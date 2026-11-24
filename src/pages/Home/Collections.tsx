import { useLayoutEffect, useRef } from 'react';
import { TLink } from '@/components/animations/PageTransition';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { ProductThumb } from '@/components/configurator/Panels/primitives';
import type { PhotoKey } from '@/data/assets';
import type { CollectionCategory } from '@/data/furniture';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { isRtl, t } from '@/i18n';

interface Panel {
  title: string;
  italic: string;
  category: CollectionCategory;
  photo: PhotoKey;
  product: string;
  note: string;
  /** Layout per panel keeps the sequence rhythmic rather than uniform */
  size: string;
  aspect: string;
  offset: string;
  productPos: string;
}

const panels: Panel[] = [
  { title: 'Seating', italic: 'for staying', category: 'sofas', photo: 'yellowChair', product: 'orla-lounge-chair', note: 'Sofas, lounge and accent chairs', size: 'w-[78vw] sm:w-[52vw] lg:w-[34vw]', aspect: 'aspect-[4/5]', offset: 'lg:mt-0', productPos: '-right-6 bottom-8 w-[34%]' },
  { title: 'Tables', italic: 'to gather at', category: 'coffee-tables', photo: 'catTables', product: 'plinth-coffee-table', note: 'Dining, coffee, side and console', size: 'w-[70vw] sm:w-[44vw] lg:w-[26vw]', aspect: 'aspect-[3/4]', offset: 'lg:mt-[14vh]', productPos: '-left-6 top-10 w-[44%]' },
  { title: 'Lighting', italic: 'after dark', category: 'lighting', photo: 'catLighting', product: 'stem-floor-lamp', note: 'Floor, table and pendant', size: 'w-[82vw] sm:w-[58vw] lg:w-[38vw]', aspect: 'aspect-[16/11]', offset: 'lg:mt-[4vh]', productPos: '-right-6 top-8 w-[20%]' },
  { title: 'Storage', italic: 'kept quiet', category: 'storage', photo: 'catStorage', product: 'arc-console', note: 'Shelving, consoles, wardrobes', size: 'w-[70vw] sm:w-[44vw] lg:w-[25vw]', aspect: 'aspect-[3/4]', offset: 'lg:mt-[18vh]', productPos: '-left-6 bottom-10 w-[44%]' },
  { title: 'Bedroom', italic: 'at rest', category: 'beds', photo: 'catBedroom', product: 'still-bed', note: 'Beds and nightstands', size: 'w-[78vw] sm:w-[54vw] lg:w-[33vw]', aspect: 'aspect-[5/4]', offset: 'lg:mt-[2vh]', productPos: '-right-6 bottom-8 w-[38%]' },
  { title: 'Objects', italic: '& decor', category: 'accessories', photo: 'catObjects', product: 'urn-vase', note: 'Rugs, vessels, books, art', size: 'w-[70vw] sm:w-[44vw] lg:w-[26vw]', aspect: 'aspect-[4/5]', offset: 'lg:mt-[10vh]', productPos: '-left-6 bottom-8 w-[28%]' },
];

export function Collections() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      // In Arabic the sequence runs right to left, so the track travels the other way.
      const dir = isRtl() ? 1 : -1;
      const tween = gsap.to(tr, {
        x: () => dir * distance(),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
      });
      // Images drift a little against the track for depth.
      tr.querySelectorAll<HTMLElement>('[data-drift] img').forEach((img) => {
        gsap.fromTo(img, { xPercent: 6 * dir }, { xPercent: -6 * dir, ease: 'none', scrollTrigger: { trigger: img, containerAnimation: tween, start: dir < 0 ? 'left right' : 'right left', end: dir < 0 ? 'right left' : 'left right', scrub: true } });
      });
    });
    return () => mm.revert();
  }, []);


  return (
    <section ref={section} className="relative overflow-hidden bg-ivory lg:h-[100svh]" aria-labelledby="collections-title">
      <div className="flex h-full flex-col justify-center py-section lg:py-0">
        <div ref={track} className="no-scrollbar flex items-start gap-[clamp(28px,4vw,72px)] overflow-x-auto px-[var(--margin)] pb-14 pt-14 lg:overflow-visible lg:pb-0 lg:pt-0">
          <header className="flex w-[82vw] shrink-0 flex-col justify-between self-stretch sm:w-[56vw] lg:w-[30vw] lg:py-[6vh]">
            <div>
              <p className="t-figure" data-reveal="fade">{t('03 / Collections')}</p>
              <SplitWords id="collections-title" as="h2" text={t('Made for rooms,|*not showrooms.*')} className="t-display mt-6 block text-d-m" />
            </div>
            <div className="mt-8 lg:mt-0">
              <p className="max-w-[22rem] font-sans text-[0.95rem] leading-relaxed text-stone-deep">
                {t('Thirty-one pieces in seven families, drawn in plan before elevation so they sit well against walls, under windows and in the middle of a room.')}
              </p>
              <TLink to="/collection" className="u-link-static mt-5 inline-block font-sans text-[0.82rem]">{t('View the full collection')}</TLink>
            </div>
          </header>

          {panels.map((p, i) => (
            <TLink key={p.title} to={`/collection?category=${p.category}`} className={`group relative shrink-0 ${p.size} ${p.offset}`}>
              <div className="relative">
                <div className={`relative overflow-hidden ${p.aspect}`} data-drift>
                  <Photo id={p.photo} sizes="(min-width: 1024px) 38vw, 80vw" className="absolute inset-0 h-full w-full" imgClassName="scale-[1.14] transition-[filter] duration-700 group-hover:brightness-[0.92]" />
                </div>
                <div className={`pointer-events-none absolute ${p.productPos} aspect-square bg-ivory p-2.5 shadow-[0_24px_60px_-30px_rgba(37,37,34,0.45)] transition-transform duration-700 ease-out group-hover:-translate-y-2`}>
                  <ProductThumb id={p.product} />
                </div>
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-[clamp(1.8rem,2.4vw,2.6rem)] leading-none">
                  {t(p.title)} <span className="italic text-stone-deep">{t(p.italic)}</span>
                </h3>
                <span className="t-figure">0{i + 1}</span>
              </div>
              <p className="mt-2 font-sans text-[0.8rem] text-stone-deep">{t(p.note)} <span className="u-link ms-2 text-ink">{t('Browse')}</span></p>
            </TLink>
          ))}
          <div className="w-[1px] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}
