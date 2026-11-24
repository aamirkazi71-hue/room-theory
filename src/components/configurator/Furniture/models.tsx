/**
 * Procedural furniture. Every model is built in metres, faces +Z, and has
 * its origin at the centre of its footprint on the floor. Materials arrive
 * per slot (`m.upholstery`, `m.base`…) so swapping a finish swaps a shared
 * material, never geometry.
 */
import { createContext, useContext, useMemo } from 'react';
import * as THREE from 'three';
import type { ModelKey } from '@/data/furniture';
import { F, artworkTexture, getShadeMaterial } from '@/lib/threeMaterials';
import { Box, Cyl, RBox, RCyl, Strut, arcBand, extrudeShape, lathe, seeded } from './parts';

export type Mats = Record<string, THREE.Material>;
export interface ModelProps { m: Mats; ids: Record<string, string>; ceiling?: number }

/** Lamp output (0 = off). Provided by the scene's lighting rig. */
export const LampContext = createContext(0);
const useLamp = () => useContext(LampContext);

function LampLight({ y, power = 1, distance = 5 }: { y: number; power?: number; distance?: number }) {
  const level = useLamp();
  if (level <= 0.01) return null;
  return <pointLight position={[0, y, 0]} intensity={level * power * 4.2} distance={distance * 1.3} decay={1.5} color="#ffcf96" />;
}

/* ——————————————————————————— Seating ——————————————————————————— */

function Sofa({ m }: ModelProps) {
  const W = 2.8, D = 0.98, arm = 0.18;
  const inner = W - arm * 2;
  const cw = inner / 3;
  return (
    <group>
      <Box size={[W - 0.16, 0.08, D - 0.16]} position={[0, 0.04, 0]} mat={m.base} />
      <RBox size={[W, 0.2, D]} r={0.03} position={[0, 0.18, 0]} mat={m.upholstery} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[arm, 0.5, D]} r={0.06} position={[s * (W / 2 - arm / 2), 0.33, 0]} mat={m.upholstery} />
      ))}
      <RBox size={[W - 0.02, 0.44, 0.22]} r={0.06} position={[0, 0.5, -D / 2 + 0.11]} mat={m.upholstery} />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-inner / 2 + cw / 2 + i * cw, 0, 0]}>
          <RBox size={[cw - 0.012, 0.17, 0.72]} r={0.07} position={[0, 0.365, D / 2 - 0.37]} mat={m.upholstery} />
          <RBox size={[cw - 0.03, 0.42, 0.17]} r={0.08} position={[0, 0.6, -D / 2 + 0.3]} rotation={[-0.16, 0, 0]} mat={m.upholstery} />
        </group>
      ))}
    </group>
  );
}

function LoungeChair({ m }: ModelProps) {
  const W = 0.78, D = 0.86;
  const x = W / 2 - 0.035;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Strut from={[s * x, 0, D / 2 - 0.08]} to={[s * x, 0.58, D / 2 - 0.1]} r={0.022} rTo={0.026} mat={m.frame} />
          <Strut from={[s * x, 0, -D / 2 + 0.06]} to={[s * x, 0.6, -D / 2 + 0.22]} r={0.022} rTo={0.026} mat={m.frame} />
          <RBox size={[0.075, 0.032, D - 0.08]} r={0.012} position={[s * x, 0.6, 0.0]} mat={m.frame} />
          <RBox size={[0.04, 0.05, D - 0.18]} r={0.01} position={[s * x, 0.2, 0]} mat={m.frame} />
        </group>
      ))}
      <RBox size={[W - 0.06, 0.05, 0.04]} r={0.01} position={[0, 0.22, D / 2 - 0.09]} mat={m.frame} />
      <RBox size={[W - 0.06, 0.05, 0.04]} r={0.01} position={[0, 0.22, -D / 2 + 0.12]} mat={m.frame} />
      <RBox size={[W - 0.14, 0.13, 0.66]} r={0.055} position={[0, 0.31, 0.04]} rotation={[-0.07, 0, 0]} mat={m.upholstery} />
      <RBox size={[W - 0.14, 0.5, 0.13]} r={0.06} position={[0, 0.56, -D / 2 + 0.2]} rotation={[-0.34, 0, 0]} mat={m.upholstery} />
    </group>
  );
}

