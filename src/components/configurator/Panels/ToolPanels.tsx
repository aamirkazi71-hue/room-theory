import { useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { formatDims, formatPrice, products, studioCategories, type StudioCategory } from '@/data/furniture';
import { floorFinishes, getFloorFinish, getWallFinish, wallColours, wallFinishes } from '@/data/materials';
import { buildDesign, roomTemplates, spaces, roomTypeLabels, getSpace } from '@/data/spaces';
import { photos, photoUrl } from '@/data/assets';
import { useStudio } from '@/store/studio';
import { useProjects } from '@/store/projects';
import type { DesignSnapshot, RoomType, WallIndex } from '@/store/types';
import { lightingPresets } from '../Scene/Lighting';
import { PanelHeader, ProductThumb, Section, Segmented, Slider, SwatchImage } from './primitives';
import { shoppingList } from '@/lib/exporters';
import { ChipSlider } from '@/components/ui/ChipSlider';
import { t } from '@/i18n';
import { roomTypeSingular, spaceTitle } from '@/data/spaces';

/* ------------------------------------------------------------------ */
/* Furniture library                                                   */
/* ------------------------------------------------------------------ */

export function FurniturePanel({ onAdded }: { onAdded?: () => void }) {
  const [cat, setCat] = useState<StudioCategory | 'all'>('all');
  const add = useStudio((s) => s.addItem);
  const list = useMemo(() => (cat === 'all' ? products : products.filter((p) => p.studioCategory === cat)), [cat]);
  return (
    <div className="flex h-full flex-col">
      <PanelHeader eyebrow={t('Library')} title={t('Furniture')}>{t('Choose a piece to place it, or drag it to a spot in the room.')}</PanelHeader>
      <div className="border-b hairline px-5 py-3">
        <ChipSlider label={t('Furniture categories')} activeKey={cat}>
          {[{ id: 'all' as const, label: 'All' }, ...studioCategories].map((c) => (
            <button key={c.id} className="chip h-8 shrink-0 px-3 text-[0.74rem]" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{t(c.label)}</button>
          ))}
        </ChipSlider>
      </div>
      <ul className="thin-scroll grid flex-1 grid-cols-2 content-start gap-x-3 gap-y-5 overflow-y-auto px-5 py-5">
        {list.map((p) => (
          <li key={p.id}>
            <button
              className="group block w-full text-start"
              onClick={() => { add(p.id); onAdded?.(); }}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('text/rt-product', p.id); e.dataTransfer.effectAllowed = 'copy'; }}
              aria-label={t('Add {name}, {tagline}, {price}', { name: p.name, tagline: t(p.tagline), price: formatPrice(p.price) })}
            >
              <span className="relative block aspect-square overflow-hidden bg-ivory-2 transition-colors group-hover:bg-ivory-3">
                <span className="absolute inset-2 block transition-transform duration-700 ease-out group-hover:scale-[1.04]"><ProductThumb id={p.id} /></span>
                <span className="absolute end-1.5 top-1.5 grid h-6 w-6 place-items-center bg-ink text-ivory opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"><Plus size={13} strokeWidth={1.6} /></span>
              </span>
              <span className="mt-2 flex items-baseline justify-between gap-2">
                <span className="font-serif text-[1.12rem] leading-none">{p.name}</span>
                <span className="t-num font-sans text-[0.72rem] text-stone-deep">{formatPrice(p.price)}</span>
              </span>
              <span className="mt-1 block font-sans text-[0.72rem] leading-snug text-stone-deep">{t(p.tagline)}</span>
              <span className="t-num block font-sans text-[0.68rem] text-stone">{formatDims(p.dims)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spaces & saved projects                                             */
/* ------------------------------------------------------------------ */

export function SpacesPanel({ requestLoad }: { requestLoad: (d: DesignSnapshot, meta: { name: string; spaceSlug: string | null; projectId: string | null }) => void }) {
  const projects = useProjects((s) => s.projects);
  const current = useStudio((s) => s.spaceSlug);
  const types = Object.keys(roomTemplates) as RoomType[];
  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <PanelHeader eyebrow={t('Start from')} title={t('Spaces')}>{t('Load an empty template or one of our curated rooms.')}</PanelHeader>
      <Section title={t('Room templates')} aside={t('Furnished starting points')}>
        <div className="grid grid-cols-2 gap-2">
          {types.map((rt) => (
            <button
              key={rt}
              className="border hairline px-3 py-3 text-start transition-colors hover:border-ink/40 hover:bg-ivory-2"
              onClick={() => requestLoad(buildDesign(rt), { name: t('My {room}', { room: t(roomTypeSingular[rt]) }), spaceSlug: null, projectId: null })}
            >
              <span className="block font-serif text-[1.1rem] leading-tight">{t(roomTemplates[rt].label)}</span>
              <span className="t-num t-meta text-[0.7rem]">{roomTemplates[rt].width} × {roomTemplates[rt].depth} {t('m')}</span>
            </button>
          ))}
        </div>
      </Section>
      {projects.length > 0 && (
        <Section title={t('Your saved rooms')} aside={`${projects.length}`}>
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id}>
                <button className="flex w-full items-center gap-3 text-start" onClick={() => requestLoad(p.design, { name: p.name, spaceSlug: p.spaceSlug ?? null, projectId: p.id })}>
                  <span className="frame h-11 w-14 shrink-0 bg-ivory-3">{p.thumbnail && <img src={p.thumbnail} alt="" />}</span>
                  <span>
                    <span className="block font-serif text-[1.05rem] leading-tight">{p.name}</span>
                    <span className="t-meta text-[0.7rem]">{t(roomTemplates[p.design.room.type].label)} · {t('{n} pieces', { n: p.design.items.length })}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section title={t('Curated spaces')} aside={`${spaces.length}`} className="border-b-0">
        <ul className="space-y-3">
          {spaces.map((s) => (
            <li key={s.slug}>
              <button
                className="group flex w-full items-center gap-3 text-start"
                onClick={() => requestLoad(buildDesign(s.type, s), { name: spaceTitle(s.name, s.type), spaceSlug: s.slug, projectId: null })}
              >
                <span className="frame h-14 w-[72px] shrink-0">
                  <img src={photoUrl(photos[s.photo], 200)} alt="" loading="lazy" className="transition-transform duration-700 group-hover:scale-105" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-serif text-[1.08rem] leading-tight">
                    {s.name}
                    {current === s.slug && <Check size={13} strokeWidth={1.6} className="text-olive" aria-label={t('Current')} />}
                  </span>
                  <span className="t-meta block truncate text-[0.7rem]">{t(s.style)} · {t(roomTypeSingular[s.type])}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Room materials                                                      */
/* ------------------------------------------------------------------ */

const wallNames: Record<WallIndex, string> = { 0: 'Back', 1: 'Right', 2: 'Front', 3: 'Left' };
const wallLabel = (w: WallIndex) => t('{side} wall', { side: t(wallNames[w]) });

export function MaterialsPanel() {
  const room = useStudio((s) => s.room);
  const setRoom = useStudio((s) => s.setRoom);
  const tintable = getWallFinish(room.wallFinish).tintable;
  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <PanelHeader eyebrow={t('Surfaces')} title={t('Materials')}>{t('Floor and walls. Select a piece in the room to change its finishes.')}</PanelHeader>
      <Section title={t('Floor')} aside={t(getFloorFinish(room.floor).name)}>
        <div className="grid grid-cols-3 gap-2">
          {floorFinishes.map((f) => (
            <button key={f.id} onClick={() => setRoom({ floor: f.id })} aria-pressed={room.floor === f.id} className={`group text-left`}>
              <span className={`block aspect-square p-[3px] transition-shadow ${room.floor === f.id ? 'shadow-[inset_0_0_0_1px_#252522]' : 'shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)] group-hover:shadow-[inset_0_0_0_1px_rgba(37,37,34,0.4)]'}`}>
                <SwatchImage texture={f.texture} color={f.color} className="h-full w-full" />
              </span>
              <span className="mt-1.5 block font-sans text-[0.68rem] leading-tight text-stone-deep">{t(f.name)}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title={t('Walls')} aside={t(getWallFinish(room.wallFinish).name)}>
        <div className="grid grid-cols-3 gap-2">
          {wallFinishes.map((f) => (
            <button key={f.id} onClick={() => setRoom({ wallFinish: f.id })} aria-pressed={room.wallFinish === f.id} className="group text-left">
              <span className={`block aspect-square p-[3px] transition-shadow ${room.wallFinish === f.id ? 'shadow-[inset_0_0_0_1px_#252522]' : 'shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)] group-hover:shadow-[inset_0_0_0_1px_rgba(37,37,34,0.4)]'}`}>
                <SwatchImage texture={f.texture} color={f.tintable ? room.wallColor : f.color} className="h-full w-full" />
              </span>
              <span className="mt-1.5 block font-sans text-[0.68rem] leading-tight text-stone-deep">{t(f.name)}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title={t('Wall colour')} aside={tintable ? t(wallColours.find((c) => c.hex.toLowerCase() === room.wallColor.toLowerCase())?.name ?? 'Custom') : t('Not paintable')}>
        <div className={`flex flex-wrap items-center gap-2 ${tintable ? '' : 'pointer-events-none opacity-40'}`}>
          {wallColours.map((c) => (
            <button
              key={c.id}
              onClick={() => setRoom({ wallColor: c.hex })}
              aria-pressed={room.wallColor.toLowerCase() === c.hex.toLowerCase()}
              aria-label={t(c.name)}
              title={t(c.name)}
              className={`h-8 w-8 p-[3px] ${room.wallColor.toLowerCase() === c.hex.toLowerCase() ? 'shadow-[inset_0_0_0_1px_#252522]' : 'shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)]'}`}
            >
              <span className="block h-full w-full" style={{ background: c.hex }} />
            </button>
          ))}
          <label className="relative h-8 w-8 cursor-pointer p-[3px] shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)]" title={t('Custom colour')}>
            <span className="block h-full w-full" style={{ background: 'conic-gradient(#C49E66, #7E8369, #6C5A4A, #B3B6A0, #CDB59D, #C49E66)' }} />
            <input type="color" value={room.wallColor} onChange={(e) => setRoom({ wallColor: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('Custom wall colour')} />
          </label>
        </div>
        {!tintable && <p className="mt-2 t-meta text-[0.72rem]">{t('Choose matt paint or limewash to apply a colour.')}</p>}
      </Section>
      <Section title={t('Feature wall')} aside={room.accentWall === null ? t('None') : wallLabel(room.accentWall)} className="border-b-0">
        <Segmented
          label={t('Feature wall')}
          value={room.accentWall === null ? 'none' : String(room.accentWall)}
          options={[{ id: 'none', label: t('None') }, { id: '0', label: t('Back') }, { id: '3', label: t('Left') }, { id: '1', label: t('Right') }]}
          onChange={(v) => setRoom({ accentWall: v === 'none' ? null : (Number(v) as WallIndex) })}
        />
        {room.accentWall !== null && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {wallFinishes.filter((f) => !f.tintable).map((f) => (
              <button key={f.id} onClick={() => setRoom({ accentFinish: f.id })} aria-pressed={room.accentFinish === f.id} className="group text-left">
                <span className={`block aspect-square p-[3px] ${room.accentFinish === f.id ? 'shadow-[inset_0_0_0_1px_#252522]' : 'shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)] group-hover:shadow-[inset_0_0_0_1px_rgba(37,37,34,0.4)]'}`}>
                  <SwatchImage texture={f.texture} color={f.color} className="h-full w-full" />
                </span>
                <span className="mt-1.5 block font-sans text-[0.68rem] leading-tight text-stone-deep">{t(f.name)}</span>
              </button>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting                                                            */
/* ------------------------------------------------------------------ */

export function LightingPanel() {
  const lighting = useStudio((s) => s.lighting);
  const setLighting = useStudio((s) => s.setLighting);
  const lamps = useStudio((s) => s.items.filter((i) => ['stem-floor-lamp', 'dome-table-lamp', 'halo-pendant'].includes(i.productId)).length);
  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <PanelHeader eyebrow={t('Atmosphere')} title={t('Lighting')}>{t('Check the room at noon and at nine. Lamps switch on as the light fades.')}</PanelHeader>
      <ul className="px-5 py-4">
        {(Object.keys(lightingPresets) as (keyof typeof lightingPresets)[]).map((k) => {
          const p = lightingPresets[k];
          const active = lighting === k;
          return (
            <li key={k}>
              <button onClick={() => setLighting(k)} aria-pressed={active} className="group flex w-full items-center gap-4 border-b hairline py-3.5 text-start">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden" style={{ background: `linear-gradient(160deg, ${p.sky}, ${p.background} 60%, ${p.ground})` }}>
                  <span className="absolute h-3 w-3 rounded-full" style={{ background: p.sun, left: `${20 + p.sunFrom[0] * 40}%`, top: `${70 - p.sunFrom[1] * 55}%`, boxShadow: `0 0 14px ${p.sun}` }} />
                </span>
                <span className="flex-1">
                  <span className="flex items-baseline justify-between">
                    <span className={`font-serif text-[1.25rem] leading-none ${active ? '' : 'text-ink/80'}`}>{t(p.label)}</span>
                    <span className="t-num font-sans text-[0.72rem] text-stone-deep">{p.time}</span>
                  </span>
                  <span className="mt-1 block font-sans text-[0.72rem] leading-snug text-stone-deep">{t(p.description)}</span>
                </span>
                <span className={`h-1.5 w-1.5 shrink-0 ${active ? 'bg-olive' : 'bg-transparent'}`} />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-5 pb-6 t-meta text-[0.74rem]">
        {lamps === 0 ? t('No lamps in this room yet — add one from Furniture → Lighting to see it after dark.') : t(lamps > 1 ? '{n} lamps in the room.' : '{n} lamp in the room.', { n: lamps })}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout: dimensions, views, reset                                    */
/* ------------------------------------------------------------------ */

export function LayoutPanel({ onReset, onClear }: { onReset: () => void; onClear: () => void }) {
  const room = useStudio((s) => s.room);
  const setRoom = useStudio((s) => s.setRoom);
  const camera = useStudio((s) => s.camera);
  const setCamera = useStudio((s) => s.setCamera);
  const spaceSlug = useStudio((s) => s.spaceSlug);
  const [draft, setDraft] = useState<{ width: number; depth: number; height: number } | null>(null);
  const v = draft ?? { width: room.width, depth: room.depth, height: room.height };
  const commit = () => { if (draft) { setRoom(draft); setDraft(null); } };
  const area = (v.width * v.depth).toFixed(1);
  return (
    <div className="thin-scroll h-full overflow-y-auto">
      <PanelHeader eyebrow={t('Plan')} title={t('Layout')}>{t(roomTemplates[room.type].label)}{spaceSlug ? ` · ${getSpace(spaceSlug)?.name}` : ''} · {area} {t('m²')}</PanelHeader>
      <Section title={t('Room dimensions')} aside={t('Within supported limits')}>
        <div className="space-y-5">
          <Slider label={t('Width')} value={v.width} min={3.2} max={9} step={0.1} format={(n) => `${n.toFixed(1)} ${t('m')}`} onChange={(n) => setDraft({ ...v, width: n })} onCommit={commit} />
          <Slider label={t('Depth')} value={v.depth} min={3} max={8} step={0.1} format={(n) => `${n.toFixed(1)} ${t('m')}`} onChange={(n) => setDraft({ ...v, depth: n })} onCommit={commit} />
          <Slider label={t('Ceiling height')} value={v.height} min={2.5} max={3.6} step={0.05} format={(n) => `${n.toFixed(2)} ${t('m')}`} onChange={(n) => setDraft({ ...v, height: n })} onCommit={commit} />
        </div>
        <p className="mt-4 t-meta text-[0.72rem]">{t('Furniture stays inside the walls when the room changes size.')}</p>
      </Section>
      <Section title={t('View')}>
        <Segmented label={t('Camera')} value={camera} options={[{ id: 'perspective', label: t('Perspective') }, { id: 'front', label: t('Front') }, { id: 'top', label: t('Plan') }, { id: 'corner', label: t('Corner') }]} onChange={setCamera} />
        <p className="mt-3 t-meta text-[0.72rem]">{t('Drag to orbit · right-drag or two fingers to pan · scroll or pinch to zoom.')}</p>
      </Section>
      <Section title={t('Start over')} className="border-b-0">
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onReset}><span>{t('Reset room')}</span></button>
          <button className="btn btn-ghost btn-sm" onClick={onClear}><span>{t('Clear furniture')}</span></button>
        </div>
        <p className="mt-3 t-meta text-[0.72rem]">{t('Reset restores the original layout. Both can be undone.')}</p>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary / budget                                                    */
/* ------------------------------------------------------------------ */

export function SummaryPanel({ onExportList }: { onExportList: () => void }) {
  const items = useStudio((s) => s.items);
  const room = useStudio((s) => s.room);
  const select = useStudio((s) => s.select);
  const { lines, total } = useMemo(() => shoppingList(items), [items]);
  return (
    <div className="flex h-full flex-col">
      <PanelHeader eyebrow={t('Project')} title={t('Summary')}>{t('{n} pieces', { n: items.length })} · {t(getFloorFinish(room.floor).name)} · {t(getWallFinish(room.wallFinish).name)}</PanelHeader>
      <ul className="thin-scroll flex-1 overflow-y-auto px-5">
        {lines.length === 0 && <li className="py-8 t-meta">{t('The room is empty. Add furniture to build a shopping list.')}</li>}
        {lines.map((l) => (
          <li key={`${l.productId}${l.materials}`} className="border-b hairline py-3.5">
            <button
              className="grid w-full grid-cols-[44px_1fr_auto] items-start gap-3 text-start"
              onClick={() => { const it = items.find((i) => i.productId === l.productId); if (it) select(it.uid); }}
            >
              <span className="block h-11 w-11 bg-ivory-2 p-1"><ProductThumb id={l.productId} /></span>
              <span className="min-w-0">
                <span className="block font-serif text-[1.08rem] leading-tight">{l.name}{l.qty > 1 && <span className="font-sans text-[0.72rem] text-stone-deep"> × {l.qty}</span>}</span>
                <span className="block truncate font-sans text-[0.7rem] text-stone-deep">{l.materials || t(l.tagline)}</span>
              </span>
              <span className="t-num font-sans text-[0.78rem]">{formatPrice(l.total)}</span>
            </button>
          </li>
        ))}
      </ul>
      <footer className="border-t hairline px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[0.78rem]">{t('Estimated total')}</span>
          <span className="t-num font-serif text-[1.9rem] leading-none">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 t-meta text-[0.7rem]">{t('Includes selected finishes. Delivery quoted separately.')}</p>
        <button className="btn btn-primary mt-4 w-full" onClick={onExportList} disabled={lines.length === 0}><span>{t('Download shopping list (CSV)')}</span></button>
      </footer>
    </div>
  );
}
