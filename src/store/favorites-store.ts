import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  slugs: string[];
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  count: () => number;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      slugs: [],

      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((s) => s !== slug)
            : [...state.slugs, slug],
        })),

      isFavorite: (slug) => get().slugs.includes(slug),

      count: () => get().slugs.length,

      clear: () => set({ slugs: [] }),
    }),
    {
      name: 'gostinets-favorites',
    },
  ),
);
