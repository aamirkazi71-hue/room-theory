import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { SplitWords } from '@/components/typography/SplitWords';
import { useNearView, useVisible } from '@/hooks/useInView';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';
import { t } from '@/i18n';

const IntroScene = lazy(() => import('./IntroScene'));

const capabilities = [
  { n: '01', title: 'Place furniture', body: 'Drag real pieces into a room built to your dimensions. They sit on the floor, stop at walls and slide under tables where they should.' },
  { n: '02', title: 'Explore materials', body: 'Change bouclé to linen, travertine to walnut. Every finish is rendered from the samples we send out.' },
  { n: '03', title: 'Shape the atmosphere', body: 'Move from morning light to evening lamps and see how the room changes before you commit to anything.' },
];

export function StudioIntro() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(prefersReducedMotion() ? 1 : 0);
  const [step, setStep] = useState(0);
  const near = useNearView(section, '600px');
  const visible = useVisible(stage, '100px');

  useLayoutEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: true,
        onUpdate: (s) => { progress.current = s.progress; },
      });
    });
    mm.add('(max-width: 1023px)', () => {
      ScrollTrigger.create({
        trigger: stage.current,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: true,
        onUpdate: (s) => { progress.current = s.progress; },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-ink text-ivory on-dark lg:h-[100svh]" aria-labelledby="studio-intro-title">
      <div className="mx-auto grid h-full max-w-page grid-cols-1 lg:grid-cols-12">
        <div ref={stage} className="relative order-2 aspect-[4/5] sm:aspect-[4/3] lg:order-1 lg:col-span-7 lg:aspect-auto lg:h-full">
          {near && (
            <Suspense fallback={<div className="absolute inset-0 bg-[#E6DDCF]" />}>
              <div className="absolute inset-0">
                <IntroScene progress={progress} onStep={setStep} active={visible} />
              </div>
            </Suspense>
          )}
          <div className={`pointer-events-none absolute bottom-5 left-5 right-5 flex items-center justify-between font-sans text-[0.7rem] transition-colors duration-1000 lg:bottom-8 lg:left-8 ${step === 2 ? 'text-ivory/60' : 'text-ink/60'}`}>
            <span className="t-num">{t('Fig. 02 — Calder living room, rendered live')}</span>
            <span className="t-num hidden sm:inline">{t(['Arrangement', 'Finishes', 'Light'][step])}</span>
          </div>
        </div>

        <div className="page-x order-1 flex flex-col justify-center py-section lg:order-2 lg:col-span-5 lg:py-0 lg:pl-[clamp(32px,4vw,80px)]">
          <p className="t-figure text-ivory/60" data-reveal="fade">{t('02 / The studio')}</p>
          <SplitWords id="studio-intro-title" as="h2" text={t('Your imagination.|*Your space.*')} className="t-display mt-6 text-d-m" />
          <p className="mt-6 max-w-measure font-sans text-[0.98rem] leading-relaxed text-ivory/70" data-reveal="fade">
            {t('A real-time 3D room you can furnish, finish and light — at your own dimensions, with our own pieces. No downloads, no account needed to begin.')}
          </p>
          <ol className="mt-10 border-t hairline-dark">
            {capabilities.map((c, i) => {
              const active = step === i;
              return (
                <li key={c.n} className="border-b hairline-dark py-5">
                  <div className="flex items-baseline gap-5">
                    <span className={`t-num font-sans text-[0.72rem] transition-colors duration-500 ${active ? 'text-olive-soft' : 'text-ivory/40'}`}>{c.n}</span>
                    <div>
                      <h3 className={`font-serif text-[1.7rem] leading-none transition-colors duration-500 ${active ? 'text-ivory' : 'text-ivory lg:text-ivory/45'}`}>{t(c.title)}</h3>
                      <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-out ${active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0'}`}>
                        <p className="overflow-hidden pt-3 font-sans text-[0.88rem] leading-relaxed text-ivory/65">{t(c.body)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-10" data-reveal="fade">
            <TLink to="/studio" className="btn btn-light arrow-shift">
              <span>{t('Enter the studio')}</span>
              <ArrowRight size={15} strokeWidth={1.5} />
            </TLink>
          </div>
        </div>
      </div>
    </section>
  );
}