function AccentChair({ m }: ModelProps) {
  const open = 1.9; // opening angle at the front
  const phiStart = open / 2;
  const phiLength = Math.PI * 2 - open;
  const shellProfile: [number, number][] = [[0.3, 0.22], [0.38, 0.22], [0.385, 0.6], [0.37, 0.67], [0.34, 0.69], [0.31, 0.66], [0.3, 0.6], [0.3, 0.22]];
  const shell = lathe('pellShell', shellProfile, 64, phiStart, phiLength);
  const capR = 0.04;
  const capAt = (phi: number) => [Math.sin(phi) * 0.34, 0.22, Math.cos(phi) * 0.34] as [number, number, number];
  return (
    <group>
      <RCyl r={0.27} h={0.1} bevel={0.01} position={[0, 0, 0]} mat={m.base} />
      <RCyl r={0.36} h={0.16} bevel={0.05} position={[0, 0.08, 0]} mat={m.upholstery} />
      <RCyl r={0.31} h={0.13} bevel={0.06} position={[0, 0.21, 0.02]} mat={m.upholstery} />
      <mesh geometry={shell} material={m.upholstery} castShadow receiveShadow />
      {[phiStart, phiStart + phiLength].map((phi) => (
        <group key={phi} position={capAt(phi)}>
          <RCyl r={capR} h={0.47} bevel={0.035} mat={m.upholstery} />
        </group>
      ))}
    </group>
  );
}

function Ottoman({ m }: ModelProps) {
  return (
    <group>
      <RCyl r={0.31} h={0.4} bevel={0.09} mat={m.upholstery} />
    </group>
  );
}

function DiningChair({ m }: ModelProps) {
  const back = arcBand(0.34, 0.31, 1.25, 0.075);
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Strut key={`${sx}${sz}`} from={[sx * 0.205, 0, sz * 0.21]} to={[sx * 0.195, 0.44, sz * 0.2]} r={0.017} rTo={0.02} mat={m.frame} />
      ))}
      <RBox size={[0.47, 0.04, 0.47]} r={0.012} position={[0, 0.455, 0]} mat={m.frame} />
      <RBox size={[0.43, 0.055, 0.42]} r={0.022} position={[0, 0.5, 0.01]} mat={m.seat} />
      {[-1, 1].map((s) => (
        <Strut key={s} from={[s * 0.195, 0.45, -0.2]} to={[s * 0.2, 0.75, -0.24]} r={0.016} mat={m.frame} />
      ))}
      <mesh geometry={back} material={m.frame} position={[0, 0.69, 0.03]} castShadow receiveShadow />
    </group>
  );
}

function CounterStool({ m }: ModelProps) {
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Strut key={`${sx}${sz}`} from={[sx * 0.19, 0, sz * 0.19]} to={[sx * 0.125, 0.61, sz * 0.125]} r={0.016} rTo={0.019} mat={m.frame} />
      ))}
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={m.ring}>
        <torusGeometry args={[0.235, 0.008, 10, 48]} />
      </mesh>
      <RCyl r={0.19} h={0.05} bevel={0.018} position={[0, 0.61, 0]} mat={m.frame} />
    </group>
  );
}

/* ——————————————————————————— Tables ——————————————————————————— */

function CoffeeTable({ m }: ModelProps) {
  return (
    <group>
      <RBox size={[1.2, 0.06, 0.7]} r={0.018} position={[0, 0.31, 0]} mat={m.top} />
      <RBox size={[0.34, 0.28, 0.5]} r={0.01} position={[-0.33, 0.14, 0.02]} mat={m.base} />
      <RBox size={[0.24, 0.28, 0.44]} r={0.01} position={[0.38, 0.14, -0.04]} mat={m.base} />
    </group>
  );
}

