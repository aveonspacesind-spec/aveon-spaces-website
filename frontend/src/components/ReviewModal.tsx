"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  
  const [formData, setFormData] = useState({
    author: '',
    role: '',
    company: '',
    quote: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "testimonials"), {
        ...formData,
        rating,
        status: 'pending',
        image: "", // Default avatar fallback
        createdAt: serverTimestamp(),
      });
      setStep('success');
      setFormData({ author: '', role: '', company: '', quote: '' });
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[210] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-2xl font-black font-outfit text-white tracking-tight">WRITE A REVIEW</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {step === 'form' ? (
                <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col items-center justify-center mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`transition-colors ${star <= rating ? 'text-brand-accent' : 'text-gray-600'}`}
                        >
                          <Star className="w-8 h-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="John Doe"
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full p-4 bg-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent border-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Company Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="Acme Corp"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full p-4 bg-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent border-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Your Role</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Operations Director"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-4 bg-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent border-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Your Review</label>
                    <textarea 
                      required
                      placeholder="Tell us about your experience with Aveon Spaces..."
                      value={formData.quote}
                      onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
                      className="w-full p-4 bg-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-accent border-none min-h-[120px] resize-none"
                    />
                  </div>
                </form>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black font-outfit text-white mb-2">Review Submitted!</h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
                    Thank you for your feedback. Your review has been submitted successfully.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
              {step === 'form' ? (
                <button 
                  form="review-form"
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-brand-accent text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent transition-colors shadow-lg shadow-brand-accent/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'} <Send className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setStep('form');
                    onClose();
                  }}
                  className="w-full py-4 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
