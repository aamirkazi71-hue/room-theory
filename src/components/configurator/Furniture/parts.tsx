/**
 * Geometry primitives for procedural furniture. Geometries are cached by
 * their arguments so every instance of a model shares GPU buffers.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ThreeElements } from '@react-three/fiber';

type V3 = [number, number, number];
type MeshProps = Omit<ThreeElements['mesh'], 'args'>;

const geoCache = new Map<string, THREE.BufferGeometry>();
function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key) as T | undefined;
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}
const k = (...n: number[]) => n.map((v) => v.toFixed(4)).join(',');

export function roundedBox(w: number, h: number, d: number, r: number) {
  const rr = Math.max(0.0005, Math.min(r, Math.min(w, h, d) / 2 - 0.0005));
  return cached(`rb${k(w, h, d, rr)}`, () => new RoundedBoxGeometry(w, h, d, 3, rr));
}

export function box(w: number, h: number, d: number) {
  return cached(`b${k(w, h, d)}`, () => new THREE.BoxGeometry(w, h, d));
}

export function cylinder(rTop: number, rBottom: number, h: number, seg = 32, open = false) {
  return cached(`c${k(rTop, rBottom, h, seg)}${open}`, () => new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open));
}

/** Cylinder with rounded top and bottom edges (cushions, ottomans, discs). Origin at the base. */
export function roundedCylinder(r: number, h: number, bevel: number, seg = 48) {
  return cached(`rc${k(r, h, bevel, seg)}`, () => {
    const b = Math.min(bevel, h / 2, r);
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, b + Math.sin(a) * b));
    }
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b));
    }
    pts.push(new THREE.Vector2(0, h));
    return new THREE.LatheGeometry(pts, seg);
  });
}

/** Revolve a profile of [radius, y] pairs. */
export function lathe(key: string, profile: [number, number][], seg = 48, phiStart = 0, phiLength = Math.PI * 2) {
  return cached(`l${key}${k(seg, phiStart, phiLength)}`, () => {
    const g = new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), seg, phiStart, phiLength);
    g.computeVertexNormals();
    return g;
  });
}

/** A curved band (annulus sector) extruded upward — chair back rails and similar. */
export function arcBand(rOuter: number, rInner: number, angle: number, height: number) {
  return cached(`ab${k(rOuter, rInner, angle, height)}`, () => {
    const s = new THREE.Shape();
    const a0 = Math.PI / 2 - angle / 2;
    const a1 = Math.PI / 2 + angle / 2;
    s.absarc(0, 0, rOuter, a0, a1, false);
    s.absarc(0, 0, rInner, a1, a0, true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  });
}

export function extrudeShape(key: string, make: () => THREE.Shape, depth: number, bevel = 0.006) {
  return cached(`ex${key}${k(depth, bevel)}`, () => {
    const g = new THREE.ExtrudeGeometry(make(), { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 40 });
    g.computeVertexNormals();
    return g;
  });
}

/* ------------------------------------------------------------------ */
/* Mesh shorthands                                                     */
/* ------------------------------------------------------------------ */

interface PartProps extends MeshProps { mat: THREE.Material }

export function RBox({ size, r = 0.02, mat, ...rest }: PartProps & { size: V3; r?: number }) {
  return <mesh geometry={roundedBox(size[0], size[1], size[2], r)} material={mat} castShadow receiveShadow {...rest} />;
}

export function Box({ size, mat, ...rest }: PartProps & { size: V3 }) {
  return <mesh geometry={box(size[0], size[1], size[2])} material={mat} castShadow receiveShadow {...rest} />;
}

export function Cyl({ r, rTop, h, seg = 32, mat, ...rest }: PartProps & { r: number; rTop?: number; h: number; seg?: number }) {
  return <mesh geometry={cylinder(rTop ?? r, r, h, seg)} material={mat} castShadow receiveShadow {...rest} />;
}

export function RCyl({ r, h, bevel = 0.02, mat, ...rest }: PartProps & { r: number; h: number; bevel?: number }) {
  return <mesh geometry={roundedCylinder(r, h, bevel)} material={mat} castShadow receiveShadow {...rest} />;
}

const UP = new THREE.Vector3(0, 1, 0);
/** A cylinder spanning two points (legs, stems, branches). */
export function Strut({ from, to, r, rTo, mat, seg = 16 }: { from: V3; to: V3; r: number; rTo?: number; mat: THREE.Material; seg?: number }) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  return <mesh geometry={cylinder(rTo ?? r, r, len, seg)} material={mat} position={mid} quaternion={q} castShadow receiveShadow />;
}

/** Deterministic pseudo-random for decorative variation. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
