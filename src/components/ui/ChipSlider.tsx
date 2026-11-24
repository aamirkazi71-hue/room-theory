import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@/i18n';

/**
 * Horizontal slider for a row of chips: arrow buttons appear only when there
 * is more to see in that direction, edges fade, and the row can be dragged,
 * swiped or scrolled with a mouse wheel. The active chip is kept in view.
 */
export function ChipSlider({ children, label, className = '', tone = 'ivory', activeKey }: {
  children: ReactNode;
  label: string;
  className?: string;
  /** Background the fades blend into */
  tone?: 'ivory' | 'ivory-95';
  /** Changes when the selection changes, to scroll the pressed chip into view */
  activeKey?: string | null;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    // Physical edges: in right-to-left layouts browsers report scrollLeft from 0 down to -max.
    const max = el.scrollWidth - el.clientWidth;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const fromStart = Math.abs(el.scrollLeft);
    setEdges(rtl ? { start: fromStart < max - 2, end: fromStart > 2 } : { start: el.scrollLeft > 2, end: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Vertical wheel moves the row sideways (non-passive so the page doesn't scroll).
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      // Wheel down moves towards the end of the row in either reading direction.
      const before = el.scrollLeft;
      el.scrollLeft += (getComputedStyle(el).direction === 'rtl' ? -1 : 1) * e.deltaY;
      if (el.scrollLeft !== before) e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener('wheel', onWheel); };
  }, [update]);

  useEffect(() => {
    const el = track.current;
    const active = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !active) return;
    const box = el.getBoundingClientRect();
    const chip = active.getBoundingClientRect();
    if (chip.left < box.left + 32) el.scrollBy({ left: chip.left - box.left - 32, behavior: 'smooth' });
    else if (chip.right > box.right - 32) el.scrollBy({ left: chip.right - box.right + 32, behavior: 'smooth' });
  }, [activeKey]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  const fade = tone === 'ivory' ? 'from-ivory' : 'from-ivory/95';
  const arrow = 'absolute top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center bg-ink text-ivory shadow-[0_4px_14px_rgba(37,37,34,0.18)] transition-opacity duration-300';

  return (
    <div className={`relative min-w-0 ${className}`} role="group" aria-label={label}>
      <div
        ref={track}
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || e.button !== 0) return;
          drag.current = { x: e.clientX, left: track.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 5) d.moved = true;
          if (d.moved) track.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => { setTimeout(() => { drag.current = null; }, 0); }}
        onPointerLeave={() => { if (drag.current && !drag.current.moved) drag.current = null; }}
        // A drag should not also count as a click on the chip under the pointer.
        onClickCapture={(e) => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); } drag.current = null; }}
        className="no-scrollbar flex select-none gap-1.5 overflow-x-auto scroll-smooth"
      >
        {children}
      </div>
      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r ${fade} to-transparent transition-opacity duration-300 ${edges.start ? 'opacity-100' : 'opacity-0'}`} />
      <span aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l ${fade} to-transparent transition-opacity duration-300 ${edges.end ? 'opacity-100' : 'opacity-0'}`} />
      <button type="button" aria-label={t('Scroll categories left')} tabIndex={-1} onClick={() => page(-1)} className={`${arrow} left-0 ${edges.start ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <ChevronLeft size={15} strokeWidth={1.6} />
      </button>
      <button type="button" aria-label={t('Scroll categories right')} tabIndex={-1} onClick={() => page(1)} className={`${arrow} right-0 ${edges.end ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <ChevronRight size={15} strokeWidth={1.6} />
      </button>
    </div>
  );
}
