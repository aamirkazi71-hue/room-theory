import { useParams } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { site } from '@/data/site';
import NotFound from './NotFound';
import { intlLocale, t } from '@/i18n';

const docs: Record<string, { title: string; updated: string; sections: { h: string; p: string }[] }> = {
  privacy: {
    title: 'Privacy',
    updated: '2026-10-01',
    sections: [
      { h: 'What we collect', p: 'The design studio stores your rooms, saved projects and preferences in your own browser (local storage). Nothing you design is sent to our servers unless you create an account in future and choose to sync.' },
      { h: 'Newsletter', p: 'If you subscribe to letters from the studio, we keep your email address only to send those letters. You can unsubscribe from any letter.' },
      { h: 'Photography and fonts', p: 'Images are served from an image CDN and typefaces from Google Fonts. These providers receive standard request information such as your IP address in order to deliver files.' },
      { h: 'Contact', p: `Questions about your data can be sent to ${site.email}.` },
    ],
  },
  terms: {
    title: 'Terms',
    updated: '2026-10-01',
    sections: [
      { h: 'Using the studio', p: 'The studio is provided to help you plan interiors. Dimensions and renders are representative; always confirm measurements on site before ordering.' },
      { h: 'Prices', p: 'Prices shown in the studio and collection are estimates in euros including the finishes selected. Delivery and installation are quoted separately.' },
      { h: 'Your designs', p: 'Rooms you create are yours. You may export and share renders and shopping lists freely.' },
    ],
  },
  cookies: {
    title: 'Cookies',
    updated: '2026-10-01',
    sections: [
      { h: 'No tracking cookies', p: 'Room Theory does not set advertising or analytics cookies.' },
      { h: 'Local storage', p: 'We use your browser’s local and session storage to remember your current room, saved projects and product renders. Clearing site data removes them.' },
    ],
  },
};

export default function Legal() {
  const { doc = '' } = useParams();
  const d = docs[doc];
  useSeo({ title: d ? t(d.title) : t('Page not found'), description: d ? t('{title} at Room Theory.', { title: t(d.title) }) : undefined });
  if (!d) return <NotFound />;
  return (
    <article className="page-x mx-auto max-w-page pb-section pt-40">
      <div className="grid-12">
        <header className="col-span-12 lg:col-span-4">
          <p className="t-label text-stone-deep">{t('Legal')}</p>
          <h1 className="t-display mt-4 text-d-m">{t(d.title)}</h1>
          <p className="mt-4 t-meta">{t('Updated {date}', { date: new Date(d.updated).toLocaleDateString(intlLocale(), { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
        </header>
        <div className="col-span-12 mt-12 max-w-measure-wide lg:col-span-6 lg:col-start-6 lg:mt-0">
          {d.sections.map((s) => (
            <section key={s.h} className="border-t hairline py-7">
              <h2 className="font-serif text-title">{t(s.h)}</h2>
              <p className="mt-3 text-body text-stone-deep">{t(s.p)}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
