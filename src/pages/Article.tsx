import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Link2 } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { Emph, SplitWords } from '@/components/typography/SplitWords';
import { Photo } from '@/components/ui/Photo';
import { useSeo } from '@/hooks/useSeo';
import { photos, photoUrl } from '@/data/assets';
import { articles, formatDate, getArticle, type Block } from '@/data/journal';
import NotFound from './NotFound';
import { t, tOptional } from '@/i18n';

function BlockView({ b, first }: { b: Block; first: boolean }) {
  switch (b.type) {
    case 'h':
      return <h2 className="mt-14 font-serif text-[clamp(1.7rem,2.3vw,2.2rem)] leading-tight" data-reveal="fade">{t(b.text)}</h2>;
    case 'quote':
      return (
        <figure className="my-14 border-s border-ink ps-6 lg:-ms-24 lg:ps-10" data-reveal="fade">
          <blockquote className="font-serif text-[clamp(1.8rem,2.8vw,2.8rem)] italic leading-[1.12]">{t('“{q}”', { q: t(b.text) })}</blockquote>
          {b.cite && <figcaption className="mt-4 t-meta">— {b.cite}</figcaption>}
        </figure>
      );
    case 'image':
      return (
        <figure className={`my-14 ${b.wide ? 'lg:-mx-40' : ''}`}>
          <div className="relative aspect-[3/2] overflow-hidden" data-reveal="image"><Photo id={b.photo} sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 h-full w-full" /></div>
          <figcaption className="mt-3 flex gap-3 font-sans text-[0.76rem] text-stone-deep"><span className="t-num text-ink">{t('Fig.')}</span>{t(b.caption)}</figcaption>
        </figure>
      );
    case 'list':
      return (
        <ol className="my-8 space-y-4">
          {b.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[2.2rem_1fr] border-t hairline pt-4 font-sans text-[1.02rem] leading-relaxed">
              <span className="t-figure pt-1">0{i + 1}</span>{t(item)}
            </li>
          ))}
        </ol>
      );
    default:
      return <p className={`mt-6 font-sans text-[1.06rem] leading-[1.78] text-ink/90 ${first ? 'dropcap' : ''}`}>{t(b.text)}</p>;
  }
}

export default function Article() {
  const { slug = '' } = useParams();
  const a = getArticle(slug);
  const root = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  useSeo({ title: a ? t(a.title) : t('Story not found'), description: a ? t(a.standfirst) : undefined, image: a ? photoUrl(photos[a.cover], 1200) : undefined, type: 'article' });
  usePageMotion(root, [slug]);
  if (!a) return <NotFound />;
  const idx = articles.findIndex((x) => x.slug === a.slug);
  const next = articles[(idx + 1) % articles.length];
  const firstP = a.body.findIndex((b) => b.type === 'p');

  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { /* clipboard unavailable */ }
  };

  return (
    <article ref={root}>
      <header className="relative h-[94svh] min-h-[620px] overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0" data-reveal="image">
          <Photo id={a.cover} priority sizes="100vw" className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,24,0.5)_0%,rgba(26,26,24,0)_28%,rgba(26,26,24,0.15)_50%,rgba(26,26,24,0.78)_100%)]" />
        </div>
        <div className="page-x relative mx-auto flex h-full max-w-page flex-col justify-end pb-12">
          <p className="flex flex-wrap items-center gap-x-3 font-sans text-[0.78rem] text-ivory/80" data-reveal="fade">
            <TLink to={`/journal?category=${encodeURIComponent(a.category)}`} className="u-link text-ivory">{t(a.category)}</TLink>
            <span className="h-px w-5 bg-ivory/40" />
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            <span>· {t('{n} min read', { n: a.readingTime })}</span>
          </p>
          <SplitWords as="h1" text={t(a.display)} className="t-display mt-6 block max-w-5xl text-d-l" />
        </div>
      </header>

      <div className="page-x mx-auto max-w-page py-section">
        <div className="grid-12 gap-y-10">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="t-figure">{t('Words')}</p>
              <p className="mt-2 font-serif text-[1.35rem]">{tOptional(a.author)}</p>
              <button onClick={copy} className="mt-6 flex items-center gap-2 font-sans text-[0.78rem] text-stone-deep hover:text-ink">
                <Link2 size={14} strokeWidth={1.4} /> {copied ? t('Link copied') : t('Copy link')}
              </button>
              <TLink to="/journal" className="u-link mt-3 inline-block font-sans text-[0.78rem] text-stone-deep">{t('← All stories')}</TLink>
            </div>
          </aside>
          <div className="col-span-12 max-w-[40rem] lg:col-span-6 lg:col-start-5">
            <p className="font-serif text-[clamp(1.5rem,2vw,1.95rem)] leading-[1.3]" data-reveal="fade"><Emph text={t(a.standfirst)} /></p>
            <div className="mt-10 border-t hairline pt-4">
              {a.body.map((b, i) => <BlockView key={i} b={b} first={i === firstP} />)}
            </div>
          </div>
        </div>
      </div>

      <TLink to={`/journal/${next.slug}`} className="group block bg-ivory-2">
        <div className="page-x mx-auto grid max-w-page grid-cols-12 items-center gap-[var(--gutter)] py-16 lg:py-24">
          <div className="col-span-12 md:col-span-7">
            <p className="t-figure">{t('Next story')}</p>
            <p className="t-display mt-4 text-d-m transition-colors group-hover:text-olive-deep"><Emph text={t(next.display)} /></p>
            <span className="mt-6 inline-flex items-center gap-2 font-sans text-[0.82rem]">{t('Read')} <ArrowRight size={14} strokeWidth={1.4} className="transition-transform group-hover:translate-x-1" /></span>
          </div>
          <div className="relative col-span-12 aspect-[4/3] overflow-hidden md:col-span-4 md:col-start-9">
            <Photo id={next.cover} sizes="(min-width: 768px) 33vw, 100vw" className="zoom-on-hover absolute inset-0 h-full w-full" />
          </div>
        </div>
      </TLink>
    </article>
  );
}