function SideTable({ m }: ModelProps) {
  return (
    <group>
      <RCyl r={0.19} h={0.045} bevel={0.012} mat={m.body} />
      <Cyl r={0.085} rTop={0.075} h={0.42} seg={14} position={[0, 0.245, 0]} mat={m.body} />
      <RCyl r={0.22} h={0.045} bevel={0.012} position={[0, 0.455, 0]} mat={m.body} />
    </group>
  );
}

function DiningTable({ m }: ModelProps) {
  return (
    <group>
      <RBox size={[2.2, 0.042, 0.95]} r={0.012} position={[0, 0.729, 0]} mat={m.top} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <RBox size={[0.085, 0.69, 0.72]} r={0.01} position={[s * 0.72, 0.345, 0]} mat={m.legs} />
          <RBox size={[0.18, 0.04, 0.78]} r={0.008} position={[s * 0.72, 0.02, 0]} mat={m.legs} />
        </group>
      ))}
      <RBox size={[1.44, 0.06, 0.05]} r={0.008} position={[0, 0.66, 0]} mat={m.legs} />
    </group>
  );
}

function ConsoleTable({ m }: ModelProps) {
  const geo = extrudeShape('arcConsole', () => {
    const s = new THREE.Shape();
    const r = 0.38, spring = 0.26;
    s.moveTo(-0.7, 0);
    s.lineTo(-r, 0);
    s.lineTo(-r, spring);
    s.absarc(0, spring, r, Math.PI, 0, true);
    s.lineTo(r, 0);
    s.lineTo(0.7, 0);
    s.lineTo(0.7, 0.8);
    s.lineTo(-0.7, 0.8);
    s.closePath();
    return s;
  }, 0.33, 0.012);
  return (
    <group>
      <mesh geometry={geo} material={m.body} position={[0, 0, -0.165]} castShadow receiveShadow />
    </group>
  );
}

function Desk({ m }: ModelProps) {
  return (
    <group>
      <RBox size={[1.4, 0.03, 0.7]} r={0.008} position={[0, 0.735, 0]} mat={m.top} />
      <RBox size={[0.62, 0.06, 0.46]} r={0.006} position={[0, 0.69, -0.06]} mat={m.top} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Strut key={`${sx}${sz}`} from={[sx * 0.66, 0, sz * 0.31]} to={[sx * 0.6, 0.72, sz * 0.27]} r={0.012} mat={m.legs} />
      ))}
      {[-1, 1].map((s) => (
        <Strut key={s} from={[s * 0.63, 0.22, -0.29]} to={[s * 0.63, 0.22, 0.29]} r={0.009} mat={m.legs} />
      ))}
    </group>
  );
}

/* ——————————————————————————— Lighting ——————————————————————————— */

function FloorLamp({ m, ids }: ModelProps) {
  const shade = getShadeMaterial(ids.shade ?? 'linen-natural');
  return (
    <group>
      <RCyl r={0.15} h={0.025} bevel={0.008} mat={m.metal} />
      <Cyl r={0.009} h={1.36} position={[0, 0.7, 0]} mat={m.metal} seg={12} />
      <Cyl r={0.022} h={0.06} position={[0, 1.37, 0]} mat={m.metal} seg={16} />
      <mesh position={[0, 1.47, 0]} geometry={useMemo(() => new THREE.CylinderGeometry(0.165, 0.2, 0.27, 48, 1, true), [])} material={shade} castShadow />
      <mesh position={[0, 1.42, 0]} material={F.bulb()}>
        <sphereGeometry args={[0.03, 16, 12]} />
      </mesh>
      <LampLight y={1.42} power={1.2} />
    </group>
  );
}

function TableLamp({ m }: ModelProps) {
  const dome = lathe('domeShade', [[0.0, 0.17], [0.05, 0.168], [0.1, 0.155], [0.135, 0.13], [0.152, 0.1], [0.155, 0.085], [0.0, 0.085]], 48);
  return (
    <group>
      <RCyl r={0.085} h={0.03} bevel={0.01} mat={m.body} />
      <Cyl r={0.032} rTop={0.022} h={0.26} position={[0, 0.16, 0]} mat={m.body} />
      <group position={[0, 0.2, 0]}>
        <mesh geometry={dome} material={m.body} castShadow />
        <mesh position={[0, 0.084, 0]} rotation={[Math.PI / 2, 0, 0]} material={F.opal()}>
          <circleGeometry args={[0.15, 40]} />
        </mesh>
      </group>
      <LampLight y={0.24} power={0.55} distance={3} />
    </group>
  );
}

