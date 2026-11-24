/**
 * Homepage studio demonstration. Scroll progress (0–1) drives the scene:
 *   0.00–0.45  furniture arrives piece by piece
 *   0.45–0.72  finishes change on the sofa, rug and table
 *   0.72–1.00  the light moves from afternoon to evening
 * Progress lives in a ref so scrolling never re-renders React per frame.
 */
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { buildDesign, getSpace } from '@/data/spaces';
import { getProduct } from '@/data/furniture';
import { itemBaseY } from '@/lib/placement';
import type { LightingPreset, PlacedItem } from '@/store/types';
import { Room } from '@/components/configurator/Scene/Room';
import { LightingRig } from '@/components/configurator/Scene/Lighting';
import { ProductModel } from '@/components/configurator/Furniture/ProductModel';

const ARRIVE_END = 0.45;
const MATERIAL_END = 0.72;

const finishSteps: Record<string, Record<string, string>[]> = {
  'sable-sofa': [{ upholstery: 'boucle-oat' }, { upholstery: 'linen-olive' }, { upholstery: 'mohair-terracotta' }],
  'weft-rug': [{ rug: 'rug-ivory' }, { rug: 'rug-jute' }, { rug: 'rug-stone' }],
  'plinth-coffee-table': [{ top: 'travertine', base: 'travertine' }, { top: 'walnut', base: 'walnut' }, { top: 'marble-verde', base: 'marble-verde' }],
};

function ArrivingItem({ item, index, count, items, progress, room, step }: {
  item: PlacedItem; index: number; count: number; items: PlacedItem[]; progress: MutableRefObject<number>;
  room: ReturnType<typeof buildDesign>['room']; step: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const p = getProduct(item.productId)!;
  const baseY = itemBaseY(item, p, items, room);
  const mats = finishSteps[item.productId] ? { ...item.materials, ...finishSteps[item.productId][step] } : item.materials;
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const start = (index / count) * ARRIVE_END * 0.92;
    const t = THREE.MathUtils.clamp((progress.current - start) / 0.07, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    g.visible = t > 0.001;
    g.position.y = (1 - e) * 0.9;
    g.scale.setScalar(0.85 + 0.15 * e);
  });
  return (
    <group position={[item.x, baseY, item.z]} rotation={[0, item.rotation, 0]}>
      <group ref={ref}>
        <ProductModel productId={item.productId} materials={mats} ceiling={room.height - baseY} />
      </group>
    </group>
  );
}

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const r = 10.2;
  useFrame(({ camera }) => {
    const p = progress.current;
    const a = 0.62 - p * 0.42;
    camera.position.set(Math.sin(a) * r, 7.2 - p * 1.6, Math.cos(a) * r);
    camera.lookAt(0, 0.2, 0.3);
  });
  return null;
}

function Story({ progress, onStep }: { progress: MutableRefObject<number>; onStep: (s: number) => void }) {
  const design = useMemo(() => {
    const d = buildDesign('living', getSpace('calder-living-room'));
    d.room = { ...d.room, accentWall: null, wallFinish: 'limewash', wallColor: '#E6DED0' };
    return d;
  }, []);
  // Arrival order: large pieces first, accessories last.
  const ordered = useMemo(() => {
    const weight = (i: PlacedItem) => {
      const p = getProduct(i.productId)!;
      return p.placement === 'rug' ? -1 : p.placement === 'surface' ? 1000 : -(p.dims.w * p.dims.d);
    };
    return [...design.items].sort((a, b) => weight(a) - weight(b));
  }, [design]);
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<LightingPreset>('afternoon');
  const last = useRef({ step: -1, phase: -1 });

  useFrame(() => {
    const p = progress.current;
    const s = p < MATERIAL_END - 0.02 ? (p < ARRIVE_END + 0.06 ? 0 : p < ARRIVE_END + 0.16 ? 1 : 2) : 2;
    const phase = p < ARRIVE_END ? 0 : p < MATERIAL_END ? 1 : 2;
    if (s !== last.current.step) { last.current.step = s; setStep(s); }
    if (phase !== last.current.phase) {
      last.current.phase = phase;
      onStep(phase);
      setPreset(phase === 2 ? 'evening' : 'afternoon');
    }
  });

  return (
    <LightingRig preset={preset} room={design.room}>
      <Room room={design.room} />
      {ordered.map((it, i) => (
        <ArrivingItem key={it.uid} item={it} index={i} count={ordered.length} items={design.items} progress={progress} room={design.room} step={step} />
      ))}
    </LightingRig>
  );
}

export default function IntroScene({ progress, onStep, active }: { progress: MutableRefObject<number>; onStep: (s: number) => void; active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ fov: 34, near: 0.1, far: 80, position: [5, 5, 6] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden
    >
      <Rig progress={progress} />
      <Story progress={progress} onStep={onStep} />
    </Canvas>
  );
}
