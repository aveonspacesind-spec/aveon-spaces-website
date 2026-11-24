"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setIsVisible(latest > 0.05);
    });
  }, [scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group hover:bg-white/20 transition-all mix-blend-difference ${!isVisible && 'pointer-events-none'}`}
    >
      {/* SVG Progress Circle */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle 
          cx="50" cy="50" r="46" 
          fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="4" 
        />
        <motion.circle 
          cx="50" cy="50" r="46" 
          fill="none" stroke="var(--color-brand-accent)" strokeWidth="4" 
          strokeDasharray="289" // 2 * PI * 46 = 289.02
          style={{ pathLength: scrollYProgress }}
          strokeLinecap="round"
        />
      </svg>
      <ArrowUp className="w-5 h-5 text-white group-hover:-translate-y-1 transition-transform" />
    </motion.button>
  );
}
