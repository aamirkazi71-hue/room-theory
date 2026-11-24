import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useTransitionNavigate } from '@/components/animations/PageTransition';
import { products, formatPrice } from '@/data/furniture';
import { spaces, roomTypeLabels } from '@/data/spaces';
import { articles } from '@/data/journal';
import { useUi } from '@/store/ui';
import { t } from '@/i18n';

interface Result { group: string; title: string; meta: string; to: string }

// Built per render language so Arabic queries match Arabic copy too.
const buildIndex = (): (Result & { hay: string })[] => [
  ...products.map((p) => ({ group: t('Furniture'), title: p.name, meta: `${t(p.tagline)} · ${formatPrice(p.price)}`, to: `/collection/${p.id}`, hay: `${p.name} ${p.tagline} ${t(p.tagline)} ${p.category} ${p.description} ${t(p.description)} ${p.slots.flatMap((s) => s.options).join(' ')}`.toLowerCase().replace(/-/g, ' ') })),
  ...spaces.map((s) => ({ group: t('Spaces'), title: s.name, meta: `${t(s.style)} · ${t(roomTypeLabels[s.type])}`, to: `/spaces/${s.slug}`, hay: `${s.name} ${s.style} ${t(s.style)} ${roomTypeLabels[s.type]} ${t(roomTypeLabels[s.type])} ${s.lede} ${t(s.lede)} ${t(s.description)}`.toLowerCase() })),
  ...articles.map((a) => ({ group: t('Journal'), title: t(a.title), meta: `${t(a.category)} · ${t('{n} min read', { n: a.readingTime })}`, to: `/journal/${a.slug}`, hay: `${a.title} ${t(a.title)} ${a.category} ${t(a.category)} ${a.standfirst} ${t(a.standfirst)}`.toLowerCase() })),
];

const suggestions = ['Travertine', 'Bouclé', 'Bedroom', 'Lighting', 'Japandi', 'Walnut'];
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export function SearchOverlay() {
  const { searchOpen, setSearch } = useUi();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const go = useTransitionNavigate();
  const index = useMemo(buildIndex, []);

  useEffect(() => {
    if (searchOpen) { setQ(''); window.setTimeout(() => input.current?.focus(), 50); }
    document.documentElement.style.overflow = searchOpen ? 'hidden' : '';
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearch(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearch]);

  const results = useMemo(() => {
    const t = fold(q.trim().toLowerCase());
    if (t.length < 2) return [];
    const terms = t.split(/\s+/);
    return index.filter((r) => terms.every((term) => fold(r.hay).includes(term))).slice(0, 12);
  }, [q, index]);

  if (!searchOpen) return null;
  const open = (to: string) => { setSearch(false); go(to); };
  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => { (acc[r.group] ??= []).push(r); return acc; }, {});

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory/[0.985] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t('Search')}>
      <div className="page-x mx-auto max-w-page pt-5">
        <div className="flex justify-end">
          <button onClick={() => setSearch(false)} className="flex h-10 items-center gap-2 font-sans text-[0.78rem]" aria-label={t('Close search')}>
            {t('Close')} <X size={16} strokeWidth={1.4} />
          </button>
        </div>
        <div className="mx-auto mt-[8vh] max-w-4xl">
          <label htmlFor="site-search" className="t-label text-stone-deep">{t('Search Room Theory')}</label>
          <input
            id="site-search"
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) open(results[0].to); }}
            placeholder={t('Furniture, spaces, materials')}
            className="mt-4 w-full border-b border-ink/30 bg-transparent pb-4 font-serif text-[clamp(2rem,5vw,3.6rem)] leading-none outline-none placeholder:text-stone/60 focus:border-ink"
            autoComplete="off"
          />
          {q.trim().length < 2 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="t-meta me-2">{t('Try')}</span>
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => setQ(t(s))}>{t(s)}</button>
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="mt-10 t-meta">{t('Nothing matches “{q}”. Try a material, a room or a style.', { q })}</p>
          ) : (
            <div className="mt-10 grid gap-10 pb-20 md:grid-cols-3">
              {Object.entries(grouped).map(([group, rs]) => (
                <section key={group}>
                  <h2 className="t-label border-b hairline pb-3 text-stone-deep">{group}</h2>
                  <ul>
                    {rs.map((r) => (
                      <li key={r.to}>
                        <button onClick={() => open(r.to)} className="group flex w-full items-start justify-between gap-4 border-b hairline py-4 text-left">
                          <span>
                            <span className="block font-serif text-[1.45rem] leading-tight">{r.title}</span>
                            <span className="t-meta">{r.meta}</span>
                          </span>
                          <ArrowUpRight size={16} strokeWidth={1.3} className="mt-2 shrink-0 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
