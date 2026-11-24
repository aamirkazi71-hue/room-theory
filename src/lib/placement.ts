/**
 * Placement rules for the studio: footprints, room bounds, wall snapping,
 * collisions and surface stacking. Pure functions — no React, no Three.
 */
import { getProduct, type Product } from '@/data/furniture';
import type { PlacedItem, RoomState, WallIndex } from '@/store/types';

export interface Rect { minX: number; maxX: number; minZ: number; maxZ: number }

const EPS = 0.004;

/** Half extents of the item's axis-aligned footprint after rotation (metres). */
export function halfExtents(p: Product, rotation: number) {
  const w = p.dims.w / 100;
  const d = p.dims.d / 100;
  const c = Math.abs(Math.cos(rotation));
  const s = Math.abs(Math.sin(rotation));
  return { hx: (w * c + d * s) / 2, hz: (w * s + d * c) / 2 };
}

export function footprint(item: Pick<PlacedItem, 'x' | 'z' | 'rotation'>, p: Product): Rect {
  const { hx, hz } = halfExtents(p, item.rotation);
  return { minX: item.x - hx, maxX: item.x + hx, minZ: item.z - hz, maxZ: item.z + hz };
}

const overlaps = (a: Rect, b: Rect) =>
  a.minX < b.maxX - EPS && a.maxX > b.minX + EPS && a.minZ < b.maxZ - EPS && a.maxZ > b.minZ + EPS;

/** Items that take part in floor collisions. */
const isSolid = (p: Product) => p.placement === 'floor';

export function collides(candidate: PlacedItem, items: PlacedItem[]): boolean {
  const p = getProduct(candidate.productId);
  if (!p || !isSolid(p)) return false;
  const r = footprint(candidate, p);
  for (const other of items) {
    if (other.uid === candidate.uid) continue;
    const q = getProduct(other.productId);
    if (!q || !isSolid(q)) continue;
    if ((p.tucksUnder && q.allowsTuck) || (q.tucksUnder && p.allowsTuck)) continue;
    if (overlaps(r, footprint(other, q))) return true;
  }
  return false;
}

/** Wall snapping for wall-mounted items: returns position + inward-facing rotation. */
export function snapToWall(x: number, z: number, p: Product, room: RoomState): { x: number; z: number; rotation: number; wall: WallIndex } {
  const W = room.width / 2;
  const D = room.depth / 2;
  const hw = p.dims.w / 200;
  const hd = p.dims.d / 200;
  const dist: [WallIndex, number][] = [
    [0, Math.abs(z + D)],
    [1, Math.abs(W - x)],
    [2, Math.abs(D - z)],
    [3, Math.abs(x + W)],
  ];
  dist.sort((a, b) => a[1] - b[1]);
  const wall = dist[0][0];
  const cl = (v: number, lim: number) => Math.min(lim - hw, Math.max(-lim + hw, v));
  switch (wall) {
    case 0: return { wall, x: cl(x, W), z: -D + hd, rotation: 0 };
    case 1: return { wall, x: W - hd, z: cl(z, D), rotation: -Math.PI / 2 };
    case 2: return { wall, x: cl(x, W), z: D - hd, rotation: Math.PI };
    default: return { wall, x: -W + hd, z: cl(z, D), rotation: Math.PI / 2 };
  }
}

/** Keep an item inside the room (and on a wall, for wall items). */
export function constrain(item: PlacedItem, room: RoomState): PlacedItem {
  const p = getProduct(item.productId);
  if (!p) return item;
  if (p.placement === 'wall') {
    const s = snapToWall(item.x, item.z, p, room);
    const maxMount = room.height - p.dims.h / 200 - 0.05;
    const minMount = p.dims.h / 200 + 0.2;
    const elevation = Math.min(maxMount, Math.max(minMount, item.elevation ?? p.mount ?? 1.5));
    return { ...item, x: s.x, z: s.z, rotation: s.rotation, elevation };
  }
  const { hx, hz } = halfExtents(p, item.rotation);
  const W = room.width / 2;
  const D = room.depth / 2;
  const x = Math.min(W - hx, Math.max(-W + hx, item.x));
  const z = Math.min(D - hz, Math.max(-D + hz, item.z));
  let elevation = item.elevation;
  if (p.placement === 'ceiling') {
    const max = room.height - 0.35;
    elevation = Math.min(max, Math.max(1.2, elevation ?? p.mount ?? 1.8));
  }
  return { ...item, x, z, elevation };
}

/** Height a surface item rests at: the top of the highest supporting piece beneath it, or the floor. */
export function supportHeight(item: Pick<PlacedItem, 'x' | 'z' | 'uid'>, items: PlacedItem[]): number {
  let h = 0;
  for (const other of items) {
    if (other.uid === item.uid) continue;
    const q = getProduct(other.productId);
    if (!q?.surfaceHeight || q.placement !== 'floor') continue;
    const r = footprint(other, q);
    if (item.x > r.minX && item.x < r.maxX && item.z > r.minZ && item.z < r.maxZ) h = Math.max(h, q.surfaceHeight);
  }
  return h;
}

/** World Y of the item's origin. */
export function itemBaseY(item: PlacedItem, p: Product, items: PlacedItem[], room: RoomState): number {
  switch (p.placement) {
    case 'surface': return supportHeight(item, items);
    case 'wall': return (item.elevation ?? p.mount ?? 1.5) - p.dims.h / 200;
    case 'ceiling': return item.elevation ?? p.mount ?? 1.8;
    case 'rug': return 0.002;
    default: return 0;
  }
}

/**
 * Find the free spot nearest a preferred point: a 10 cm grid over the whole
 * room, trying the item's rotation and a quarter turn. Falls back to the
 * preferred point only if the room is genuinely full.
 */
export function findFreeSpot(base: PlacedItem, items: PlacedItem[], room: RoomState): PlacedItem {
  const p = getProduct(base.productId);
  if (!p) return base;
  if (p.placement !== 'floor') return constrain(base, room);
  const first = constrain(base, room);
  if (!collides(first, items)) return first;
  const step = 0.1;
  const W = room.width / 2, D = room.depth / 2;
  let best: PlacedItem | null = null;
  let bestScore = Infinity;
  for (const rot of [base.rotation, base.rotation + Math.PI / 2]) {
    const { hx, hz } = halfExtents(p, rot);
    for (let x = -W + hx; x <= W - hx + 1e-6; x += step) {
      for (let z = -D + hz; z <= D - hz + 1e-6; z += step) {
        const score = (x - base.x) ** 2 + (z - base.z) ** 2 + (rot === base.rotation ? 0 : 0.5);
        if (score >= bestScore) continue;
        const cand = { ...base, x, z, rotation: rot };
        if (!collides(cand, items)) { best = cand; bestScore = score; }
      }
    }
  }
  return best ?? first;
}

/**
 * Resolve a drag: try the full move, then each axis alone so items slide
 * along obstacles instead of sticking to them.
 */
export function resolveMove(item: PlacedItem, x: number, z: number, items: PlacedItem[], room: RoomState): PlacedItem {
  const tryAt = (nx: number, nz: number) => constrain({ ...item, x: nx, z: nz }, room);
  const full = tryAt(x, z);
  // An item that already overlaps something (e.g. after a room resize) moves freely until it is clear.
  if (!collides(full, items) || collides(item, items)) return full;
  const onlyX = tryAt(x, item.z);
  if (!collides(onlyX, items)) return onlyX;
  const onlyZ = tryAt(item.x, z);
  if (!collides(onlyZ, items)) return onlyZ;
  return item;
}
