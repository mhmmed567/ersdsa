
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
  items: CartItem[];
  totalPrice: number;
  specialRequests?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: number;
}

interface WarmHearthState {
  role: 'customer' | 'staff' | null;
  cart: CartItem[];
  orders: Order[];
  setRole: (role: 'customer' | 'staff' | null) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'items' | 'totalPrice'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useStore = create<WarmHearthState>((set, get) => ({
  role: null,
  cart: [],
  orders: [],
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
  placeOrder: (orderData) => {
    const cart = get().cart;
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: [...cart],
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
    };
    set({
      orders: [newOrder, ...get().orders],
      cart: [],
    });
    return newOrder;
  },
  updateOrderStatus: (orderId, status) =>
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    }),
}));
