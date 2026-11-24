/**
 * Room Theory wordmark: a tracked sans "ROOM", a plan-drawing glyph (a room
 * in plan with its door swing), and an italic serif "Theory".
 */
export function PlanGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2.5 2.5h15v15h-8" />
      <path d="M2.5 2.5v15h3" />
      <path d="M5.5 17.5a4 4 0 0 1 4-4" strokeWidth="0.8" />
      <path d="M9.5 13.5v4" strokeWidth="0.8" />
    </svg>
  );
}

export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span dir="ltr" className={`inline-flex items-center gap-[0.55em] leading-none ${className}`}>
      <span className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.34em]">Room</span>
      <PlanGlyph className="h-[1.05em] w-[1.05em] -translate-y-[0.02em] text-[0.95rem] opacity-80" />
      {!compact && <span className="font-serif text-[1.42rem] italic tracking-[-0.01em]">Theory</span>}
    </span>
  );
}
