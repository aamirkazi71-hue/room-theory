/**
 * Shared Three.js materials. Furniture materials are cached by id so every
 * sofa in a scene shares one GPU material; room surfaces are cached by
 * finish + tint + repeat. Nothing here is disposed during normal use — the
 * set is small and bounded — but `disposeAll` exists for teardown.
 */
import * as THREE from 'three';
import { getMaterialDef, type SurfaceFinish } from '@/data/materials';
import { generateTexture, type TextureKind } from './textures';

const furnitureCache = new Map<string, THREE.MeshStandardMaterial>();
const surfaceCache = new Map<string, THREE.MeshStandardMaterial>();
const textureCache = new Map<string, { map: THREE.Texture; bump: THREE.Texture }>();

function textures(kind: TextureKind, color: string, size = 512) {
  const key = `${kind}|${color}|${size}`;
  let t = textureCache.get(key);
  if (!t) {
    const maps = generateTexture(kind, color, size);
    const map = new THREE.CanvasTexture(maps.color);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 8;
    const bump = new THREE.CanvasTexture(maps.height);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    t = { map, bump };
    textureCache.set(key, t);
  }
  return t;
}

function withRepeat(tex: THREE.Texture, rx: number, ry: number) {
  const c = tex.clone();
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  return c;
}

export function getFurnitureMaterial(id: string): THREE.MeshStandardMaterial {
  const hit = furnitureCache.get(id);
  if (hit) return hit;
  const def = getMaterialDef(id);
  const params: THREE.MeshPhysicalMaterialParameters = {
    color: def.texture ? '#ffffff' : def.color,
    roughness: def.roughness,
    metalness: def.metalness ?? 0,
  };
  if (def.texture) {
    const { map, bump } = textures(def.texture, def.color, def.family === 'rug' ? 512 : 512);
    const r = def.repeat ?? 1;
    params.map = r === 1 ? map : withRepeat(map, r, r);
    if (def.bump) {
      params.bumpMap = r === 1 ? bump : withRepeat(bump, r, r);
      params.bumpScale = def.bump * 1.2;
    }
  }
  let mat: THREE.MeshStandardMaterial;
  if (def.sheen) {
    mat = new THREE.MeshPhysicalMaterial({ ...params, sheen: 0.6, sheenRoughness: 0.75, sheenColor: new THREE.Color(def.color).lerp(new THREE.Color('#ffffff'), 0.4) });
  } else if (def.family === 'stone' && def.roughness < 0.4) {
    mat = new THREE.MeshPhysicalMaterial({ ...params, clearcoat: 0.25, clearcoatRoughness: 0.35 });
  } else {
    mat = new THREE.MeshStandardMaterial(params);
  }
  mat.name = id;
  furnitureCache.set(id, mat);
  return mat;
}

export function getSurfaceMaterial(finish: SurfaceFinish, tint: string | null, widthM: number, heightM: number): THREE.MeshStandardMaterial {
  const color = finish.tintable && tint ? tint : finish.color;
  const rx = Math.max(0.25, Math.round((widthM / finish.tile) * 100) / 100);
  const ry = Math.max(0.25, Math.round((heightM / finish.tile) * 100) / 100);
  const key = `${finish.id}|${color}|${rx}|${ry}`;
  const hit = surfaceCache.get(key);
  if (hit) return hit;
  const params: THREE.MeshStandardMaterialParameters = { color, roughness: finish.roughness, metalness: 0 };
  if (finish.texture) {
    const { map, bump } = textures(finish.texture, color, 1024);
    params.color = '#ffffff';
    params.map = withRepeat(map, rx, ry);
    if (finish.bump) {
      params.bumpMap = withRepeat(bump, rx, ry);
      params.bumpScale = finish.bump;
    }
  }
  const mat = new THREE.MeshStandardMaterial(params);
  surfaceCache.set(key, mat);
  return mat;
}

/* Fixed materials used inside models (not user-customisable) */
const fixed = new Map<string, THREE.Material>();
function fixedMat(key: string, make: () => THREE.Material) {
  let m = fixed.get(key);
  if (!m) { m = make(); fixed.set(key, m); }
  return m;
}

