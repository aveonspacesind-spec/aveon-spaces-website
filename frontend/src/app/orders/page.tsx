"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  ShoppingBag,
  X,
} from "lucide-react";

// ─── Status Config ────────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Confirmed" | "In Progress" | "In Transit" | "Cancelled";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: any; step: number }
> = {
  Pending: {
    label: "Pending Review",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: Clock,
    step: 0,
  },
  Confirmed: {
    label: "Confirmed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    icon: CheckCircle2,
    step: 1,
  },
  "In Progress": {
    label: "In Progress",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
    icon: Package,
    step: 2,
  },
  "In Transit": {
    label: "In Transit",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
    icon: Truck,
    step: 3,
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: X,
    step: -1,
  },
};

const TIMELINE_STEPS: OrderStatus[] = ["Pending", "Confirmed", "In Progress", "In Transit"];

// ─── Order Timeline Component ─────────────────────────────────────────────────

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  const isCancelled = status === "Cancelled";

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute top-5 left-5 right-5 h-[2px] bg-white/5" />
      <div
        className="absolute top-5 left-5 h-[2px] bg-gradient-to-r from-brand-accent to-violet-500 transition-all duration-700"
        style={{
          width: isCancelled ? "0%" : `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
        }}
      />

      <div className="relative flex justify-between">
        {TIMELINE_STEPS.map((stepStatus, idx) => {
          const cfg = STATUS_CONFIG[stepStatus];
          const Icon = cfg.icon;
          const isComplete = !isCancelled && currentStep >= idx;
          const isCurrent = !isCancelled && currentStep === idx;

          return (
            <div key={stepStatus} className="flex flex-col items-center gap-3 z-10">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isComplete
                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                    : "bg-white/5 border-white/10 text-white/20"
                } ${isCurrent ? "shadow-lg shadow-current/20" : ""}`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest text-center ${
                  isComplete ? cfg.color : "text-white/20"
                }`}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Cancelled overlay */}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-3 bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-4"
        >
          <X className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm font-bold">
            This order has been cancelled. Please contact us if you have questions.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Order Card Component ─────────────────────────────────────────────────────

function OrderCard({ order }: { order: any }) {
  const rawStatus = (order.status as OrderStatus) || "Pending";
  const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG["Pending"];
  const StatusIcon = statusCfg.icon;

  const formattedDate = order.createdAt?.toDate
    ? new Date(order.createdAt.toDate()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const updatedDate = order.updatedAt?.toDate
    ? new Date(order.updatedAt.toDate()).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const customerName = order.customer?.name || order.name || "Customer";
  const customerEmail = order.customer?.email || order.email || "";
  const customerPhone = order.customer?.phone || order.phone || "";
  const customerCompany = order.customer?.company || order.company || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">
              Order Reference
            </p>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-widest text-white">
              {order.orderRef || "—"}
            </h2>
            <p className="text-xs text-white/40 mt-1">Placed on {formattedDate}</p>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color} self-start md:self-auto`}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{statusCfg.label}</span>
          </div>
        </div>

        {/* Timeline */}
        <OrderTimeline status={rawStatus} />

        {updatedDate && (
          <p className="text-[10px] text-white/20 mt-4 text-right">
            Last updated: {updatedDate}
          </p>
        )}

        {/* Admin Note */}
        {order.adminNote && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
              Note from Aveon Spaces
            </p>
            <p className="text-sm text-white/70 italic">"{order.adminNote}"</p>
          </div>
        )}
      </div>

      {/* Customer & Items */}
      <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact */}
        <div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-5">
            Contact Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/60 text-sm">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              {customerEmail}
            </div>
            {customerPhone && (
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                {customerPhone}
              </div>
            )}
            {customerCompany && (
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                {customerCompany}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-5">
            Items Ordered ({order.items?.length || 0})
          </p>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {order.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
              >
                {item.image && (
                  <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  {item.notes && (
                    <p className="text-[10px] text-white/40 truncate italic mt-0.5">{item.notes}</p>
                  )}
                </div>
                <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest shrink-0">
                  ×{item.quantity || 1}
                </span>
              </div>
            ))}
            {(!order.items || order.items.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20 uppercase tracking-widest">No items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page (Inner) ────────────────────────────────────────────────────────

function OrdersPageInner() {
  const searchParams = useSearchParams();
  const prefilledRef = searchParams.get("ref") || "";

  const [refInput, setRefInput] = useState(prefilledRef);
  const [emailInput, setEmailInput] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const unsubRef = useRef<(() => void) | null>(null);

  // Auto-search if prefilled ref from URL
  useEffect(() => {
    if (prefilledRef) {
      handleSearch(prefilledRef, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledRef]);

  const handleSearch = (ref?: string, email?: string) => {
    const searchRef = (ref ?? refInput).trim().toUpperCase();
    const searchEmail = (email ?? emailInput).trim().toLowerCase();

    if (!searchRef && !searchEmail) {
      setError("Please enter an Order Reference Number or Email address.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    // Unsubscribe previous listener
    if (unsubRef.current) {
      unsubRef.current();
    }

    // Build Firestore query
    let q;
    if (searchRef) {
      q = query(
        collection(db, "enquiries"),
        where("orderRef", "==", searchRef),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "enquiries"),
        where("email", "==", searchEmail),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // If email search, further filter by email in nested customer object
        const filtered =
          !searchRef && searchEmail
            ? docs.filter((d: any) => {
                const docEmail = (d.customer?.email || d.email || "").toLowerCase();
                return docEmail === searchEmail;
              })
            : docs;
        setOrders(filtered);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to fetch order details. Please try again.");
        setLoading(false);
      }
    );

    unsubRef.current = unsub;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-0 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 sm:mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.4em] mb-2 sm:mb-3">
            Aveon Spaces
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tighter leading-none mb-3 sm:mb-4">
            TRACK YOUR <span className="text-brand-accent">ORDER</span>
          </h1>
          <p className="text-white/40 text-xs sm:text-sm md:text-base max-w-[500px] leading-relaxed">
            Enter your Order Reference Number or email address to see the real-time
            status of your enquiry.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.03] border border-white/10 rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-8 mb-8 sm:mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                Order Reference Number
              </label>
              <input
                type="text"
                placeholder="AVN-2406-8471"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm font-bold tracking-widest focus:outline-none focus:border-brand-accent transition-all placeholder:text-white/20 placeholder:font-normal placeholder:tracking-normal"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">
                — or — Email Address
              </label>
              <input
                type="email"
                placeholder="john@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base md:text-sm focus:outline-none focus:border-brand-accent transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={() => handleSearch()}
            className="w-full py-4 bg-brand-accent text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#a81f1f] transition-colors shadow-lg shadow-red-900/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Track Order
              </>
            )}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searched && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {orders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem]"
                >
                  <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white/40 uppercase tracking-tight mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-white/20 text-sm max-w-[300px] mx-auto">
                    We couldn't find any orders matching your search. Please check the reference number or email address.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                  <p className="text-center text-white/20 text-xs uppercase tracking-widest pt-4">
                    Showing {orders.length} order{orders.length > 1 ? "s" : ""} · Updates in real-time
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info footer */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
          >
            {[
              {
                icon: Package,
                title: "Reference Number",
                desc: "Found in your submission confirmation (format: AVN-YYMM-XXXX)",
              },
              {
                icon: Clock,
                title: "Processing Time",
                desc: "Our team reviews enquiries within 24 business hours",
              },
              {
                icon: Truck,
                title: "Live Tracking",
                desc: "Status updates reflect in real-time as your order progresses",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white/60 mb-1">{item.title}</p>
                    <p className="text-[11px] text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Page with Suspense boundary (required for useSearchParams) ───────────────

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        </div>
      }
    >
      <OrdersPageInner />
    </Suspense>
  );
}
