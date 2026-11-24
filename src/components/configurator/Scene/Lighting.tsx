/**
 * Time-of-day lighting. Each preset defines sun, sky, fill, background,
 * exposure and lamp output; the rig eases between presets over ~1s.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import type { LightingPreset, RoomState } from '@/store/types';
import { setLampGlow } from '@/lib/threeMaterials';
import { LampContext } from '../Furniture/models';

export interface LightingDef {
  label: string;
  time: string;
  description: string;
  sun: string;
  sunIntensity: number;
  /** Direction the sun comes from (normalised later) */
  sunFrom: [number, number, number];
  sky: string;
  ground: string;
  hemi: number;
  background: string;
  env: number;
  exposure: number;
  lamps: number;
}

export const lightingPresets: Record<LightingPreset, LightingDef> = {
  daylight: { label: 'Daylight', time: '11:00', description: 'Even, neutral light from high in the sky.', sun: '#fff4e2', sunIntensity: 3.1, sunFrom: [0.45, 1, -0.55], sky: '#eef0ee', ground: '#c9bba5', hemi: 1.05, background: '#E3E0D9', env: 0.55, exposure: 1.0, lamps: 0 },
  afternoon: { label: 'Afternoon', time: '15:30', description: 'Warmer, lower sun with longer shadows.', sun: '#ffe0b0', sunIntensity: 3.0, sunFrom: [0.85, 0.75, -0.5], sky: '#efe6d8', ground: '#c4ad8f', hemi: 0.9, background: '#E6DDCF', env: 0.5, exposure: 1.0, lamps: 0 },
  sunset: { label: 'Sunset', time: '19:10', description: 'Raking amber light, the first lamps on.', sun: '#ff9d5c', sunIntensity: 2.6, sunFrom: [1, 0.28, -0.35], sky: '#f0bf98', ground: '#6e5848', hemi: 0.55, background: '#D8B096', env: 0.35, exposure: 1.05, lamps: 0.45 },
  evening: { label: 'Evening', time: '21:00', description: 'Blue dusk outside, lamplight within.', sun: '#8ea3cc', sunIntensity: 0.35, sunFrom: [0.6, 0.7, -0.4], sky: '#6f7c9c', ground: '#3b342d', hemi: 0.32, background: '#2E3341', env: 0.18, exposure: 1.15, lamps: 1 },
  night: { label: 'Night', time: '23:30', description: 'Dark outside; only the lamps remain.', sun: '#7688b0', sunIntensity: 0.12, sunFrom: [0.4, 0.8, -0.6], sky: '#2b3247', ground: '#1d1a17', hemi: 0.14, background: '#16181D', env: 0.08, exposure: 1.2, lamps: 1.15 },
};

const tmpA = new THREE.Color();
const tmpV = new THREE.Vector3();

export function LightingRig({ preset, room, children, instant = false }: { preset: LightingPreset; room: RoomState; children?: ReactNode; instant?: boolean }) {
  const target = lightingPresets[preset];
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { scene, gl } = useThree();
  const [lampLevel, setLampLevel] = useState(target.lamps);
  const current = useRef({ ...target, sunC: new THREE.Color(target.sun), skyC: new THREE.Color(target.sky), groundC: new THREE.Color(target.ground), bgC: new THREE.Color(target.background), dir: new THREE.Vector3(...target.sunFrom).normalize() });
  const span = Math.max(room.width, room.depth);

  useEffect(() => {
    if (!scene.background) scene.background = new THREE.Color(target.background);
    if (sun.current) {
      sun.current.shadow.camera.layers.enable(1);
      sun.current.target.position.set(0, 0, 0);
      scene.add(sun.current.target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cam = sun.current?.shadow.camera as THREE.OrthographicCamera | undefined;
    if (!cam) return;
    const e = span / 2 + 1.2;
    cam.left = -e; cam.right = e; cam.top = e; cam.bottom = -e;
    cam.near = 0.5; cam.far = span * 4 + 20;
    cam.updateProjectionMatrix();
  }, [span]);

  useFrame((_, dt) => {
    const c = current.current;
    const k = instant ? 1 : 1 - Math.exp(-dt * 3.2);
    c.sunIntensity += (target.sunIntensity - c.sunIntensity) * k;
    c.hemi += (target.hemi - c.hemi) * k;
    c.env += (target.env - c.env) * k;
    c.exposure += (target.exposure - c.exposure) * k;
    c.lamps += (target.lamps - c.lamps) * k;
    c.sunC.lerp(tmpA.set(target.sun), k);
    c.skyC.lerp(tmpA.set(target.sky), k);
    c.groundC.lerp(tmpA.set(target.ground), k);
    c.bgC.lerp(tmpA.set(target.background), k);
    c.dir.lerp(tmpV.set(...target.sunFrom).normalize(), k).normalize();

    if (sun.current) {
      sun.current.color.copy(c.sunC);
      sun.current.intensity = c.sunIntensity;
      sun.current.position.copy(c.dir).multiplyScalar(span * 1.6 + 6);
    }
    if (hemi.current) {
      hemi.current.color.copy(c.skyC);
      hemi.current.groundColor.copy(c.groundC);
      hemi.current.intensity = c.hemi;
    }
    if (scene.background instanceof THREE.Color) scene.background.copy(c.bgC);
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = c.env;
    gl.toneMappingExposure = c.exposure;
    setLampGlow(c.lamps);
    if (Math.abs(c.lamps - lampLevel) > 0.04 || (target.lamps === 0 && lampLevel !== 0 && c.lamps < 0.02)) setLampLevel(c.lamps < 0.02 ? 0 : c.lamps);
  });

  return (
    <LampContext.Provider value={lampLevel}>
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
      />
      <hemisphereLight ref={hemi} />
      <ambientLight intensity={0.12} color="#fff6ea" />
      <StudioEnvironment />
      {children}
    </LampContext.Provider>
  );
}

/** A soft studio environment for reflections, generated locally (no HDR download). */
export function StudioEnvironment() {
  const forms = useMemo(
    () => [
      { position: [0, 6, -6] as [number, number, number], scale: [12, 4, 1] as [number, number, number], intensity: 1.4, color: '#fff3e2' },
      { position: [-7, 3, 2] as [number, number, number], scale: [4, 6, 1] as [number, number, number], intensity: 0.8, color: '#f2efe9' },
      { position: [7, 2, 3] as [number, number, number], scale: [5, 3, 1] as [number, number, number], intensity: 0.6, color: '#efe5d4' },
    ],
    [],
  );
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={['#cfc9bf']} />
      {forms.map((f, i) => (
        <Lightformer key={i} form="rect" position={f.position} scale={f.scale} intensity={f.intensity} color={f.color} target={[0, 0, 0]} />
      ))}
    </Environment>
  );
}
