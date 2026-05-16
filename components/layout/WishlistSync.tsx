'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useWishlist } from '@/store/useWishlist';

/** Synchronise les favoris Supabase à la connexion / déconnexion. */
export default function WishlistSync() {
  const refresh = useWishlist((s) => s.refresh);

  useEffect(() => {
    const supabase = createClient();
    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  return null;
}
