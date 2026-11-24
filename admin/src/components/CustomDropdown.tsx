"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Option",
  label,
  className = ""
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-sm flex items-center justify-between transition-all hover:bg-white/10 ${isOpen ? 'border-brand-accent/50 ring-1 ring-brand-accent/20' : ''}`}
      >
        <span className={!selectedOption ? "text-white/20" : "text-white font-bold"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[300] left-0 right-0 mt-3 bg-[#0F0F0F] border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hide py-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-6 py-3.5 flex items-center justify-between text-sm transition-all hover:bg-white/5 group ${value === option.value ? 'bg-brand-accent/10 text-white' : 'text-white/60'}`}
                  >
                    <span className={`font-bold transition-colors ${value === option.value ? 'text-brand-accent' : 'group-hover:text-white'}`}>
                      {option.label}
                    </span>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-brand-accent" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-6 py-4 text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No options found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
