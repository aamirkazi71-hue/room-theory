/**
 * Product renders. The site's product imagery is rendered from the same 3D
 * models used in the studio (see ThumbnailStudio), so a product looks the
 * same in the collection as it does in a room. Cached per session.
 */
import { create } from 'zustand';

const KEY = 'rt.thumbs.v3';

function readCache(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

interface ThumbState {
  images: Record<string, string>;
  set: (id: string, url: string) => void;
}

export const useThumbs = create<ThumbState>()((set, get) => ({
  images: readCache(),
  set: (id, url) => {
    const images = { ...get().images, [id]: url };
    set({ images });
    try {
      sessionStorage.setItem(KEY, JSON.stringify(images));
    } catch {
      /* cache is optional */
    }
  },
}));
