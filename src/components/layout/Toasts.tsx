import { useUi } from '@/store/ui';

export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-[toast_0.5s_cubic-bezier(0.22,1,0.36,1)] bg-ink px-5 py-3 font-sans text-[0.8rem] text-ivory shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          {t.message}
        </div>
      ))}
    </div>
  );
}
