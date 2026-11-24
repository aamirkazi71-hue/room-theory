import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { useSeo } from '@/hooks/useSeo';
import {
  areaOf, paletteLabels, roomTypeLabels, sizeBand, sizeLabels, spaceItemCount, spaces, styles,
  type InteriorStyle, type Palette, type SizeBand, type Space,
} from '@/data/spaces';
import type { RoomType } from '@/store/types';
import { spaceTitle } from '@/data/spaces';
import { Emph } from '@/components/typography/SplitWords';
import { t } from '@/i18n';

/* A repeating seven-step rhythm so the gallery never settles into a uniform grid. */
const rhythm = [
  { col: 'md:col-span-7', aspect: 'aspect-[4/3]', mt: '' },
  { col: 'md:col-span-4 md:col-start-9', aspect: 'aspect-[4/5]', mt: 'md:mt-32' },
  { col: 'md:col-span-4', aspect: 'aspect-[3/4]', mt: 'md:-mt-8' },
  { col: 'md:col-span-4', aspect: 'aspect-[3/4]', mt: 'md:mt-20' },
  { col: 'md:col-span-4', aspect: 'aspect-[3/4]', mt: 'md:mt-40' },
  { col: 'md:col-span-5 md:col-start-2', aspect: 'aspect-[4/5]', mt: 'md:mt-4' },
  { col: 'md:col-span-6 md:col-start-7', aspect: 'aspect-[16/11]', mt: 'md:mt-36' },
];

function SpaceCard({ s, i }: { s: Space; i: number }) {
  const r = rhythm[i % rhythm.length];
  return (
    <article className={`col-span-12 ${r.col} ${r.mt}`}>
      <TLink to={`/spaces/${s.slug}`} className="group block">
        <div className={`relative overflow-hidden ${r.aspect}`}>
          <Photo id={s.photo} sizes="(min-width: 768px) 50vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" />
          <span className="absolute left-4 top-4 flex gap-1" aria-hidden>
            {paletteLabels[s.palette].swatches.map((c) => <span key={c} className="h-3 w-3 border border-white/60" style={{ background: c }} />)}
          </span>
          <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center bg-ivory text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={16} strokeWidth={1.4} /></span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-6">
          <div>
            <h2 className="font-serif text-[clamp(1.6rem,2.1vw,2.2rem)] leading-none"><Emph text={spaceTitle(s.name, s.type, true)} italicClass="italic text-stone-deep" /></h2>
            <p className="mt-2 max-w-sm font-sans text-[0.84rem] leading-relaxed text-stone-deep">{t(s.lede)}</p>
          </div>
          <span className="t-figure shrink-0 pt-1">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-sans text-[0.74rem] text-stone-deep">
          <div className="flex gap-1.5"><dt className="sr-only">{t('Style')}</dt><dd className="text-ink">{t(s.style)}</dd></div>
          <div className="flex gap-1.5"><dt>{t('Size')}</dt><dd className="t-num">{s.width.toFixed(1)} × {s.depth.toFixed(1)} {t('m')} · {areaOf(s)} {t('m²')}</dd></div>
          <div className="flex gap-1.5"><dt>{t('Pieces')}</dt><dd className="t-num">{spaceItemCount(s)}</dd></div>
        </dl>
      </TLink>
    </article>
  );
}

function FilterGroup<T extends string>({ label, options, value, onChange, render }: {
  label: string; options: { id: T; label: string }[]; value: T | null; onChange: (v: T | null) => void; render?: (o: { id: T; label: string }) => React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="me-2 w-16 shrink-0 font-sans text-[0.72rem] text-stone-deep">{label}</span>
      {options.map((o) => (
        <button key={o.id} className="chip h-8 px-3 text-[0.74rem]" aria-pressed={value === o.id} onClick={() => onChange(value === o.id ? null : o.id)}>
          {render ? render(o) : t(o.label)}
        </button>
      ))}
    </div>
  );
}

