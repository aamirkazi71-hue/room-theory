/**
 * Renders a "product photograph" of every piece from its 3D model, one at a
 * time on an offscreen canvas with a transparent background and a soft
 * contact shadow. Results land in the thumbnails store.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { products, defaultMaterials, type Product } from '@/data/furniture';
import { useThumbs } from '@/store/thumbnails';
import { ProductModel } from './ProductModel';
import { StudioEnvironment } from '../Scene/Lighting';

const SIZE = 800;

export function cameraFor(p: Product, fov = 26) {
  const w = p.dims.w / 100, d = p.dims.d / 100;
  let h = p.dims.h / 100;
  let lookY = h * 0.45;
  if (p.placement === 'ceiling') { h = 0.7; lookY = 0.18; }
  if (p.placement === 'wall') lookY = h / 2;
  const radius = Math.sqrt(w * w + d * d + h * h) / 2;
  const dist = (radius / Math.sin((fov * Math.PI) / 360)) * 1.04;
  const elev = p.model === 'rug' ? 0.95 : p.placement === 'wall' ? 0.05 : p.placement === 'ceiling' ? 0.1 : 0.32;
  const az = p.placement === 'wall' ? 0.25 : 0.62;
  const pos = new THREE.Vector3(Math.sin(az) * Math.cos(elev) * dist, lookY + Math.sin(elev) * dist, Math.cos(az) * Math.cos(elev) * dist);
  return { pos, target: new THREE.Vector3(0, lookY, 0), fov };
}

function Shot({ product, onDone }: { product: Product; onDone: (url: string) => void }) {
  const { gl, camera, advance } = useThree();
  const mats = useMemo(() => defaultMaterials(product), [product]);
  const cam = useMemo(() => cameraFor(product), [product]);

  useEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = cam.fov;
    c.position.copy(cam.pos);
    c.lookAt(cam.target);
    c.updateProjectionMatrix();
    let cancelled = false;
    let frames = 0;
    const tick = () => {
      if (cancelled) return;
      advance(performance.now());
      if (++frames < 4) { requestAnimationFrame(tick); return; }
      onDone(gl.domElement.toDataURL('image/webp', 0.9));
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [product, cam, camera, gl, advance, onDone]);

  const span = Math.max(product.dims.w, product.dims.d) / 100;
  const isHanging = product.placement === 'wall' || product.placement === 'ceiling';
  return (
    <>
      <directionalLight
        position={[-2.5, 5, 3.5]}
        intensity={2.6}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={8}
        shadow-bias={-0.0004}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <hemisphereLight args={['#f4f1ea', '#b9ab95', 0.9]} />
      <StudioEnvironment />
      <ProductModel productId={product.id} materials={mats} ceiling={product.placement === 'ceiling' ? 0.55 : undefined} />
      {!isHanging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
          <planeGeometry args={[span * 4 + 3, span * 4 + 3]} />
          <shadowMaterial opacity={0.17} />
        </mesh>
      )}
    </>
  );
}

export default function ThumbnailStudio() {
  const images = useThumbs((s) => s.images);
  const queue = products.filter((p) => !images[p.id]);
  const current = queue[0];
  if (!current) return null;
  return (
    <div aria-hidden style={{ position: 'fixed', left: -12000, top: 0, width: SIZE, height: SIZE, pointerEvents: 'none' }}>
      <Canvas
        frameloop="never"
        dpr={1}
        shadows="soft"
        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
        camera={{ fov: 26, near: 0.05, far: 60 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Shot key={current.id} product={current} onDone={(url) => useThumbs.getState().set(current.id, url)} />
      </Canvas>
    </div>
  );
}
