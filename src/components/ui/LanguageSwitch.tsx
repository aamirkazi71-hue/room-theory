import { useLocale } from '@/i18n';

/** Toggles between English and Arabic. Each label is written in its own language. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const next = locale === 'ar' ? 'en' : 'ar';
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      lang={next}
      aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
      className={`flex h-10 items-center px-2 font-sans text-[0.8rem] opacity-80 transition-opacity hover:opacity-100 ${className}`}
    >
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
