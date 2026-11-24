/**
 * The architectural shell: floor slab, walls with real openings, windows,
 * door, skirting and ceiling. Walls between the camera and the room move to
 * layer 1 — invisible to the camera but still casting shadows, so daylight
 * keeps entering only through the windows.
 */
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { Opening, RoomState, WallIndex } from '@/store/types';
import { getFloorFinish, getWallFinish } from '@/data/materials';
import { F, getSurfaceMaterial } from '@/lib/threeMaterials';

export const WALL_T = 0.14;
const HIDDEN_LAYER = 1;

const pocheMat = new THREE.MeshStandardMaterial({ color: '#2b2b28', roughness: 0.9 });
const slabMat = new THREE.MeshStandardMaterial({ color: '#d9d4ca', roughness: 0.95 });
const sillMat = new THREE.MeshStandardMaterial({ color: '#e6e0d4', roughness: 0.7 });
const handleMat = new THREE.MeshStandardMaterial({ color: '#b79a68', roughness: 0.35, metalness: 1 });

interface WallSpec { index: WallIndex; length: number; position: [number, number, number]; rotationY: number; flip: boolean }

function wallSpecs(room: RoomState): WallSpec[] {
  const W = room.width / 2, D = room.depth / 2;
  return [
    { index: 0, length: room.width, position: [0, 0, -D - WALL_T], rotationY: 0, flip: false },
    { index: 1, length: room.depth, position: [W + WALL_T, 0, 0], rotationY: -Math.PI / 2, flip: false },
    { index: 2, length: room.width, position: [0, 0, D + WALL_T], rotationY: Math.PI, flip: true },
    { index: 3, length: room.depth, position: [-W - WALL_T, 0, 0], rotationY: Math.PI / 2, flip: true },
  ];
}

function wallGeometry(length: number, height: number, openings: { u: number; o: Opening }[]) {
  const L = length / 2 + WALL_T;
  const s = new THREE.Shape();
  s.moveTo(-L, 0);
  const doors = openings.filter((x) => x.o.kind === 'door').sort((a, b) => a.u - b.u);
  for (const { u, o } of doors) {
    s.lineTo(u - o.width / 2, 0);
    s.lineTo(u - o.width / 2, o.height);
    s.lineTo(u + o.width / 2, o.height);
    s.lineTo(u + o.width / 2, 0);
  }
  s.lineTo(L, 0);
  s.lineTo(L, height);
  s.lineTo(-L, height);
  s.closePath();
  for (const { u, o } of openings) {
    if (o.kind !== 'window') continue;
    const sill = o.sill ?? 0.6;
    const h = new THREE.Path();
    h.moveTo(u - o.width / 2, sill);
    h.lineTo(u + o.width / 2, sill);
    h.lineTo(u + o.width / 2, sill + o.height);
    h.lineTo(u - o.width / 2, sill + o.height);
    h.closePath();
    s.holes.push(h);
  }
  return new THREE.ExtrudeGeometry(s, { depth: WALL_T, bevelEnabled: false });
}

function Window({ u, o }: { u: number; o: Opening }) {
  const sill = o.sill ?? 0.6;
  const f = 0.05;
  const cy = sill + o.height / 2;
  const frame = F.frame();
  const mullions = o.width > 1.5 ? Math.round(o.width / 0.8) - 1 : 0;
  return (
    <group position={[u, 0, WALL_T / 2]}>
      <mesh position={[0, sill + o.height - f / 2, 0]} material={frame} castShadow><boxGeometry args={[o.width, f, 0.06]} /></mesh>
      <mesh position={[0, sill + f / 2, 0]} material={frame} castShadow><boxGeometry args={[o.width, f, 0.06]} /></mesh>
      <mesh position={[-o.width / 2 + f / 2, cy, 0]} material={frame} castShadow><boxGeometry args={[f, o.height, 0.06]} /></mesh>
      <mesh position={[o.width / 2 - f / 2, cy, 0]} material={frame} castShadow><boxGeometry args={[f, o.height, 0.06]} /></mesh>
      {Array.from({ length: mullions }, (_, i) => {
        const x = -o.width / 2 + ((i + 1) * o.width) / (mullions + 1);
        return <mesh key={i} position={[x, cy, 0]} material={frame} castShadow><boxGeometry args={[0.03, o.height, 0.05]} /></mesh>;
      })}
      <mesh position={[0, sill + o.height * 0.72, 0]} material={frame} castShadow><boxGeometry args={[o.width, 0.03, 0.05]} /></mesh>
      <mesh position={[0, cy, 0]} material={F.glass()}><planeGeometry args={[o.width - f, o.height - f]} /></mesh>
      <mesh position={[0, sill - 0.015, WALL_T / 2 + 0.02]} material={sillMat} castShadow receiveShadow><boxGeometry args={[o.width + 0.1, 0.03, 0.1]} /></mesh>
    </group>
  );
}

