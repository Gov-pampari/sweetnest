import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { LOGO_URL } from "../lib/supabase";

export const Navbar = () => {
  const { count, setIsOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Home", to: "#hero" },
    { label: "Sweets", to: "#products" },
    { label: "Gift Box", to: "#giftbox" },
    { label: "Reviews", to: "#reviews" },
    { label: "Contact", to: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      data-testid="main-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled
          ? "backdrop-blur-xl bg-[#F5E6B8]/85 shadow-[0_4px_24px_-12px_rgba(92,26,11,0.25)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
          <img
            src={LOGO_URL}
            alt="SweetNest"
            className="h-12 md:h-14 w-auto object-contain select-none"
            draggable={false}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.to}
              className="text-[#5C1A0B] text-sm tracking-wide uppercase hover:text-[#D4AF37] transition-colors"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full hover:bg-[#5C1A0B]/10 transition"
            data-testid="open-cart-btn"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-6 h-6 text-[#5C1A0B]" />
            {count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-0.5 -right-0.5 bg-[#5C1A0B] text-[#F5E6B8] text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2 text-[#5C1A0B]"
            onClick={() => setOpen((o) => !o)}
            data-testid="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden bg-[#FAF6EA] border-t border-[#E8D8A7] px-4 py-4 space-y-3"
          data-testid="mobile-menu"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.to}
              onClick={() => setOpen(false)}
              className="block text-[#5C1A0B] text-base py-1"
              data-testid={`mobile-nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              nav("/admin/login");
            }}
            className="text-[#8A412A] text-sm underline"
            data-testid="mobile-admin-link"
          >
            Admin
          </button>
        </div>
      )}
    </motion.header>
  );
};
