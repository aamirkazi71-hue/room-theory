import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bookmark, Search } from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { useProjects } from '@/store/projects';
import { useUi } from '@/store/ui';
import { Logo } from './Logo';
import { t } from '@/i18n';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

export const navLinks = [
  { to: '/spaces', label: 'Spaces' },
  { to: '/collection', label: 'Collections' },
  { to: '/journal', label: 'Inspiration' },
  { to: '/about', label: 'About' },
];

/** Routes whose first screen is a dark full-bleed image. */
const overImage = (path: string) => path === '/' || /^\/spaces\/[^/]+$/.test(path) || /^\/journal\/[^/]+$/.test(path);

export function Nav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const saved = useProjects((s) => s.projects.length);
  const { setSearch, setSaved, setMenu, menuOpen } = useUi();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 24);
        if (y > 420 && y > lastY.current + 4) setHidden(true);
        else if (y < lastY.current - 4 || y < 420) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { setHidden(false); }, [pathname]);

  const light = overImage(pathname) && !scrolled && !menuOpen;
  const tone = light ? 'text-ivory' : 'text-ink';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-700 ease-out ${hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'} ${scrolled && !menuOpen ? 'bg-ivory/[0.92] shadow-[0_1px_0_rgba(37,37,34,0.08)] backdrop-blur-md' : 'bg-transparent'} ${tone}`}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">{t('Skip to content')}</a>
      <nav className="page-x mx-auto flex h-[var(--nav-h)] max-w-page items-center justify-between" aria-label="Primary">
        <TLink to="/" className="relative z-10 -m-2 p-2" aria-label="Room Theory — home">
          <Logo />
        </TLink>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.to || pathname.startsWith(l.to + '/');
            return (
              <li key={l.to}>
                <TLink to={l.to} className="u-link font-sans text-[0.8rem] tracking-[0.01em]" aria-current={active ? 'page' : undefined}>
                  {t(l.label)}
                </TLink>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitch className="hidden sm:flex" />
          <button onClick={() => setSearch(true)} className="grid h-10 w-10 place-items-center opacity-80 transition-opacity hover:opacity-100" aria-label={t('Search')}>
            <Search size={17} strokeWidth={1.4} />
          </button>
          <button onClick={() => setSaved(true)} className="relative grid h-10 w-10 place-items-center opacity-80 transition-opacity hover:opacity-100" aria-label={t('Saved designs ({n})', { n: saved })}>
            <Bookmark size={17} strokeWidth={1.4} />
            {saved > 0 && <span className="t-num absolute end-1 top-1.5 font-sans text-[0.6rem] font-medium">{saved}</span>}
          </button>
          <TLink to="/studio" className={`btn btn-sm ms-3 hidden md:inline-flex ${light ? 'btn-light' : 'btn-primary'}`}>
            <span>{t('Start designing')}</span>
          </TLink>
          <button
            onClick={() => setMenu(!menuOpen)}
            className="relative z-10 ms-1 flex h-10 items-center gap-3 ps-2 font-sans text-[0.78rem] lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span>{menuOpen ? t('Close') : t('Menu')}</span>
            <span className="relative block h-2.5 w-5">
              <span className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-500 ${menuOpen ? 'translate-y-[5px] rotate-45' : ''}`} />
              <span className={`absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-500 ${menuOpen ? '-translate-y-[4px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
