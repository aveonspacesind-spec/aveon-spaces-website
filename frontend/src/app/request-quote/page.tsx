"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
} from "lucide-react";

// Generate a unique quote reference: QT-YYMM-XXXX
function generateQuoteRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `QT-${yy}${mm}-${rand}`;
}

export default function RequestQuotePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    category: "Task Chairs",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteRef, setQuoteRef] = useState("");
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ref = generateQuoteRef();

    try {
      await addDoc(collection(db, "enquiries"), {
        orderRef: ref,
        orderType: "Quote",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        message: formData.message,
        items: [
          {
            name: `Quote Request: ${formData.category}`,
            category: formData.category,
            quantity: 1,
            notes: formData.message,
          }
        ],
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNote: "",
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          message: formData.message,
        }
      });

      setQuoteRef(ref);
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting quote request:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quoteRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="bg-[#050505] min-h-screen text-white font-sans relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-0 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 sm:mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header */}
              <div className="mb-8 sm:mb-12">
                <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-2 sm:mb-3">
                  Aveon Spaces
                </p>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tighter leading-none mb-3 sm:mb-4 uppercase">
                  Request a <span className="text-brand-accent">Quote</span>
                </h1>
                <p className="text-white/40 text-xs sm:text-sm md:text-base max-w-[500px] leading-relaxed">
                  Provide your project details and seating preferences. A workspace specialist will deliver a tailored quotation within 24 hours.
                </p>
              </div>

              {/* Form Grid */}
              <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                      Work Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                      Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                      Company Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                    Product Interest Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="Task Chairs">Task Chairs (Aura, Aeromesh, etc.)</option>
                    <option value="Executive Chairs">Executive Chairs (ErgoPro, etc.)</option>
                    <option value="Lounge Seating">Lounge & Reception Seating</option>
                    <option value="Ergonomic Accessories">Ergonomic Accessories</option>
                    <option value="Custom Office Projects">Custom Office Projects (Bulk Seating)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                    Project Details / Custom Specifications
                  </label>
                  <textarea
                    required
                    placeholder="Tell us about the quantity, dimensions, materials, or custom layout requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all min-h-[140px]"
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-4 bg-brand-accent hover:bg-[#a81f1f] text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-colors shadow-lg shadow-red-900/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Quote Request
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 text-center max-w-lg mx-auto"
            >
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-black font-outfit mb-3 uppercase">Quote Request Filed!</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                Your workspace quote request has been logged. Our commercial consultants will reach out to you within 24 hours.
              </p>

              {/* Quote Ref Card */}
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-2xl p-5 mb-8">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <FileText className="w-4 h-4 text-brand-accent" />
                  <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest">Quote Reference</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black font-outfit tracking-widest text-white">{quoteRef}</span>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white/5 hover:bg-brand-accent/10 transition-colors"
                    title="Copy reference number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-white/30 mt-2">Save this reference to track your quote request</p>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/orders?ref=${quoteRef}`}
                  className="w-full py-4 bg-brand-accent hover:bg-[#a81f1f] text-white font-black rounded-xl text-xs uppercase tracking-widest text-center transition-colors shadow-lg shadow-brand-accent/20"
                >
                  Track Quote Status →
                </Link>
                <Link
                  href="/"
                  className="w-full py-4 bg-white/5 text-gray-400 font-black rounded-xl text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
