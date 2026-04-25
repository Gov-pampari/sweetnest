import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";

const WEIGHTS = ["250g", "500g", "1kg"];
const COL = { "250g": "price_250g", "500g": "price_500g", "1kg": "price_1kg" };
const FALLBACK_MULT = { "250g": 0.55, "500g": 1, "1kg": 1.9 };

export const ProductCard = ({ product, index = 0 }) => {
  // Only offer weights that actually have a price configured (admin can hide a
  // weight by leaving the field empty). Fallback to multiplier if all 3 are null.
  const priceFor = (w) => {
    const v = product[COL[w]];
    if (v != null && v !== "") return Number(v);
    return Math.round(Number(product.price) * FALLBACK_MULT[w]);
  };
  const hasExplicit =
    product.price_250g != null ||
    product.price_500g != null ||
    product.price_1kg != null;
  const availableWeights = hasExplicit
    ? WEIGHTS.filter((w) => product[COL[w]] != null && product[COL[w]] !== "")
    : WEIGHTS;
  const defaultWeight = availableWeights.includes("500g")
    ? "500g"
    : availableWeights[0];

  const [weight, setWeight] = useState(defaultWeight);
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: (index % 8) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group bg-[#FAF6EA] rounded-2xl overflow-hidden border border-[#E8D8A7] shadow-[0_6px_24px_-12px_rgba(92,26,11,0.2)] hover:shadow-[0_18px_40px_-18px_rgba(92,26,11,0.45)] transition-shadow"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-[#F5E6B8]">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className="absolute top-3 left-3 bg-[#5C1A0B]/90 text-[#F5E6B8] text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full"
          data-testid={`product-category-${product.id}`}
        >
          {product.category}
        </span>
      </div>

      <div className="p-5">
        <h3
          className="font-serif text-2xl leading-tight text-[#5C1A0B]"
          data-testid={`product-name-${product.id}`}
        >
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1.5 text-sm text-[#8A412A] line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex gap-1.5" role="group" aria-label="Weight">
          {availableWeights.map((w) => (
            <button
              key={w}
              onClick={() => setWeight(w)}
              data-testid={`weight-${w}-${product.id}`}
              className={`flex-1 text-xs py-1.5 rounded-full border transition ${
                weight === w
                  ? "bg-[#5C1A0B] text-[#F5E6B8] border-[#5C1A0B]"
                  : "bg-transparent text-[#5C1A0B] border-[#E8D8A7] hover:border-[#5C1A0B]"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div
              className="font-serif text-2xl font-semibold text-[#5C1A0B]"
              data-testid={`product-price-${product.id}`}
            >
              ₹{priceFor(weight)}
            </div>
            <div className="text-[11px] text-[#8A412A] uppercase tracking-wider">
              {weight}
            </div>
          </div>
          <button
            onClick={() => {
              addItem(product, weight, 1, priceFor(weight));
              toast.success(`${product.name} (${weight}) added to cart`);
            }}
            data-testid={`add-to-cart-${product.id}`}
            className="btn-primary rounded-full px-4 py-2.5 inline-flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};
