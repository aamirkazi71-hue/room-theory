import { useMemo, type ReactNode } from 'react';
import { getMaterialDef } from '@/data/materials';
import { textureSwatch, type TextureKind } from '@/lib/textures';
import { useThumbs } from '@/store/thumbnails';
import { t } from '@/i18n';

export function PanelHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="border-b hairline px-5 pb-4 pt-5">
      <p className="t-label text-stone-deep">{eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-[1.65rem] leading-none">{title}</h2>
      {children && <div className="mt-2 t-meta">{children}</div>}
    </header>
  );
}

export function Section({ title, aside, children, className = '' }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border-b hairline px-5 py-5 ${className}`}>
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h3 className="font-sans text-[0.74rem] font-medium tracking-[0.02em] text-ink">{title}</h3>
        {aside && <span className="t-meta text-[0.74rem]">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** Texture swatch from the same generator the 3D materials use. */
export function SwatchImage({ texture, color, className = '' }: { texture?: TextureKind; color: string; className?: string }) {
  const url = useMemo(() => textureSwatch(texture, color), [texture, color]);
  return <span className={`block bg-cover bg-center ${className}`} style={{ backgroundImage: `url(${url})`, backgroundColor: color }} />;
}

export function MaterialSwatch({ id, active, onSelect, size = 'md' }: { id: string; active: boolean; onSelect: () => void; size?: 'sm' | 'md' }) {
  const m = getMaterialDef(id);
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={t(m.name)}
      title={`${t(m.name)}${m.note ? ` — ${t(m.note)}` : ''}`}
      className={`group relative ${dim} shrink-0 p-[3px] outline-offset-2 transition-shadow ${active ? 'shadow-[inset_0_0_0_1px_#252522]' : 'shadow-[inset_0_0_0_1px_rgba(37,37,34,0.1)] hover:shadow-[inset_0_0_0_1px_rgba(37,37,34,0.45)]'}`}
    >
      <SwatchImage texture={m.texture} color={m.color} className="h-full w-full" />
    </button>
  );
}

export function ProductThumb({ id, className = '' }: { id: string; className?: string }) {
  const src = useThumbs((s) => s.images[id]);
  return src ? <img src={src} alt="" className={`h-full w-full object-contain ${className}`} draggable={false} /> : <span className={`skeleton block h-full w-full ${className}`} />;
}

export function Slider({ label, value, min, max, step, unit = '', onChange, onCommit, format }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void; onCommit?: () => void; format?: (v: number) => string;
}) {
  const id = `sl-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="t-meta text-[0.78rem] text-ink">{label}</label>
        <span className="t-num font-sans text-[0.78rem] text-stone-deep">{format ? format(value) : `${value}${unit}`}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="rt-range mt-2 w-full"
      />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col border hairline">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-9 font-sans text-[0.74rem] transition-colors ${value === o.id ? 'bg-ink text-ivory' : 'text-ink hover:bg-ivory-2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
