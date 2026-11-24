"use client";

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const { items, itemCount, updateItem, removeItem, clearCart, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center pt-24 pb-28">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 sm:pt-28 pb-32 px-4 sm:px-6 lg:px-8 selection:bg-brand-accent selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-accent transition-colors py-1 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workspace Selection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-outfit uppercase tracking-tighter text-white">
              Shopping <span className="text-brand-accent">Cart</span>
            </h1>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {itemCount} {itemCount === 1 ? "Item" : "Items"} in Selection
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-16 px-6 bg-[#111111] border border-white/10 rounded-3xl shadow-2xl my-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-gray-500 shadow-inner">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tight text-white mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 font-light leading-relaxed">
              You haven't added any ergonomic chairs or office seating systems to your selection yet. Explore our curated collections.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-brand-accent text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-accent/90 transition-all shadow-xl shadow-brand-accent/25 active:scale-95"
            >
              <span>Explore Products Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Item List */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 sm:p-6 bg-[#111111] border border-white/10 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 group hover:border-white/20 transition-all shadow-lg"
                  >
                    {/* Item Image */}
                    <div className="w-full sm:w-28 h-36 sm:h-28 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-gray-600" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent block mb-1">
                              {item.category}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold font-outfit text-white">
                              {item.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quantity & Notes */}
                      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                            <button
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Custom Notes */}
                      <div className="mt-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                          Specifications / Special Requirements
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ergonomic lumbar adjustments, custom upholstery, color"
                          value={item.notes || ""}
                          onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-accent transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
                <h3 className="text-base font-black font-outfit uppercase tracking-wider text-white pb-4 border-b border-white/10">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Total Items</span>
                    <span className="font-bold text-white">{itemCount} units</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Delivery Option</span>
                    <span className="font-bold text-green-400">Complimentary Pan-India</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Professional Assembly</span>
                    <span className="font-bold text-white">Included</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
                    <span>5-Year Comprehensive Warranty</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <Truck className="w-4 h-4 text-brand-accent shrink-0" />
                    <span>Free White-Glove Installation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-300">
                    <RotateCcw className="w-4 h-4 text-brand-accent shrink-0" />
                    <span>30-Day Ergonomic Comfort Trial</span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-brand-accent text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-brand-accent/25 hover:bg-brand-accent/90 transition-all active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[11px] text-gray-500 text-center font-light leading-relaxed">
                  GST invoices and corporate enterprise billing are finalized during checkout.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
