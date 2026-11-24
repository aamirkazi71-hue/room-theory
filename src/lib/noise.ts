/** Small, fast, seeded value noise for procedural textures. */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ValueNoise {
  private perm: Uint8Array;
  private vals: Float32Array;

  constructor(seed = 1) {
    const rand = mulberry32(seed);
    this.perm = new Uint8Array(512);
    this.vals = new Float32Array(256);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
      this.vals[i] = rand();
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  /** Tileable value noise in [0,1]. px/py = cells per tile on each axis. */
  noise(x: number, y: number, px = 256, py = px): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const x0 = ((xi % px) + px) % px;
    const y0 = ((yi % py) + py) % py;
    const x1 = (x0 + 1) % px;
    const y1 = (y0 + 1) % py;
    const p = this.perm;
    const v = this.vals;
    const a = v[p[(p[x0 & 255] + y0) & 511] & 255];
    const b = v[p[(p[x1 & 255] + y0) & 511] & 255];
    const c = v[p[(p[x0 & 255] + y1) & 511] & 255];
    const d = v[p[(p[x1 & 255] + y1) & 511] & 255];
    const u = xf * xf * (3 - 2 * xf);
    const w = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  }

  /** Fractal sum, tileable when x,y are scaled so that `period` = cells per tile. */
  fbm(x: number, y: number, octaves = 4, px = 256, py = px): number {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let f = 1;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise(x * f, y * f, px * f, py * f);
      norm += amp;
      amp *= 0.5;
      f *= 2;
    }
    return sum / norm;
  }
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
