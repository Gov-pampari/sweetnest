import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { supabase, WHATSAPP_NUMBER } from "../lib/supabase";
import { toast } from "sonner";

export const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQty, removeItem, total, clear } =
    useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitOrder = async () => {
    if (items.length === 0) return;
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    setSubmitting(true);
    const payload = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      items: items.map((i) => ({
        id: i.productId,
        name: i.name,
        weight: i.weight,
        price: i.unitPrice,
        qty: i.qty,
        subtotal: i.unitPrice * i.qty,
      })),
      total,
      status: "new",
    };
    const { error } = await supabase.from("orders").insert(payload);
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("Could not save order: " + error.message);
      return;
    }

    const lines = items
      .map((i) => `• ${i.name} (${i.weight}) x ${i.qty} — ₹${i.unitPrice * i.qty}`)
      .join("%0A");
    const msg =
      `Hi SweetNest, I'd like to order:%0A${lines}%0A%0A` +
      `Total: ₹${total}%0A%0AName: ${encodeURIComponent(
        name
      )}%0APhone: ${encodeURIComponent(phone)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, "_blank");
    clear();
    setIsOpen(false);
    setName("");
    setPhone("");
    toast.success("Order placed — opening WhatsApp!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#5C1A0B]/40 backdrop-blur-sm z-[60]"
            data-testid="cart-overlay"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF6EA] z-[70] flex flex-col shadow-2xl"
            data-testid="cart-drawer"
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-[#E8D8A7]">
              <h2 className="font-serif text-3xl text-[#5C1A0B]">Your Basket</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#5C1A0B]/10"
                data-testid="close-cart-btn"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-[#5C1A0B]" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div
                  className="text-center text-[#8A412A] py-16"
                  data-testid="empty-cart"
                >
                  Your basket is empty.
                </div>
              ) : (
                items.map((i) => (
                  <div
                    key={i.key}
                    className="flex gap-3 items-center bg-[#F5E6B8]/60 rounded-xl p-3"
                    data-testid={`cart-item-${i.key}`}
                  >
                    <img
                      src={i.image_url}
                      alt={i.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-lg text-[#5C1A0B] truncate">
                        {i.name}
                      </div>
                      <div className="text-xs text-[#8A412A]">
                        {i.weight} • ₹{i.unitPrice}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateQty(i.key, i.qty - 1)}
                          className="w-7 h-7 rounded-full bg-[#5C1A0B] text-[#F5E6B8] flex items-center justify-center"
                          data-testid={`qty-dec-${i.key}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className="min-w-[1.5rem] text-center text-sm font-medium"
                          data-testid={`qty-val-${i.key}`}
                        >
                          {i.qty}
                        </span>
                        <button
                          onClick={() => updateQty(i.key, i.qty + 1)}
                          className="w-7 h-7 rounded-full bg-[#5C1A0B] text-[#F5E6B8] flex items-center justify-center"
                          data-testid={`qty-inc-${i.key}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-lg text-[#5C1A0B]">
                        ₹{i.unitPrice * i.qty}
                      </div>
                      <button
                        onClick={() => removeItem(i.key)}
                        className="text-[#8A412A] hover:text-[#5C1A0B] mt-1"
                        data-testid={`remove-${i.key}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#E8D8A7] p-6 space-y-3 bg-[#F5E6B8]/40">
                <div className="flex gap-2">
                  <input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B]"
                    data-testid="cart-name-input"
                  />
                  <input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B]"
                    data-testid="cart-phone-input"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8A412A] uppercase text-xs tracking-wider">
                    Total
                  </span>
                  <span
                    className="font-serif text-3xl text-[#5C1A0B]"
                    data-testid="cart-total"
                  >
                    ₹{total}
                  </span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={submitting}
                  className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-full py-3.5 font-medium inline-flex items-center justify-center gap-2 transition disabled:opacity-60"
                  data-testid="whatsapp-order-btn"
                >
                  <MessageCircle className="w-5 h-5" />
                  {submitting ? "Placing..." : "Order via WhatsApp"}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
