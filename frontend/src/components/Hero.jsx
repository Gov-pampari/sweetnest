import React from "react";
import { motion } from "framer-motion";
import { FloatingSweets } from "./FloatingSweets";
import { LOGO_URL } from "../lib/supabase";

export const Hero = () => {
  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden grain"
      style={{
        background:
          "radial-gradient(ellipse at top, #FAF6EA 0%, #F5E6B8 50%, #EBD79A 100%)",
      }}
    >
      <FloatingSweets />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotateX: -20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
          className="inline-block"
        >
          <img
            src={LOGO_URL}
            alt="SweetNest - The Taste of Tradition"
            data-testid="hero-logo"
            className="w-64 sm:w-80 md:w-[28rem] lg:w-[32rem] h-auto mx-auto drop-shadow-[0_30px_50px_rgba(92,26,11,0.35)]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-[#8A412A] italic font-serif"
          data-testid="hero-tagline"
        >
          Hand-crafted Indian sweets, delivered with tradition.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#products"
            className="btn-primary px-8 py-3.5 rounded-full text-base font-medium tracking-wide inline-flex items-center gap-2"
            data-testid="hero-shop-btn"
          >
            Explore Sweets
          </a>
          <a
            href="#contact"
            className="px-8 py-3.5 rounded-full text-base font-medium tracking-wide border-2 border-[#5C1A0B] text-[#5C1A0B] hover:bg-[#5C1A0B] hover:text-[#F5E6B8] transition"
            data-testid="hero-contact-btn"
          >
            Visit Our Shop
          </a>
        </motion.div>
      </div>

      {/* bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#F5E6B8] z-10 pointer-events-none" />
    </section>
  );
};
