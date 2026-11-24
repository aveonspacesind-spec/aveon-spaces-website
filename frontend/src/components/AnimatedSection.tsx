"use client";

import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from "framer-motion";
import { ReactNode, useRef, useEffect } from "react";

// Number Counter Animation Component
export function AnimatedCounter({ value, duration = 2 }: { value: number, duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(Math.floor(latest));
      }
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

// Text Reveal Component (Slides up from invisible mask)
export function TextReveal({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  return (
    <div ref={ref} className="overflow-hidden inline-block relative">
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none" | "stagger" | "reveal";
  once?: boolean;
}

export default function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up",
  once = true
}: AnimatedSectionProps) {
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const getVariants = () => {
    switch(direction) {
      case "up": return { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } };
      case "none": return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      case "stagger": 
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: delay
            }
          }
        };
      case "reveal":
        return {
          hidden: { opacity: 0, clipPath: "inset(100% 0 0 0)" },
          visible: { opacity: 1, clipPath: "inset(0% 0 0 0)" }
        };
      default: return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.8, delay: delay, ease: [0.16, 1, 0.3, 1] }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Sub-component for Stagger items
export function AnimatedItem({ children, className = "", direction = "up" }: { children: ReactNode, className?: string, direction?: "up"|"left"|"right" }) {
  const getVariants = () => {
    switch(direction) {
      case "up": return { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } };
    }
  };

  return (
    <motion.div variants={getVariants()} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// Parallax Image Component
export function ParallaxImage({ src, alt, className = "", style = {} }: { src?: string, alt: string, className?: string, style?: React.CSSProperties }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const hasPositionClass = /\b(relative|absolute|fixed|sticky)\b/.test(className);
  const finalStyle = {
    position: (hasPositionClass ? undefined : "relative") as any,
    ...style,
  };

  const validSrc = src && src.trim() !== "" ? src : null;

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`} style={finalStyle}>
      {validSrc ? (
        <motion.img 
          src={validSrc} 
          alt={alt} 
          style={{ y, scale: 1.15 }} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
      )}
    </div>
  );
}
