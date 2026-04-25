import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { ProductCard } from "./ProductCard";
import { MOCK_PRODUCTS } from "../lib/mockData";

export const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const filtered = useMemo(
    () => (category === "All" ? products : products.filter((p) => p.category === category)),
    [products, category]
  );

  return (
    <section
      id="products"
      data-testid="products-section"
      className="relative py-20 md:py-28 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#8A412A]">
            Our Collection
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl text-[#5C1A0B]">
            Signature Sweets
          </h2>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-5" />
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              data-testid={`filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
              className={`px-4 py-1.5 rounded-full text-sm border transition ${
                category === c
                  ? "bg-[#5C1A0B] text-[#F5E6B8] border-[#5C1A0B]"
                  : "border-[#E8D8A7] text-[#5C1A0B] hover:border-[#5C1A0B]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-[#8A412A] py-20" data-testid="products-loading">
            Loading our sweets…
          </div>
        )}
        {err && (
          <div className="text-center py-10 text-[#5C1A0B] bg-[#FAF6EA] border border-[#E8D8A7] rounded-2xl max-w-2xl mx-auto px-6" data-testid="products-error">
            <p className="font-serif text-xl">Database not ready</p>
            <p className="text-sm mt-2 text-[#8A412A]">
              {err}
            </p>
            <p className="text-xs mt-3 text-[#8A412A]">
              Please run <code>/app/supabase_schema.sql</code> in your Supabase SQL editor.
            </p>
          </div>
        )}
        {!loading && !err && filtered.length === 0 && (
          <div className="text-center py-20 text-[#8A412A]" data-testid="products-empty">
            No sweets in this category yet.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
