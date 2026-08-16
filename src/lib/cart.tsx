"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Id } from "@cvx/_generated/dataModel";

export type CartLine = {
  productId: Id<"products">;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  size?: string;
  color?: string;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "contessa.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

/** Same product in two sizes is two lines, so the key folds in the variant. */
export function lineKey(line: Pick<CartLine, "productId" | "size" | "color">) {
  return `${line.productId}::${line.size ?? ""}::${line.color ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  // Guards against rendering a server-empty cart over a restored one.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Corrupted or unavailable storage just means an empty bag.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private mode / quota — the cart stays in memory for this session.
    }
  }, [lines, ready]);

  const add: CartContextValue["add"] = useCallback((line, quantity = 1) => {
    setLines((current) => {
      const key = lineKey(line);
      const existing = current.find((l) => lineKey(l) === key);
      if (existing) {
        return current.map((l) =>
          lineKey(l) === key ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...current, { ...line, quantity }];
    });
  }, []);

  const setQuantity: CartContextValue["setQuantity"] = useCallback(
    (key, quantity) => {
      setLines((current) =>
        quantity < 1
          ? current.filter((l) => lineKey(l) !== key)
          : current.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)),
      );
    },
    [],
  );

  const remove: CartContextValue["remove"] = useCallback((key) => {
    setLines((current) => current.filter((l) => lineKey(l) !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      ready,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>.");
  return context;
}
