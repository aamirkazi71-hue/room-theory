/**
 * Studio state. One store, separated into slices by responsibility:
 *  - design: room · items · lighting (the only part saved and undone)
 *  - selection & hover
 *  - view: tool, camera preset, preview mode, drag state
 *  - history: undo/redo stacks of design snapshots
 *  - project: id, name, dirty flag
 */
import { create } from 'zustand';
import { buildDesign, getSpace, newUid } from '@/data/spaces';
import { defaultMaterials, getProduct } from '@/data/furniture';
import { constrain, findFreeSpot, resolveMove } from '@/lib/placement';
import type { CameraPreset, DesignSnapshot, LightingPreset, PlacedItem, RoomState, StudioTool } from './types';

const HISTORY_LIMIT = 80;
const AUTOSAVE_KEY = 'rt.studio.autosave.v1';

interface StudioState extends DesignSnapshot {
  // selection
  selectedId: string | null;
  hoveredId: string | null;
  // view
  tool: StudioTool;
  camera: CameraPreset;
  cameraNonce: number;
  preview: boolean;
  dragging: boolean;
  capturing: boolean;
  // history
  past: DesignSnapshot[];
  future: DesignSnapshot[];
  /** Snapshot taken when a drag starts; pushed to history only if the item actually moves */
  pending: DesignSnapshot | null;
  // project
  projectId: string | null;
  projectName: string;
  spaceSlug: string | null;
  dirty: boolean;

  load: (design: DesignSnapshot, meta?: { projectId?: string | null; name?: string; spaceSlug?: string | null }) => void;
  reset: () => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;

  addItem: (productId: string, opts?: { materials?: Record<string, string>; x?: number; z?: number }) => string | null;
  removeItem: (uid: string) => void;
  duplicateItem: (uid: string) => void;
  rotateItem: (uid: string, delta: number) => void;
  setRotation: (uid: string, rotation: number, commit?: boolean) => void;
  setItemPosition: (uid: string, x: number, z: number, commit?: boolean) => void;
  setElevation: (uid: string, elevation: number, commit?: boolean) => void;
  setItemMaterial: (uid: string, slot: string, materialId: string) => void;
  setRoom: (patch: Partial<RoomState>) => void;
  setLighting: (preset: LightingPreset) => void;

  beginDrag: () => void;
  dragTo: (uid: string, x: number, z: number) => void;
  endDrag: () => void;

  select: (uid: string | null) => void;
  hover: (uid: string | null) => void;
  setTool: (tool: StudioTool) => void;
  setCamera: (camera: CameraPreset) => void;
  setPreview: (on: boolean) => void;
  setCapturing: (on: boolean) => void;
  rename: (name: string) => void;
  markSaved: (projectId: string) => void;
}

const snapshot = (s: DesignSnapshot): DesignSnapshot => ({ room: s.room, items: s.items, lighting: s.lighting });

function withHistory(s: StudioState): Pick<StudioState, 'past' | 'future' | 'dirty'> {
  return { past: [...s.past, snapshot(s)].slice(-HISTORY_LIMIT), future: [], dirty: true };
}

function readAutosave(): { design: DesignSnapshot; name: string; projectId: string | null; spaceSlug: string | null } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initial = readAutosave();
const initialRaw = initial?.design ?? buildDesign('living');
const initialDesign: DesignSnapshot = { ...initialRaw, items: initialRaw.items.map((i) => constrain(i, initialRaw.room)) };

