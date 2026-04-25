import React from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { WHATSAPP_NUMBER, ADMIN_EMAIL } from "../lib/supabase";

export const ContactSection = () => {
  const address =
    "1-1-27, beside R9000, Malkajgiri X Road, Hyderabad, Telangana 500047, India";
  const phoneDisplay = "+91 95337 26951";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    address
  )}&output=embed`;

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="py-20 md:py-28 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#8A412A]">
            Visit or Order
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl text-[#5C1A0B]">
            Find Us
          </h2>
          <div className="w-16 h-[2px] bg-[#D4AF37] mx-auto mt-5" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-[#FAF6EA] rounded-2xl p-8 border border-[#E8D8A7] space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5C1A0B] text-[#F5E6B8] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8A412A]">Address</p>
                <p className="font-serif text-xl text-[#5C1A0B]" data-testid="contact-address">
                  {address}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5C1A0B] text-[#F5E6B8] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8A412A]">Phone</p>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="font-serif text-xl text-[#5C1A0B] hover:text-[#D4AF37]"
                  data-testid="contact-phone"
                >
                  {phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#5C1A0B] text-[#F5E6B8] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8A412A]">Email</p>
                <a
                  href={`mailto:${ADMIN_EMAIL}`}
                  className="font-serif text-xl text-[#5C1A0B] hover:text-[#D4AF37] break-all"
                  data-testid="contact-email"
                >
                  {ADMIN_EMAIL}
                </a>
              </div>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20SweetNest!`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1EBE57] text-white rounded-full py-3 font-medium transition"
              data-testid="contact-whatsapp-btn"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#E8D8A7] min-h-[340px]">
            <iframe
              title="SweetNest location"
              src={mapSrc}
              width="100%"
              height="100%"
              className="min-h-[340px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="google-map"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
