import { useEffect, useMemo, useState } from 'react';
import { Copy, MousePointer2, RotateCcw, RotateCw, Trash2, X } from 'lucide-react';
import { formatDims, formatPrice, getProduct, priceFor } from '@/data/furniture';
import { getFloorFinish, getMaterialDef, getWallFinish } from '@/data/materials';
import { roomTemplates } from '@/data/spaces';
import { shoppingList } from '@/lib/exporters';
import { selectedItem, useStudio } from '@/store/studio';
import type { PlacedItem } from '@/store/types';
import { lightingPresets } from '../Scene/Lighting';
import { MaterialSwatch, ProductThumb, Section, Slider } from './primitives';
import { t } from '@/i18n';

const deg = (r: number) => Math.round((((r * 180) / Math.PI) % 360 + 360) % 360);

function NumberField({ label, value, onCommit, step = 0.05 }: { label: string; value: number; onCommit: (v: number) => void; step?: number }) {
  const [text, setText] = useState(value.toFixed(2));
  useEffect(() => setText(value.toFixed(2)), [value]);
  const commit = () => {
    const n = parseFloat(text);
    if (Number.isFinite(n)) onCommit(n); else setText(value.toFixed(2));
  };
  return (
    <label className="flex items-center gap-2 border hairline px-2.5">
      <span className="font-sans text-[0.7rem] text-stone-deep">{label}</span>
      <input
        type="number"
        step={step}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        className="t-num h-9 w-full bg-transparent text-end font-sans text-[0.8rem] outline-none"
        aria-label={t('{axis} position in metres', { axis: label })}
      />
      <span className="font-sans text-[0.7rem] text-stone">{t('m')}</span>
    </label>
  );
}

function ItemProperties({ item, onClose }: { item: PlacedItem; onClose?: () => void }) {
  const p = getProduct(item.productId)!;
  const s = useStudio.getState;
  const [rot, setRot] = useState<number | null>(null);
  const [elev, setElev] = useState<number | null>(null);
  const roomH = useStudio((st) => st.room.height);
  const price = priceFor(p, item.materials);
  const isWall = p.placement === 'wall';
  const isCeiling = p.placement === 'ceiling';

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start gap-4 border-b hairline px-5 pb-4 pt-5">
        <span className="block h-16 w-16 shrink-0 bg-ivory-2 p-1.5"><ProductThumb id={p.id} /></span>
        <div className="min-w-0 flex-1">
          <p className="t-label text-stone-deep">{t('Selected')}</p>
          <h2 className="mt-1 font-serif text-[1.65rem] leading-none">{p.name}</h2>
          <p className="mt-1 font-sans text-[0.74rem] text-stone-deep">{t(p.tagline)}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="grid h-8 w-8 place-items-center text-stone-deep hover:text-ink" aria-label={t('Deselect')}>
            <X size={16} strokeWidth={1.4} />
          </button>
        )}
      </header>
      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="flex items-baseline justify-between border-b hairline px-5 py-3.5">
          <span className="t-num font-sans text-[0.74rem] text-stone-deep">{formatDims(p.dims)}</span>
          <span className="t-num font-serif text-[1.4rem] leading-none">{formatPrice(price)}</span>
        </div>

        {p.slots.map((slot) => (
          <Section key={slot.key} title={t(slot.label)} aside={t(getMaterialDef(item.materials[slot.key] ?? slot.default).name)}>
            <div className="flex flex-wrap gap-1.5">
              {slot.options.map((id) => (
                <MaterialSwatch key={id} id={id} active={(item.materials[slot.key] ?? slot.default) === id} onSelect={() => s().setItemMaterial(item.uid, slot.key, id)} />
              ))}
            </div>
            <p className="mt-2.5 font-sans text-[0.7rem] text-stone">{t(getMaterialDef(item.materials[slot.key] ?? slot.default).note ?? '')}</p>
          </Section>
        ))}

        <Section title={t('Position')} aside={isWall ? t('Snaps to the nearest wall') : t('Drag in the room or type')}>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X" value={item.x} onCommit={(v) => s().setItemPosition(item.uid, v, item.z)} />
            <NumberField label="Z" value={item.z} onCommit={(v) => s().setItemPosition(item.uid, item.x, v)} />
          </div>
          {!isWall && (
            <div className="mt-5">
              <Slider
                label={t('Rotation')}
                value={rot ?? deg(item.rotation)}
                min={0}
                max={359}
                step={1}
                format={(v) => `${Math.round(v)}°`}
                onChange={(v) => { setRot(v); s().setRotation(item.uid, (v * Math.PI) / 180, rot === null); }}
                onCommit={() => setRot(null)}
              />
              <div className="mt-3 flex gap-2">
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => s().rotateItem(item.uid, Math.PI / 4)}><RotateCcw size={13} strokeWidth={1.5} /><span>45°</span></button>
                <button className="btn btn-ghost btn-sm flex-1" onClick={() => s().rotateItem(item.uid, -Math.PI / 4)}><RotateCw size={13} strokeWidth={1.5} /><span>45°</span></button>
              </div>
            </div>
          )}
          {(isWall || isCeiling) && (
            <div className="mt-5">
              <Slider
                label={isWall ? t('Hanging height (centre)') : t('Fixture height')}
                value={elev ?? item.elevation ?? p.mount ?? 1.5}
                min={isWall ? 0.8 : 1.2}
                max={roomH - (isWall ? 0.3 : 0.35)}
                step={0.01}
                format={(v) => `${v.toFixed(2)} ${t('m')}`}
                onChange={(v) => { setElev(v); s().setElevation(item.uid, v, elev === null); }}
                onCommit={() => setElev(null)}
              />
            </div>
          )}
        </Section>

        <div className="space-y-4 px-5 py-5">
          <p className="font-sans text-[0.78rem] leading-relaxed text-stone-deep">{t(p.description)}</p>
          <p className="font-sans text-[0.7rem] text-stone">{t('Lead time {time}', { time: t(p.leadTime) })}</p>
        </div>
      </div>
      <footer className="grid grid-cols-2 gap-2 border-t hairline px-5 py-4">
        <button className="btn btn-ghost btn-sm" onClick={() => s().duplicateItem(item.uid)}><Copy size={13} strokeWidth={1.5} /><span>{t('Duplicate')}</span></button>
        <button className="btn btn-ghost btn-sm" onClick={() => s().removeItem(item.uid)}><Trash2 size={13} strokeWidth={1.5} /><span>{t('Remove')}</span></button>
      </footer>
    </div>
  );
}

