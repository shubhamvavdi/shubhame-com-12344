import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemWithProduct } from "@shared/schema";

interface CartState {
  items: CartItemWithProduct[];
  isOpen: boolean;
  itemCount: number;
  total: number;
  setItems: (items: CartItemWithProduct[]) => void;
  addItem: (item: CartItemWithProduct) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  calculateTotals: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      total: 0,
      setItems: (items) => {
        set({ items });
        get().calculateTotals();
      },
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.productId === item.productId);
        
        if (existingItem) {
          get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        } else {
          set({ items: [...items, item] });
          get().calculateTotals();
        }
      },
      removeItem: (itemId) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== itemId) });
        get().calculateTotals();
      },
      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set({
          items: items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
        get().calculateTotals();
      },
      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      calculateTotals: () => {
        const { items } = get();
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => {
          const price = parseFloat(item.product.salePrice || item.product.price);
          return sum + (price * item.quantity);
        }, 0);
        set({ itemCount, total });
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateTotals();
        }
      },
    }
  )
);
