import { TLink } from '@/components/animations/PageTransition';
import { useSeo } from '@/hooks/useSeo';
import { Emph } from '@/components/typography/SplitWords';
import { t } from '@/i18n';

export default function NotFound() {
  useSeo({ title: t('Page not found') });
  return (
    <section className="page-x mx-auto flex min-h-[90svh] max-w-page flex-col justify-end pb-24 pt-40">
      <p className="t-label text-stone-deep">{t('Error 404')}</p>
      <h1 className="t-display mt-6 max-w-4xl text-d-l"><Emph text={t('This room *doesn’t exist* — yet.')} /></h1>
      <p className="mt-8 max-w-measure text-lede text-stone-deep">{t('The page you were looking for has moved or was never built. Start somewhere better.')}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <TLink to="/" className="btn btn-primary"><span>{t('Return home')}</span></TLink>
        <TLink to="/studio" className="btn btn-ghost"><span>{t('Open the studio')}</span></TLink>
      </div>
    </section>
  );
}