export const useStudio = create<StudioState>()((set, get) => ({
  ...initialDesign,
  selectedId: null,
  hoveredId: null,
  tool: 'furniture',
  camera: 'perspective',
  cameraNonce: 0,
  preview: false,
  dragging: false,
  capturing: false,
  past: [],
  future: [],
  pending: null,
  projectId: initial?.projectId ?? null,
  projectName: initial?.name ?? 'Untitled room',
  spaceSlug: initial?.spaceSlug ?? null,
  dirty: false,

  load: (design, meta) =>
    set((s) => ({
      ...design,
      items: design.items.map((i) => constrain(i, design.room)),
      selectedId: null,
      hoveredId: null,
      past: [],
      future: [],
      pending: null,
      projectId: meta?.projectId !== undefined ? meta.projectId : s.projectId,
      projectName: meta?.name ?? s.projectName,
      spaceSlug: meta?.spaceSlug !== undefined ? meta.spaceSlug : s.spaceSlug,
      dirty: false,
      cameraNonce: s.cameraNonce + 1,
      camera: 'perspective',
    })),

  reset: () => {
    // Back to the original furnished layout of the current space (or room type). Undoable.
    const s = get();
    const space = s.spaceSlug ? getSpace(s.spaceSlug) : undefined;
    const fresh = buildDesign(space?.type ?? s.room.type, space);
    set({ ...withHistory(s), ...fresh, selectedId: null });
  },

  clear: () => {
    const s = get();
    set({ ...withHistory(s), items: [], selectedId: null });
  },

  undo: () =>
    set((s) => {
      const prev = s.past[s.past.length - 1];
      if (!prev) return s;
      return { ...prev, past: s.past.slice(0, -1), future: [snapshot(s), ...s.future], selectedId: prev.items.some((i) => i.uid === s.selectedId) ? s.selectedId : null, dirty: true };
    }),

  redo: () =>
    set((s) => {
      const next = s.future[0];
      if (!next) return s;
      return { ...next, past: [...s.past, snapshot(s)], future: s.future.slice(1), selectedId: next.items.some((i) => i.uid === s.selectedId) ? s.selectedId : null, dirty: true };
    }),

  addItem: (productId, opts) => {
    const p = getProduct(productId);
    if (!p) return null;
    const s = get();
    const base: PlacedItem = {
      uid: newUid(),
      productId,
      x: opts?.x ?? 0,
      z: opts?.z ?? 0,
      rotation: 0,
      materials: { ...defaultMaterials(p), ...(opts?.materials ?? {}) },
      elevation: p.mount,
    };
    const placed = findFreeSpot(base, s.items, s.room);
    set({ ...withHistory(s), items: [...s.items, placed], selectedId: placed.uid });
    return placed.uid;
  },

  removeItem: (uid) =>
    set((s) => ({ ...withHistory(s), items: s.items.filter((i) => i.uid !== uid), selectedId: s.selectedId === uid ? null : s.selectedId })),

  duplicateItem: (uid) => {
    const s = get();
    const src = s.items.find((i) => i.uid === uid);
    if (!src) return;
    const copy = findFreeSpot({ ...src, uid: newUid(), x: src.x + 0.4, z: src.z + 0.4, materials: { ...src.materials } }, s.items, s.room);
    set({ ...withHistory(s), items: [...s.items, copy], selectedId: copy.uid });
  },

  rotateItem: (uid, delta) => {
    const s = get();
    const it = s.items.find((i) => i.uid === uid);
    if (!it) return;
    get().setRotation(uid, it.rotation + delta, true);
  },

  setRotation: (uid, rotation, commit = true) =>
    set((s) => {
      const it = s.items.find((i) => i.uid === uid);
      const p = it && getProduct(it.productId);
      if (!it || !p || p.placement === 'wall') return s;
      const norm = Math.atan2(Math.sin(rotation), Math.cos(rotation));
      const next = constrain({ ...it, rotation: norm }, s.room);
      return { ...(commit ? withHistory(s) : { dirty: true }), items: s.items.map((i) => (i.uid === uid ? next : i)) };
    }),

  setItemPosition: (uid, x, z, commit = true) =>
    set((s) => {
      const it = s.items.find((i) => i.uid === uid);
      if (!it) return s;
      const next = resolveMove(it, x, z, s.items, s.room);
      return { ...(commit ? withHistory(s) : { dirty: true }), items: s.items.map((i) => (i.uid === uid ? next : i)) };
    }),

  setElevation: (uid, elevation, commit = true) =>
    set((s) => {
      const it = s.items.find((i) => i.uid === uid);
      if (!it) return s;
      const next = constrain({ ...it, elevation }, s.room);
      return { ...(commit ? withHistory(s) : { dirty: true }), items: s.items.map((i) => (i.uid === uid ? next : i)) };
    }),

  setItemMaterial: (uid, slot, materialId) =>
    set((s) => ({ ...withHistory(s), items: s.items.map((i) => (i.uid === uid ? { ...i, materials: { ...i.materials, [slot]: materialId } } : i)) })),

  setRoom: (patch) =>
    set((s) => {
      const room = { ...s.room, ...patch };
      if (patch.width !== undefined || patch.depth !== undefined) {
        const sx = room.width / s.room.width;
        const sz = room.depth / s.room.depth;
        room.openings = s.room.openings.map((o) => {
          const len = o.wall % 2 === 0 ? room.width : room.depth;
          const scaled = o.offset * (o.wall % 2 === 0 ? sx : sz);
          const lim = len / 2 - o.width / 2 - 0.15;
          return { ...o, offset: Math.max(-lim, Math.min(lim, scaled)) };
        });
      }
      if (patch.height !== undefined) {
        room.openings = room.openings.map((o) => ({ ...o, height: Math.min(o.height, room.height - (o.sill ?? 0) - 0.3) }));
      }
      return { ...withHistory(s), room, items: s.items.map((i) => constrain(i, room)) };
    }),

  setLighting: (lighting) => set((s) => (s.lighting === lighting ? s : { ...withHistory(s), lighting })),

  beginDrag: () => set((s) => ({ dragging: true, pending: snapshot(s) })),
  dragTo: (uid, x, z) =>
    set((s) => {
      const it = s.items.find((i) => i.uid === uid);
      if (!it) return s;
      const next = resolveMove(it, x, z, s.items, s.room);
      if (next === it) return s;
      const moved = s.pending ? { past: [...s.past, s.pending].slice(-HISTORY_LIMIT), future: [], pending: null } : {};
      return { ...moved, dirty: true, items: s.items.map((i) => (i.uid === uid ? next : i)) };
    }),
  endDrag: () => set({ dragging: false, pending: null }),

  select: (uid) => set((s) => (s.selectedId === uid ? s : { selectedId: uid, tool: uid && (s.tool === 'spaces' || s.tool === 'layout') ? 'furniture' : s.tool })),
  hover: (uid) => set((s) => (s.hoveredId === uid ? s : { hoveredId: uid })),
  setTool: (tool) => set({ tool }),
  setCamera: (camera) => set((s) => ({ camera, cameraNonce: s.cameraNonce + 1 })),
  setPreview: (preview) => set({ preview, selectedId: preview ? null : get().selectedId }),
  setCapturing: (capturing) => set({ capturing }),
  rename: (projectName) => set({ projectName: projectName.trim() || 'Untitled room', dirty: true }),
  markSaved: (projectId) => set({ projectId, dirty: false }),
}));

/* Autosave the working design so a refresh or navigation never loses work. */
let autosaveTimer: number | undefined;
useStudio.subscribe((s, prev) => {
  if (s.items === prev.items && s.room === prev.room && s.lighting === prev.lighting && s.projectName === prev.projectName) return;
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ design: snapshot(s), name: s.projectName, projectId: s.projectId, spaceSlug: s.spaceSlug }));
    } catch {
      /* storage unavailable — the session still works in memory */
    }
  }, 400);
});

export const selectedItem = (s: StudioState) => s.items.find((i) => i.uid === s.selectedId) ?? null;
