import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { collectionCategories } from '@/data/furniture';
import { site } from '@/data/site';
import { PlanGlyph } from '@/components/navigation/Logo';
import { t } from '@/i18n';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

const NEWSLETTER_KEY = 'rt.newsletter';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'error' | 'done'>(() => {
    try { return localStorage.getItem(NEWSLETTER_KEY) ? 'done' : 'idle'; } catch { return 'idle'; }
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setState('error'); return; }
    // No mailing provider is connected yet; the address is kept locally so the
    // form is honest about its state. Wire to the provider's API here.
    try { localStorage.setItem(NEWSLETTER_KEY, email.trim()); } catch { /* ignore */ }
    setState('done');
  };
  if (state === 'done') {
    return (
      <div>
        <p className="font-serif text-[1.6rem] leading-tight">{t('Thank you.')}</p>
        <p className="mt-2 t-meta">{t('You are on the list for the next letter from the studio.')}</p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="nl-email" className="font-serif text-[1.6rem] leading-tight">{t('Letters from the studio')}</label>
      <p className="mt-2 max-w-sm t-meta">{t('New spaces, materials and pieces, four times a year. Nothing else.')}</p>
      <div className="mt-6 flex items-end gap-3">
        <input
          id="nl-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
          placeholder={t('Email address')}
          className="field"
          aria-invalid={state === 'error'}
          aria-describedby={state === 'error' ? 'nl-error' : undefined}
          autoComplete="email"
        />
        <button type="submit" className="arrow-shift grid h-11 w-11 shrink-0 place-items-center bg-ink text-ivory transition-colors hover:bg-olive-deep" aria-label={t('Subscribe')}>
          <ArrowRight size={16} strokeWidth={1.4} />
        </button>
      </div>
      {state === 'error' && <p id="nl-error" className="mt-2 font-sans text-[0.78rem] text-[#8a3d2a]">{t('Please enter a valid email address.')}</p>}
    </form>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ivory-2 text-ink" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">Room Theory</h2>
      <div className="page-x mx-auto max-w-page pt-24 lg:pt-32">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Newsletter />
          </div>
          <nav className="col-span-6 sm:col-span-4 lg:col-span-2 lg:col-start-7" aria-label={t('Explore')}>
            <p className="t-label text-stone-deep">{t('Explore')}</p>
            <ul className="mt-5 space-y-2.5 font-sans text-[0.9rem]">
              <li><TLink className="u-link" to="/spaces">{t('Spaces')}</TLink></li>
              <li><TLink className="u-link" to="/studio">{t('Design studio')}</TLink></li>
              <li><TLink className="u-link" to="/collection">{t('Collections')}</TLink></li>
              <li><TLink className="u-link" to="/journal">{t('Journal')}</TLink></li>
              <li><TLink className="u-link" to="/about">{t('About')}</TLink></li>
            </ul>
          </nav>
          <nav className="col-span-6 sm:col-span-4 lg:col-span-2" aria-label={t('Furniture')}>
            <p className="t-label text-stone-deep">{t('Furniture')}</p>
            <ul className="mt-5 space-y-2.5 font-sans text-[0.9rem]">
              {collectionCategories.map((c) => (
                <li key={c.id}><TLink className="u-link" to={`/collection?category=${c.id}`}>{t(c.label)}</TLink></li>
              ))}
            </ul>
          </nav>
          <div className="col-span-12 sm:col-span-4 lg:col-span-2">
            <p className="t-label text-stone-deep">{t('Contact')}</p>
            <ul className="mt-5 space-y-2.5 font-sans text-[0.9rem]">
              <li><a className="u-link" href={`mailto:${site.email}`}>{site.email}</a></li>
              {site.locations.map((l) => <li key={l} className="text-stone-deep">{t(l)}</li>)}
            </ul>
            <ul className="mt-6 flex gap-5 font-sans text-[0.82rem]">
              {site.social.map((s) => (
                <li key={s.label}><a className="u-link" href={s.href} target="_blank" rel="noreferrer noopener">{t(s.label)}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-24 flex items-end justify-between gap-6 border-b hairline pb-6 lg:mt-32" aria-hidden>
          <span className="t-display block text-[clamp(4rem,15.5vw,16rem)] leading-[0.78] tracking-[-0.035em]">
            Room <span className="italic">Theory</span>
          </span>
          <PlanGlyph className="mb-[1.2vw] hidden h-[6vw] w-[6vw] text-ink/70 md:block" />
        </div>

        <div className="flex flex-col gap-4 py-7 font-sans text-[0.76rem] text-stone-deep sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Room Theory. {t('Design your space. Define your atmosphere.')}</p>
          <ul className="flex gap-6">
            <li><TLink className="u-link" to="/legal/privacy">{t('Privacy')}</TLink></li>
            <li><TLink className="u-link" to="/legal/terms">{t('Terms')}</TLink></li>
            <li><TLink className="u-link" to="/legal/cookies">{t('Cookies')}</TLink></li>
            <li><LanguageSwitch className="-my-3 h-auto px-0 opacity-100" /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
