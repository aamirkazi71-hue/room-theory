import { formatDims, formatPrice, getProduct, priceFor } from '@/data/furniture';
import { getMaterialDef, getFloorFinish, getWallFinish } from '@/data/materials';
import { roomTemplates } from '@/data/spaces';
import type { DesignSnapshot, PlacedItem } from '@/store/types';
import { t } from '@/i18n';

export function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'room';

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** Frame a render with a quiet caption strip, like a plate in a monograph. */
export async function composeRender(dataUrl: string, title: string, subtitle: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const pad = Math.round(img.width * 0.035);
  const strip = Math.round(img.width * 0.06);
  const c = document.createElement('canvas');
  c.width = img.width + pad * 2;
  c.height = img.height + pad + strip;
  const g = c.getContext('2d')!;
  g.fillStyle = '#F3F0E9';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, pad, pad);
  const base = img.height + pad + strip * 0.58;
  const small = Math.max(11, Math.round(img.width * 0.0085));
  g.fillStyle = '#252522';
  g.font = `600 ${small}px "Inter Tight", system-ui, sans-serif`;
  g.letterSpacing = `${small * 0.3}px`;
  g.textBaseline = 'middle';
  g.fillText('ROOM THEORY', pad, base);
  g.letterSpacing = '0px';
  g.textAlign = 'right';
  g.font = `italic ${Math.round(small * 1.9)}px "Instrument Serif", Georgia, serif`;
  const sub = `  —  ${subtitle}`;
  g.fillStyle = '#625E57';
  g.font = `400 ${small}px "Inter Tight", system-ui, sans-serif`;
  const subW = g.measureText(sub).width;
  g.fillText(sub, c.width - pad, base);
  g.fillStyle = '#252522';
  g.font = `italic ${Math.round(small * 1.9)}px "Instrument Serif", Georgia, serif`;
  g.fillText(title, c.width - pad - subW, base);
  return c.toDataURL('image/png');
}

/** Small JPEG for saved-project thumbnails. */
export async function makeThumbnail(dataUrl: string, width = 360): Promise<string> {
  const img = await loadImage(dataUrl);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = Math.round((img.height / img.width) * width);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.78);
}

export interface ListLine {
  productId: string;
  name: string;
  tagline: string;
  materials: string;
  dims: string;
  qty: number;
  unit: number;
  total: number;
}

/** Group identical pieces (same product and finishes) into lines. */
export function shoppingList(items: PlacedItem[]): { lines: ListLine[]; total: number } {
  const map = new Map<string, ListLine>();
  for (const it of items) {
    const p = getProduct(it.productId);
    if (!p) continue;
    const key = `${it.productId}|${JSON.stringify(it.materials)}`;
    const unit = priceFor(p, it.materials);
    const existing = map.get(key);
    if (existing) {
      existing.qty += 1;
      existing.total += unit;
    } else {
      map.set(key, {
        productId: p.id,
        name: p.name,
        tagline: t(p.tagline),
        materials: p.slots.map((s) => t(getMaterialDef(it.materials[s.key] ?? s.default).name)).join(' · '),
        dims: formatDims(p.dims),
        qty: 1,
        unit,
        total: unit,
      });
    }
  }
  const lines = [...map.values()].sort((a, b) => b.total - a.total);
  return { lines, total: lines.reduce((s, l) => s + l.total, 0) };
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export function shoppingListCsv(name: string, design: DesignSnapshot): string {
  const { lines, total } = shoppingList(design.items);
  const r = design.room;
  const header = [
    [t('Room Theory — shopping list')],
    [t('Project'), name],
    [t('Room'), t('{room}, {w} × {d} m, {h} m ceiling', { room: t(roomTemplates[r.type].label), w: r.width.toFixed(1), d: r.depth.toFixed(1), h: r.height.toFixed(1) })],
    [t('Floor'), t(getFloorFinish(r.floor).name)],
    [t('Walls'), `${t(getWallFinish(r.wallFinish).name)} ${r.wallColor}`],
    [],
    [t('Piece'), t('Description'), t('Finishes'), t('Dimensions (W × D × H)'), t('Qty'), t('Unit price (EUR)'), t('Line total (EUR)')],
  ];
  const rows = lines.map((l) => [l.name, l.tagline, l.materials, l.dims, l.qty, l.unit, l.total]);
  const footer = [[], ['', '', '', '', '', t('Estimated total'), total], [t('Prices are estimates including selected finishes; delivery not included.')]];
  return [...header, ...rows, ...footer].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  download(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export { formatPrice };
