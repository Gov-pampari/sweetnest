import React from "react";
import { Link } from "react-router-dom";
import { LOGO_URL } from "../lib/supabase";

export const Footer = () => {
  return (
    <footer
      data-testid="footer"
      className="bg-[#5C1A0B] text-[#F5E6B8] pt-14 pb-8 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <img
            src={LOGO_URL}
            alt="SweetNest"
            className="h-24 w-auto brightness-125 mb-3"
            data-testid="footer-logo"
          />
          <p className="text-sm text-[#F5E6B8]/80 max-w-xs">
            Hand-crafted Indian sweets, delivered with tradition.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-2xl mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-[#F5E6B8]/80">
            <li key="home"><a href="#hero" className="hover:text-[#D4AF37]">Home</a></li>
            <li key="sweets"><a href="#products" className="hover:text-[#D4AF37]">Sweets</a></li>
            <li key="reviews"><a href="#reviews" className="hover:text-[#D4AF37]">Reviews</a></li>
            <li key="contact"><a href="#contact" className="hover:text-[#D4AF37]">Contact</a></li>
            <li key="admin">
              <Link to="/admin/login" className="hover:text-[#D4AF37]" data-testid="footer-admin-link">
                Admin
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-2xl mb-3">Reach Us</h4>
          <ul className="space-y-2 text-sm text-[#F5E6B8]/80">
            <li key="address">1-1-27, beside R9000,<br />Malkajgiri X Road, Hyderabad 500047</li>
            <li key="phone1">+91 95337 26951</li>
            <li key="phone2">+91 91005 45087</li>
            <li key="email">sweetnestmalkajgiri@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#F5E6B8]/20 text-xs text-[#F5E6B8]/60 flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} SweetNest — The Taste of Tradition</span>
        <span>Crafted with love · Orders via WhatsApp</span>
      </div>
    </footer>
  );
};
