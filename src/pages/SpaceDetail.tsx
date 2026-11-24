import { lazy, Suspense, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Move3d } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { FloorPlan } from '@/components/configurator/FloorPlan';
import { ProductThumb, SwatchImage } from '@/components/configurator/Panels/primitives';
import { useSeo } from '@/hooks/useSeo';
import { useNearView, useVisible } from '@/hooks/useInView';
import { photos, photoUrl } from '@/data/assets';
import { formatPrice, getProduct, priceFor } from '@/data/furniture';
import { getFloorFinish, getMaterialDef, getWallFinish } from '@/data/materials';
import { areaOf, buildDesign, getSpace, roomTemplates, roomTypeLabels, spaces } from '@/data/spaces';
import { lightingPresets } from '@/components/configurator/Scene/Lighting';
import NotFound from './NotFound';
import { t, tOptional } from '@/i18n';
import { Emph } from '@/components/typography/SplitWords';
import { spaceTitle } from '@/data/spaces';

const RoomPreview = lazy(() => import('@/components/configurator/Scene/RoomPreview'));

export default function SpaceDetail() {
  const { slug = '' } = useParams();
  const space = getSpace(slug);
  const root = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const near = useNearView(previewRef, '300px');
  const visible = useVisible(previewRef);
  const design = useMemo(() => (space ? buildDesign(space.type, space) : null), [space]);
  useSeo({ title: space ? spaceTitle(space.name, space.type) : t('Space not found'), description: space ? t(space.lede) : undefined, image: space ? photoUrl(photos[space.photo], 1200) : undefined });
  usePageMotion(root, [slug]);

  const furniture = useMemo(() => {
    if (!design) return [];
    const seen = new Map<string, { id: string; qty: number; mats: Record<string, string> }>();
    design.items.forEach((i) => {
      const e = seen.get(i.productId);
      if (e) e.qty += 1; else seen.set(i.productId, { id: i.productId, qty: 1, mats: i.materials });
    });
    return [...seen.values()];
  }, [design]);

  const keyMaterials = useMemo(() => {
    if (!design) return [];
    const ids = new Set<string>();
    design.items.forEach((i) => Object.values(i.materials).forEach((m) => ids.add(m)));
    return [...ids].map(getMaterialDef).filter((m) => m.texture).slice(0, 8);
  }, [design]);

  if (!space || !design) return <NotFound />;
  const total = design.items.reduce((sum, i) => sum + priceFor(getProduct(i.productId)!, i.materials), 0);
  const related = spaces.filter((s) => s.slug !== space.slug && (s.type === space.type || s.style === space.style)).slice(0, 3);
  const floor = getFloorFinish(space.finishes.floor);
  const wall = getWallFinish(space.finishes.wallFinish);
  const rows = [
    { label: 'Room', value: roomTemplates[space.type].label },
    { label: 'Dimensions', value: `${space.width.toFixed(1)} × ${space.depth.toFixed(1)} ${t('m')}` },
    { label: 'Floor area', value: `${areaOf(space)} ${t('m²')}` },
    { label: 'Ceiling', value: `${(space.height ?? roomTemplates[space.type].height).toFixed(1)} ${t('m')}` },
  ];
  rows.push(...space.characteristics.filter((c) => !rows.some((r) => r.label === c.label)));

  return (
    <div ref={root}>
      {/* Hero */}
      <section className="relative h-[92svh] min-h-[600px] overflow-hidden bg-ink text-ivory" aria-labelledby="space-title">
        <div className="absolute inset-0" data-reveal="image">
          <Photo id={space.photo} priority sizes="100vw" className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,24,0.5)_0%,rgba(26,26,24,0)_25%,rgba(26,26,24,0)_50%,rgba(26,26,24,0.7)_100%)]" />
        </div>
        <div className="page-x relative mx-auto flex h-full max-w-page flex-col justify-end pb-10">
          <TLink to="/spaces" className="u-link mb-auto mt-[calc(var(--nav-h)+24px)] self-start font-sans text-[0.78rem] text-ivory/80">{t('← All spaces')}</TLink>
          <p className="t-figure mb-5 text-ivory/75" data-reveal="fade">{t(space.style)} · {t(roomTemplates[space.type].label)}</p>
          <SplitWords id="space-title" as="h1" text={spaceTitle(space.name, space.type, true)} className="t-display block text-d-xl" />
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-ivory/20 pt-5">
            <dl className="flex flex-wrap gap-x-10 gap-y-2 font-sans text-[0.78rem] text-ivory/80">
              <div><dt className="text-ivory/55">{t('Area')}</dt><dd className="t-num">{areaOf(space)} {t('m²')}</dd></div>
              <div><dt className="text-ivory/55">{t('Pieces')}</dt><dd className="t-num">{design.items.length}</dd></div>
              <div><dt className="text-ivory/55">{t('Light')}</dt><dd>{t(lightingPresets[design.lighting].label)}</dd></div>
              <div><dt className="text-ivory/55">{t('Furnished from')}</dt><dd className="t-num">{formatPrice(total)}</dd></div>
            </dl>
            <TLink to={`/studio?space=${space.slug}`} className="btn btn-light arrow-shift"><span>{t('Start customizing')}</span><ArrowRight size={15} strokeWidth={1.5} /></TLink>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="page-x mx-auto max-w-page py-section">
        <div className="grid-12 gap-y-8">
          <p className="t-figure col-span-12 lg:col-span-3" data-reveal="fade">{t('The space')}</p>
          <div className="col-span-12 lg:col-span-7">
            <p className="t-display text-d-s" data-reveal="fade">{t(space.lede)}</p>
            <p className="mt-8 max-w-measure-wide font-sans text-[1rem] leading-relaxed text-stone-deep" data-reveal="fade">{t(space.description)}</p>
          </div>
        </div>
      </section>

      {/* Plan + characteristics */}
      <section className="bg-ivory-2" aria-labelledby="plan-title">
        <div className="page-x mx-auto max-w-page py-section">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-7" data-reveal="fade">
              <div className="flex items-baseline justify-between border-b hairline pb-3">
                <h2 id="plan-title" className="font-serif text-title">{t('Plan')}</h2>
                <span className="t-figure">{t('1:50 · dimensions in mm')}</span>
              </div>
              <FloorPlan design={design} className="mt-6 w-full" />
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <h2 className="font-serif text-title" data-reveal="fade">{t('Architectural characteristics')}</h2>
              <dl className="mt-6" data-reveal="stagger">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-6 border-b hairline py-3">
                    <dt className="font-sans text-[0.8rem] text-stone-deep">{t(r.label)}</dt>
                    <dd className="text-end font-sans text-[0.86rem]">{tOptional(r.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Live 3D */}
      <section className="relative bg-ink text-ivory on-dark" aria-labelledby="preview-title">
        <div ref={previewRef} className="relative h-[80svh] min-h-[520px]">
          {near && (
            <Suspense fallback={null}>
              <RoomPreview design={design} active={visible} />
            </Suspense>
          )}
          <div className="page-x pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-page items-start justify-between pt-8">
            <div className="bg-ink/80 px-4 py-3 backdrop-blur">
              <h2 id="preview-title" className="font-serif text-[1.5rem] leading-none">{t('The room, live')}</h2>
              <p className="mt-1 flex items-center gap-2 font-sans text-[0.74rem] text-ivory/70"><Move3d size={13} strokeWidth={1.4} /> {t('Drag to turn it around')}</p>
            </div>
            <TLink to={`/studio?space=${space.slug}`} className="btn btn-light btn-sm pointer-events-auto"><span>{t('Edit in the studio')}</span></TLink>
          </div>
        </div>
      </section>

      {/* Furniture */}
      <section className="page-x mx-auto max-w-page py-section" aria-labelledby="furniture-title">
        <div className="flex flex-col gap-4 border-b hairline pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-figure" data-reveal="fade">{t('In this room')}</p>
            <h2 id="furniture-title" className="t-display mt-4 text-d-m" data-reveal="fade"><Emph text={t('Available *furniture*')} /></h2>
          </div>
          <p className="font-sans text-[0.86rem]">{t('{n} pieces · {price} as shown', { n: furniture.length, price: formatPrice(total) })}</p>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-10 sm:grid-cols-3 lg:grid-cols-5" data-reveal="stagger">
          {furniture.map((f) => {
            const p = getProduct(f.id)!;
            return (
              <li key={f.id}>
                <TLink to={`/collection/${p.id}`} className="group block">
                  <span className="block aspect-square bg-ivory-2 p-4 transition-colors duration-500 group-hover:bg-ivory-3">
                    <span className="block h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"><ProductThumb id={p.id} /></span>
                  </span>
                  <span className="mt-3 flex items-baseline justify-between">
                    <span className="font-serif text-[1.25rem] leading-none">{p.name}{f.qty > 1 && <span className="font-sans text-[0.72rem] text-stone-deep"> × {f.qty}</span>}</span>
                    <span className="t-num font-sans text-[0.74rem] text-stone-deep">{formatPrice(priceFor(p, f.mats))}</span>
                  </span>
                  <span className="mt-1 block font-sans text-[0.74rem] text-stone-deep">{t(p.tagline)}</span>
                </TLink>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Materials */}
      <section className="page-x mx-auto max-w-page pb-section" aria-labelledby="materials-title">
        <div className="grid-12 gap-y-10 border-t hairline pt-14">
          <div className="col-span-12 lg:col-span-4">
            <h2 id="materials-title" className="t-display text-d-s" data-reveal="fade">{t('Materials')}</h2>
            <p className="mt-4 max-w-sm font-sans text-[0.9rem] leading-relaxed text-stone-deep" data-reveal="fade">
              {space.finishes.accentWall != null && space.finishes.accentFinish
                ? t('{floor} underfoot, {wall} on the walls, and a feature wall in {feature}. Every finish can be changed in the studio.', { floor: t(floor.name), wall: t(wall.name).toLowerCase(), feature: t(getWallFinish(space.finishes.accentFinish).name).toLowerCase() })
                : t('{floor} underfoot, {wall} on the walls. Every finish can be changed in the studio.', { floor: t(floor.name), wall: t(wall.name).toLowerCase() })}
            </p>
          </div>
          <ul className="col-span-12 grid grid-cols-2 gap-x-[var(--gutter)] gap-y-6 sm:grid-cols-4 lg:col-span-7 lg:col-start-6" data-reveal="stagger">
            <li>
              <SwatchImage texture={floor.texture} color={floor.color} className="aspect-square w-full" />
              <p className="mt-2 font-sans text-[0.8rem]">{t(floor.name)}</p><p className="font-sans text-[0.7rem] text-stone-deep">{t('Floor')}</p>
            </li>
            <li>
              <SwatchImage texture={wall.texture} color={wall.tintable ? space.finishes.wallColor : wall.color} className="aspect-square w-full" />
              <p className="mt-2 font-sans text-[0.8rem]">{t(wall.name)}</p><p className="font-sans text-[0.7rem] text-stone-deep">{t('Walls')}</p>
            </li>
            {keyMaterials.slice(0, 6).map((m) => (
              <li key={m.id}>
                <SwatchImage texture={m.texture} color={m.color} className="aspect-square w-full" />
                <p className="mt-2 font-sans text-[0.8rem]">{t(m.name)}</p><p className="font-sans text-[0.7rem] text-stone-deep">{m.note ? t(m.note) : null}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ivory-2">
        <div className="page-x mx-auto flex max-w-page flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-end">
          <h2 className="t-display max-w-2xl text-d-m" data-reveal="fade"><Emph text={t('Make {name} *your own.*', { name: space.name })} /></h2>
          <div className="flex flex-wrap gap-3" data-reveal="fade">
            <TLink to={`/studio?space=${space.slug}`} className="btn btn-primary arrow-shift"><span>{t('Start customizing')}</span><ArrowRight size={15} strokeWidth={1.5} /></TLink>
            <TLink to="/spaces" className="btn btn-ghost"><span>{t('Browse other spaces')}</span></TLink>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="page-x mx-auto max-w-page py-section" aria-labelledby="related-title">
          <h2 id="related-title" className="font-serif text-title">{t('Related spaces')}</h2>
          <div className="mt-8 grid gap-[var(--gutter)] gap-y-12 md:grid-cols-3">
            {related.map((s, i) => (
              <TLink key={s.slug} to={`/spaces/${s.slug}`} className={`group block ${i === 1 ? 'md:mt-16' : ''}`}>
                <div className="relative aspect-[4/5] overflow-hidden"><Photo id={s.photo} sizes="(min-width: 768px) 33vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" /></div>
                <p className="mt-4 font-serif text-[1.6rem] leading-none"><Emph text={spaceTitle(s.name, s.type, true)} italicClass="italic text-stone-deep" /></p>
                <p className="mt-1 t-meta">{t(s.style)} · {areaOf(s)} {t('m²')}</p>
              </TLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