function Pendant({ m, ceiling = 1.2 }: ModelProps) {
  const shade = lathe('haloShade', [[0.02, 0.2], [0.06, 0.198], [0.14, 0.17], [0.2, 0.1], [0.225, 0.02], [0.228, 0.0], [0.215, 0.0], [0.212, 0.02], [0.188, 0.095], [0.13, 0.16], [0.055, 0.186], [0.02, 0.188]], 56);
  return (
    <group>
      <mesh geometry={shade} material={m.metal} castShadow />
      <mesh position={[0, 0.07, 0]} material={F.opal()}>
        <sphereGeometry args={[0.1, 32, 20]} />
      </mesh>
      <Cyl r={0.004} h={ceiling - 0.2} position={[0, 0.2 + (ceiling - 0.2) / 2, 0]} mat={F.cord()} seg={8} />
      <Cyl r={0.06} h={0.02} position={[0, ceiling - 0.01, 0]} mat={m.metal} />
      <LampLight y={0.0} power={1.1} distance={4.5} />
    </group>
  );
}

/* ——————————————————————————— Decor ——————————————————————————— */

function Plant({ m }: ModelProps) {
  const pot = lathe('plantPot', [[0, 0], [0.19, 0], [0.2, 0.01], [0.235, 0.38], [0.245, 0.4], [0.245, 0.42], [0.225, 0.42], [0.215, 0.39], [0, 0.39]], 48);
  const clusters = useMemo(() => {
    const r = seeded(42);
    return Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + r() * 0.6;
      const rad = 0.08 + r() * 0.24;
      return { pos: [Math.cos(a) * rad, 0.95 + r() * 0.7, Math.sin(a) * rad] as [number, number, number], s: 0.11 + r() * 0.09, light: r() > 0.55, rot: r() * 3 };
    });
  }, []);
  const leafGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  return (
    <group>
      <mesh geometry={pot} material={m.pot} castShadow receiveShadow />
      <Cyl r={0.21} h={0.01} position={[0, 0.385, 0]} mat={F.soil()} />
      <Strut from={[0, 0.38, 0]} to={[0.04, 1.0, 0.02]} r={0.028} rTo={0.02} mat={F.bark()} />
      <Strut from={[0.03, 0.8, 0.01]} to={[-0.16, 1.32, 0.06]} r={0.016} rTo={0.01} mat={F.bark()} />
      <Strut from={[0.04, 0.95, 0.02]} to={[0.18, 1.45, -0.08]} r={0.015} rTo={0.009} mat={F.bark()} />
      <Strut from={[0.04, 1.0, 0.02]} to={[0.0, 1.55, 0.12]} r={0.012} rTo={0.008} mat={F.bark()} />
      {clusters.map((c, i) => (
        <mesh key={i} geometry={leafGeo} material={c.light ? F.leafLight() : F.leaf()} position={c.pos} scale={[c.s * 1.25, c.s * 0.8, c.s]} rotation={[c.rot, c.rot * 0.5, 0]} castShadow />
      ))}
    </group>
  );
}

function Vase({ m }: ModelProps) {
  const body = lathe('urn', [[0, 0], [0.07, 0], [0.085, 0.01], [0.115, 0.08], [0.128, 0.16], [0.12, 0.22], [0.085, 0.27], [0.055, 0.3], [0.05, 0.33], [0.058, 0.35], [0.05, 0.352], [0.042, 0.33], [0, 0.33]], 48);
  return (
    <group>
      <mesh geometry={body} material={m.body} castShadow receiveShadow />
      <Strut from={[0, 0.3, 0]} to={[0.08, 0.78, 0.03]} r={0.004} rTo={0.002} mat={F.bark()} seg={6} />
      <Strut from={[0.04, 0.55, 0.015]} to={[0.16, 0.7, -0.02]} r={0.003} rTo={0.0015} mat={F.bark()} seg={6} />
      <Strut from={[0, 0.3, 0]} to={[-0.09, 0.66, -0.04]} r={0.0035} rTo={0.002} mat={F.bark()} seg={6} />
    </group>
  );
}

