import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { t } from '@/i18n';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const img = el.querySelector('[data-hero-img] img');
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo('[data-hero-img]', { clipPath: 'inset(8% 6% 8% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.42, transformOrigin: '82% 58%' }, { scale: 1.24, duration: 2.6, ease: 'expo.out' }, 0)
        .from('.split-inner', { yPercent: 115, duration: 1.4, ease: 'expo.out', stagger: 0.07 }, 0.75)
        .from('[data-hero-fade]', { opacity: 0, y: 18, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 1.05);

      // Scroll: the photograph drifts and settles while the copy lifts away.
      gsap.to(img, { yPercent: 7, scale: 1.18, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('[data-hero-copy]', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-ivory" aria-labelledby="hero-title">
      <div data-hero-img className="absolute inset-0">
        <Photo id="heroLiving" priority sizes="100vw" className="h-full w-full" imgClassName="origin-[82%_58%] scale-[1.24]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,24,0.55)_0%,rgba(26,26,24,0.12)_16%,rgba(26,26,24,0)_30%,rgba(26,26,24,0.05)_45%,rgba(26,26,24,0.72)_100%)]" />
        <div className="absolute inset-0 rtl:-scale-x-100 bg-[linear-gradient(90deg,rgba(26,26,24,0.35)_0%,rgba(26,26,24,0)_45%,rgba(26,26,24,0.0)_65%,rgba(26,26,24,0.3)_100%)]" />
      </div>

      <div data-hero-copy className="page-x relative mx-auto flex h-full max-w-page flex-col justify-end pb-10 md:pb-14">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-8">
            <p data-hero-fade className="mb-6 flex items-center gap-3 font-sans text-[0.74rem] tracking-[0.02em] text-ivory/80">
              <span className="t-num">{t('Fig. 01')}</span>
              <span className="h-px w-8 bg-ivory/50" />
              <span>{t('Tavira living room, organic modern')}</span>
            </p>
            <SplitWords
              id="hero-title" reveal={false} as="h1"
              text={t('Spaces that|feel like *you.*')}
              className="t-display block text-d-xl"
              italicClass="italic text-ivory/95"
            />
          </div>
          <div className="col-span-12 sm:col-span-8 md:col-span-6 lg:col-span-4 lg:pb-3">
            <p data-hero-fade className="max-w-[23rem] font-sans text-[0.98rem] leading-relaxed text-ivory/85">
              {t('Explore the relationship between form, material and atmosphere. Create spaces that are entirely your own.')}
            </p>
            <div data-hero-fade className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <TLink to="/studio" className="btn btn-light arrow-shift">
                <span>{t('Start designing')}</span>
                <ArrowRight size={15} strokeWidth={1.5} />
              </TLink>
              <TLink to="/spaces" className="u-link-static font-sans text-[0.82rem] text-ivory">{t('Explore spaces')}</TLink>
            </div>
          </div>
        </div>

        <div data-hero-fade className="mt-10 flex items-end justify-between border-t border-ivory/20 pt-4 font-sans text-[0.72rem] text-ivory/70 md:mt-14">
          <span className="hidden sm:inline">{t('Oak, travertine, linen — 31 m²')}</span>
          <span className="flex items-center gap-3" aria-hidden>
            {t('Scroll')}
            <span className="relative block h-8 w-px overflow-hidden bg-ivory/20">
              <span className="scroll-cue absolute inset-0 bg-ivory" />
            </span>
          </span>
          <span className="hidden sm:inline">{t('Autumn collection 2026')}</span>
        </div>
      </div>
    </section>
  );
}
