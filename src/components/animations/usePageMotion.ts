import { useLayoutEffect, type RefObject } from 'react';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

/**
 * Declarative scroll motion for a page. Mark elements with:
 *   data-reveal="fade" | "image" | "words" | "line" | "stagger"
 *   data-delay="0.1"            (seconds)
 *   data-parallax="0.12"        (fraction of element height, scrubbed)
 * Everything runs inside a gsap.context scoped to `root` and is reverted on
 * unmount. With reduced motion, nothing is hidden or moved.
 */
export function usePageMotion(root: RefObject<HTMLElement>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const delay = (n: Element) => parseFloat((n as HTMLElement).dataset.delay ?? '0');
      const trigger = (n: Element, start = 'top 88%') => ({ trigger: n, start, once: true });

      q('[data-reveal="fade"]').forEach((n) => {
        gsap.from(n, { y: 28, opacity: 0, duration: 1.2, ease: 'expo.out', delay: delay(n), scrollTrigger: trigger(n) });
      });

      q('[data-reveal="stagger"]').forEach((n) => {
        gsap.from(n.children, { y: 24, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: delay(n), scrollTrigger: trigger(n) });
      });

      q('[data-reveal="image"]').forEach((n) => {
        const img = n.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: trigger(n, 'top 92%'), delay: delay(n) });
        tl.fromTo(n, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
        if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.15);
      });

      q('[data-reveal="words"]').forEach((n) => {
        gsap.from(n.querySelectorAll('.split-inner'), { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.055, delay: delay(n), scrollTrigger: trigger(n, 'top 90%') });
      });

      q('[data-reveal="line"]').forEach((n) => {
        gsap.from(n, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'expo.inOut', delay: delay(n), scrollTrigger: trigger(n, 'top 95%') });
      });

      q('[data-parallax]').forEach((n) => {
        const speed = parseFloat((n as HTMLElement).dataset.parallax ?? '0.1');
        gsap.fromTo(n, { yPercent: -speed * 100 }, { yPercent: speed * 100, ease: 'none', scrollTrigger: { trigger: n.parentElement ?? n, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, el);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