function Books() {
  const stack = [
    { s: [0.31, 0.034, 0.235], r: 0.02, c: 0 },
    { s: [0.28, 0.028, 0.215], r: -0.06, c: 1 },
    { s: [0.3, 0.042, 0.228], r: 0.05, c: 2 },
    { s: [0.25, 0.026, 0.19], r: -0.02, c: 3 },
  ] as const;
  let y = 0;
  return (
    <group>
      {stack.map((b, i) => {
        const cy = y + b.s[1] / 2;
        y += b.s[1];
        return (
          <group key={i} position={[0, cy, 0]} rotation={[0, b.r, 0]}>
            <Box size={[b.s[0], b.s[1], b.s[2]]} mat={F.book(b.c)} />
            <Box size={[b.s[0] - 0.008, b.s[1] - 0.006, b.s[2] + 0.002]} position={[0.006, 0, 0]} mat={F.pages()} />
          </group>
        );
      })}
    </group>
  );
}

function Rug({ m }: ModelProps) {
  return <RBox size={[2.4, 0.012, 1.7]} r={0.004} position={[0, 0.006, 0]} mat={m.rug} castShadow={false} />;
}

function Artwork({ m }: ModelProps) {
  const W = 0.76, H = 1.0, D = 0.035, b = 0.03;
  const art = useMemo(() => new THREE.MeshStandardMaterial({ map: artworkTexture(), roughness: 0.95 }), []);
  return (
    <group position={[0, H / 2, 0]}>
      <Box size={[W, b, D]} position={[0, H / 2 - b / 2, 0]} mat={m.frame} />
      <Box size={[W, b, D]} position={[0, -H / 2 + b / 2, 0]} mat={m.frame} />
      <Box size={[b, H - b * 2, D]} position={[-W / 2 + b / 2, 0, 0]} mat={m.frame} />
      <Box size={[b, H - b * 2, D]} position={[W / 2 - b / 2, 0, 0]} mat={m.frame} />
      <Box size={[W - b * 2, H - b * 2, 0.006]} position={[0, 0, -0.008]} mat={F.white()} />
      <mesh position={[0, 0.02, -0.004]} material={art}>
        <planeGeometry args={[W - 0.2, (W - 0.2) * 1.333]} />
      </mesh>
    </group>
  );
}

/* ——————————————————————————— Bedroom ——————————————————————————— */

function Bed({ m }: ModelProps) {
  const W = 1.86, D = 2.16;
  const zHead = -D / 2 + 0.05;
  return (
    <group>
      <Box size={[W - 0.12, 0.08, D - 0.2]} position={[0, 0.04, 0.04]} mat={m.frame} />
      <RBox size={[W, 0.18, D - 0.1]} r={0.015} position={[0, 0.17, 0.05]} mat={m.frame} />
      <RBox size={[W, 0.96, 0.06]} r={0.012} position={[0, 0.48, zHead - 0.02]} mat={m.frame} />
      {[-1, 0, 1].map((i) => (
        <RBox key={i} size={[0.6, 0.6, 0.09]} r={0.04} position={[i * 0.615, 0.6, zHead + 0.05]} mat={m.headboard} />
      ))}
      <RBox size={[1.8, 0.22, 1.98]} r={0.06} position={[0, 0.36, 0.08]} mat={F.white()} />
      <RBox size={[1.86, 0.06, 1.46]} r={0.03} position={[0, 0.485, 0.35]} mat={m.bedding} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.03, 0.26, 1.46]} r={0.012} position={[s * 0.935, 0.37, 0.35]} mat={m.bedding} />
      ))}
      <RBox size={[1.87, 0.045, 0.42]} r={0.02} position={[0, 0.535, 0.8]} mat={m.headboard} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.72, 0.15, 0.44]} r={0.07} position={[s * 0.42, 0.56, -0.72]} rotation={[-0.3, 0, 0]} mat={m.bedding} />
      ))}
      {[-1, 1].map((s) => (
        <RBox key={`c${s}`} size={[0.5, 0.13, 0.3]} r={0.06} position={[s * 0.3, 0.56, -0.48]} rotation={[-0.22, 0, 0]} mat={F.white()} />
      ))}
    </group>
  );
}

