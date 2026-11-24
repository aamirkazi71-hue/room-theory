import { Fragment, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { ChipSlider } from '@/components/ui/ChipSlider';
import { ProductThumb } from '@/components/configurator/Panels/primitives';
import { useSeo } from '@/hooks/useSeo';
import { collectionCategories, formatDims, formatPrice, products, type CollectionCategory, type Product } from '@/data/furniture';
import { getMaterialDef } from '@/data/materials';
import { t } from '@/i18n';
import { Emph } from '@/components/typography/SplitWords';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'name';
const sorts: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'name', label: 'Name' },
];

/* Varied proportions and tones keep the grid editorial. */
const rhythm = [
  { span: 'lg:col-span-5', aspect: 'aspect-[4/5]', tone: 'bg-ivory-2' },
  { span: 'lg:col-span-4 lg:mt-24', aspect: 'aspect-[3/4]', tone: 'bg-[#E4DED3]' },
  { span: 'lg:col-span-3 lg:mt-48', aspect: 'aspect-[4/5]', tone: 'bg-ivory-2' },
  { span: 'lg:col-span-4', aspect: 'aspect-square', tone: 'bg-[#DCD6CB]' },
  { span: 'lg:col-span-4 lg:mt-16', aspect: 'aspect-square', tone: 'bg-ivory-2' },
  { span: 'lg:col-span-4 lg:mt-32', aspect: 'aspect-[4/5]', tone: 'bg-[#E4DED3]' },
  { span: 'lg:col-span-7', aspect: 'aspect-[16/10]', tone: 'bg-ivory-2' },
  { span: 'lg:col-span-5 lg:mt-20', aspect: 'aspect-[4/5]', tone: 'bg-[#DCD6CB]' },
];

function ProductCard({ p, i }: { p: Product; i: number }) {
  const r = rhythm[i % rhythm.length];
  const mainMaterial = t(p.slots[0] ? getMaterialDef(p.slots[0].default).name : 'Mixed');
  const cat = collectionCategories.find((c) => c.id === p.category)?.label;
  return (
    <article className={`col-span-12 sm:col-span-6 ${r.span}`}>
      <TLink to={`/collection/${p.id}`} className="group block" aria-label={`${p.name}, ${t(p.tagline)}, ${formatPrice(p.price)}`}>
        <div className={`relative ${r.aspect} ${r.tone} overflow-hidden`}>
          <span className="absolute inset-[9%] block transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"><ProductThumb id={p.id} /></span>
          <span className="t-figure absolute start-4 top-4">{cat ? t(cat) : null}</span>
          {p.featured && <span className="absolute end-4 top-4 font-sans text-[0.68rem] text-olive-deep">{t('Studio favourite')}</span>}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-[clamp(1.5rem,1.8vw,1.9rem)] leading-none">{p.name}</h2>
          <span className="t-num font-sans text-[0.86rem]">{formatPrice(p.price)}</span>
        </div>
        <p className="mt-1.5 font-sans text-[0.82rem] text-ink/80">{t(p.tagline)}</p>
        <p className="mt-1 flex flex-wrap gap-x-3 font-sans text-[0.74rem] text-stone-deep">
          <span>{mainMaterial}{p.slots.length > 1 ? ` + ${t(p.slots.length > 2 ? '{n} finishes' : '{n} finish', { n: p.slots.length - 1 })}` : ''}</span>
          <span className="t-num">{formatDims(p.dims)}</span>
        </p>
      </TLink>
    </article>
  );
}

export default function Collection() {
  const root = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const category = params.get('category') as CollectionCategory | null;
  const sort = (params.get('sort') as Sort) ?? 'featured';
  useSeo({ title: category ? `${t(collectionCategories.find((c) => c.id === category)?.label ?? 'Furniture')} — ${t('Collection')}` : t('Collection'), description: t('Sofas, chairs, tables, beds, lighting, storage, electronics and objects — each piece drawn in plan, made in solid materials, and ready to place in your room.') });
  usePageMotion(root, []);

  const list = useMemo(() => {
    const filtered = category ? products.filter((p) => p.category === category) : products;
    const out = [...filtered];
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
    else if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
    else out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return out;
  }, [category, sort]);

  const set = (key: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(key, v); else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div ref={root}>
      <header className="page-x mx-auto max-w-page pb-12 pt-40 lg:pt-48">
        <div className="grid-12 items-end gap-y-8">
          <p className="t-figure col-span-12 lg:col-span-2" data-reveal="fade">{t('Collection')}</p>
          <SplitWords as="h1" text={t('Furniture,|*drawn in plan.*')} className="t-display col-span-12 text-d-l lg:col-span-6" />
          <p className="col-span-12 max-w-sm font-sans text-[0.95rem] leading-relaxed text-stone-deep md:col-span-6 lg:col-span-3 lg:col-start-10" data-reveal="fade">
            {t('Every piece is made from solid timber, stone, natural fibre or brushed metal — and every one can be placed in your room before you decide.')}
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-y hairline bg-ivory/95 backdrop-blur">
        <div className="page-x mx-auto flex max-w-page items-center justify-between gap-6">
          <nav aria-label={t('Categories')} className="min-w-0 flex-1 py-3">
            <ChipSlider label="Furniture categories" tone="ivory-95" activeKey={category}>
            <button className="chip h-8 shrink-0 px-3 text-[0.76rem]" aria-pressed={!category} onClick={() => set('category', null)}>{t('All')}</button>
            {collectionCategories.map((c) => (
              <button key={c.id} className="chip h-8 shrink-0 px-3 text-[0.76rem]" aria-pressed={category === c.id} onClick={() => set('category', c.id)}>{t(c.label)}</button>
            ))}
            </ChipSlider>
          </nav>
          <div className="flex shrink-0 items-center gap-4">
            <span className="t-num hidden font-sans text-[0.76rem] text-stone-deep md:inline">{t('{n} pieces', { n: list.length })}</span>
            <label className="flex items-center gap-2 font-sans text-[0.76rem]">
              <span className="text-stone-deep">{t('Sort')}</span>
              <select value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)} className="h-8 border hairline bg-transparent px-2 font-sans text-[0.76rem] outline-none focus-visible:border-ink">
                {sorts.map((s) => <option key={s.id} value={s.id}>{t(s.label)}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>

      <section className="page-x mx-auto max-w-page pb-section pt-14" aria-label={t('Products')}>
        <div className="grid-12 gap-y-14">
          {list.map((p, i) => (
            <Fragment key={p.id}>
              <ProductCard p={p} i={i} />
              {i === 5 && !category && sort === 'featured' && (
                <aside className="col-span-12 my-6 grid grid-cols-12 items-center gap-[var(--gutter)] bg-ink text-ivory lg:my-12">
                  <div className="relative col-span-12 aspect-[16/10] md:col-span-7"><Photo id="emptyRoom" sizes="(min-width: 768px) 58vw, 100vw" className="absolute inset-0 h-full w-full" /></div>
                  <div className="col-span-12 p-8 md:col-span-5 md:p-12">
                    <p className="t-figure text-ivory/60">{t('Studio note')}</p>
                    <p className="t-display mt-4 text-d-s"><Emph text={t('Choose the room *before* the furniture.')} /></p>
                    <p className="mt-4 max-w-sm font-sans text-[0.9rem] leading-relaxed text-ivory/70">{t('Every piece here can be placed in a room at your own dimensions, in your own light, before you commit to anything.')}</p>
                    <TLink to="/studio" className="btn btn-light mt-8"><span>{t('Open the studio')}</span></TLink>
                  </div>
                </aside>
              )}
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
