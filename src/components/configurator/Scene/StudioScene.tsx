import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudio } from '@/store/studio';
import type { CameraPreset, RoomState } from '@/store/types';
import { Room } from './Room';
import { LightingRig } from './Lighting';
import { DragController, Items } from './Items';
import { t } from '@/i18n';

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

function presetPose(preset: CameraPreset, room: RoomState, aspect = 1.6) {
  // Pull back on narrow viewports so the whole room stays in frame.
  const r = Math.max(room.width, room.depth) * Math.max(0.9, Math.min(2.1, 1.22 / aspect));
  switch (preset) {
    case 'front': return { pos: new THREE.Vector3(0, room.height * 0.62, room.depth / 2 + r * 0.95), target: new THREE.Vector3(0, room.height * 0.38, 0) };
    case 'top': return { pos: new THREE.Vector3(0, r * 1.85, 0.02), target: new THREE.Vector3(0, 0, 0) };
    case 'corner': return { pos: new THREE.Vector3(-r * 0.78, r * 0.68, r * 0.86), target: new THREE.Vector3(0, 0.45, 0) };
    default: return { pos: new THREE.Vector3(r * 0.74, r * 0.84, r * 1.02), target: new THREE.Vector3(0, 0.35, 0) };
  }
}

function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const nonce = useStudio((s) => s.cameraNonce);
  const preset = useStudio((s) => s.camera);
  const dragging = useStudio((s) => s.dragging);
  const preview = useStudio((s) => s.preview);
  const room = useStudio((s) => s.room);
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const first = useRef(true);

  useEffect(() => {
    const pose = presetPose(preset, useStudio.getState().room, (camera as THREE.PerspectiveCamera).aspect);
    if (first.current) {
      camera.position.copy(pose.pos);
      controls.current?.target.copy(pose.target);
      controls.current?.update();
      first.current = false;
      return;
    }
    goal.current = pose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useFrame((_, dt) => {
    const g = goal.current;
    const c = controls.current;
    if (!g || !c) return;
    const k = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(g.pos, k);
    c.target.lerp(g.target, k);
    c.update();
    if (camera.position.distanceTo(g.pos) < 0.01 && c.target.distanceTo(g.target) < 0.01) goal.current = null;
  });

  const r = Math.max(room.width, room.depth);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={!dragging}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={r * 3.2}
      maxPolarAngle={Math.PI * 0.49}
      autoRotate={preview}
      autoRotateSpeed={0.5}
      onStart={() => { goal.current = null; }}
      screenSpacePanning
    />
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

let captureFn: ((scale?: number) => Promise<string>) | null = null;
let floorFn: ((clientX: number, clientY: number) => { x: number; z: number } | null) | null = null;

/** Project a screen point onto the floor plane (for drag-and-drop from the library). */
export function screenToFloor(clientX: number, clientY: number) {
  return floorFn ? floorFn(clientX, clientY) : null;
}

/** Render the current view to a PNG data URL (selection helpers hidden). */
export async function captureStudio(scale = 2): Promise<string | null> {
  return captureFn ? captureFn(scale) : null;
}

function CaptureBridge() {
  const { gl, scene, camera, size } = useThree();
  useEffect(() => {
    captureFn = async (scale = 2) => {
      const store = useStudio.getState();
      store.setCapturing(true);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const prevRatio = gl.getPixelRatio();
      gl.setPixelRatio(Math.min(3, scale));
      gl.setSize(size.width, size.height, false);
      gl.render(scene, camera);
      const url = gl.domElement.toDataURL('image/png');
      gl.setPixelRatio(prevRatio);
      gl.setSize(size.width, size.height, false);
      store.setCapturing(false);
      return url;
    };
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    floorFn = (cx, cy) => {
      const r = gl.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
      return ray.ray.intersectPlane(plane, hit) ? { x: hit.x, z: hit.z } : null;
    };
    return () => { captureFn = null; floorFn = null; };
  }, [gl, scene, camera, size]);
  return null;
}

/* ------------------------------------------------------------------ */

function SceneContents({ interactive }: { interactive: boolean }) {
  const room = useStudio((s) => s.room);
  const lighting = useStudio((s) => s.lighting);
  const select = useStudio((s) => s.select);
  return (
    <LightingRig preset={lighting} room={room}>
      <Room room={room} onSurfaceClick={() => select(null)} />
      <Suspense fallback={null}>
        <Items interactive={interactive} />
      </Suspense>
    </LightingRig>
  );
}

export default function StudioScene({ interactive = true }: { interactive?: boolean }) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{ fov: 36, near: 0.1, far: 120, position: [6, 6, 8] }}
      gl={{ antialias: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
      onPointerMissed={(e) => { if (e.type === 'click') useStudio.getState().select(null); }}
      aria-label={t('3D room view')}
    >
      <SceneContents interactive={interactive} />
      <CameraRig />
      {interactive && <DragController />}
      <CaptureBridge />
    </Canvas>
  );
}
