import { useEffect, useState, type RefObject } from 'react';

/** True once the element comes within `margin` of the viewport (stays true). */
export function useNearView(ref: RefObject<Element>, margin = '400px') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

/** Live visibility (toggles), for pausing work offscreen. */
export function useVisible(ref: RefObject<Element>, margin = '0px') {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return visible;
}
