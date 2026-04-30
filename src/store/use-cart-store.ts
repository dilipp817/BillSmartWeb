"use client";

import { create } from "zustand";

import { OrderType } from "@/constants";
import type { FoodListItem } from "@/features/menu/types";
import type { CreateOrderItemRequest } from "@/features/orders/types";

// ─── Cart Item ────────────────────────────────────────────────────────────────

/**
 * A single item in the cart. Extends FoodListItem with quantity and
 * an optional special request note per item.
 */
export interface CartItem extends FoodListItem {
  quantity: number;
  special_requests: string;
}

// ─── State & Actions ──────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  /** null = TAKEAWAY; set when cashier selects a table (O-04 / O-07) */
  tableId: number | null;
  orderType: OrderType;
}

interface CartActions {
  /**
   * Add a food item to the cart. If the item already exists, increment its
   * quantity by 1 instead of creating a duplicate entry.
   */
  addItem: (food: FoodListItem) => void;

  /**
   * Remove a food item from the cart entirely (regardless of quantity).
   */
  removeItem: (foodId: number) => void;

  /**
   * Set the quantity of a specific item. If quantity <= 0 the item is removed.
   */
  updateQuantity: (foodId: number, quantity: number) => void;

  /**
   * Set (or clear) the special request note for a specific item.
   */
  setSpecialRequest: (foodId: number, specialRequest: string) => void;

  /**
   * Set the target table and order type for this cart session.
   * Pass tableId=null and orderType=TAKEAWAY for takeaway orders.
   */
  setTable: (tableId: number | null, orderType: OrderType) => void;

  /**
   * Empty the cart and reset table selection back to TAKEAWAY defaults.
   * Called after a successful order creation (O-07).
   */
  clearCart: () => void;
}

type CartStore = CartState & CartActions;

// ─── Derived helpers (pure functions — keep store lean) ───────────────────────

/**
 * Total number of individual items (sum of quantities).
 * Use this for the cart badge / count.
 */
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

/**
 * Running total before tax.
 * Tax is always computed server-side / at bill generation — never here.
 */
export function cartRunningTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

/**
 * Convert cart items to the shape expected by CreateOrderRequest.items.
 * Used by O-07 (Create Order) when submitting to the backend.
 */
export function toCreateOrderItems(items: CartItem[]): CreateOrderItemRequest[] {
  return items.map(({ id, quantity, special_requests }) => ({
    food_id: id,
    quantity,
    ...(special_requests.trim().length > 0 && { special_requests: special_requests.trim() }),
  }));
}

// ─── Store ────────────────────────────────────────────────────────────────────

const INITIAL_STATE: CartState = {
  items: [],
  tableId: null,
  orderType: OrderType.TAKEAWAY,
};

export const useCartStore = create<CartStore>((set) => ({
  ...INITIAL_STATE,

  addItem: (food) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === food.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        items: [...state.items, { ...food, quantity: 1, special_requests: "" }],
      };
    }),

  removeItem: (foodId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== foodId),
    })),

  updateQuantity: (foodId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== foodId) };
      }
      return {
        items: state.items.map((item) => (item.id === foodId ? { ...item, quantity } : item)),
      };
    }),

  setSpecialRequest: (foodId, specialRequest) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === foodId ? { ...item, special_requests: specialRequest } : item
      ),
    })),

  setTable: (tableId, orderType) => set({ tableId, orderType }),

  clearCart: () => set(INITIAL_STATE),
}));
