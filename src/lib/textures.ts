/**
 * Procedural material textures, generated on demand in a 2D canvas.
 * Each generator returns a colour map and a height map (used as a bump map)
 * so a material reads the same in a UI swatch and on a 3D surface.
 * Everything tiles seamlessly except `rug`, which is a whole-object print.
 */
import { ValueNoise, mulberry32, clamp01, smoothstep } from './noise';

export type TextureKind =
  | 'wood' | 'planks' | 'slats' | 'tiles' | 'travertine' | 'marble' | 'concrete' | 'plaster'
  | 'terrazzo' | 'linen' | 'boucle' | 'wool' | 'leather' | 'brushed' | 'rug' | 'jute';

export interface TextureMaps { color: HTMLCanvasElement; height: HTMLCanvasElement }

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const luminance = ([r, g, b]: RGB) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const frac = (v: number) => v - Math.floor(v);

const N = new ValueNoise(7);
const N2 = new ValueNoise(23);

/** Shared wood grain field. Grain runs along v. Returns [shade, height]. */
function woodGrain(u: number, v: number, seed = 0, freq = 26): [number, number] {
  // Grain runs along v: gently drifting lines, fine pores and soft figure.
  const w = N.fbm(u * 4 + seed * 3, v * 1, 3, 4, 1);
  const drift = 0.35 * Math.sin((v + seed * 0.37) * Math.PI * 2);
  const ring = 0.5 + 0.5 * Math.sin((u * freq + w * 1.4 + drift) * Math.PI * 2);
  const line = Math.pow(ring, 5);
  const fine = N2.noise(u * 320 + seed * 17, v * 4, 320, 4);
  const pore = N.noise(u * 160, v * 40, 160, 40);
  const s = 1 - 0.13 * line - 0.09 * fine + 0.07 * (w - 0.5) - 0.04 * smoothstep(0.7, 0.95, pore);
  return [s, clamp01(0.62 - 0.35 * line - 0.25 * fine)];
}

function travertineField(u: number, v: number, seed = 0): [number, number, number] {
  const warp = N.fbm(u * 3 + seed, v * 3, 4, 3, 3);
  const band = 0.5 + 0.5 * Math.sin((v * 9 + warp * 2.2) * Math.PI * 2);
  const band2 = 0.5 + 0.5 * Math.sin((v * 23 + warp * 4) * Math.PI * 2);
  const cloud = N2.fbm(u * 4, v * 8, 4, 4, 8);
  const pore = N.noise(u * 36 + seed * 5, v * 150, 36, 150);
  const pore2 = N2.noise(u * 80, v * 260, 80, 260);
  const pit = Math.max(smoothstep(0.8, 0.9, pore), smoothstep(0.86, 0.94, pore2) * 0.7);
  const s = 0.92 + 0.08 * band - 0.07 * Math.pow(band2, 6) + 0.1 * (cloud - 0.5) - 0.32 * pit;
  return [s, clamp01(0.75 - 0.75 * pit), pit];
}

type PixelFn = (u: number, v: number, base: RGB, out: Float32Array) => void;

function render(size: number, base: RGB, fn: PixelFn): TextureMaps {
  const color = document.createElement('canvas');
  const height = document.createElement('canvas');
  color.width = color.height = height.width = height.height = size;
  const cctx = color.getContext('2d')!;
  const hctx = height.getContext('2d')!;
  const cimg = cctx.createImageData(size, size);
  const himg = hctx.createImageData(size, size);
  const out = new Float32Array(4);
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      out[0] = base[0]; out[1] = base[1]; out[2] = base[2]; out[3] = 0.5;
      fn(u, v, base, out);
      const i = (y * size + x) * 4;
      cimg.data[i] = out[0];
      cimg.data[i + 1] = out[1];
      cimg.data[i + 2] = out[2];
      cimg.data[i + 3] = 255;
      const h = clamp01(out[3]) * 255;
      himg.data[i] = himg.data[i + 1] = himg.data[i + 2] = h;
      himg.data[i + 3] = 255;
    }
  }
  cctx.putImageData(cimg, 0, 0);
  hctx.putImageData(himg, 0, 0);
  return { color, height };
}

