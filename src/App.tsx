import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TransitionProvider } from '@/components/animations/PageTransition';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { SavedDrawer } from '@/components/layout/SavedDrawer';
import { Toasts } from '@/components/layout/Toasts';
import Home from '@/pages/Home';
import { products } from '@/data/furniture';
import { useThumbs } from '@/store/thumbnails';

const Spaces = lazy(() => import('@/pages/Spaces'));
const SpaceDetail = lazy(() => import('@/pages/SpaceDetail'));
const Studio = lazy(() => import('@/pages/Studio'));
const Collection = lazy(() => import('@/pages/Collection'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Journal = lazy(() => import('@/pages/Journal'));
const Article = lazy(() => import('@/pages/Article'));
const About = lazy(() => import('@/pages/About'));
const Legal = lazy(() => import('@/pages/Legal'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ThumbnailStudio = lazy(() => import('@/components/configurator/Furniture/ThumbnailStudio'));

function PageFallback() {
  return <div className="min-h-[100svh] bg-ivory" aria-busy="true" />;
}

/** Render product imagery once the page has settled — only if any renders are missing. */
function DeferredThumbnails() {
  const [ready, setReady] = useState(false);
  const missing = useThumbs((s) => products.some((p) => !s.images[p.id]));
  useEffect(() => {
    if (!missing) return;
    const start = () => setReady(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 2500 });
    else window.setTimeout(start, 1200);
  }, [missing]);
  return ready && missing ? <Suspense fallback={null}><ThumbnailStudio /></Suspense> : null;
}

export default function App() {
  return (
    <TransitionProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/studio" element={<Studio />} />
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/spaces/:slug" element={<SpaceDetail />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/collection/:id" element={<ProductDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<Article />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal/:doc" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <SearchOverlay />
      <SavedDrawer />
      <Toasts />
      <DeferredThumbnails />
    </TransitionProvider>
  );
}
