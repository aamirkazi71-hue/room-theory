import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Move3d } from 'lucide-react';
import { TLink, useTransitionNavigate } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { MaterialSwatch, ProductThumb } from '@/components/configurator/Panels/primitives';
import { useSeo } from '@/hooks/useSeo';
import { collectionCategories, defaultMaterials, formatPrice, getProduct, priceFor, products, type Product } from '@/data/furniture';
import { getMaterialDef } from '@/data/materials';
import { spaces, roomTemplates, spaceTitle } from '@/data/spaces';
import { useUi } from '@/store/ui';
import NotFound from './NotFound';
import { t, tOptional } from '@/i18n';
import { Emph } from '@/components/typography/SplitWords';

const ProductViewer = lazy(() => import('@/components/configurator/Furniture/ProductViewer'));

/** Front elevation and plan, dimensioned in centimetres. */
function DimensionDrawing({ p }: { p: Product }) {
  const { w, d, h } = p.dims;
  const max = Math.max(w, d, h);
  const s = 100 / max;
  const W = w * s, D = d * s, H = h * s;
  const gap = 34;
  const ink = '#252522';
  return (
    <svg viewBox={`-18 -14 ${W + D + gap + 40} ${Math.max(H, D) + 40}`} className="w-full" direction="ltr" role="img" aria-label={t('Width {w} cm, depth {d} cm, height {h} cm', { w, d, h })}>
      <g fill="none" stroke={ink} strokeWidth={0.6}>
        <rect x={0} y={Math.max(H, D) - H} width={W} height={H} fill="#EAE5DB" />
        <rect x={W + gap} y={Math.max(H, D) - D} width={D} height={D} fill="#EAE5DB" />
      </g>
      <g stroke={ink} strokeWidth={0.4} fill={ink} fontFamily="Inter Tight, sans-serif" fontSize={5.4}>
        <line x1={0} x2={W} y1={Math.max(H, D) + 8} y2={Math.max(H, D) + 8} />
        <text x={W / 2} y={Math.max(H, D) + 16} textAnchor="middle" stroke="none">{t('W')} {w}</text>
        <line x1={-8} x2={-8} y1={Math.max(H, D) - H} y2={Math.max(H, D)} />
        <text x={-11} y={Math.max(H, D) - H / 2} textAnchor="middle" stroke="none" transform={`rotate(-90 -11 ${Math.max(H, D) - H / 2})`}>{t('H')} {h}</text>
        <line x1={W + gap} x2={W + gap + D} y1={Math.max(H, D) + 8} y2={Math.max(H, D) + 8} />
        <text x={W + gap + D / 2} y={Math.max(H, D) + 16} textAnchor="middle" stroke="none">{t('D')} {d}</text>
        <text x={0} y={-6} stroke="none" fill="#625E57">{t('Elevation')}</text>
        <text x={W + gap} y={-6} stroke="none" fill="#625E57">{t('Side')}</text>
      </g>
    </svg>
  );
}

