import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addCartItem,
  clearRemoteCart,
  fetchCart,
  mergeRemoteCart,
  removeCartItem,
  updateCartItem,
  type RemoteCart,
} from "@/lib/api/cart";
import { useSessionStore } from "@/lib/store/session";
import type { Product } from "@/lib/types";

export interface CartLineView {
  id: string;
  product: Product;
  quantity: number;
  lineTotal: number;
}

interface ActionResult {
  ok: boolean;
  message?: string;
}

interface CartState {
  items: CartLineView[];
  guestItems: CartLineView[];
  mode: "guest" | "server";
  status: "idle" | "loading" | "ready";
  load: () => Promise<void>;
  mergeGuest: () => Promise<number>;
  addItem: (product: Product, quantity: number) => Promise<ActionResult>;
  setQuantity: (productId: string, quantity: number) => Promise<ActionResult>;
  removeItem: (productId: string) => Promise<ActionResult>;
  clear: () => Promise<void>;
  reset: () => void;
  clampToStock: (products: Product[]) => void;
}

function toLines(cart: RemoteCart): CartLineView[] {
  return cart.items.map((item) => ({
    id: item.id,
    product: item.product,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  }));
}

function guestLine(product: Product, quantity: number): CartLineView {
  return {
    id: product.id,
    product,
    quantity,
    lineTotal: product.price * quantity,
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Keranjang gagal diperbarui.";
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestItems: [],
      mode: "guest",
      status: "idle",

      load: async () => {
        const user = useSessionStore.getState().user;
        if (!user) {
          set({ items: get().guestItems, mode: "guest", status: "ready" });
          return;
        }
        set({ status: "loading" });
        try {
          const remote = await fetchCart();
          set({
            items: toLines(remote),
            mode: "server",
            status: "ready",
          });
        } catch {
          set({ status: "ready" });
        }
      },

      mergeGuest: async () => {
        const guest = get().guestItems;
        if (guest.length === 0) {
          await get().load();
          return 0;
        }
        try {
          const result = await mergeRemoteCart(
            guest.map((line) => ({
              productId: line.product.id,
              quantity: line.quantity,
            })),
          );
          set({
            items: toLines(result.data),
            guestItems: [],
            mode: "server",
            status: "ready",
          });
          return result.skippedProductIds.length;
        } catch {
          await get().load();
          return 0;
        }
      },

      addItem: async (product, quantity) => {
        const user = useSessionStore.getState().user;
        if (user) {
          try {
            const remote = await addCartItem(product.id, quantity);
            set({ items: toLines(remote), mode: "server", status: "ready" });
            return { ok: true };
          } catch (error) {
            return { ok: false, message: errorMessage(error) };
          }
        }

        if (product.stock <= 0) {
          return { ok: false, message: "Stok produk habis." };
        }
        const guest = get().guestItems;
        const existing = guest.find((line) => line.product.id === product.id);
        const nextQuantity = Math.min(
          (existing?.quantity ?? 0) + quantity,
          product.stock,
        );
        const line = guestLine(product, nextQuantity);
        const guestItems = existing
          ? guest.map((item) => (item.product.id === product.id ? line : item))
          : [...guest, line];
        set({ guestItems, items: guestItems, mode: "guest", status: "ready" });
        return { ok: true };
      },

      setQuantity: async (productId, quantity) => {
        const user = useSessionStore.getState().user;
        if (user) {
          const line = get().items.find((item) => item.product.id === productId);
          if (!line) return { ok: false, message: "Produk tidak ada di keranjang." };
          try {
            const remote =
              quantity <= 0
                ? await removeCartItem(line.id)
                : await updateCartItem(line.id, quantity);
            set({ items: toLines(remote), mode: "server", status: "ready" });
            return { ok: true };
          } catch (error) {
            return { ok: false, message: errorMessage(error) };
          }
        }

        const guest = get().guestItems;
        const line = guest.find((item) => item.product.id === productId);
        if (!line) return { ok: false, message: "Produk tidak ada di keranjang." };
        const safe = Math.max(0, Math.min(quantity, line.product.stock));
        const guestItems =
          safe === 0
            ? guest.filter((item) => item.product.id !== productId)
            : guest.map((item) =>
                item.product.id === productId
                  ? guestLine(item.product, safe)
                  : item,
              );
        set({ guestItems, items: guestItems, mode: "guest", status: "ready" });
        return { ok: true };
      },

      removeItem: async (productId) => {
        const user = useSessionStore.getState().user;
        if (user) {
          const line = get().items.find((item) => item.product.id === productId);
          if (!line) return { ok: false, message: "Produk tidak ada di keranjang." };
          try {
            const remote = await removeCartItem(line.id);
            set({ items: toLines(remote), mode: "server", status: "ready" });
            return { ok: true };
          } catch (error) {
            return { ok: false, message: errorMessage(error) };
          }
        }

        const guestItems = get().guestItems.filter(
          (item) => item.product.id !== productId,
        );
        set({ guestItems, items: guestItems, mode: "guest", status: "ready" });
        return { ok: true };
      },

      clear: async () => {
        const user = useSessionStore.getState().user;
        if (user) {
          try {
            await clearRemoteCart();
          } catch {
            // ignore network errors; local state is cleared below
          }
          set({ items: [], mode: "server", status: "ready" });
          return;
        }
        set({ guestItems: [], items: [], mode: "guest", status: "ready" });
      },

      reset: () => {
        set({ items: [], guestItems: [], mode: "guest", status: "ready" });
      },

      clampToStock: (products) => {
        if (useSessionStore.getState().user) return;
        const stockById = new Map(
          products.map((product) => [product.id, product]),
        );
        const guestItems = get()
          .guestItems.map((line) => {
            const product = stockById.get(line.product.id);
            if (!product) return line;
            const quantity = Math.min(line.quantity, product.stock);
            return guestLine(product, quantity);
          })
          .filter((line) => line.quantity > 0);
        set({ guestItems, items: guestItems });
      },
    }),
    {
      name: "mocha-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 2,
      partialize: (state) => ({ guestItems: state.guestItems }),
      migrate: () => ({ guestItems: [] }),
    },
  ),
);

export function cartCount(lines: CartLineView[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
