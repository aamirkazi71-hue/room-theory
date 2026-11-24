import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TLink } from '@/components/animations/PageTransition';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { useUi } from '@/store/ui';
import { navLinks } from './Nav';
import { t } from '@/i18n';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

export function MobileMenu() {
  const { menuOpen, setMenu, setSaved } = useUi();
  const panel = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => { setMenu(false); }, [pathname, setMenu]);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    if (prefersReducedMotion()) { el.style.visibility = menuOpen ? 'visible' : 'hidden'; return; }
    if (menuOpen) {
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(el.querySelectorAll('[data-item]'), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.3 });
    } else {
      gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => { gsap.set(el, { visibility: 'hidden' }); } });
    }
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMenu]);

  return (
    <div id="mobile-menu" ref={panel} className="fixed inset-0 z-40 flex flex-col bg-ivory pt-[var(--nav-h)] lg:hidden" style={{ visibility: 'hidden' }} aria-hidden={!menuOpen}>
      <nav className="page-x flex flex-1 flex-col justify-center" aria-label={t('Mobile')}>
        <ol>
          {navLinks.map((l, i) => (
            <li key={l.to} className="overflow-hidden border-b hairline">
              <TLink to={l.to} data-item className="flex items-baseline justify-between py-4" tabIndex={menuOpen ? 0 : -1}>
                <span className="t-display text-[clamp(2.6rem,11vw,4rem)] leading-none">{t(l.label)}</span>
                <span className="t-figure">0{i + 1}</span>
              </TLink>
            </li>
          ))}
        </ol>
        <div className="mt-10 overflow-hidden">
          <div data-item className="flex flex-wrap gap-3">
            <TLink to="/studio" className="btn btn-primary" tabIndex={menuOpen ? 0 : -1}><span>{t('Start designing')}</span></TLink>
            <button className="btn btn-ghost" onClick={() => setSaved(true)} tabIndex={menuOpen ? 0 : -1}><span>{t('Saved designs')}</span></button>
          </div>
        </div>
      </nav>
      <div className="page-x flex items-center justify-between pb-6"><p className="t-meta">{t('Design your space. Define your atmosphere.')}</p><LanguageSwitch className="-me-2" /></div>
    </div>
  );
}
