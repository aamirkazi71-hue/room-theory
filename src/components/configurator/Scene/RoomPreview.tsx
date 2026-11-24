/** A self-contained, read-only 3D view of a design (no studio store). */
import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { getProduct } from '@/data/furniture';
import { itemBaseY } from '@/lib/placement';
import { constrain } from '@/lib/placement';
import type { DesignSnapshot } from '@/store/types';
import { ProductModel } from '../Furniture/ProductModel';
import { LightingRig } from './Lighting';
import { Room } from './Room';
import { t } from '@/i18n';

export default function RoomPreview({ design, active = true }: { design: DesignSnapshot; active?: boolean }) {
  const items = useMemo(() => design.items.map((i) => constrain(i, design.room)), [design]);
  const r = Math.max(design.room.width, design.room.depth);
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ fov: 32, near: 0.1, far: 100, position: [r * 1.05, r * 1.15, r * 1.45] }}
      gl={{ antialias: true }}
      aria-label={t('Interactive 3D preview of the room. Drag to rotate.')}
    >
      <LightingRig preset={design.lighting} room={design.room}>
        <Room room={design.room} />
        {items.map((it) => {
          const p = getProduct(it.productId);
          if (!p) return null;
          const y = itemBaseY(it, p, items, design.room);
          return (
            <group key={it.uid} position={[it.x, y, it.z]} rotation={[0, it.rotation, 0]}>
              <ProductModel productId={it.productId} materials={it.materials} ceiling={design.room.height - y} />
            </group>
          );
        })}
      </LightingRig>
      <OrbitControls makeDefault enableDamping autoRotate autoRotateSpeed={0.35} enablePan={false} minDistance={r * 0.9} maxDistance={r * 3} maxPolarAngle={Math.PI * 0.46} target={[0, 0.4, 0]} enableZoom={false} />
    </Canvas>
  );
}