function Nightstand({ m }: ModelProps) {
  return (
    <group>
      <Box size={[0.44, 0.08, 0.34]} position={[0, 0.04, 0]} mat={m.body} />
      <RBox size={[0.5, 0.03, 0.4]} r={0.01} position={[0, 0.485, 0]} mat={m.body} />
      <RBox size={[0.5, 0.03, 0.4]} r={0.01} position={[0, 0.095, 0]} mat={m.body} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.03, 0.36, 0.4]} position={[s * 0.235, 0.29, 0]} mat={m.body} />
      ))}
      <RBox size={[0.44, 0.15, 0.38]} r={0.006} position={[0, 0.39, 0.005]} mat={m.body} />
      <Box size={[0.44, 0.2, 0.02]} position={[0, 0.21, -0.19]} mat={m.body} />
      <Box size={[0.12, 0.008, 0.01]} position={[0, 0.39, 0.197]} mat={F.cord()} />
    </group>
  );
}

function Wardrobe({ m }: ModelProps) {
  return (
    <group>
      <Box size={[1.12, 0.08, 0.52]} position={[0, 0.04, 0]} mat={m.body} />
      <RBox size={[1.2, 2.12, 0.6]} r={0.008} position={[0, 1.14, 0]} mat={m.body} />
      <Box size={[0.004, 2.06, 0.004]} position={[0, 1.14, 0.301]} mat={F.cord()} />
      {[-1, 1].map((s) => (
        <RBox key={s} size={[0.016, 0.5, 0.024]} r={0.006} position={[s * 0.045, 1.12, 0.31]} mat={m.pulls} />
      ))}
    </group>
  );
}

function Shelving({ m }: ModelProps) {
  const shelves = [0.02, 0.46, 0.9, 1.34, 1.875];
  const books = useMemo(() => {
    const r = seeded(7);
    const out: { x: number; y: number; h: number; w: number; c: number; tilt: number }[] = [];
    let x = -0.74;
    while (x < -0.18) { const w = 0.025 + r() * 0.02; const h = 0.22 + r() * 0.08; out.push({ x: x + w / 2, y: 0.46 + 0.0125, h, w, c: Math.floor(r() * 6), tilt: 0 }); x += w + 0.002; }
    x = 0.06;
    while (x < 0.5) { const w = 0.025 + r() * 0.02; const h = 0.2 + r() * 0.1; out.push({ x: x + w / 2, y: 1.34 + 0.0125, h, w, c: Math.floor(r() * 6), tilt: 0 }); x += w + 0.002; }
    return out;
  }, []);
  return (
    <group>
      {[-0.7875, 0, 0.7875].map((x) => (
        <Box key={x} size={[0.025, 1.9, 0.36]} position={[x, 0.95, 0]} mat={m.body} />
      ))}
      {shelves.map((y) => (
        <Box key={y} size={[1.6, 0.025, 0.36]} position={[0, y, 0]} mat={m.body} />
      ))}
      {books.map((b, i) => (
        <Box key={i} size={[b.w, b.h, 0.21]} position={[b.x, b.y + b.h / 2, 0.02]} mat={F.book(b.c)} />
      ))}
      <group position={[0.4, 0.9125, 0]}><Vase m={{ body: F.white() }} ids={{}} /></group>
      <group position={[-0.45, 1.8875, 0]} scale={0.8}><Books /></group>
      <group position={[-0.35, 0.0325, 0.02]}><Books /></group>
      <mesh position={[0.45, 0.4725 + 0.07, 0]} castShadow material={F.white()}>
        <sphereGeometry args={[0.07, 24, 16]} />
      </mesh>
    </group>
  );
}

/* ——————————————————————————— Kitchen ——————————————————————————— */

