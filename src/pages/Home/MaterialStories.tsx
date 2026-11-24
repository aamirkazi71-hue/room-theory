import { useEffect, useRef, useState } from 'react';
import { SplitWords } from '@/components/typography/SplitWords';
import { getMaterialDef, materialStories } from '@/data/materials';
import { generateTexture } from '@/lib/textures';
import { useNearView } from '@/hooks/useInView';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { t } from '@/i18n';

/** Generate the large material plates one at a time during idle time. */
function usePlates(enabled: boolean, first: number) {
  const [plates, setPlates] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const order = [...materialStories.keys()].sort((a, b) => (a === first ? -1 : b === first ? 1 : a - b));
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 60));
    const next = (i: number) => {
      if (cancelled || i >= order.length) return;
      ric(() => {
        if (cancelled) return;
        const story = materialStories[order[i]];
        const def = getMaterialDef(story.materialId);
        const url = def.texture ? generateTexture(def.texture, def.color, 640).color.toDataURL('image/jpeg', 0.9) : '';
        setPlates((p) => ({ ...p, [story.id]: url }));
        next(i + 1);
      });
    };
    next(0);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return plates;
}

export function MaterialStories() {
  const section = useRef<HTMLElement>(null);
  const near = useNearView(section, '800px');
  const [active, setActive] = useState(0);
  const plates = usePlates(near, active);
  const isDesktop = useIsDesktop();
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!isDesktop) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index)); }),
      { rootMargin: '-48% 0px -48% 0px' },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, [isDesktop]);

  const story = materialStories[active];

  return (
    <section ref={section} className="bg-ink text-ivory on-dark" aria-labelledby="materials-title">
      <div className="page-x mx-auto max-w-page py-section">
        <header className="grid-12 gap-y-6">
          <p className="t-figure col-span-12 text-ivory/55 lg:col-span-2" data-reveal="fade">{t('04 / Materials')}</p>
          <SplitWords id="materials-title" as="h2" text={t('The language of|*natural materials.*')} className="t-display col-span-12 text-d-l lg:col-span-7" />
          <p className="col-span-12 max-w-[24rem] self-end font-sans text-[0.95rem] leading-relaxed text-ivory/65 md:col-span-6 lg:col-span-3" data-reveal="fade">
            {t('Seven materials we return to. Each plate is rendered from the same definition the studio uses, so what you see here is what you place.')}
          </p>
        </header>

        <div className="grid-12 mt-16 gap-y-10 lg:mt-24">
          {/* Plate */}
          <div className="col-span-12 lg:col-span-6">
            <div className="lg:sticky lg:top-[12vh]">
              <div className="relative aspect-square overflow-hidden bg-ink-soft lg:aspect-auto lg:h-[76vh]">
                {materialStories.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-inout"
                    style={{ clipPath: i === active ? 'inset(0% 0% 0% 0%)' : i < active ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', zIndex: i === active ? 2 : 1 }}
                    aria-hidden={i !== active}
                  >
                    <div
                      className={`h-full w-full bg-cover bg-center transition-transform duration-[2400ms] ease-out ${i === active ? 'scale-100' : 'scale-110'}`}
                      style={{ backgroundImage: plates[s.id] ? `url(${plates[s.id]})` : undefined, backgroundColor: getMaterialDef(s.materialId).color, backgroundSize: '160%' }}
                    />
                  </div>
                ))}
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/45 to-transparent p-5 pt-16 font-sans text-[0.72rem] text-ivory/85">
                  <span>{t('Fig.')} <span className="t-num">0{active + 4}</span> — {t(getMaterialDef(story.materialId).name)}</span>
                  <span>{t(story.origin)}</span>
                </div>
              </div>
              {/* Mobile selector */}
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:hidden" role="tablist" aria-label={t('Materials')}>
                {materialStories.map((s, i) => (
                  <button key={s.id} role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={`h-9 shrink-0 border px-3.5 font-sans text-[0.76rem] transition-colors ${i === active ? 'border-ivory bg-ivory text-ink' : 'border-ivory/25 text-ivory/80'}`}>
                    {t(s.name)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stories */}
          <ol className="col-span-12 lg:col-span-5 lg:col-start-8">
            {materialStories.map((s, i) => {
              const on = i === active;
              return (
                <li
                  key={s.id}
                  ref={(el) => { rows.current[i] = el; }}
                  data-index={i}
                  className={`border-t hairline-dark lg:flex lg:min-h-[52vh] lg:flex-col lg:justify-center ${on ? '' : 'hidden lg:flex'}`}
                >
                  <button className="group flex w-full items-baseline gap-5 py-6 text-left" onClick={() => setActive(i)} aria-expanded={on}>
                    <span className={`t-num font-sans text-[0.72rem] transition-colors ${on ? 'text-olive-soft' : 'text-ivory/40'}`}>0{i + 1}</span>
                    <span className={`font-serif text-[clamp(2.2rem,3.6vw,3.6rem)] leading-none transition-colors duration-500 ${on ? 'text-ivory' : 'text-ivory/35 group-hover:text-ivory/60'}`}>{t(s.name)}</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pb-8 ps-[calc(0.72rem*2+1.25rem)]">
                        <p className="font-serif text-[1.45rem] italic leading-snug text-ivory/90">{t(s.character)}</p>
                        <p className="mt-4 max-w-md font-sans text-[0.9rem] leading-relaxed text-ivory/65">{t(s.body)}</p>
                        <dl className="mt-6 grid max-w-md grid-cols-3 gap-4 border-t hairline-dark pt-4">
                          {s.traits.map((tr) => (
                            <div key={tr.label}>
                              <dt className="font-sans text-[0.68rem] text-ivory/45">{t(tr.label)}</dt>
                              <dd className="mt-1 font-sans text-[0.82rem] text-ivory/90">{t(tr.value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
