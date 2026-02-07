import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  slugs: string[];
  _serverSync: boolean;
  toggle: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  count: () => number;
  clear: () => void;
  setServerSync: (enabled: boolean) => void;
  syncFromServer: (serverSlugs: string[]) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      slugs: [],
      _serverSync: false,

      toggle: (slug) => {
        const current = get().slugs;
        const isRemoving = current.includes(slug);

        set({
          slugs: isRemoving
            ? current.filter((s) => s !== slug)
            : [...current, slug],
        });

        // Fire-and-forget server sync
        if (get()._serverSync) {
          if (isRemoving) {
            fetch('/api/favorites', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hotelSlug: slug }),
            }).catch(() => {});
          } else {
            fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hotelSlug: slug }),
            }).catch(() => {});
          }
        }
      },

      isFavorite: (slug) => get().slugs.includes(slug),

      count: () => get().slugs.length,

      clear: () => set({ slugs: [] }),

      setServerSync: (enabled) => set({ _serverSync: enabled }),

      syncFromServer: (serverSlugs) => {
        const localSlugs = get().slugs;
        // Union of local and server
        const merged = Array.from(new Set([...localSlugs, ...serverSlugs]));
        set({ slugs: merged });

        // Push local-only slugs to server
        const localOnly = localSlugs.filter((s) => !serverSlugs.includes(s));
        for (const slug of localOnly) {
          fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hotelSlug: slug }),
          }).catch(() => {});
        }
      },
    }),
    {
      name: 'gostinets-favorites',
      partialize: (state) => ({ slugs: state.slugs }),
    },
  ),
);
