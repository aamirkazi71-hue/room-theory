import { useEffect } from 'react';

interface Seo {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

/** Per-page title, description and Open Graph tags. */
export function useSeo({ title, description, image, type = 'website' }: Seo) {
  useEffect(() => {
    const full = title === 'Room Theory' ? 'Room Theory — Design your space. Define your atmosphere.' : `${title} — Room Theory`;
    document.title = full;
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', window.location.href);
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
    if (image) setMeta('property', 'og:image', image);
  }, [title, description, image, type]);
}
