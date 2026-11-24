"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, useSpring, useTransform, animate } from "framer-motion";

interface CounterProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
}

export default function Counter({ value, duration = 2, delay = 0, suffix = "" }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        const controls = animate(0, value, {
          duration: duration,
          ease: "easeOut",
          onUpdate(value) {
            setDisplayValue(Math.round(value));
          },
        });
        return () => controls.stop();
      }, delay * 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, value, duration, delay]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
