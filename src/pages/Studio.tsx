import { Suspense, useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Armchair, Box, ChevronDown, Download, Eye, FileSpreadsheet, Image as ImageIcon, LayoutGrid, Palette, Redo2, Save, Sun, Undo2, X, ReceiptText,
} from 'lucide-react';
import { TLink } from '@/components/animations/PageTransition';
import { Logo } from '@/components/navigation/Logo';
import { useSeo } from '@/hooks/useSeo';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getProduct } from '@/data/furniture';
import { buildDesign, getSpace, roomTemplates } from '@/data/spaces';
import { composeRender, downloadCsv, download, makeThumbnail, shoppingListCsv, slugify } from '@/lib/exporters';
import { useStudio } from '@/store/studio';
import { useProjects } from '@/store/projects';
import { useUi } from '@/store/ui';
import type { CameraPreset, DesignSnapshot, RoomType, StudioTool } from '@/store/types';
import { FurniturePanel, LayoutPanel, LightingPanel, MaterialsPanel, SpacesPanel, SummaryPanel } from '@/components/configurator/Panels/ToolPanels';
import { PropertiesPanel } from '@/components/configurator/Panels/PropertiesPanel';
import StudioScene, { captureStudio, screenToFloor } from '@/components/configurator/Scene/StudioScene';
import { lightingPresets } from '@/components/configurator/Scene/Lighting';
import { intlLocale, t } from '@/i18n';
import { roomTypeSingular, spaceTitle } from '@/data/spaces';


const tools: { id: StudioTool; label: string; icon: typeof Box }[] = [
  { id: 'spaces', label: 'Spaces', icon: Box },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'materials', label: 'Materials', icon: Palette },
  { id: 'lighting', label: 'Lighting', icon: Sun },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'summary', label: 'Summary', icon: ReceiptText },
];

const cameras: { id: CameraPreset; label: string }[] = [
  { id: 'perspective', label: 'Perspective' },
  { id: 'front', label: 'Front' },
  { id: 'top', label: 'Plan' },
];

type Pending = { design: DesignSnapshot; meta: { name: string; spaceSlug: string | null; projectId: string | null } };

function ConfirmReplace({ pending, onCancel, onConfirm, onSaveFirst }: { pending: Pending; onCancel: () => void; onConfirm: () => void; onSaveFirst: () => void }) {
  const name = useStudio((s) => s.projectName);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/40 p-5" role="dialog" aria-modal="true" aria-labelledby="replace-title">
      <div className="w-full max-w-md bg-ivory p-7">
        <p className="t-label text-stone-deep">{t('Unsaved changes')}</p>
        <h2 id="replace-title" className="mt-2 font-serif text-[1.9rem] leading-tight">{t('Replace “{name}”?', { name })}</h2>
        <p className="mt-3 font-sans text-[0.86rem] leading-relaxed text-stone-deep">{t('Opening {name} will replace the room you are working on. Save it first to keep a copy.', { name: pending.meta.name })}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={onSaveFirst} autoFocus><span>{t('Save, then open')}</span></button>
          <button className="btn btn-ghost" onClick={onConfirm}><span>{t('Replace')}</span></button>
          <button className="btn btn-sm h-12 px-3 text-stone-deep hover:text-ink" onClick={onCancel}><span>{t('Cancel')}</span></button>
        </div>
      </div>
    </div>
  );
}

function ProjectName() {
  const name = useStudio((s) => s.projectName);
  const rename = useStudio((s) => s.rename);
  const dirty = useStudio((s) => s.dirty);
  const projectId = useStudio((s) => s.projectId);
  // The default name is stored in English; show it in the reader's language.
  const shown = name === 'Untitled room' ? t('Untitled room') : name;
  const [draft, setDraft] = useState(shown);
  useEffect(() => setDraft(shown), [shown]);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== shown) rename(draft); }}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setDraft(shown); (e.target as HTMLInputElement).blur(); } }}
        aria-label={t('Project name')}
        className="min-w-0 max-w-[15rem] truncate bg-transparent font-serif text-[1.2rem] leading-none text-ivory outline-none placeholder:text-ivory/40 focus:border-b focus:border-ivory/40"
        size={Math.max(8, draft.length)}
      />
      <span className="hidden whitespace-nowrap font-sans text-[0.68rem] text-ivory/45 xl:inline">{dirty ? t('Unsaved changes') : projectId ? t('Saved') : t('Draft')}</span>
    </div>
  );
}