function Island({ m }: ModelProps) {
  return (
    <group>
      <Box size={[2.34, 0.08, 0.64]} position={[0, 0.04, -0.15]} mat={m.body} />
      <RBox size={[2.4, 0.8, 0.7]} r={0.008} position={[0, 0.48, -0.15]} mat={m.body} />
      {[0.3, 0.58].map((y) => (
        <Box key={y} size={[2.38, 0.004, 0.004]} position={[0, y, -0.502]} mat={F.cord()} />
      ))}
      {[-0.4, 0.4].map((x) => (
        <Box key={x} size={[0.004, 0.78, 0.004]} position={[x, 0.48, -0.502]} mat={F.cord()} />
      ))}
      <RBox size={[2.4, 0.04, 1.0]} r={0.006} position={[0, 0.9, 0]} mat={m.top} />
      <Box size={[0.56, 0.006, 0.38]} position={[-0.5, 0.921, -0.18]} mat={F.sink()} />
      <Strut from={[-0.5, 0.92, -0.42]} to={[-0.5, 1.2, -0.42]} r={0.012} mat={F.sink()} />
      <Strut from={[-0.5, 1.2, -0.42]} to={[-0.5, 1.2, -0.27]} r={0.011} mat={F.sink()} />
    </group>
  );
}

function KitchenRun({ m }: ModelProps) {
  return (
    <group>
      <Box size={[3.0, 0.1, 0.56]} position={[0, 0.05, -0.03]} mat={m.body} />
      <RBox size={[3.0, 0.78, 0.6]} r={0.006} position={[0, 0.49, -0.025]} mat={m.body} />
      {[-0.9, -0.3, 0.3, 0.9].map((x) => (
        <Box key={x} size={[0.004, 0.76, 0.004]} position={[x, 0.49, 0.277]} mat={F.cord()} />
      ))}
      <Box size={[3.0, 0.004, 0.004]} position={[0, 0.66, 0.277]} mat={F.cord()} />
      <Box size={[3.0, 0.04, 0.65]} position={[0, 0.9, 0]} mat={m.top} />
      <Box size={[3.0, 0.55, 0.02]} position={[0, 1.195, -0.315]} mat={m.top} />
      <Box size={[3.0, 0.035, 0.27]} position={[0, 1.58, -0.19]} mat={m.body} />
      <Box size={[0.56, 0.006, 0.4]} position={[0.6, 0.921, 0]} mat={F.sink()} />
      <Strut from={[0.6, 0.92, -0.26]} to={[0.6, 1.22, -0.26]} r={0.012} mat={F.sink()} />
      <Strut from={[0.6, 1.22, -0.26]} to={[0.6, 1.22, -0.1]} r={0.011} mat={F.sink()} />
      <Box size={[0.6, 0.006, 0.5]} position={[-0.75, 0.921, 0]} mat={F.frame()} />
      <group position={[-1.2, 1.5975, -0.19]}><Vase m={{ body: F.white() }} ids={{}} /></group>
      <group position={[1.1, 1.5975, -0.2]} scale={0.9}><Books /></group>
    </group>
  );
}

/* ——————————————————————————— Electronics ——————————————————————————— */

function Tv({ m }: ModelProps) {
  const W = 1.45, H = 0.835, lift = 0.06;
  return (
    <group>
      <RBox size={[W, H, 0.024]} r={0.004} position={[0, lift + H / 2, 0]} mat={m.frame} />
      <mesh position={[0, lift + H / 2, 0.0125]} material={F.screen()}>
        <planeGeometry args={[W - 0.016, H - 0.016]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Strut from={[s * 0.56, lift + 0.02, 0]} to={[s * 0.6, 0.004, 0.12]} r={0.006} mat={m.frame} seg={8} />
          <Strut from={[s * 0.56, lift + 0.02, 0]} to={[s * 0.6, 0.004, -0.12]} r={0.006} mat={m.frame} seg={8} />
        </group>
      ))}
    </group>
  );
}

