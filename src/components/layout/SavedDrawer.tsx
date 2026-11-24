import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTransitionNavigate } from '@/components/animations/PageTransition';
import { roomTemplates } from '@/data/spaces';
import { useProjects } from '@/store/projects';
import { useUi } from '@/store/ui';
import { intlLocale, t } from '@/i18n';

const when = (t: number) => new Date(t).toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' });

export function SavedDrawer() {
  const { savedOpen, setSaved } = useUi();
  const { projects, remove } = useProjects();
  const [confirm, setConfirm] = useState<string | null>(null);
  const go = useTransitionNavigate();

  useEffect(() => {
    if (!savedOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSaved(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [savedOpen, setSaved]);

  return (
    <div className={`fixed inset-0 z-[60] ${savedOpen ? '' : 'pointer-events-none'}`} aria-hidden={!savedOpen}>
      <div className={`absolute inset-0 bg-ink/30 transition-opacity duration-500 ${savedOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSaved(false)} />
      <aside
        className={`absolute inset-y-0 end-0 flex w-full max-w-[460px] flex-col bg-ivory transition-transform duration-700 ease-out ${savedOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('Saved designs')}
      >
        <header className="flex items-center justify-between border-b hairline px-7 py-5">
          <div>
            <p className="t-label text-stone-deep">{t('Your archive')}</p>
            <h2 className="mt-1 font-serif text-[1.9rem] leading-none">{t('Saved designs')}</h2>
          </div>
          <button onClick={() => setSaved(false)} className="grid h-10 w-10 place-items-center" aria-label={t('Close saved designs')} tabIndex={savedOpen ? 0 : -1}>
            <X size={18} strokeWidth={1.4} />
          </button>
        </header>
        <div className="thin-scroll flex-1 overflow-y-auto px-7 py-6">
          {projects.length === 0 ? (
            <div className="mt-10">
              <p className="font-serif text-[1.6rem] leading-tight">{t('Nothing saved yet.')}</p>
              <p className="mt-3 max-w-xs t-meta">{t('Rooms you save in the studio are kept here, on this device, until you are ready to come back to them.')}</p>
              <button className="btn btn-primary mt-8" onClick={() => { setSaved(false); go('/studio'); }} tabIndex={savedOpen ? 0 : -1}><span>{t('Open the studio')}</span></button>
            </div>
          ) : (
            <ul className="space-y-6">
              {projects.map((p) => (
                <li key={p.id} className="group grid grid-cols-[112px_1fr] gap-5">
                  <button
                    className="frame aspect-[4/3] bg-ivory-3"
                    onClick={() => { setSaved(false); go(`/studio?project=${p.id}`); }}
                    aria-label={t('Open {name}', { name: p.name })}
                    tabIndex={savedOpen ? 0 : -1}
                  >
                    {p.thumbnail && <img src={p.thumbnail} alt="" />}
                  </button>
                  <div className="flex flex-col justify-between border-b hairline pb-4">
                    <div>
                      <p className="font-serif text-[1.35rem] leading-tight">{p.name}</p>
                      <p className="t-meta">{t(roomTemplates[p.design.room.type].label)} · {t('{n} pieces', { n: p.design.items.length })} · {when(p.updatedAt)}</p>
                    </div>
                    <div className="mt-3 flex gap-5 font-sans text-[0.76rem]">
                      <button className="u-link-static" onClick={() => { setSaved(false); go(`/studio?project=${p.id}`); }} tabIndex={savedOpen ? 0 : -1}>{t('Open')}</button>
                      {confirm === p.id ? (
                        <>
                          <button className="text-[#8a3d2a]" onClick={() => { void remove(p.id); setConfirm(null); }} tabIndex={savedOpen ? 0 : -1}>{t('Confirm delete')}</button>
                          <button className="text-stone-deep" onClick={() => setConfirm(null)} tabIndex={savedOpen ? 0 : -1}>{t('Keep')}</button>
                        </>
                      ) : (
                        <button className="text-stone-deep hover:text-ink" onClick={() => setConfirm(p.id)} tabIndex={savedOpen ? 0 : -1}>{t('Delete')}</button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="border-t hairline px-7 py-4 t-meta">{t('Saved locally in this browser.')}</footer>
      </aside>
    </div>
  );
}
