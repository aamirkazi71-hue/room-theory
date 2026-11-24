import { ArrowUpRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { areaOf, getSpace, spaceTitle, spaces, type Space } from '@/data/spaces';
import { Emph } from '@/components/typography/SplitWords';
import { t } from '@/i18n';

const featured = ['calder-living-room', 'linen-bedroom', 'plaster-dining-room', 'rua-studio-apartment'].map((s) => getSpace(s)!);

function SpaceFigure({ space, index, className, aspect, sizes, long }: { space: Space; index: number; className: string; aspect: string; sizes: string; long?: boolean }) {
  return (
    <article className={className}>
      <TLink to={`/spaces/${space.slug}`} className="group block" aria-label={`${spaceTitle(space.name, space.type)} — ${t(space.style)}`}>
        <div className={`relative overflow-hidden ${aspect}`} data-reveal="image">
          <Photo id={space.photo} sizes={sizes} className="zoom-on-hover absolute inset-0 h-full w-full" />
          <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center bg-ivory text-ink opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={16} strokeWidth={1.4} />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-5" data-reveal="fade">
          <span className="t-figure pt-2">0{index}</span>
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-serif text-[clamp(1.6rem,2.2vw,2.3rem)] leading-none">
                <Emph text={spaceTitle(space.name, space.type, true)} italicClass="italic text-stone-deep" />
              </h3>
              <span className="t-meta">{t(space.style)} · <span className="t-num">{areaOf(space)} {t('m²')}</span></span>
            </div>
            {long && <p className="mt-3 max-w-md font-sans text-[0.9rem] leading-relaxed text-stone-deep">{t(space.lede)}</p>}
            <span className="u-link mt-3 inline-block font-sans text-[0.8rem]">{t('Explore the space')}</span>
          </div>
        </div>
      </TLink>
    </article>
  );
}

export function FeaturedSpaces() {
  const [living, bedroom, dining, studio] = featured;
  return (
    <section className="page-x mx-auto max-w-page py-section" aria-labelledby="spaces-title">
      <header className="grid-12 items-end gap-y-6">
        <p className="t-figure col-span-12 lg:col-span-2" data-reveal="fade">{t('01 / Spaces')}</p>
        <SplitWords id="spaces-title" as="h2" text={t('Spaces, *reimagined.*')} className="t-display col-span-12 text-d-l lg:col-span-6" />
        <div className="col-span-12 md:col-span-6 lg:col-span-3 lg:col-start-10" data-reveal="fade">
          <p className="font-sans text-[0.95rem] leading-relaxed text-stone-deep">
            {t('Four rooms from the studio, each planned around one idea. Every one opens in the studio, ready to make your own.')}
          </p>
          <TLink to="/spaces" className="u-link-static mt-4 inline-block font-sans text-[0.82rem]">{t('All {n} spaces', { n: spaces.length })}</TLink>
        </div>
      </header>

      <div className="grid-12 mt-16 gap-y-16 lg:mt-24">
        <SpaceFigure space={living} index={1} long className="col-span-12 md:col-span-7" aspect="aspect-[4/5] md:aspect-[5/6]" sizes="(min-width: 768px) 58vw, 100vw" />
        <SpaceFigure space={bedroom} index={2} className="col-span-10 col-start-3 md:col-span-4 md:col-start-9 md:mt-48" aspect="aspect-[3/4]" sizes="(min-width: 768px) 33vw, 85vw" />
        <SpaceFigure space={dining} index={3} long className="col-span-12 md:col-span-5 md:col-start-2 md:-mt-24" aspect="aspect-square" sizes="(min-width: 768px) 42vw, 100vw" />
        <SpaceFigure space={studio} index={4} long className="col-span-12 md:col-span-6 md:col-start-7 md:mt-24" aspect="aspect-[16/11]" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    </section>
  );
}
