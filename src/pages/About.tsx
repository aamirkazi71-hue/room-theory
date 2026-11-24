import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { useSeo } from '@/hooks/useSeo';
import { site } from '@/data/site';
import { t } from '@/i18n';
import { Emph } from '@/components/typography/SplitWords';

const principles = [
  { title: 'The room comes first', body: 'We design furniture for the rooms it will live in — against walls, under windows, in the middle of things. Every piece is drawn in plan before it is drawn in elevation.' },
  { title: 'Materials that age well', body: 'Solid timber, natural stone, linen, wool and unlacquered metal. Things that can be repaired, re-oiled and re-covered, and look better for it.' },
  { title: 'See it before you choose it', body: 'A piece is only right in context. The studio lets you place it in your room, at your dimensions, in your light — before anything is made.' },
  { title: 'Fewer, better things', body: 'A small collection, carefully made, in a handful of finishes we stand behind. We would rather you bought one good chair than four adequate ones.' },
];

const process = [
  { n: '01', title: 'Start from a room', body: 'Choose one of our spaces or a template, then set its dimensions, floor and walls.' },
  { n: '02', title: 'Furnish and finish', body: 'Place pieces, try upholsteries and woods, and check the room from morning to night.' },
  { n: '03', title: 'Save, share, order', body: 'Keep your designs, export renders and a priced shopping list, and talk to the studio when you are ready.' },
];

export default function About() {
  const root = useRef<HTMLDivElement>(null);
  useSeo({ title: t('About'), description: t('Room Theory is an interior design studio and furniture maker working between Lisbon and Porto. We design rooms first, and the furniture to live in them.') });
  usePageMotion(root);
  return (
    <div ref={root}>
      <header className="page-x mx-auto max-w-page pb-section pt-40 lg:pt-52">
        <p className="t-figure" data-reveal="fade">{t('About the studio')}</p>
        <SplitWords as="h1" text={t('A studio for rooms,|*not things.*')} className="t-display mt-8 block text-d-xl" />
        <div className="grid-12 mt-16 gap-y-6">
          <p className="col-span-12 font-serif text-[clamp(1.5rem,2.1vw,2.1rem)] leading-[1.3] md:col-span-7 lg:col-span-6 lg:col-start-5" data-reveal="fade">
            {t('Room Theory began as an interior practice and became a furniture maker because the pieces we needed for our rooms did not exist. The studio is how we work: room first, then everything in it.')}
          </p>
        </div>
      </header>

      <section className="grid-12 gap-y-10 page-x mx-auto max-w-page" aria-label={t('The workshop')}>
        <div className="relative col-span-12 aspect-[4/5] overflow-hidden md:col-span-6 lg:col-span-5" data-reveal="image">
          <Photo id="maker" sizes="(min-width: 768px) 42vw, 100vw" className="absolute inset-0 h-full w-full" />
        </div>
        <div className="col-span-12 flex flex-col justify-end md:col-span-5 md:col-start-8">
          <p className="t-figure" data-reveal="fade">{t('Made in Portugal')}</p>
          <h2 className="t-display mt-5 text-d-m" data-reveal="fade"><Emph text={t('Fourteen people, *one workshop.*')} /></h2>
          <p className="mt-6 max-w-measure font-sans text-[0.95rem] leading-relaxed text-stone-deep" data-reveal="fade">
            {t('Our metalwork and joinery are made in a workshop in Porto by people who have done it for decades. Upholstery is cut and sewn a few streets away. Stone comes from quarries we have visited; linen from mills we know by name.')}
          </p>
          <div className="relative mt-12 aspect-[4/3] w-2/3 self-end overflow-hidden" data-reveal="image">
            <Photo id="rugDetail" sizes="30vw" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </section>

      <section className="page-x mx-auto max-w-page py-section" aria-labelledby="principles-title">
        <div className="grid-12 gap-y-10">
          <h2 id="principles-title" className="t-display col-span-12 text-d-l lg:col-span-4" data-reveal="fade"><Emph text={t('What we *believe*')} /></h2>
          <ol className="col-span-12 lg:col-span-7 lg:col-start-6">
            {principles.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t hairline py-8" data-reveal="fade">
                <span className="t-figure pt-2">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-[clamp(1.6rem,2.2vw,2.2rem)] leading-tight">{t(p.title)}</h3>
                  <p className="mt-3 max-w-xl font-sans text-[0.95rem] leading-relaxed text-stone-deep">{t(p.body)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink text-ivory on-dark" aria-labelledby="process-title">
        <div className="page-x mx-auto max-w-page py-section">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 id="process-title" className="t-display text-d-m" data-reveal="fade"><Emph text={t('How the studio *works*')} /></h2>
            <TLink to="/studio" className="btn btn-light arrow-shift self-start md:self-end"><span>{t('Open the studio')}</span><ArrowRight size={15} strokeWidth={1.5} /></TLink>
          </div>
          <ol className="mt-16 grid gap-10 md:grid-cols-3" data-reveal="stagger">
            {process.map((s) => (
              <li key={s.n} className="border-t hairline-dark pt-6">
                <span className="t-num font-sans text-[0.72rem] text-olive-soft">{s.n}</span>
                <h3 className="mt-4 font-serif text-[1.9rem] leading-none">{t(s.title)}</h3>
                <p className="mt-4 max-w-xs font-sans text-[0.9rem] leading-relaxed text-ivory/65">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="page-x mx-auto max-w-page py-section" aria-labelledby="contact-title">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-figure" data-reveal="fade">{t('Contact')}</p>
            <h2 id="contact-title" className="t-display mt-6 text-d-l" data-reveal="fade"><Emph text={t('Talk to *the studio.*')} /></h2>
          </div>
          <div className="col-span-12 self-end md:col-span-6 lg:col-span-4 lg:col-start-9" data-reveal="fade">
            <p className="font-sans text-[0.95rem] leading-relaxed text-stone-deep">{t('For projects, trade enquiries or questions about a piece, write to us. Send a saved design or shopping list and we will reply with lead times and delivery.')}</p>
            <a href={`mailto:${site.email}`} className="u-link-static mt-6 inline-block font-serif text-[1.8rem]">{site.email}</a>
            <ul className="mt-6 space-y-1 font-sans text-[0.84rem] text-stone-deep">
              {site.locations.map((l) => <li key={l}>{t(l)}</li>)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
