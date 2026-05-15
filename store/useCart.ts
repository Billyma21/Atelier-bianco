import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  variantId: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((item) => item.variantId === newItem.variantId);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((item) => item.variantId !== variantId) });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'atelier-bianco-cart',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { items?: CartItem[] };
        if (version < 2 && state?.items) {
          state.items = state.items.filter(
            (i) => i?.variantId && Number(i.quantity) > 0 && Number(i.price) >= 0
          );
        }
        return { items: state?.items ?? [] };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const clean = state.items.filter(
          (i) => i?.variantId && Number(i.quantity) > 0 && Number.isFinite(Number(i.price))
        );
        if (clean.length !== state.items.length) {
          state.items = clean;
        }
      },
    }
  )
);