function Door({ u, o }: { u: number; o: Opening }) {
  const a = 0.06;
  return (
    <group position={[u, 0, 0]}>
      <mesh position={[0, o.height / 2, WALL_T / 2]} material={F.door()} castShadow receiveShadow><boxGeometry args={[o.width - 0.02, o.height - 0.01, 0.045]} /></mesh>
      <mesh position={[o.width / 2 - 0.1, 1.0, WALL_T / 2 + 0.05]} material={handleMat} castShadow><boxGeometry args={[0.12, 0.016, 0.016]} /></mesh>
      {[WALL_T + 0.01, -0.01].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-o.width / 2 - a / 2, o.height / 2 + a / 2, 0]} material={F.skirting()}><boxGeometry args={[a, o.height + a, 0.02]} /></mesh>
          <mesh position={[o.width / 2 + a / 2, o.height / 2 + a / 2, 0]} material={F.skirting()}><boxGeometry args={[a, o.height + a, 0.02]} /></mesh>
          <mesh position={[0, o.height + a / 2, 0]} material={F.skirting()}><boxGeometry args={[o.width + a * 2, a, 0.02]} /></mesh>
        </group>
      ))}
    </group>
  );
}

const Wall = memo(function Wall({ spec, room, onClick }: { spec: WallSpec; room: RoomState; onClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const ref = useRef<THREE.Group>(null);
  const openings = useMemo(
    () => room.openings.filter((o) => o.wall === spec.index).map((o) => ({ o, u: spec.flip ? -o.offset : o.offset })),
    [room.openings, spec.index, spec.flip],
  );
  const geo = useMemo(() => wallGeometry(spec.length, room.height, openings), [spec.length, room.height, openings]);
  const isAccent = room.accentWall === spec.index;
  const finish = getWallFinish(isAccent ? room.accentFinish : room.wallFinish);
  const material = getSurfaceMaterial(finish, room.wallColor, 1, 1);

  const skirting = useMemo(() => {
    const L = spec.length / 2;
    const doors = openings.filter((x) => x.o.kind === 'door').map((x) => [x.u - x.o.width / 2 - 0.06, x.u + x.o.width / 2 + 0.06] as const).sort((a, b) => a[0] - b[0]);
    const segs: [number, number][] = [];
    let start = -L;
    for (const [a, b] of doors) { if (a > start) segs.push([start, a]); start = Math.max(start, b); }
    if (start < L) segs.push([start, L]);
    return segs;
  }, [openings, spec.length]);

  // Cutaway: hide (from the camera only) walls that stand between camera and room.
  const lastHidden = useRef<boolean | null>(null);
  useEffect(() => { lastHidden.current = null; }, [geo, material, skirting]);
  useFrame(({ camera }) => {
    const g = ref.current;
    if (!g) return;
    const W = room.width / 2, D = room.depth / 2;
    const p = camera.position;
    const hidden =
      spec.index === 0 ? p.z < -D + 0.05 :
      spec.index === 1 ? p.x > W - 0.05 :
      spec.index === 2 ? p.z > D - 0.05 :
      p.x < -W + 0.05;
    if (hidden === lastHidden.current) return;
    lastHidden.current = hidden;
    g.traverse((o) => { o.layers.set(hidden ? HIDDEN_LAYER : 0); });
  });

  return (
    <group ref={ref} position={spec.position} rotation={[0, spec.rotationY, 0]}>
      <mesh geometry={geo} material={material} castShadow receiveShadow onClick={onClick} />
      <mesh position={[0, room.height + 0.004, WALL_T / 2]} material={pocheMat}>
        <boxGeometry args={[spec.length + WALL_T * 2, 0.008, WALL_T]} />
      </mesh>
      {skirting.map(([a, b]) => (
        <mesh key={`${a}`} position={[(a + b) / 2, 0.045, WALL_T + 0.008]} material={F.skirting()} receiveShadow>
          <boxGeometry args={[b - a, 0.09, 0.016]} />
        </mesh>
      ))}
      {openings.map(({ u, o }, i) => (o.kind === 'window' ? <Window key={i} u={u} o={o} /> : <Door key={i} u={u} o={o} />))}
    </group>
  );
});

function Ceiling({ room }: { room: RoomState }) {
  const ref = useRef<THREE.Mesh>(null);
  const last = useRef<boolean | null>(null);
  useFrame(({ camera }) => {
    const inside = camera.position.y < room.height - 0.05 && Math.abs(camera.position.x) < room.width / 2 && Math.abs(camera.position.z) < room.depth / 2;
    if (!ref.current || inside === last.current) return;
    last.current = inside;
    ref.current.layers.set(inside ? 0 : HIDDEN_LAYER);
  });
  return (
    <mesh ref={ref} position={[0, room.height + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]} material={F.ceiling()} castShadow receiveShadow>
      <planeGeometry args={[room.width + WALL_T * 2, room.depth + WALL_T * 2]} />
    </mesh>
  );
}

export function Room({ room, onSurfaceClick }: { room: RoomState; onSurfaceClick?: (e: ThreeEvent<MouseEvent>) => void }) {
  const specs = useMemo(() => wallSpecs(room), [room]);
  const floorMat = getSurfaceMaterial(getFloorFinish(room.floor), null, room.width, room.depth);
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 3) return;
    onSurfaceClick?.(e);
  };
  return (
    <group>
      <mesh position={[0, -0.09, 0]} material={slabMat} receiveShadow>
        <boxGeometry args={[room.width + WALL_T * 2, 0.18, room.depth + WALL_T * 2]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]} material={floorMat} receiveShadow onClick={click}>
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>
      {specs.map((s) => <Wall key={s.index} spec={s} room={room} onClick={click} />)}
      <Ceiling room={room} />
    </group>
  );
}
