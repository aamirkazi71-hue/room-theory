import { create } from 'zustand';

interface Toast { id: number; message: string }

interface UiState {
  menuOpen: boolean;
  searchOpen: boolean;
  savedOpen: boolean;
  toasts: Toast[];
  setMenu: (v: boolean) => void;
  setSearch: (v: boolean) => void;
  setSaved: (v: boolean) => void;
  toast: (message: string) => void;
}

let tid = 0;
export const useUi = create<UiState>()((set, get) => ({
  menuOpen: false,
  searchOpen: false,
  savedOpen: false,
  toasts: [],
  setMenu: (menuOpen) => set({ menuOpen }),
  setSearch: (searchOpen) => set({ searchOpen, menuOpen: false }),
  setSaved: (savedOpen) => set({ savedOpen, menuOpen: false }),
  toast: (message) => {
    const id = ++tid;
    set({ toasts: [...get().toasts, { id, message }] });
    window.setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 3200);
  },
}));