export default function Spaces() {
  const root = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  useSeo({ title: t('Spaces'), description: t('Browse curated room templates — living rooms, bedrooms, dining rooms, kitchens, home offices and studio apartments — and open any of them in the 3D studio.') });

  const type = params.get('type') as RoomType | null;
  const style = params.get('style') as InteriorStyle | null;
  const size = params.get('size') as SizeBand | null;
  const palette = params.get('palette') as Palette | null;

  const set = (key: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(key, v); else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(
    () => spaces.filter((s) => (!type || s.type === type) && (!style || s.style === style) && (!size || sizeBand(s) === size) && (!palette || s.palette === palette)),
    [type, style, size, palette],
  );
  usePageMotion(root, []);
  const active = [type, style, size, palette].filter(Boolean).length;

  return (
    <div ref={root}>
      <header className="page-x mx-auto max-w-page pb-14 pt-40 lg:pt-48">
        <div className="grid-12 items-end gap-y-8">
          <p className="t-figure col-span-12 lg:col-span-2" data-reveal="fade">{t('Spaces')}</p>
          <SplitWords as="h1" text={t('Rooms to|*begin from.*')} className="t-display col-span-12 text-d-l lg:col-span-6" />
          <p className="col-span-12 max-w-sm font-sans text-[0.95rem] leading-relaxed text-stone-deep md:col-span-6 lg:col-span-3 lg:col-start-10" data-reveal="fade">
            {t('{n} rooms planned by the studio. Each has real dimensions, a full furniture plan and finishes you can change — open any of them in the studio.', { n: spaces.length })}
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-y hairline bg-ivory/95 backdrop-blur">
        <div className="page-x mx-auto max-w-page">
          <details className="group lg:hidden">
            <summary className="flex h-14 cursor-pointer list-none items-center justify-between font-sans text-[0.8rem]">
              <span>{t('Filter')}{active ? ` · ${t('{n} active', { n: active })}` : ''}</span>
              <span className="t-meta">{t('{a} of {b}', { a: results.length, b: spaces.length })}</span>
            </summary>
            <div className="space-y-3 pb-5">
              <Filters {...{ type, style, size, palette, set }} />
            </div>
          </details>
          <div className="hidden items-start justify-between gap-8 py-4 lg:flex">
            <div className="space-y-2.5"><Filters {...{ type, style, size, palette, set }} /></div>
            <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
              <span className="t-num font-sans text-[0.8rem]">{t('{a} of {b} spaces', { a: results.length, b: spaces.length })}</span>
              {active > 0 && <button className="u-link-static font-sans text-[0.74rem] text-stone-deep" onClick={() => setParams({}, { replace: true })}>{t('Clear filters')}</button>}
            </div>
          </div>
        </div>
      </div>

      <section className="page-x mx-auto max-w-page pb-section pt-16" aria-label={t('Results')}>
        {results.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-d-s">{t('No rooms match all of those.')}</p>
            <p className="mt-3 t-meta">{t('Try removing a filter — or start from an empty room in the studio.')}</p>
            <div className="mt-8 flex justify-center gap-3">
              <button className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}><span>{t('Clear filters')}</span></button>
              <TLink to="/studio" className="btn btn-primary"><span>{t('Open the studio')}</span></TLink>
            </div>
          </div>
        ) : (
          <div className="grid-12 gap-y-16">
            {results.map((s, i) => <SpaceCard key={s.slug} s={s} i={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function Filters({ type, style, size, palette, set }: { type: RoomType | null; style: InteriorStyle | null; size: SizeBand | null; palette: Palette | null; set: (k: string, v: string | null) => void }) {
  return (
    <>
      <FilterGroup label={t('Room')} value={type} onChange={(v) => set('type', v)} options={(Object.keys(roomTypeLabels) as RoomType[]).map((k) => ({ id: k, label: roomTypeLabels[k] }))} />
      <FilterGroup label={t('Style')} value={style} onChange={(v) => set('style', v)} options={styles.map((s) => ({ id: s, label: s }))} />
      <div className="flex flex-wrap gap-x-8 gap-y-2.5">
        <FilterGroup label={t('Size')} value={size} onChange={(v) => set('size', v)} options={(Object.keys(sizeLabels) as SizeBand[]).map((k) => ({ id: k, label: sizeLabels[k] }))} />
        <FilterGroup
          label={t('Palette')}
          value={palette}
          onChange={(v) => set('palette', v)}
          options={(Object.keys(paletteLabels) as Palette[]).map((k) => ({ id: k, label: paletteLabels[k].label }))}
          render={(o) => (
            <>
              <span className="flex" aria-hidden>{paletteLabels[o.id as Palette].swatches.map((c) => <span key={c} className="h-2.5 w-2.5" style={{ background: c }} />)}</span>
              {t(o.label)}
            </>
          )}
        />
      </div>
    </>
  );
}