export default function Studio() {
  useSeo({ title: t('Design studio'), description: t('Furnish a real 3D room: place furniture, change materials and light, then save, export and shop the result.') });
  const isDesktop = useIsDesktop();
  const [params, setParams] = useSearchParams();
  const { tool, setTool, preview, setPreview, camera, setCamera, lighting } = useStudio();
  const canUndo = useStudio((s) => s.past.length > 0);
  const canRedo = useStudio((s) => s.future.length > 0);
  const selectedId = useStudio((s) => s.selectedId);
  const projectName = useStudio((s) => s.projectName);
  const toast = useUi((s) => s.toast);
  const saveProject = useProjects((s) => s.save);
  const getProject = useProjects((s) => s.get);
  const [panelOpen, setPanelOpen] = useState(true);
  const [sheet, setSheet] = useState<'tool' | 'props' | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [dropHint, setDropHint] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  /* ——— Loading from URL: ?space= ?room= ?project= ?place= ——— */
  const handledParams = useRef(false);
  useEffect(() => {
    // Run once per mount even under StrictMode double effects, or ?place would add twice.
    if (handledParams.current) return;
    handledParams.current = true;
    const st = useStudio.getState();
    const space = params.get('space');
    const room = params.get('room') as RoomType | null;
    const project = params.get('project');
    const place = params.get('place');
    let handled = false;
    const run = async () => {
      if (project) {
        const p = await getProject(project);
        if (p) { st.load(p.design, { name: p.name, projectId: p.id, spaceSlug: p.spaceSlug ?? null }); toast(t('Opened “{name}”', { name: p.name })); }
        handled = true;
      } else if (space && getSpace(space)) {
        const s = getSpace(space)!;
        st.load(buildDesign(s.type, s), { name: spaceTitle(s.name, s.type), spaceSlug: s.slug, projectId: null });
        handled = true;
      } else if (room && roomTemplates[room]) {
        st.load(buildDesign(room), { name: t('My {room}', { room: t(roomTypeSingular[room]) }), spaceSlug: null, projectId: null });
        handled = true;
      }
      if (place && getProduct(place)) {
        const mats = Object.fromEntries((params.get('m') ?? '').split(',').filter(Boolean).map((kv) => kv.split(':') as [string, string]));
        useStudio.getState().addItem(place, { materials: mats });
        useStudio.getState().setTool('furniture');
        toast(t('{name} placed in your room', { name: getProduct(place)!.name }));
        handled = true;
      }
      if (handled) setParams({}, { replace: true });
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ——— Save / export ——— */
  const save = useCallback(async () => {
    setBusy(true);
    try {
      const st = useStudio.getState();
      const shot = await captureStudio(1);
      const thumbnail = shot ? await makeThumbnail(shot) : undefined;
      const saved = await saveProject({ id: st.projectId, name: st.projectName, spaceSlug: st.spaceSlug ?? undefined, thumbnail, design: { room: st.room, items: st.items, lighting: st.lighting } });
      st.markSaved(saved.id);
      toast(t('Saved “{name}” to your designs', { name: saved.name }));
      return true;
    } catch {
      toast(t('Could not save — storage may be full'));
      return false;
    } finally {
      setBusy(false);
    }
  }, [saveProject, toast]);

  const exportImage = useCallback(async () => {
    setExportOpen(false);
    setBusy(true);
    try {
      const shot = await captureStudio(2);
      if (!shot) return;
      const st = useStudio.getState();
      const sub = `${t(roomTemplates[st.room.type].label)} · ${t(lightingPresets[st.lighting].label)} · ${new Date().toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' })}`;
      const framed = await composeRender(shot, st.projectName, sub);
      download(framed, `room-theory-${slugify(st.projectName)}.png`);
      toast(t('Render downloaded'));
    } finally {
      setBusy(false);
    }
  }, [toast]);

  const exportList = useCallback(() => {
    setExportOpen(false);
    const st = useStudio.getState();
    if (st.items.length === 0) { toast(t('Add furniture first')); return; }
    downloadCsv(shoppingListCsv(st.projectName, st), `room-theory-${slugify(st.projectName)}-shopping-list.csv`);
    toast(t('Shopping list downloaded'));
  }, [toast]);

  const requestLoad = useCallback((design: DesignSnapshot, meta: Pending['meta']) => {
    const st = useStudio.getState();
    if (st.dirty && st.items.length > 0) { setPending({ design, meta }); return; }
    st.load(design, meta);
    toast(t('Opened {name}', { name: meta.name }));
    if (!isDesktop) setSheet(null);
  }, [isDesktop, toast]);

  /* ——— Keyboard ——— */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return;
      const st = useStudio.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') { e.preventDefault(); if (e.shiftKey) st.redo(); else st.undo(); return; }
      if (mod && key === 'y') { e.preventDefault(); st.redo(); return; }
      if (mod && key === 's') { e.preventDefault(); void save(); return; }
      if (key === 'escape') { if (st.preview) st.setPreview(false); else st.select(null); return; }
      if (key === 'p' && !mod) { st.setPreview(!st.preview); return; }
      const id = st.selectedId;
      if (!id) return;
      const it = st.items.find((i) => i.uid === id);
      if (!it) return;
      if (key === 'delete' || key === 'backspace') { e.preventDefault(); st.removeItem(id); }
      else if (mod && key === 'd') { e.preventDefault(); st.duplicateItem(id); }
      else if (key === 'r') { st.rotateItem(id, (e.shiftKey ? 1 : -1) * (Math.PI / 4)); }
      else if (key.startsWith('arrow')) {
        e.preventDefault();
        const d = e.shiftKey ? 0.25 : 0.05;
        const dx = key === 'arrowleft' ? -d : key === 'arrowright' ? d : 0;
        const dz = key === 'arrowup' ? -d : key === 'arrowdown' ? d : 0;
        st.setItemPosition(id, it.x + dx, it.z + dz);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  /* Mobile: selecting a piece opens its properties sheet */
  useEffect(() => {
    if (!isDesktop && selectedId) setSheet('props');
    if (!isDesktop && !selectedId && sheet === 'props') setSheet(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, isDesktop]);

  /* Warn before leaving with unsaved work */
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => { if (useStudio.getState().dirty && useStudio.getState().items.length) { e.preventDefault(); } };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, []);

  /* Drag from library */
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDropHint(false);
    const id = e.dataTransfer.getData('text/rt-product');
    if (!id) return;
    const at = screenToFloor(e.clientX, e.clientY);
    useStudio.getState().addItem(id, at ?? undefined);
  };

  const toolPanel = (() => {
    switch (tool) {
      case 'spaces': return <SpacesPanel requestLoad={requestLoad} />;
      case 'materials': return <MaterialsPanel />;
      case 'lighting': return <LightingPanel />;
      case 'layout': return <LayoutPanel onReset={() => { useStudio.getState().reset(); toast(t('Room reset — undo to go back')); }} onClear={() => { useStudio.getState().clear(); toast(t('Furniture cleared — undo to go back')); }} />;
      case 'summary': return <SummaryPanel onExportList={exportList} />;
      default: return <FurniturePanel onAdded={() => { if (!isDesktop) setSheet(null); }} />;
    }
  })();

  const iconBtn = 'grid h-9 w-9 place-items-center text-ivory/75 transition-colors hover:bg-white/[0.07] hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-ink-deep text-ink">
      <h1 className="sr-only">{t('Room Theory design studio')}</h1>

      {/* ——— Toolbar ——— */}
      {!preview && (
        <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-ink-deep px-3 text-ivory lg:gap-4 lg:px-4">
          <TLink to="/" className="flex h-10 items-center px-2 text-ivory/90 hover:text-ivory" aria-label={t('Back to Room Theory')}>
            <Logo compact={!isDesktop} />
          </TLink>
          <span className="hidden h-5 w-px bg-white/10 lg:block" />
          <ProjectName />
          <div className="ms-auto flex items-center gap-1 lg:absolute lg:left-1/2 lg:ms-0 lg:-translate-x-1/2">
            <button className={iconBtn} onClick={() => useStudio.getState().undo()} disabled={!canUndo} aria-label={t('Undo')} title={t('Undo (Ctrl+Z)')}><Undo2 size={16} strokeWidth={1.5} /></button>
            <button className={iconBtn} onClick={() => useStudio.getState().redo()} disabled={!canRedo} aria-label={t('Redo')} title={t('Redo (Ctrl+Shift+Z)')}><Redo2 size={16} strokeWidth={1.5} /></button>
            <span className="mx-2 hidden h-5 w-px bg-white/10 md:block" />
            <div role="radiogroup" aria-label={t('Camera view')} className="hidden md:flex">
              {cameras.map((c) => (
                <button key={c.id} role="radio" aria-checked={camera === c.id} onClick={() => setCamera(c.id)} className={`h-8 px-3 font-sans text-[0.72rem] transition-colors ${camera === c.id ? 'bg-ivory text-ink' : 'text-ivory/65 hover:text-ivory'}`}>
                  {t(c.label)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 lg:ms-auto">
            <button className={`${iconBtn} hidden sm:grid`} onClick={() => setPreview(true)} aria-label={t('Preview')} title={t('Preview (P)')}><Eye size={16} strokeWidth={1.5} /></button>
            <button className="flex h-9 items-center gap-2 px-3 font-sans text-[0.74rem] text-ivory/85 transition-colors hover:bg-white/[0.07] hover:text-ivory disabled:opacity-40" onClick={() => void save()} disabled={busy} title={t('Save (Ctrl+S)')}>
              <Save size={15} strokeWidth={1.5} /><span className="hidden sm:inline">{t('Save')}</span>
            </button>
            <div className="relative">
              <button className="flex h-9 items-center gap-2 bg-ivory px-3 font-sans text-[0.74rem] text-ink transition-colors hover:bg-white disabled:opacity-40" onClick={() => setExportOpen((v) => !v)} aria-expanded={exportOpen} aria-haspopup="menu" disabled={busy}>
                <Download size={14} strokeWidth={1.6} /><span className="hidden sm:inline">{t('Export')}</span><ChevronDown size={13} strokeWidth={1.6} />
              </button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                  <div role="menu" className="absolute end-0 top-11 z-20 w-64 bg-ivory py-2 text-ink shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
                    <button role="menuitem" className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-ivory-2" onClick={() => void exportImage()}>
                      <ImageIcon size={16} strokeWidth={1.4} className="mt-0.5" />
                      <span><span className="block font-sans text-[0.8rem]">{t('Render image')}</span><span className="t-meta text-[0.7rem]">{t('High-resolution PNG of this view')}</span></span>
                    </button>
                    <button role="menuitem" className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-ivory-2" onClick={exportList}>
                      <FileSpreadsheet size={16} strokeWidth={1.4} className="mt-0.5" />
                      <span><span className="block font-sans text-[0.8rem]">{t('Shopping list')}</span><span className="t-meta text-[0.7rem]">{t('CSV with finishes and prices')}</span></span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1">
        {/* ——— Tool rail (desktop) ——— */}
        {isDesktop && !preview && (
          <nav className="z-20 flex w-[72px] shrink-0 flex-col items-stretch border-e border-white/[0.07] bg-ink-deep py-2" aria-label={t('Studio tools')}>
            {tools.map(({ id, label, icon: Icon }) => {
              const active = tool === id && panelOpen;
              return (
                <button
                  key={id}
                  onClick={() => { if (tool === id) setPanelOpen(!panelOpen); else { setTool(id); setPanelOpen(true); } }}
                  aria-pressed={active}
                  className={`group relative flex flex-col items-center gap-1.5 py-3.5 transition-colors ${active ? 'text-ivory' : 'text-ivory/50 hover:text-ivory/90'}`}
                >
                  <span className={`absolute start-0 top-3 bottom-3 w-[2px] transition-colors ${active ? 'bg-olive-soft' : 'bg-transparent'}`} />
                  <Icon size={18} strokeWidth={1.35} />
                  <span className="font-sans text-[0.62rem] tracking-[0.02em]">{t(label)}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ——— Tool panel (desktop) ——— */}
        {isDesktop && !preview && (
          <aside className={`z-10 shrink-0 overflow-hidden bg-ivory transition-[width] duration-500 ease-out ${panelOpen ? 'w-[312px]' : 'w-0'}`} aria-label={t(tools.find((x) => x.id === tool)?.label ?? 'Furniture')}>
            <div className="h-full w-[312px] border-e hairline">{toolPanel}</div>
          </aside>
        )}

        {/* ——— Viewport ——— */}
        <div
          ref={viewport}
          className="relative min-w-0 flex-1"
          onDragOver={(e) => { if (e.dataTransfer.types.includes('text/rt-product')) { e.preventDefault(); setDropHint(true); } }}
          onDragLeave={() => setDropHint(false)}
          onDrop={onDrop}
        >
          <Suspense fallback={<div className="grid h-full place-items-center bg-[#E3E0D9] font-sans text-[0.8rem] text-stone-deep">{t('Preparing the room…')}</div>}>
            <StudioScene />
          </Suspense>

          {dropHint && <div className="pointer-events-none absolute inset-4 border border-dashed border-ink/40 bg-ivory/10" />}

          {!preview && (
            <div className="pointer-events-none absolute bottom-3 start-3 hidden font-sans text-[0.7rem] lg:block" style={{ color: ['evening', 'night'].includes(lighting) ? 'rgba(243,240,233,0.6)' : 'rgba(37,37,34,0.55)' }}>
              {t('Drag pieces to move · R rotate · Del remove · Ctrl+Z undo')}
            </div>
          )}

          {preview && (
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
              <div className="bg-ivory/90 px-4 py-3 backdrop-blur">
                <p className="t-label text-stone-deep">{t('Preview')}</p>
                <p className="font-serif text-[1.5rem] leading-none">{projectName}</p>
              </div>
              <button className="btn btn-light btn-sm" onClick={() => setPreview(false)}><X size={14} strokeWidth={1.5} /><span>{t('Exit preview')}</span></button>
            </div>
          )}

          {/* Mobile camera & preview controls */}
          {!isDesktop && !preview && (
            <div className="absolute end-3 top-3 flex flex-col gap-1">
              {cameras.map((c) => (
                <button key={c.id} onClick={() => setCamera(c.id)} aria-pressed={camera === c.id} className={`h-8 px-2.5 font-sans text-[0.68rem] ${camera === c.id ? 'bg-ink text-ivory' : 'bg-ivory/90 text-ink'}`}>{t(c.label)}</button>
              ))}
              <button onClick={() => setPreview(true)} className="mt-1 grid h-8 place-items-center bg-ivory/90 text-ink" aria-label={t('Preview')}><Eye size={14} strokeWidth={1.5} /></button>
            </div>
          )}
        </div>

        {/* ——— Properties (desktop) ——— */}
        {isDesktop && !preview && (
          <aside className="z-10 w-[300px] shrink-0 border-s hairline bg-ivory xl:w-[320px]" aria-label={t('Properties')}>
            <PropertiesPanel />
          </aside>
        )}
      </div>

      {/* ——— Mobile: bottom tools + sheet ——— */}
      {!isDesktop && !preview && (
        <>
          {sheet && (
            <div className="absolute inset-x-0 bottom-[60px] z-30 flex max-h-[62svh] flex-col bg-ivory shadow-[0_-12px_40px_rgba(0,0,0,0.2)]" role="dialog" aria-label={sheet === 'props' ? t('Selected piece') : t(tools.find((x) => x.id === tool)?.label ?? 'Furniture')}>
              <div className="flex justify-center py-2">
                <button className="h-1 w-10 bg-ink/20" onClick={() => setSheet(null)} aria-label={t('Close panel')} />
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">{sheet === 'props' ? <PropertiesPanel onClose={() => { useStudio.getState().select(null); setSheet(null); }} /> : toolPanel}</div>
            </div>
          )}
          <nav className="z-30 grid h-[60px] shrink-0 grid-cols-6 border-t border-white/[0.07] bg-ink-deep" aria-label={t('Studio tools')}>
            {tools.map(({ id, label, icon: Icon }) => {
              const active = sheet === 'tool' && tool === id;
              return (
                <button key={id} onClick={() => { if (active) setSheet(null); else { setTool(id); setSheet('tool'); } }} aria-pressed={active} className={`flex flex-col items-center justify-center gap-1 ${active ? 'text-ivory' : 'text-ivory/55'}`}>
                  <Icon size={17} strokeWidth={1.4} />
                  <span className="font-sans text-[0.58rem]">{t(label)}</span>
                </button>
              );
            })}
          </nav>
        </>
      )}

      {pending && (
        <ConfirmReplace
          pending={pending}
          onCancel={() => setPending(null)}
          onConfirm={() => { useStudio.getState().load(pending.design, pending.meta); toast(t('Opened {name}', { name: pending.meta.name })); setPending(null); setSheet(null); }}
          onSaveFirst={async () => { const ok = await save(); if (ok) { useStudio.getState().load(pending.design, pending.meta); setPending(null); setSheet(null); } }}
        />
      )}
    </div>
  );
}
