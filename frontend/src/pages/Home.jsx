import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ProductsSection } from "../components/ProductsSection";
import { GiftBoxBuilder } from "../components/GiftBoxBuilder";
import { ReviewsSection } from "../components/ReviewsSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5E6B8]" data-testid="home-page">
      <Navbar />
      <Hero />
      <ProductsSection />
      <GiftBoxBuilder />
      <ReviewsSection />
      <ContactSection />
      <Footer />
      <CartDrawer />
    </div>
  );
}