const shade = (out: Float32Array, base: RGB, s: number) => {
  out[0] = base[0] * s; out[1] = base[1] * s; out[2] = base[2] * s;
};

const generators: Record<TextureKind, (size: number, base: RGB) => TextureMaps> = {
  wood: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const [s, h] = woodGrain(u, v);
      shade(o, b, s); o[3] = h;
    }),

  planks: (size, base) => {
    const rand = mulberry32(11);
    const boards = 10;
    const offsets = Array.from({ length: boards }, () => rand());
    const tones = Array.from({ length: boards * 2 }, () => 0.88 + rand() * 0.22);
    return render(size, base, (u, v, b, o) => {
      const bi = Math.floor(u * boards);
      const ub = u * boards - bi;
      const vv = v + offsets[bi];
      const seg = Math.floor(vv) % 2;
      const vs = frac(vv);
      const [s, h] = woodGrain(u, vv * 0.5, bi * 1.7 + seg * 4.1, 60);
      let t = s * tones[bi * 2 + seg];
      const joint = ub < 0.018 || ub > 0.982 || vs < 0.003 || vs > 0.997;
      if (joint) t *= 0.62;
      shade(o, b, t); o[3] = joint ? 0 : h;
    });
  },

  slats: (size, base) => {
    const rand = mulberry32(5);
    const n = 8;
    const tones = Array.from({ length: n }, () => 0.9 + rand() * 0.16);
    return render(size, base, (u, v, b, o) => {
      const si = Math.floor(u * n);
      const fu = u * n - si;
      const [s, h] = woodGrain(u, v, si * 2.3);
      const groove = fu < 0.07;
      const edge = smoothstep(0.07, 0.12, fu) * (1 - smoothstep(0.93, 1, fu) * 0.25);
      const t = groove ? 0.45 : s * tones[si] * (0.86 + 0.14 * edge);
      shade(o, b, t); o[3] = groove ? 0 : 0.5 + h * 0.5 * edge;
    });
  },

  travertine: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const [s, h, pit] = travertineField(u, v);
      shade(o, b, s);
      // pits read slightly warmer/darker
      o[0] += pit * -6; o[2] += pit * -10; o[3] = h;
    }),

  tiles: (size, base) => {
    const rand = mulberry32(3);
    const tones = Array.from({ length: 8 }, () => 0.93 + rand() * 0.12);
    return render(size, base, (u, v, b, o) => {
      const cols = 2, rows = 2;
      const ti = Math.floor(u * cols), tj = Math.floor(v * rows);
      const fu = u * cols - ti, fv = v * rows - tj;
      const grout = fu < 0.006 || fu > 0.994 || fv < 0.006 || fv > 0.994;
      const [s, h] = travertineField(frac(u + tj * 0.37), frac(v + ti * 0.21), ti + tj * 3);
      if (grout) { shade(o, b, 0.84); o[3] = 0.15; return; }
      shade(o, b, s * tones[(ti + tj * cols) % 8]); o[3] = h;
    });
  },

  marble: (size, base) => {
    const light = luminance(base) > 0.5;
    const vein: RGB = light ? [142, 134, 122] : [196, 205, 194];
    return render(size, base, (u, v, b, o) => {
      const t = N.fbm(u * 4, v * 4, 5, 4, 4);
      const t2 = N2.fbm(u * 8, v * 8, 4, 8, 8);
      const main = 1 - Math.pow(Math.abs(Math.sin((u * 1 + v * 2 + t * 2.4) * Math.PI * 2)), 0.1);
      const fine = 1 - Math.pow(Math.abs(Math.sin((u * 3 - v * 2 + t2 * 3.2) * Math.PI * 2)), 0.05);
      const cloud = N.fbm(u * 2, v * 2, 4, 2, 2);
      const k = clamp01(main * 0.95 + fine * 0.4);
      const s = 0.97 + 0.08 * (cloud - 0.5);
      o[0] = mix(b[0] * s, vein[0], k);
      o[1] = mix(b[1] * s, vein[1], k);
      o[2] = mix(b[2] * s, vein[2], k);
      o[3] = 0.5;
    });
  },

  concrete: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const m = N.fbm(u * 5, v * 5, 5, 5, 5);
      const m2 = N2.fbm(u * 24, v * 24, 3, 24, 24);
      const pore = N.noise(u * 140, v * 140, 140, 140);
      const p = smoothstep(0.86, 0.93, pore);
      const s = 0.84 + 0.28 * m + 0.06 * (m2 - 0.5) - 0.25 * p;
      shade(o, b, s); o[3] = 0.6 - p * 0.6 + (m2 - 0.5) * 0.2;
    }),

  plaster: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const m = N.fbm(u * 3, v * 3, 5, 3, 3);
      const trowel = N2.fbm(u * 6 + m * 2, v * 2, 3, 6, 2);
      const grain = N.noise(u * 200, v * 200, 200, 200);
      const s = 0.93 + 0.12 * (m - 0.5) + 0.06 * (trowel - 0.5) + 0.03 * (grain - 0.5);
      shade(o, b, s); o[3] = 0.5 + (trowel - 0.5) * 0.5 + (grain - 0.5) * 0.2;
    }),

  terrazzo: (size, base) => {
    const maps = render(size, base, (u, v, b, o) => {
      const m = N.fbm(u * 10, v * 10, 3, 10, 10);
      shade(o, b, 0.96 + 0.06 * (m - 0.5)); o[3] = 0.5;
    });
    const ctx = maps.color.getContext('2d')!;
    const rand = mulberry32(19);
    const chipColors = ['#B8AD9D', '#8C8E78', '#3B3A36', '#F4F1EA', '#A27D62', '#CFC6B8'];
    for (let i = 0; i < size * 0.5; i++) {
      const cx = rand() * size, cy = rand() * size;
      const r = (0.004 + Math.pow(rand(), 3) * 0.028) * size;
      ctx.fillStyle = chipColors[Math.floor(rand() * chipColors.length)];
      const sides = 4 + Math.floor(rand() * 3);
      const rot = rand() * Math.PI;
      for (const [dx, dy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
        ctx.beginPath();
        for (let k = 0; k < sides; k++) {
          const a = rot + (k / sides) * Math.PI * 2;
          const rr = r * (0.65 + rand() * 0.5);
          const px = cx + dx + Math.cos(a) * rr, py = cy + dy + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
    return maps;
  },

  linen: (size, base) => {
    const T = Math.max(64, Math.round(size / 3.2));
    return render(size, base, (u, v, b, o) => {
      const tx = u * T, ty = v * T;
      const over = (Math.floor(tx) + Math.floor(ty)) % 2 === 0;
      const prof = over ? Math.sin(frac(tx) * Math.PI) : Math.sin(frac(ty) * Math.PI);
      const slubW = N.noise(u * 6, ty, 6, T);
      const slubV = N2.noise(tx, v * 6, T, 6);
      const slub = over ? slubV : slubW;
      const mott = N.fbm(u * 4, v * 4, 3, 4, 4);
      const s = 0.86 + 0.12 * prof + 0.1 * (slub - 0.5) + 0.06 * (mott - 0.5);
      shade(o, b, s); o[3] = 0.3 + prof * 0.6;
    });
  },

  boucle: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const r = N.fbm(u * 40, v * 40, 3, 40, 40);
      const loops = Math.pow(1 - Math.abs(r * 2 - 1), 3);
      const r2 = N2.noise(u * 110, v * 110, 110, 110);
      const knot = Math.pow(1 - Math.abs(r2 * 2 - 1), 4);
      const s = 0.74 + 0.26 * loops + 0.1 * knot;
      shade(o, b, s); o[3] = clamp01(loops * 0.8 + knot * 0.3);
    }),

  wool: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const n = N.fbm(u * 96, v * 96, 3, 96, 96);
      const m = N2.fbm(u * 6, v * 6, 3, 6, 6);
      const s = 0.88 + 0.16 * (n - 0.5) + 0.08 * (m - 0.5);
      shade(o, b, s); o[3] = n;
    }),

  leather: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const mott = N.fbm(u * 5, v * 5, 4, 5, 5);
      const c = N2.noise(u * 48, v * 48, 48, 48);
      const crease = Math.pow(1 - Math.abs(c * 2 - 1), 10);
      const pore = N.noise(u * 300, v * 300, 300, 300);
      const s = 0.92 + 0.16 * (mott - 0.5) - 0.07 * crease + 0.03 * (pore - 0.5);
      shade(o, b, s); o[3] = 0.6 - crease * 0.4 + (pore - 0.5) * 0.15;
    }),

  brushed: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const streak = N.noise(u * 3, v * 420, 3, 420);
      const streak2 = N2.noise(u * 12, v * 180, 12, 180);
      const cloud = N.fbm(u * 2, v * 2, 3, 2, 2);
      const s = 0.86 + 0.14 * streak + 0.08 * streak2 + 0.08 * (cloud - 0.5);
      shade(o, b, s); o[3] = streak;
    }),

  rug: (size, base) =>
    render(size, base, (u, v, b, o) => {
      const knot = N.noise(u * 220, v * 220, 220, 220);
      const abr = N2.fbm(u * 5, v * 5, 4, 5, 5);
      const d = Math.min(u, 1 - u, v, 1 - v);
      const border = d > 0.045 && d < 0.075 ? 1 : 0;
      const pin = d > 0.092 && d < 0.097 ? 1 : 0;
      const field = 0.95 + 0.06 * (abr - 0.5) + 0.05 * (knot - 0.5);
      const s = field * (border ? 0.8 : 1) * (pin ? 0.86 : 1);
      shade(o, b, s); o[3] = 0.4 + knot * 0.4 - border * 0.1;
    }),

  jute: (size, base) => {
    const T = Math.max(24, Math.round(size / 12));
    return render(size, base, (u, v, b, o) => {
      const tx = u * T, ty = v * T;
      const cell = (Math.floor(tx / 2) + Math.floor(ty / 2)) % 2 === 0;
      const prof = cell ? Math.sin(frac(ty) * Math.PI) : Math.sin(frac(tx) * Math.PI);
      const fib = N.noise(u * T * 6, v * T * 6, T * 6, T * 6);
      const tone = N2.noise(Math.floor(tx) * 1.0, Math.floor(ty) * 1.0, T, T);
      const s = 0.72 + 0.3 * prof + 0.1 * (fib - 0.5) + 0.1 * (tone - 0.5);
      shade(o, b, s); o[3] = prof;
    });
  },
};

const cache = new Map<string, TextureMaps>();

export function generateTexture(kind: TextureKind, color: string, size = 512): TextureMaps {
  const key = `${kind}|${color}|${size}`;
  let maps = cache.get(key);
  if (!maps) {
    maps = generators[kind](size, hexToRgb(color));
    cache.set(key, maps);
  }
  return maps;
}

const swatchCache = new Map<string, string>();

/** Small data-URL preview of a texture for UI swatches. */
export function textureSwatch(kind: TextureKind | undefined, color: string, size = 96): string {
  const key = `${kind}|${color}|${size}`;
  const hit = swatchCache.get(key);
  if (hit) return hit;
  let url: string;
  if (!kind) {
    const c = document.createElement('canvas');
    c.width = c.height = 4;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 4, 4);
    url = c.toDataURL();
  } else {
    url = generateTexture(kind, color, kind === 'linen' || kind === 'jute' ? 192 : 128).color.toDataURL('image/jpeg', 0.86);
  }
  swatchCache.set(key, url);
  return url;
}
