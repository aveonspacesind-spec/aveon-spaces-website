"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, X, Plus, Minus, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from './CartContext';

export default function EnquiryFloatingButton() {
  const { 
    items, 
    itemCount, 
    removeItem, 
    updateItem, 
    isCartOpen, 
    setIsCartOpen,
  } = useCart();
  
  if (itemCount === 0 && !isCartOpen) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="hidden md:flex fixed bottom-8 right-8 z-[60] bg-brand-accent text-white p-4 rounded-2xl shadow-[0_20px_50px_color-mix(in srgb, var(--color-brand-accent) 30%, transparent)] items-center gap-3 group"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-white text-brand-accent text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {itemCount}
          </span>
        </div>
        <span className="font-bold text-sm pr-2 hidden md:block">My Cart</span>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
        )}
      </AnimatePresence>

      {/* Side Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            data-lenis-prevent="true"
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0E0E0E] text-white border-l border-white/10 z-[80] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black font-outfit text-white tracking-wide">
                    SHOPPING CART
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {itemCount} ITEM{itemCount === 1 ? '' : 'S'} IN CART
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 py-16">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-4 shadow-inner">
                    <ShoppingBag className="w-9 h-9 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold font-outfit text-white mb-2">Your Cart is Empty</h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-6 font-light leading-relaxed">
                    Explore our engineered seating collection and add chairs to your custom workspace selection.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 bg-brand-accent text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-[#141414] border border-white/10 rounded-2xl flex gap-3.5 group shadow-sm"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block truncate mb-0.5">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-brand-accent transition-colors p-1"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                            <button
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <textarea
                            placeholder="Add notes: finish, mesh, custom specs..."
                            value={item.notes || ''}
                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                            className="w-full p-2 bg-black/40 border border-white/10 rounded-lg text-[11px] text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-accent min-h-[48px] resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0A0A0A] shrink-0 space-y-2.5">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className={`w-full py-3.5 bg-brand-accent text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-brand-accent/25 hover:bg-brand-accent/90 transition-all ${
                  itemCount === 0 ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                Proceed to Checkout <Send className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-2.5 text-center text-gray-400 hover:text-white text-xs font-semibold uppercase tracking-wider block transition-colors"
              >
                View Detailed Cart Page
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
