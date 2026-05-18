"use client";

import { create } from "zustand";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhoneNumber?: string;
  carLicensePlate?: string;
  carType?: string;
  items: CartItem[];
  totalPrice: number;
  specialRequests?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: number;
}

interface DiamondState {
  role: 'customer' | 'staff' | null;
  cart: CartItem[];
  setRole: (role: 'customer' | 'staff' | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useStore = create<DiamondState>((set, get) => ({
  role: null,
  cart: [],
  setRole: (role) => set({ role }),
  addToCart: (item) => {
    const existing = get().cart.find((i) => i.id === item.id);
    if (existing) {
      set({
        cart: get().cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ cart: [...get().cart, { ...item, quantity: 1 }] });
    }
  },
  removeFromCart: (id) =>
    set({ cart: get().cart.filter((i) => i.id !== id) }),
  updateQuantity: (id, quantity) =>
    set({
      cart: get().cart.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
      ).filter(i => i.quantity > 0),
    }),
  clearCart: () => set({ cart: [] }),
}));