function WallTv({ m }: ModelProps) {
  const W = 1.67, H = 0.96;
  return (
    <group position={[0, H / 2, 0]}>
      <RBox size={[W, H, 0.03]} r={0.004} position={[0, 0, -0.005]} mat={m.frame} />
      <mesh position={[0, 0, 0.0105]} material={F.screen()}>
        <planeGeometry args={[W - 0.014, H - 0.014]} />
      </mesh>
    </group>
  );
}

function MediaConsole({ m }: ModelProps) {
  const doors = [-0.75, -0.25, 0.25, 0.75];
  return (
    <group>
      <Box size={[1.9, 0.06, 0.38]} position={[0, 0.03, -0.01]} mat={m.body} />
      <RBox size={[2.0, 0.4, 0.45]} r={0.008} position={[0, 0.26, 0]} mat={m.body} />
      {[-0.5, 0, 0.5].map((x) => (
        <Box key={x} size={[0.004, 0.37, 0.004]} position={[x, 0.26, 0.226]} mat={F.cord()} />
      ))}
      {doors.flatMap((x) => [0, 1, 2, 3, 4].map((i) => (
        <Box key={`${x}-${i}`} size={[0.34, 0.005, 0.004]} position={[x, 0.41 - i * 0.022, 0.226]} mat={F.cord()} />
      )))}
    </group>
  );
}

function Speaker({ m }: ModelProps) {
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Cyl key={`${sx}${sz}`} r={0.012} h={0.03} position={[sx * 0.08, 0.015, sz * 0.11]} mat={F.cord()} seg={12} />
      ))}
      <RBox size={[0.22, 1.0, 0.3]} r={0.012} position={[0, 0.53, 0]} mat={m.cabinet} />
      <RBox size={[0.2, 0.96, 0.014]} r={0.006} position={[0, 0.53, 0.153]} mat={m.grille} />
    </group>
  );
}

function Soundbar({ m }: ModelProps) {
  return (
    <group>
      <RBox size={[1.0, 0.07, 0.1]} r={0.03} position={[0, 0.035, 0]} mat={m.grille} />
    </group>
  );
}

function Turntable({ m }: ModelProps) {
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Cyl key={`${sx}${sz}`} r={0.02} h={0.02} position={[sx * 0.19, 0.01, sz * 0.14]} mat={F.cord()} seg={16} />
      ))}
      <RBox size={[0.45, 0.07, 0.36]} r={0.008} position={[0, 0.055, 0]} mat={m.plinth} />
      <Cyl r={0.15} h={0.02} position={[-0.05, 0.1, 0]} mat={m.platter} seg={48} />
      <Cyl r={0.148} h={0.003} position={[-0.05, 0.1115, 0]} mat={F.vinyl()} seg={48} />
      <Cyl r={0.045} h={0.002} position={[-0.05, 0.1135, 0]} mat={F.label()} seg={32} />
      <Cyl r={0.018} h={0.035} position={[0.165, 0.108, -0.11]} mat={m.platter} seg={16} />
      <Strut from={[0.165, 0.125, -0.11]} to={[0.02, 0.122, 0.07]} r={0.004} mat={m.platter} seg={8} />
      <Box size={[0.03, 0.008, 0.045]} position={[0.02, 0.118, 0.08]} mat={F.cord()} />
    </group>
  );
}

export const models: Record<ModelKey, (p: ModelProps) => JSX.Element> = {
  tv: Tv, wallTv: WallTv, mediaConsole: MediaConsole, speaker: Speaker, soundbar: Soundbar, turntable: Turntable,
  sofa: Sofa, loungeChair: LoungeChair, accentChair: AccentChair, ottoman: Ottoman, diningChair: DiningChair, counterStool: CounterStool,
  coffeeTable: CoffeeTable, sideTable: SideTable, diningTable: DiningTable, console: ConsoleTable, desk: Desk,
  floorLamp: FloorLamp, tableLamp: TableLamp, pendant: Pendant,
  plant: Plant, vase: Vase, books: Books, rug: Rug, artwork: Artwork,
  bed: Bed, nightstand: Nightstand, wardrobe: Wardrobe, shelving: Shelving, island: Island, kitchenRun: KitchenRun,
};
