import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "sweetnest_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const keyOf = (productId, weight) => `${productId}__${weight}`;

  const addItem = (product, weight = "500g", qty = 1, unitPriceOverride = null) => {
    const weightMultiplier = { "250g": 0.55, "500g": 1, "1kg": 1.9 };
    const unitPrice =
      unitPriceOverride != null
        ? Math.round(unitPriceOverride)
        : Math.round(product.price * (weightMultiplier[weight] ?? 1));
    setItems((prev) => {
      const k = keyOf(product.id, weight);
      const existing = prev.find((i) => i.key === k);
      if (existing) {
        return prev.map((i) =>
          i.key === k ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          key: k,
          productId: product.id,
          name: product.name,
          image_url: product.image_url,
          weight,
          unitPrice,
          qty,
        },
      ];
    });
    setIsOpen(true);
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) return removeItem(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        updateQty,
        removeItem,
        clear,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
