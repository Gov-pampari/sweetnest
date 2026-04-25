import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Check, MessageCircle, Sparkles } from "lucide-react";
import { supabase, WHATSAPP_NUMBER } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { MOCK_PRODUCTS } from "../lib/mockData";

const MIN_ITEMS = 4;
const MAX_ITEMS = 6;
const BUNDLE_DISCOUNT = 0.1; // 10% off

export const GiftBoxBuilder = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]); // array of product ids

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });
        
        if (error) throw new Error(error.message);
        setProducts(data || []);
      } catch (error) {
        console.warn("Using mock products due to database error:", error?.message || error);
        setProducts(MOCK_PRODUCTS);
      }
    })();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_ITEMS) {
        toast.error(`You can pick up to ${MAX_ITEMS} sweets`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const chosen = useMemo(
    () => selected.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [selected, products]
  );

  const subtotal = chosen.reduce((s, p) => s + Number(p.price), 0);
  const total = Math.round(subtotal * (1 - BUNDLE_DISCOUNT));
  const savings = subtotal - total;
  const ready = chosen.length >= MIN_ITEMS;

  const addToCart = () => {
    if (!ready) {
      toast.error(`Pick at least ${MIN_ITEMS} sweets`);
      return;
    }
    const names = chosen.map((p) => p.name).join(", ");
    const bundleId = `giftbox-${Date.now()}`;
    addItem(
      {
        id: bundleId,
        name: `Gift Box (${chosen.length}): ${names}`,
        image_url: chosen[0].image_url,
        price: total, // already-discounted total → 500g multiplier = 1
      },
      "500g",
      1
    );
    setSelected([]);
    toast.success("Festive gift box added to your basket");
  };

  const shareOnWhatsApp = () => {
    if (!ready) return;
    const lines = chosen.map((p) => `• ${p.name}`).join("%0A");
    const msg =
      `Hi SweetNest! I'd like to order a Festive Gift Box (${chosen.length} sweets):%0A` +
      `${lines}%0A%0ABundle Total: ₹${total} (you saved ₹${savings})`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <section
      id="giftbox"
      data-testid="giftbox-section"
      className="relative py-20 md:py-28 px-4 md:px-8 bg-[#FAF6EA] overflow-hidden"
    >
      {/* decorative shimmer */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-[#5C1A0B]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#8A412A] flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Festive Special
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl text-[#5C1A0B]">
            Build Your Gift Box
          </h2>
          <p className="mt-4 text-[#8A412A] max-w-xl mx-auto">
            Hand-pick {MIN_ITEMS}–{MAX_ITEMS} signature sweets and we'll pack
            them into a beautifully tied festive box — save {BUNDLE_DISCOUNT * 100}% as a bundle.
          </p>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-5" />
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,360px] gap-8">
          {/* Picker */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((p) => {
              const isOn = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  data-testid={`giftbox-pick-${p.id}`}
                  className={`relative rounded-2xl overflow-hidden border text-left transition ${
                    isOn
                      ? "border-[#5C1A0B] ring-2 ring-[#D4AF37] shadow-lg"
                      : "border-[#E8D8A7] hover:border-[#5C1A0B]/60"
                  }`}
                >
                  <div className="aspect-square bg-[#F5E6B8]">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isOn && (
                    <span className="absolute top-2 right-2 bg-[#5C1A0B] text-[#F5E6B8] rounded-full w-7 h-7 flex items-center justify-center shadow">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                  <div className="p-3 bg-[#FAF6EA]">
                    <div className="font-serif text-base text-[#5C1A0B] leading-tight truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-[#8A412A] mt-0.5">₹{p.price}</div>
                  </div>
                </button>
              );
            })}
            {products.length === 0 && (
              <p className="col-span-full text-[#8A412A] text-center py-10" data-testid="giftbox-no-products">
                Products will appear once loaded.
              </p>
            )}
          </div>

          {/* Summary card */}
          <motion.aside
            layout
            className="bg-[#F5E6B8]/70 rounded-2xl border border-[#E8D8A7] p-6 h-fit lg:sticky lg:top-28"
            data-testid="giftbox-summary"
          >
            <div className="flex items-center gap-2 text-[#5C1A0B]">
              <Gift className="w-5 h-5" />
              <h3 className="font-serif text-2xl">Your Box</h3>
            </div>
            <p className="text-xs text-[#8A412A] mt-1">
              {chosen.length} / {MAX_ITEMS} selected (min {MIN_ITEMS})
            </p>

            <div className="mt-4 space-y-2 min-h-[6rem]">
              <AnimatePresence>
                {chosen.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-[#8A412A] italic"
                  >
                    Tap sweets on the left to build your box.
                  </motion.p>
                )}
                {chosen.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 bg-[#FAF6EA] rounded-lg p-2"
                    data-testid={`giftbox-chosen-${p.id}`}
                  >
                    <img src={p.image_url} className="w-10 h-10 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#5C1A0B] truncate">{p.name}</div>
                      <div className="text-xs text-[#8A412A]">₹{p.price}</div>
                    </div>
                    <button
                      onClick={() => toggle(p.id)}
                      className="text-[#8A412A] text-xs underline"
                      data-testid={`giftbox-remove-${p.id}`}
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 border-t border-[#E8D8A7] pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#8A412A]">
                <span>Subtotal</span>
                <span data-testid="giftbox-subtotal">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#D4AF37] font-medium">
                <span>Bundle discount</span>
                <span data-testid="giftbox-savings">− ₹{savings}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-[#8A412A] uppercase text-xs tracking-widest">Box Total</span>
                <span className="font-serif text-3xl text-[#5C1A0B]" data-testid="giftbox-total">
                  ₹{total}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={addToCart}
                disabled={!ready}
                className="w-full btn-primary rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="giftbox-add-btn"
              >
                Add Gift Box to Basket
              </button>
              <button
                onClick={shareOnWhatsApp}
                disabled={!ready}
                className="w-full bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-full py-3 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                data-testid="giftbox-whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5" /> Share on WhatsApp
              </button>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
};
