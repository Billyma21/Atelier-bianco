import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase';

export type WishlistToggleResult =
  | { ok: true; added?: boolean; removed?: boolean }
  | { ok: false; needsLogin?: boolean; error?: string };

interface WishlistStore {
  productIds: string[];
  ready: boolean;
  isFavorite: (productId: string) => boolean;
  setProductIds: (ids: string[]) => void;
  refresh: () => Promise<void>;
  toggle: (productId: string) => Promise<WishlistToggleResult>;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      ready: false,

      isFavorite: (productId) => get().productIds.includes(productId),

      setProductIds: (ids) => set({ productIds: ids }),

      refresh: async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ productIds: [], ready: true });
          return;
        }

        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) {
          console.warn('wishlist refresh:', error.message);
          set({ ready: true });
          return;
        }

        set({
          productIds: (data ?? []).map((row) => row.product_id).filter(Boolean),
          ready: true,
        });
      },

      toggle: async (productId) => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return { ok: false, needsLogin: true };
        }

        const current = get().productIds;
        const already = current.includes(productId);

        if (already) {
          const { error } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);

          if (error) {
            return { ok: false, error: error.message };
          }

          set({ productIds: current.filter((id) => id !== productId) });
          return { ok: true, removed: true };
        }

        const { error } = await supabase.from('wishlists').insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) {
          if (error.code === '23505') {
            set({ productIds: [...new Set([...current, productId])] });
            return { ok: true, added: true };
          }
          return { ok: false, error: error.message };
        }

        set({ productIds: [...current, productId] });
        return { ok: true, added: true };
      },
    }),
    {
      name: 'atelier-bianco-wishlist',
      partialize: (state) => ({ productIds: state.productIds }),
      onRehydrateStorage: () => (state) => {
        void state?.refresh();
      },
    }
  )
);
