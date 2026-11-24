/**
 * Page transitions: a warm curtain rises over the page, the route changes
 * underneath, and the curtain lifts away. Links opt in via <TLink>.
 */
import { createContext, forwardRef, useCallback, useContext, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router-dom';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

type Go = (to: string, opts?: { replace?: boolean }) => void;
const TransitionContext = createContext<Go>(() => {});
export const useTransitionNavigate = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  const go: Go = useCallback(
    (to, opts) => {
      const current = location.pathname + location.search;
      if (to === current || busy.current) return;
      const samePath = to.split(/[?#]/)[0] === location.pathname;
      if (prefersReducedMotion() || !curtain.current || samePath) {
        navigate(to, opts);
        if (!samePath) window.scrollTo(0, 0);
        return;
      }
      busy.current = true;
      const el = curtain.current;
      const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });
      tl.set(el, { yPercent: 100, display: 'block' })
        .to(el, { yPercent: 0, duration: 0.6 })
        .fromTo(label.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.25')
        .add(() => {
          navigate(to, opts);
          window.scrollTo(0, 0);
        })
        .to(label.current, { opacity: 0, duration: 0.2 }, '+=0.12')
        .to(el, { yPercent: -100, duration: 0.7 })
        .add(() => {
          gsap.set(el, { display: 'none' });
          busy.current = false;
          ScrollTrigger.refresh();
        });
    },
    [location.pathname, location.search, navigate],
  );

  return (
    <TransitionContext.Provider value={go}>
      {children}
      <div ref={curtain} className="curtain grid place-items-center" style={{ display: 'none' }} aria-hidden>
        <span ref={label} className="flex items-center gap-3 font-sans text-micro uppercase text-ink/70">
          <span className="inline-block h-2 w-2 border border-ink/60" /> Room Theory
        </span>
      </div>
    </TransitionContext.Provider>
  );
}

type TLinkProps = Omit<LinkProps, 'to'> & { to: string };

/** Router link that plays the page transition. Modifier-clicks behave natively. */
export const TLink = forwardRef<HTMLAnchorElement, TLinkProps>(function TLink({ to, onClick, ...rest }, ref) {
  const go = useTransitionNavigate();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (rest.target && rest.target !== '_self') return;
    e.preventDefault();
    go(to);
  };
  return <Link ref={ref} to={to} onClick={handle} {...rest} />;
});

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;