export const F = {
  glass: () => fixedMat('glass', () => new THREE.MeshPhysicalMaterial({ color: '#dfe6e4', roughness: 0.05, metalness: 0, transmission: 0.0, transparent: true, opacity: 0.18 })),
  frame: () => fixedMat('frame', () => new THREE.MeshStandardMaterial({ color: '#2b2b28', roughness: 0.5, metalness: 0.4 })),
  frameLight: () => fixedMat('frameLight', () => new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.6 })),
  shadeGlow: () => fixedMat('shadeGlow', () => new THREE.MeshStandardMaterial({ color: '#efe6d4', emissive: '#ffd9a0', emissiveIntensity: 0.0, roughness: 0.9, side: THREE.DoubleSide })),
  opal: () => fixedMat('opal', () => new THREE.MeshStandardMaterial({ color: '#f3efe6', emissive: '#ffdcae', emissiveIntensity: 0.0, roughness: 0.35 })),
  bulb: () => fixedMat('bulb', () => new THREE.MeshBasicMaterial({ color: '#fff3dc' })),
  leaf: () => fixedMat('leaf', () => new THREE.MeshStandardMaterial({ color: '#5f6a48', roughness: 0.8, flatShading: true })),
  leafLight: () => fixedMat('leafLight', () => new THREE.MeshStandardMaterial({ color: '#7d8760', roughness: 0.8, flatShading: true })),
  bark: () => fixedMat('bark', () => new THREE.MeshStandardMaterial({ color: '#5a4a3b', roughness: 0.9 })),
  soil: () => fixedMat('soil', () => new THREE.MeshStandardMaterial({ color: '#3a3129', roughness: 1 })),
  white: () => fixedMat('white', () => new THREE.MeshStandardMaterial({ color: '#f1eee8', roughness: 0.9 })),
  cord: () => fixedMat('cord', () => new THREE.MeshStandardMaterial({ color: '#1f1f1d', roughness: 0.7 })),
  book: (i: number) => fixedMat(`book${i}`, () => new THREE.MeshStandardMaterial({ color: ['#2f3a33', '#b9ab92', '#8a5a3c', '#e4ddd0', '#535a6b', '#a39a87'][i % 6], roughness: 0.8 })),
  pages: () => fixedMat('pages', () => new THREE.MeshStandardMaterial({ color: '#efe8da', roughness: 0.95 })),
  sink: () => fixedMat('sink', () => new THREE.MeshStandardMaterial({ color: '#3a3936', roughness: 0.35, metalness: 0.6 })),
  door: () => fixedMat('door', () => new THREE.MeshStandardMaterial({ color: '#e7e2d8', roughness: 0.7 })),
  skirting: () => fixedMat('skirting', () => new THREE.MeshStandardMaterial({ color: '#e4dfd5', roughness: 0.8 })),
  ceiling: () => fixedMat('ceiling', () => new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.95, side: THREE.DoubleSide })),
  screen: () => fixedMat('screen', () => new THREE.MeshPhysicalMaterial({ color: '#0c0d0f', roughness: 0.12, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, emissive: '#2b3442', emissiveIntensity: 0 })),
  speakerCone: () => fixedMat('speakerCone', () => new THREE.MeshStandardMaterial({ color: '#1c1c1b', roughness: 0.6 })),
  vinyl: () => fixedMat('vinyl', () => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.25, metalness: 0.1 })),
  label: () => fixedMat('label', () => new THREE.MeshStandardMaterial({ color: '#b26f4c', roughness: 0.8 })),
  shadow: () => fixedMat('shadow', () => new THREE.ShadowMaterial({ opacity: 0.18 })),
};

/** Artwork canvas: a quiet abstract composition drawn once. */
let artTex: THREE.Texture | null = null;
export function artworkTexture(): THREE.Texture {
  if (artTex) return artTex;
  const c = document.createElement('canvas');
  c.width = 384; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9e3d6'; g.fillRect(0, 0, 384, 512);
  // paper grain
  const img = g.getImageData(0, 0, 384, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  g.fillStyle = '#b26f4c'; g.beginPath(); g.arc(150, 210, 92, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3d3c37'; g.fillRect(205, 250, 110, 190);
  g.fillStyle = '#8a8e74'; g.fillRect(60, 330, 170, 22);
  g.strokeStyle = '#2b2a26'; g.lineWidth = 2; g.beginPath(); g.moveTo(60, 120); g.lineTo(320, 120); g.stroke();
  artTex = new THREE.CanvasTexture(c);
  artTex.colorSpace = THREE.SRGBColorSpace;
  return artTex;
}

export function disposeAll() {
  furnitureCache.forEach((m) => m.dispose());
  surfaceCache.forEach((m) => m.dispose());
  textureCache.forEach((t) => { t.map.dispose(); t.bump.dispose(); });
  furnitureCache.clear(); surfaceCache.clear(); textureCache.clear();
}

/* ------------------------------------------------------------------ */
/* Lamp glow — shades and diffusers share one global glow level        */
/* ------------------------------------------------------------------ */

const glowMats = new Set<THREE.MeshStandardMaterial>();
let glowLevel = 0;

/** A lamp-shade version of a fabric/ceramic material: double-sided and able to glow. */
export function getShadeMaterial(id: string): THREE.MeshStandardMaterial {
  const key = `shade:${id}`;
  const hit = furnitureCache.get(key);
  if (hit) return hit;
  const base = getFurnitureMaterial(id);
  const mat = new THREE.MeshStandardMaterial({
    color: base.color,
    map: base.map,
    roughness: 0.9,
    side: THREE.DoubleSide,
    emissive: new THREE.Color('#ffc98a'),
    emissiveMap: base.map,
    emissiveIntensity: glowLevel,
  });
  furnitureCache.set(key, mat);
  glowMats.add(mat);
  return mat;
}

export function setLampGlow(level: number) {
  glowLevel = level;
  glowMats.forEach((m) => (m.emissiveIntensity = level));
  (F.opal() as THREE.MeshStandardMaterial).emissiveIntensity = level * 1.6;
  (F.shadeGlow() as THREE.MeshStandardMaterial).emissiveIntensity = level;
  // Screens catch a little ambient glow after dark so they don't read as holes.
  (F.screen() as THREE.MeshStandardMaterial).emissiveIntensity = level * 0.35;
}
