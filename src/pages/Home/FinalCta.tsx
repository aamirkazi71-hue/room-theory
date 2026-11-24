import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { Photo } from '@/components/ui/Photo';
import { Emph } from '@/components/typography/SplitWords';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { t } from '@/i18n';

/** A framed photograph that opens out to full-bleed as you scroll into it. */
export function FinalCta() {
  const section = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=110%', pin: true, scrub: 0.5 } });
      tl.fromTo('[data-frame]', { clipPath: 'inset(16% 26% 16% 26%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 1 }, 0)
        .fromTo('[data-frame] img', { scale: 1.3 }, { scale: 1.02, ease: 'none', duration: 1 }, 0)
        .fromTo('[data-veil]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.6 }, 0.35)
        .fromTo('[data-cta-copy] > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'power2.out' }, 0.5)
        .fromTo('[data-intro]', { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ivory" aria-labelledby="final-title">
      <div data-intro className="page-x absolute inset-x-0 top-[6vh] z-10 mx-auto flex max-w-page justify-between font-sans text-[0.74rem] text-stone-deep">
        <span className="t-figure">{t('06 / Begin')}</span>
        <span>{t('Double-height living room, dusk')}</span>
      </div>
      <div data-frame className="absolute inset-0" style={{ clipPath: prefersReducedMotion() ? undefined : 'inset(16% 26% 16% 26%)' }}>
        <Photo id="finalDusk" sizes="100vw" className="h-full w-full" />
        <div data-veil className="absolute inset-0 rtl:-scale-x-100 bg-[linear-gradient(90deg,rgba(26,26,24,0.62)_0%,rgba(26,26,24,0.25)_55%,rgba(26,26,24,0.1)_100%)]" />
      </div>
      <div className="page-x relative mx-auto flex h-full max-w-page items-end pb-[10vh] text-ivory">
        <div data-cta-copy className="max-w-3xl">
          <p className="t-figure text-ivory/70">{t('Your room, at your dimensions')}</p>
          <h2 id="final-title" className="t-display mt-6 text-d-l"><Emph text={t('Every room begins|with an *idea.*')} /></h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
            <TLink to="/studio" className="btn btn-light arrow-shift"><span>{t('Create your space')}</span><ArrowRight size={15} strokeWidth={1.5} /></TLink>
            <TLink to="/spaces" className="u-link-static font-sans text-[0.82rem]">{t('Or start from a curated room')}</TLink>
          </div>
        </div>
      </div>
    </section>
  );
}
