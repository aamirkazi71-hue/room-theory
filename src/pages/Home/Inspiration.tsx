import { TLink } from '@/components/animations/PageTransition';
import { Emph, SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { formatDate, getArticle, type Article } from '@/data/journal';
import { t } from '@/i18n';

const [lead, ...rest] = ['the-art-of-warm-minimalism', 'contemporary-organic-interiors', 'the-language-of-natural-materials', 'spaces-shaped-by-light'].map((s) => getArticle(s)!);

function Meta({ a }: { a: Article }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 font-sans text-[0.74rem] text-stone-deep">
      <span className="text-ink">{t(a.category)}</span>
      <span className="h-px w-4 bg-ink/30" />
      <time dateTime={a.date}>{formatDate(a.date)}</time>
      <span>· {t('{n} min', { n: a.readingTime })}</span>
    </p>
  );
}

export function Inspiration() {
  return (
    <section className="page-x mx-auto max-w-page py-section" aria-labelledby="journal-title">
      <header className="flex flex-col gap-6 border-b hairline pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="t-figure" data-reveal="fade">{t('05 / Journal')}</p>
          <SplitWords id="journal-title" as="h2" text={t('Notes on *living well.*')} className="t-display mt-6 block text-d-l" />
        </div>
        <TLink to="/journal" className="u-link-static self-start font-sans text-[0.82rem] md:self-end" data-reveal="fade">{t('Read the journal')}</TLink>
      </header>

      {/* Lead story */}
      <article className="grid-12 mt-14 gap-y-8 lg:mt-20">
        <TLink to={`/journal/${lead.slug}`} className="group col-span-12 lg:col-span-7" aria-label={t(lead.title)}>
          <div className="relative aspect-[16/11] overflow-hidden" data-reveal="image">
            <Photo id={lead.cover} sizes="(min-width: 1024px) 58vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" />
          </div>
        </TLink>
        <div className="col-span-12 flex flex-col justify-between lg:col-span-4 lg:col-start-9">
          <div data-reveal="fade">
            <span className="font-serif text-[5.5rem] leading-none text-ink/15" aria-hidden>01</span>
            <div className="mt-4"><Meta a={lead} /></div>
            <h3 className="t-display mt-5 text-d-s">
              <TLink to={`/journal/${lead.slug}`} className="hover:text-olive-deep"><Emph text={t(lead.display)} /></TLink>
            </h3>
            <p className="mt-5 font-sans text-[0.95rem] leading-relaxed text-stone-deep">{t(lead.standfirst)}</p>
          </div>
          <TLink to={`/journal/${lead.slug}`} className="u-link-static mt-8 self-start font-sans text-[0.82rem]" data-reveal="fade">{t('Read the story')}</TLink>
        </div>
      </article>

      {/* Secondary stories — a staggered column rhythm */}
      <div className="grid-12 mt-20 gap-y-14 lg:mt-28">
        {rest.map((a, i) => {
          const layout = [
            { col: 'col-span-12 sm:col-span-6 lg:col-span-4', aspect: 'aspect-[3/4]', mt: '' },
            { col: 'col-span-12 sm:col-span-6 lg:col-span-4 lg:mt-28', aspect: 'aspect-[4/3]', mt: '' },
            { col: 'col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-10 lg:mt-12', aspect: 'aspect-[4/5]', mt: '' },
          ][i];
          return (
            <article key={a.slug} className={layout.col}>
              <TLink to={`/journal/${a.slug}`} className="group block">
                <div className={`relative overflow-hidden ${layout.aspect}`} data-reveal="image">
                  <Photo id={a.cover} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" />
                </div>
                <div className="mt-5" data-reveal="fade">
                  <div className="flex items-baseline justify-between">
                    <Meta a={a} />
                    <span className="t-figure">0{i + 2}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-[clamp(1.5rem,1.9vw,2rem)] leading-[1.08] transition-colors group-hover:text-olive-deep"><Emph text={t(a.display)} /></h3>
                </div>
              </TLink>
            </article>
          );
        })}
      </div>
    </section>
  );
}
