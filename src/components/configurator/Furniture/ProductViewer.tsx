import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import type { Product } from '@/data/furniture';
import { StudioEnvironment } from '../Scene/Lighting';
import { ProductModel } from './ProductModel';
import { t } from '@/i18n';
import { cameraFor } from './ThumbnailStudio';

/** Turntable viewer for a single product on a transparent stage. */
export default function ProductViewer({ product, materials }: { product: Product; materials: Record<string, string> }) {
  const cam = cameraFor(product, 30);
  const h = product.dims.h / 100;
  const span = Math.max(product.dims.w, product.dims.d) / 100;
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: 30, position: cam.pos.toArray(), near: 0.05, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      aria-label={t('3D view of {name}. Drag to rotate, scroll to zoom.', { name: product.name })}
    >
      <directionalLight position={[-2.5, 5, 3.5]} intensity={2.4} color="#fff4e6" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <hemisphereLight args={['#f4f1ea', '#b9ab95', 0.9]} />
      <StudioEnvironment />
      <ProductModel productId={product.id} materials={materials} ceiling={product.placement === 'ceiling' ? 0.6 : undefined} />
      {product.placement !== 'wall' && product.placement !== 'ceiling' && (
        <ContactShadows position={[0, 0.001, 0]} scale={span * 3 + 1} blur={2.4} opacity={0.38} far={Math.max(1, h)} resolution={512} />
      )}
      <OrbitControls
        makeDefault
        target={cam.target.toArray()}
        enablePan={false}
        enableDamping
        minDistance={cam.pos.length() * 0.5}
        maxDistance={cam.pos.length() * 1.6}
        maxPolarAngle={Math.PI * 0.52}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