function RoomOverview() {
  const room = useStudio((s) => s.room);
  const items = useStudio((s) => s.items);
  const lighting = useStudio((s) => s.lighting);
  const setTool = useStudio((s) => s.setTool);
  const total = useMemo(() => shoppingList(items).total, [items]);
  const rows = [
    [t('Room'), t(roomTemplates[room.type].label)],
    [t('Size'), `${room.width.toFixed(1)} × ${room.depth.toFixed(1)} ${t('m')} · ${(room.width * room.depth).toFixed(1)} ${t('m²')}`],
    [t('Ceiling'), `${room.height.toFixed(2)} ${t('m')}`],
    [t('Floor'), t(getFloorFinish(room.floor).name)],
    [t('Walls'), t(getWallFinish(room.wallFinish).name)],
    [t('Light'), `${t(lightingPresets[lighting].label)}, ${lightingPresets[lighting].time}`],
  ];
  return (
    <div className="flex h-full flex-col">
      <header className="border-b hairline px-5 pb-4 pt-5">
        <p className="t-label text-stone-deep">{t('Properties')}</p>
        <h2 className="mt-1.5 font-serif text-[1.65rem] leading-none">{t('The room')}</h2>
      </header>
      <dl className="px-5 py-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 border-b hairline py-2.5">
            <dt className="font-sans text-[0.74rem] text-stone-deep">{k}</dt>
            <dd className="text-end font-sans text-[0.78rem]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-start gap-3 px-5 py-4">
        <MousePointer2 size={15} strokeWidth={1.4} className="mt-0.5 shrink-0 text-olive" />
        <p className="font-sans text-[0.76rem] leading-relaxed text-stone-deep">{t('Select a piece in the room to change its finishes, move it or turn it. Click the floor or a wall to come back here.')}</p>
      </div>
      <div className="mt-auto border-t hairline px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[0.78rem]">{t('{n} pieces', { n: items.length })}</span>
          <span className="t-num font-serif text-[1.6rem] leading-none">{formatPrice(total)}</span>
        </div>
        <button className="u-link-static mt-3 font-sans text-[0.76rem]" onClick={() => setTool('summary')}>{t('View shopping list')}</button>
      </div>
    </div>
  );
}

export function PropertiesPanel({ onClose }: { onClose?: () => void }) {
  const item = useStudio(selectedItem);
  return item ? <ItemProperties key={item.uid} item={item} onClose={onClose} /> : <RoomOverview />;
}
