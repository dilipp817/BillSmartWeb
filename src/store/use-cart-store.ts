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

// ─── Held Bill ───────────────────────────────────────────────────────────────

/** A frozen snapshot of a cart — stored in-memory while the cashier serves another customer. */
export interface HeldBill {
  id: number; // auto-increment label (Bill #1, #2 …)
  items: CartItem[];
  tableId: number | null;
  orderType: OrderType;
  notes: string;
  heldAt: number; // Date.now() timestamp
}

// ─── State & Actions ──────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  /** null = TAKEAWAY; set when cashier selects a table (O-04 / O-07) */
  tableId: number | null;
  orderType: OrderType;
  /** Kitchen notes — entered in cart panel (TAKEAWAY) or confirmation screen (DINE_IN) */
  notes: string;
  /** In-memory held bills (frozen cart snapshots). Lost on page close — intentional. */
  heldBills: HeldBill[];
  /** Counter for labelling held bills (Bill #1, #2 …) */
  _heldBillCounter: number;
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

  /** Set kitchen/order notes. */
  setNotes: (notes: string) => void;

  /**
   * Freeze the current cart as a held bill and start a fresh empty cart.
   * Does nothing if the cart is already empty.
   */
  holdCart: () => void;

  /**
   * Resume a held bill by its id. If the current cart has items, it is
   * automatically held first (swapped out).
   */
  resumeHeldBill: (heldBillId: number) => void;

  /** Permanently delete a held bill (cashier dismissed the customer's order). */
  deleteHeldBill: (heldBillId: number) => void;

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
  notes: "",
  heldBills: [],
  _heldBillCounter: 0,
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

  setNotes: (notes) => set({ notes }),

  holdCart: () =>
    set((state) => {
      if (state.items.length === 0) return state;
      const newCounter = state._heldBillCounter + 1;
      const held: HeldBill = {
        id: newCounter,
        items: state.items,
        tableId: state.tableId,
        orderType: state.orderType,
        notes: state.notes,
        heldAt: Date.now(),
      };
      return {
        ...INITIAL_STATE,
        heldBills: [...state.heldBills, held],
        _heldBillCounter: newCounter,
      };
    }),

  resumeHeldBill: (heldBillId) =>
    set((state) => {
      const target = state.heldBills.find((b) => b.id === heldBillId);
      if (!target) return state;

      const remaining = state.heldBills.filter((b) => b.id !== heldBillId);

      // If current cart has items, auto-hold it
      let newHeldBills = remaining;
      let newCounter = state._heldBillCounter;
      if (state.items.length > 0) {
        newCounter += 1;
        const autoHeld: HeldBill = {
          id: newCounter,
          items: state.items,
          tableId: state.tableId,
          orderType: state.orderType,
          notes: state.notes,
          heldAt: Date.now(),
        };
        newHeldBills = [...remaining, autoHeld];
      }

      return {
        items: target.items,
        tableId: target.tableId,
        orderType: target.orderType,
        notes: target.notes,
        heldBills: newHeldBills,
        _heldBillCounter: newCounter,
      };
    }),

  deleteHeldBill: (heldBillId) =>
    set((state) => ({
      heldBills: state.heldBills.filter((b) => b.id !== heldBillId),
    })),

  clearCart: () =>
    set((state) => ({
      ...INITIAL_STATE,
      // Preserve held bills — clearing the active cart does not drop held orders
      heldBills: state.heldBills,
      _heldBillCounter: state._heldBillCounter,
    })),
}));
