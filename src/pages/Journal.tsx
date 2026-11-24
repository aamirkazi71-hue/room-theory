import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { Emph } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { useSeo } from '@/hooks/useSeo';
import { articles, formatDate, journalCategories, type Article, type JournalCategory } from '@/data/journal';
import { t } from '@/i18n';

function Byline({ a, light = false }: { a: Article; light?: boolean }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.74rem] ${light ? 'text-ivory/75' : 'text-stone-deep'}`}>
      <span className={light ? 'text-ivory' : 'text-ink'}>{t(a.category)}</span>
      <span className={`h-px w-4 ${light ? 'bg-ivory/40' : 'bg-ink/30'}`} />
      <time dateTime={a.date}>{formatDate(a.date)}</time>
      <span>· {t('{n} min read', { n: a.readingTime })}</span>
    </p>
  );
}

const layouts = [
  { col: 'md:col-span-5', aspect: 'aspect-[4/5]', mt: '' },
  { col: 'md:col-span-6 md:col-start-7', aspect: 'aspect-[16/11]', mt: 'md:mt-40' },
  { col: 'md:col-span-4 md:col-start-2', aspect: 'aspect-[3/4]', mt: 'md:-mt-10' },
  { col: 'md:col-span-6 md:col-start-7', aspect: 'aspect-[4/3]', mt: 'md:mt-20' },
  { col: 'md:col-span-7', aspect: 'aspect-[16/10]', mt: 'md:mt-8' },
  { col: 'md:col-span-4 md:col-start-9', aspect: 'aspect-[4/5]', mt: 'md:mt-44' },
];

export default function Journal() {
  const root = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') as JournalCategory | null;
  useSeo({ title: t('Journal'), description: t('Essays on architecture, interiors, materials and the way rooms are lived in — from the Room Theory studio.') });
  usePageMotion(root, []);
  const list = useMemo(() => (cat ? articles.filter((a) => a.category === cat) : articles), [cat]);
  const [lead, ...rest] = list;

  return (
    <div ref={root}>
      <header className="page-x mx-auto max-w-page pt-36 lg:pt-44">
        <div className="flex items-end justify-between gap-6 border-b border-ink pb-[clamp(1.2rem,3.4vw,3.2rem)]">
          <h1 className="t-display text-[clamp(4.2rem,14vw,13rem)] leading-[0.8] tracking-[-0.03em]"><Emph text={t('The *Journal*')} /></h1>
          <div className="hidden pb-3 text-end font-sans text-[0.76rem] text-stone-deep md:block">
            <p>{t('Issue 04')}</p>
            <p>{t('Autumn 2026')}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg font-sans text-[0.9rem] text-stone-deep">{t('Essays on architecture, interiors and materials — and the ordinary rituals rooms are made for.')}</p>
          <nav aria-label={t('Journal categories')} className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
            <button className="chip h-8 shrink-0 px-3 text-[0.74rem]" aria-pressed={!cat} onClick={() => setParams({}, { replace: true })}>{t('All')}</button>
            {journalCategories.map((c) => {
              const n = articles.filter((a) => a.category === c).length;
              return (
                <button key={c} disabled={n === 0} className="chip h-8 shrink-0 px-3 text-[0.74rem] disabled:opacity-35" aria-pressed={cat === c} onClick={() => setParams({ category: c }, { replace: true })}>
                  {t(c)} <span className="t-num text-stone">{n}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {lead && (
        <section className="page-x mx-auto max-w-page pt-10" aria-label={t('Lead story')}>
          <TLink to={`/journal/${lead.slug}`} className="group relative block">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:aspect-[21/10]">
              <Photo id={lead.cover} priority sizes="100vw" className="zoom-on-hover absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(26,26,24,0.68)_0%,rgba(26,26,24,0)_55%)]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 grid-12 gap-y-4 p-6 text-ivory md:p-10">
              <div className="col-span-12 lg:col-span-8">
                <Byline a={lead} light />
                <h2 className="t-display mt-4 text-d-l"><Emph text={t(lead.display)} /></h2>
              </div>
              <p className="col-span-12 self-end font-sans text-[0.92rem] leading-relaxed text-ivory/80 lg:col-span-3 lg:col-start-10">{t(lead.standfirst)}</p>
            </div>
          </TLink>
        </section>
      )}

      <section className="page-x mx-auto max-w-page py-section" aria-label={t('Stories')}>
        {rest.length === 0 && lead && <p className="t-meta">{t('That is the only story in {cat} so far.', { cat: cat ? t(cat) : '' })}</p>}
        <div className="grid-12 gap-y-16">
          {rest.map((a, i) => {
            const l = layouts[i % layouts.length];
            return (
              <article key={a.slug} className={`col-span-12 ${l.col} ${l.mt}`}>
                <TLink to={`/journal/${a.slug}`} className="group block">
                  <div className={`relative overflow-hidden ${l.aspect}`}><Photo id={a.cover} sizes="(min-width: 768px) 50vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" /></div>
                  <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-5">
                    <span className="t-figure pt-1">{String(i + 2).padStart(2, '0')}</span>
                    <div>
                      <Byline a={a} />
                      <h2 className="mt-3 font-serif text-[clamp(1.7rem,2.4vw,2.6rem)] leading-[1.04] transition-colors group-hover:text-olive-deep"><Emph text={t(a.display)} /></h2>
                      <p className="mt-3 max-w-md font-sans text-[0.88rem] leading-relaxed text-stone-deep">{t(a.standfirst)}</p>
                    </div>
                  </div>
                </TLink>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
