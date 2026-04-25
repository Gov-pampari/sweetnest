import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SWEETS = [
  { url: "https://images.pexels.com/photos/10514163/pexels-photo-10514163.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250", top: "8%",  left: "6%",  size: 90,  delay: 0 },
  { url: "https://images.pexels.com/photos/15014918/pexels-photo-15014918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250", top: "20%", left: "82%", size: 110, delay: 1.2 },
  { url: "https://images.pexels.com/photos/28437003/pexels-photo-28437003.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250", top: "62%", left: "4%",  size: 100, delay: 0.6 },
  { url: "https://images.pexels.com/photos/14723140/pexels-photo-14723140.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250", top: "70%", left: "86%", size: 95,  delay: 1.8 },
  { url: "https://images.pexels.com/photos/36551398/pexels-photo-36551398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250", top: "40%", left: "12%", size: 75,  delay: 2.2 },
  { url: "https://images.pexels.com/photos/5864767/pexels-photo-5864767.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=250&w=250",  top: "48%", left: "78%", size: 80,  delay: 0.9 },
];

export const FloatingSweets = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {SWEETS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full overflow-hidden shadow-[0_20px_40px_-15px_rgba(92,26,11,0.45)] ring-4 ring-[#FAF6EA]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            x: mouse.x * (i % 2 === 0 ? -20 : 20),
            y: mouse.y * (i % 2 === 0 ? 15 : -15),
          }}
          animate={{ y: [0, -18, 0], rotate: [0, 5, -3, 0] }}
          transition={{
            duration: 6 + (i % 3),
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src={s.url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
};
