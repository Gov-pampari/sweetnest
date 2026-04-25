import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { MOCK_REVIEWS } from "../lib/mockData";

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      
      if (error) throw new Error(error.message);
      setReviews(data || []);
    } catch (error) {
      console.warn("Using mock reviews due to database error:", error?.message || error);
      setReviews(MOCK_REVIEWS);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      name: name.trim(),
      comment: comment.trim(),
      rating,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thank you! Your review is awaiting approval.");
    setName("");
    setComment("");
    setRating(5);
  };

  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="py-20 md:py-28 px-4 md:px-8 bg-[#FAF6EA]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#8A412A]">
            Our Patrons
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl text-[#5C1A0B]">
            Words of Sweetness
          </h2>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-5" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {reviews.map((r, i) => (
            <motion.blockquote
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#F5E6B8]/50 border border-[#E8D8A7] rounded-2xl p-6"
              data-testid={`review-${r.id}`}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={`w-4 h-4 ${
                      k < r.rating
                        ? "fill-[#D4AF37] text-[#D4AF37]"
                        : "text-[#E8D8A7]"
                    }`}
                  />
                ))}
              </div>
              <p className="font-serif text-lg italic leading-relaxed text-[#5C1A0B]">
                “{r.comment}”
              </p>
              <footer className="mt-4 text-xs uppercase tracking-widest text-[#8A412A]">
                — {r.name}
              </footer>
            </motion.blockquote>
          ))}
          {reviews.length === 0 && (
            <p className="col-span-full text-center text-[#8A412A]" data-testid="no-reviews">
              Be the first to share your experience.
            </p>
          )}
        </div>

        <form
          onSubmit={submit}
          className="max-w-xl mx-auto bg-[#F5E6B8]/60 rounded-2xl p-6 border border-[#E8D8A7] space-y-4"
          data-testid="review-form"
        >
          <h3 className="font-serif text-2xl text-[#5C1A0B]">Share your story</h3>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white rounded-lg px-3 py-2.5 border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B]"
            data-testid="review-name-input"
            required
          />
          <div className="flex gap-1" data-testid="rating-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                data-testid={`rating-${n}`}
              >
                <Star
                  className={`w-6 h-6 ${
                    n <= rating
                      ? "fill-[#D4AF37] text-[#D4AF37]"
                      : "text-[#E8D8A7]"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Your thoughts on SweetNest…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-white rounded-lg px-3 py-2.5 border border-[#E8D8A7] focus:outline-none focus:border-[#5C1A0B] resize-none"
            data-testid="review-comment-input"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary rounded-full px-6 py-2.5 disabled:opacity-60"
            data-testid="review-submit-btn"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
};