export default function ProductDetail() {
  const { id = '' } = useParams();
  const p = getProduct(id);
  const root = useRef<HTMLDivElement>(null);
  const go = useTransitionNavigate();
  const toast = useUi((s) => s.toast);
  const [mats, setMats] = useState<Record<string, string>>(() => (p ? defaultMaterials(p) : {}));
  useEffect(() => { if (p) setMats(defaultMaterials(p)); }, [p]);
  useSeo({ title: p ? `${p.name} — ${t(p.tagline)}` : t('Product not found'), description: p ? t(p.description) : undefined, type: 'product' });
  usePageMotion(root, [id]);

  const related = useMemo(() => (p ? products.filter((q) => q.id !== p.id && (q.category === p.category || q.studioCategory === p.studioCategory)).slice(0, 4) : []), [p]);
  const inSpaces = useMemo(() => (p ? spaces.filter((s) => roomTemplates[s.type].layout.some((r) => r[0] === p.id)).slice(0, 3) : []), [p]);

  if (!p) return <NotFound />;
  const price = priceFor(p, mats);
  const cat = collectionCategories.find((c) => c.id === p.category);
  const placeHref = `/studio?place=${p.id}&m=${Object.entries(mats).map(([k, v]) => `${k}:${v}`).join(',')}`;

  return (
    <div ref={root}>
      <section className="page-x mx-auto max-w-page pt-[calc(var(--nav-h)+28px)]">
        <nav aria-label={t('Breadcrumb')} className="flex gap-2 font-sans text-[0.76rem] text-stone-deep">
          <TLink to="/collection" className="u-link">{t('Collection')}</TLink>
          <span aria-hidden>/</span>
          {cat && <TLink to={`/collection?category=${cat.id}`} className="u-link">{t(cat.label)}</TLink>}
          <span aria-hidden>/</span>
          <span className="text-ink" aria-current="page">{p.name}</span>
        </nav>

        <div className="grid-12 mt-6 gap-y-10 pb-section">
          {/* Viewer */}
          <div className="col-span-12 lg:col-span-7">
            <div className="lg:sticky lg:top-6">
              <div className="relative aspect-[4/5] bg-ivory-2 sm:aspect-[5/4] lg:aspect-auto lg:h-[calc(100svh-120px)]">
                <Suspense fallback={<div className="absolute inset-[10%]"><ProductThumb id={p.id} /></div>}>
                  <div className="absolute inset-0"><ProductViewer product={p} materials={mats} /></div>
                </Suspense>
                <p className="pointer-events-none absolute bottom-4 start-4 flex items-center gap-2 font-sans text-[0.72rem] text-stone-deep"><Move3d size={13} strokeWidth={1.4} /> {t('Drag to rotate · scroll to zoom')}</p>
                <p className="t-figure pointer-events-none absolute end-4 top-4">{t('Rendered live')}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="t-figure" data-reveal="fade">{cat ? t(cat.label) : null}</p>
            <h1 className="t-display mt-3 text-d-l" data-reveal="fade">{p.name}</h1>
            <p className="mt-2 font-serif text-[1.5rem] italic text-stone-deep" data-reveal="fade">{t(p.tagline)}</p>
            <p className="t-num mt-6 font-sans text-[1.25rem]" aria-live="polite">{formatPrice(price)}</p>
            <p className="mt-1 font-sans text-[0.74rem] text-stone-deep">{t('Price with the finishes selected · Lead time {time}', { time: t(p.leadTime) })}</p>
            <p className="mt-8 font-sans text-[0.95rem] leading-relaxed text-ink/85">{t(p.description)}</p>

            {p.slots.length > 0 && (
              <div className="mt-10 border-t hairline">
                {p.slots.map((slot) => {
                  const chosen = getMaterialDef(mats[slot.key] ?? slot.default);
                  return (
                    <fieldset key={slot.key} className="border-b hairline py-5">
                      <legend className="sr-only">{t(slot.label)}</legend>
                      <div className="mb-3 flex items-baseline justify-between">
                        <span className="font-sans text-[0.8rem]">{t(slot.label)}</span>
                        <span className="font-sans text-[0.78rem] text-stone-deep">{t(chosen.name)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {slot.options.map((m) => (
                          <MaterialSwatch key={m} id={m} active={(mats[slot.key] ?? slot.default) === m} onSelect={() => setMats((s) => ({ ...s, [slot.key]: m }))} />
                        ))}
                      </div>
                      {chosen.note && <p className="mt-2.5 font-sans text-[0.72rem] text-stone-deep">{t(chosen.note)}</p>}
                    </fieldset>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                className="btn btn-primary arrow-shift w-full"
                onClick={() => { toast(t('Taking {name} to your room', { name: p.name })); go(placeHref); }}
              >
                <span>{t('Place in my room')}</span><ArrowRight size={15} strokeWidth={1.5} />
              </button>
              <p className="font-sans text-[0.74rem] leading-relaxed text-stone-deep">{t('Adds {name} with these finishes to the room you have open in the studio. Your current room is kept.', { name: p.name })}</p>
            </div>

            <div className="mt-12">
              <h2 className="font-serif text-title">{t('Dimensions')}</h2>
              <div className="mt-5"><DimensionDrawing p={p} /></div>
            </div>

            <div className="mt-12">
              <h2 className="font-serif text-title">{t('Specifications')}</h2>
              <dl className="mt-4">
                {[{ label: 'Dimensions', value: `${p.dims.w} × ${p.dims.d} × ${p.dims.h} ${t('cm')}` }, ...p.specs, { label: 'Lead time', value: p.leadTime }].map((s) => (
                  <div key={s.label} className="flex justify-between gap-6 border-b hairline py-3">
                    <dt className="font-sans text-[0.8rem] text-stone-deep">{t(s.label)}</dt>
                    <dd className="text-end font-sans text-[0.84rem]">{tOptional(s.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {inSpaces.length > 0 && (
              <div className="mt-12">
                <h2 className="font-serif text-title">{t('Seen in')}</h2>
                <ul className="mt-3">
                  {inSpaces.map((s) => (
                    <li key={s.slug}><TLink to={`/spaces/${s.slug}`} className="flex justify-between border-b hairline py-3 font-sans text-[0.84rem] hover:text-olive-deep"><span>{spaceTitle(s.name, s.type)}</span><span className="text-stone-deep">{t(s.style)}</span></TLink></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-ivory-2" aria-labelledby="related-title">
          <div className="page-x mx-auto max-w-page py-section">
            <div className="flex items-end justify-between border-b hairline pb-6">
              <h2 id="related-title" className="t-display text-d-m" data-reveal="fade"><Emph text={t('Related *furniture*')} /></h2>
              <TLink to="/collection" className="u-link-static font-sans text-[0.82rem]">{t('Full collection')}</TLink>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 lg:grid-cols-4" data-reveal="stagger">
              {related.map((q, i) => (
                <li key={q.id} className={i % 2 === 1 ? 'lg:mt-12' : ''}>
                  <TLink to={`/collection/${q.id}`} className="group block">
                    <span className="block aspect-[4/5] bg-ivory p-6"><span className="block h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"><ProductThumb id={q.id} /></span></span>
                    <span className="mt-3 flex items-baseline justify-between"><span className="font-serif text-[1.35rem] leading-none">{q.name}</span><span className="t-num font-sans text-[0.78rem]">{formatPrice(q.price)}</span></span>
                    <span className="mt-1 block font-sans text-[0.76rem] text-stone-deep">{t(q.tagline)}</span>
                  </TLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
