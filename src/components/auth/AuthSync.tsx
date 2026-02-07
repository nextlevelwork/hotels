'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFavoritesStore } from '@/store/favorites-store';

export default function AuthSync() {
  const { data: session, status } = useSession();
  const setServerSync = useFavoritesStore((s) => s.setServerSync);
  const syncFromServer = useFavoritesStore((s) => s.syncFromServer);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setServerSync(true);
      // Fetch server favorites and merge
      fetch('/api/favorites')
        .then((res) => res.json())
        .then((serverSlugs: string[]) => {
          if (Array.isArray(serverSlugs)) {
            syncFromServer(serverSlugs);
          }
        })
        .catch(() => {});
    } else if (status === 'unauthenticated') {
      setServerSync(false);
    }
  }, [status, session, setServerSync, syncFromServer]);

  return null;
}
