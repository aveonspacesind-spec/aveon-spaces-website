"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { Suspense } from "react";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Package,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  Building2,
  Calendar,
  Mail,
  Phone,
  Layout,
  Truck,
  X,
  AlertTriangle,
  ShoppingBag,
  Save,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrintLabelButton } from "@/components/PrintLabelButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Confirmed" | "In Progress" | "In Transit" | "Completed" | "Cancelled";

interface Order {
  id: string;
  orderRef?: string;
  orderType?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  items: any[];
  status: OrderStatus;
  createdAt: any;
  updatedAt?: any;
  adminNote?: string;
  type?: string;
  productName?: string;
  notes?: string;
  quantity?: number;
  productId?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    company?: string;
    address?: {
      firstName?: string;
      lastName?: string;
      label?: string;
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
      altPhone?: string;
    } | string;
    message?: string;
  };
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  Pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: Clock,
  },
  Confirmed: {
    label: "Confirmed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: CheckCircle2,
  },
  "In Progress": {
    label: "In Progress",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    icon: Package,
  },
  "In Transit": {
    label: "In Transit",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    icon: Truck,
  },
  Completed: {
    label: "Completed",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: X,
  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];
const FILTER_TABS = ["All", ...ALL_STATUSES] as const;

// ─── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({
  current,
  onChange,
}: {
  current: OrderStatus;
  onChange: (s: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG["Pending"];
  const Icon = cfg.icon;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${cfg.bg} ${cfg.border} ${cfg.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-[#111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
          >
            {ALL_STATUSES.map((s) => {
              const c = STATUS_CONFIG[s];
              const SIcon = c.icon;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 ${
                    s === current ? `${c.color} ${c.bg}` : "text-white/50"
                  }`}
                >
                  <SIcon className="w-3.5 h-3.5" />
                  {c.label}
                  {s === current && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function OrdersAdminContent() {
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = searchParams.get("view") || "orders";
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<(typeof FILTER_TABS)[number]>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Order" | "Quote" | "Bulk Order">("All");

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && FILTER_TABS.includes(filterParam as any)) {
      setFilter(filterParam as any);
    } else {
      setFilter("All");
    }
  }, [searchParams]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(data);
      // Initialise admin notes state
      const notes: Record<string, string> = {};
      data.forEach((o) => {
        if (o.adminNote !== undefined) notes[o.id] = o.adminNote;
      });
      setAdminNotes((prev) => ({ ...notes, ...prev }));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, "enquiries", order.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      let orderTotal = 0;
      if (order.items && Array.isArray(order.items)) {
        orderTotal = order.items.reduce((sum, item) => {
          const price = parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || "0");
          return sum + (price * (item.quantity || 1));
        }, 0);
      }

      const customerName = order.customer?.name || order.name || "Customer";
      const customerEmail = order.customer?.email || order.email || "";

      // Trigger local Resend API for ALL status changes
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderRef || order.id,
          status: newStatus.toLowerCase(),
          customerName: customerName,
          customerEmail: customerEmail,
          orderTotal: orderTotal.toString(),
          orderDate: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : new Date().toLocaleString()
        })
      }).then(res => {
        if(res.ok) {
          toast.success(`Status updated and email triggered to ${customerEmail}!`);
        } else {
          toast.error("Status updated, but email webhook failed.");
        }
      }).catch(err => {
        console.error("Webhook error:", err);
        toast.error("Webhook error: Could not trigger email.");
      });

    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const saveAdminNote = async (orderId: string) => {
    setSavingNote(orderId);
    await updateDoc(doc(db, "enquiries", orderId), {
      adminNote: adminNotes[orderId] || "",
      updatedAt: serverTimestamp(),
    });
    setSavingNote(null);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ message: "Are you sure you want to delete this item?" })) {
      await deleteDoc(doc(db, "enquiries", id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const name = (o.customer?.name || o.name || "").toLowerCase();
    const email = (o.customer?.email || o.email || "").toLowerCase();
    const company = (o.customer?.company || o.company || "").toLowerCase();
    const ref = (o.orderRef || "").toLowerCase();
    const oType = o.orderType || o.type || (o.orderRef?.startsWith("QT") ? "Quote" : o.orderRef?.startsWith("BLK") ? "Bulk Order" : "Order");

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase()) ||
      ref.includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "All" || o.status === filter ||
      // Fallback: treat missing status as Pending
      (filter === "Pending" && !o.status);

    const matchesType =
      typeFilter === "All" || oType === typeFilter;
      
    const isContactMessage = o.orderType === "Contact" || (!o.items?.length && !o.productName && !o.orderRef);
    if (view === "contact" && !isContactMessage) return false;
    if (view === "orders" && isContactMessage) return false;

    return matchesSearch && matchesFilter && matchesType;
  });

  // Counts per status for badges (respecting Type filter)
  const counts = orders.reduce<Record<string, number>>(
    (acc, o) => {
      const oType = o.orderType || o.type || (o.orderRef?.startsWith("QT") ? "Quote" : o.orderRef?.startsWith("BLK") ? "Bulk Order" : "Order");
      if (typeFilter !== "All" && oType !== typeFilter) return acc;
      
      const isContactMessage = o.orderType === "Contact" || (!o.items?.length && !o.productName && !o.orderRef);
      if (view === "contact" && !isContactMessage) return acc;
      if (view === "orders" && isContactMessage) return acc;

      const s = o.status || "Pending";
      acc[s] = (acc[s] || 0) + 1;
      acc["All"] = (acc["All"] || 0) + 1;
      return acc;
    },
    { All: 0 }
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {view === "contact" ? "Customer Messages" : "Orders & Quotes"}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {view === "contact" 
              ? "Read and respond to inquiries from the contact form." 
              : "Review orders, update fulfillment status, and print shipping labels."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-300">
              {orders.length} {view === "contact" ? "Messages" : "Orders"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-accent/15 flex items-center justify-center text-brand-accent">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 space-y-4">
        {/* Search & Type Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, company or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all placeholder:text-neutral-500"
            />
          </div>

          {view !== "contact" && (
            <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-white/10 w-fit">
              {[
                { id: "All", label: "All Types" },
                { id: "Order", label: "Orders" },
                { id: "Quote", label: "Quotes" },
                { id: "Bulk Order", label: "Bulk" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t.id
                      ? "bg-brand-accent text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
          {FILTER_TABS.map((f) => {
            const isActive = filter === f;
            const count = counts[f] || 0;
            return (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  const newParams = new URLSearchParams(searchParams.toString());
                  if (f === "All") newParams.delete("filter");
                  else newParams.set("filter", f);
                  router.push(`${pathname}?${newParams.toString()}`);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isActive
                    ? "bg-brand-accent text-white border-brand-accent shadow-sm"
                    : "bg-white/5 text-neutral-400 border-transparent hover:text-white hover:bg-white/10"
                }`}
              >
                {f}
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem]"
            >
              <AlertTriangle className="w-10 h-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-black uppercase tracking-widest text-sm">
                No items found
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredOrders.map((order) => {
          const rawStatus = (order.status as OrderStatus) || "Pending";
          const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG["Pending"];

          const displayName = order.customer?.name || order.name || "Anonymous";
          const displayCompany = order.customer?.company || order.company || "Individual Lead";
          const displayEmail = order.customer?.email || order.email || "";
          const displayPhone = order.customer?.phone || order.phone || "";
          const displayMsg = order.customer?.message || order.message || order.notes || "";
          const displayAddress = order.customer?.address || null;
          const orderType = order.orderType || order.type || (order.orderRef?.startsWith("QT") ? "Quote" : order.orderRef?.startsWith("BLK") ? "Bulk Order" : "Order");

          const date = order.createdAt?.toDate
            ? new Date(order.createdAt.toDate()).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Just now";

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className={`bg-white/5 border rounded-[2rem] transition-all ${
                selectedId === order.id
                  ? "border-brand-accent/30 shadow-2xl"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              {/* Row */}
              <div
                onClick={() =>
                  setSelectedId(selectedId === order.id ? null : order.id)
                }
                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 ${statusCfg.bg} ${statusCfg.color}`}
                  >
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-black font-outfit text-white uppercase tracking-tight">
                        {displayName}
                      </h3>
                      {order.orderRef && (
                        <span className="text-[9px] font-black text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-lg tracking-widest uppercase">
                          {order.orderRef}
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                        orderType === "Quote"
                          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          : orderType === "Bulk Order"
                          ? "text-violet-400 bg-violet-400/10 border-violet-400/20"
                          : "text-red-400 bg-red-400/10 border-red-400/20"
                      }`}>
                        {orderType === "Quote" ? <FileText className="w-2.5 h-2.5" /> : orderType === "Bulk Order" ? <Package className="w-2.5 h-2.5" /> : <ShoppingBag className="w-2.5 h-2.5" />}
                        {orderType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> {displayCompany}
                      </span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status + Actions */}
                <div
                  className="flex items-center gap-4 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StatusDropdown
                    current={rawStatus}
                    onChange={(s) => updateStatus(order, s)}
                  />

                  <div className="h-8 w-[1px] bg-white/5 hidden md:block" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order.id);
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronDown
                    className={`w-4 h-4 text-white/20 transition-transform ${
                      selectedId === order.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {selectedId === order.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="bg-black/40 border-t border-white/5 overflow-hidden rounded-b-[2rem]"
                  >
                    <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                      {/* Contact */}
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                            Contact Details
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                              <Mail className="w-4 h-4 text-brand-accent shrink-0" />
                              {displayEmail || "N/A"}
                            </div>
                            <div className="flex items-center gap-3 text-white/60 text-sm">
                              <Phone className="w-4 h-4 text-brand-accent shrink-0" />
                              {displayPhone || "N/A"}
                            </div>
                          </div>
                        </div>

                        {displayAddress ? (
                          <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                              Shipping Address
                            </p>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                              {typeof displayAddress === 'object' ? (
                                <>
                                  <p className="text-white/80 font-bold text-sm">
                                    {displayAddress.firstName} {displayAddress.lastName} 
                                    {displayAddress.label && <span className="ml-2 px-2 py-0.5 bg-white/10 text-white/50 text-[10px] rounded uppercase tracking-widest">{displayAddress.label}</span>}
                                  </p>
                                  <p className="text-white/60 text-xs">{displayAddress.street}</p>
                                  <p className="text-white/60 text-xs">{displayAddress.city}, {displayAddress.state} {displayAddress.postalCode}</p>
                                  <p className="text-white/60 text-xs">{displayAddress.country}</p>
                                  {displayAddress.phone && <p className="text-white/60 text-xs mt-1"><span className="text-white/80 font-medium">Phone:</span> {displayAddress.phone}</p>}
                                  {displayAddress.altPhone && <p className="text-white/60 text-xs"><span className="text-white/80 font-medium">Alt Phone:</span> {displayAddress.altPhone}</p>}
                                </>
                              ) : (
                                <p className="text-white/80 text-sm">{displayAddress}</p>
                              )}
                            </div>
                          </div>
                        ) : displayMsg ? (
                          <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                              {orderType === "Quote" ? "Quote Specifications" : "Message / Address"}
                            </p>
                            <p className="text-white/70 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                              "{displayMsg}"
                            </p>
                          </div>
                        ) : null}

                        {/* Admin Note */}
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">
                            Admin Note
                          </p>
                          <textarea
                            placeholder="Add internal note (not visible to customer)..."
                            value={adminNotes[order.id] ?? order.adminNote ?? ""}
                            onChange={(e) =>
                               setAdminNotes((prev) => ({
                                 ...prev,
                                 [order.id]: e.target.value,
                               }))
                            }
                            className="w-full p-3 bg-white/5 rounded-xl text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-brand-accent/50 min-h-[80px] resize-none border border-white/5"
                          />
                          <button
                            onClick={() => saveAdminNote(order.id)}
                            disabled={savingNote === order.id}
                            className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-brand-accent/20 rounded-lg text-white/40 hover:text-brand-accent transition-all"
                          >
                            <Save className="w-3 h-3" />
                            {savingNote === order.id ? "Saving..." : "Save Note"}
                          </button>
                        </div>
                        
                        {/* Shipping Label Generator */}
                        <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">
                            Fulfillment
                          </p>
                          <PrintLabelButton order={order} />
                        </div>
                      </div>

                      {/* Items */}
                      <div className="lg:col-span-2">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">
                          {orderType === "Quote" ? "Requested Categories" : orderType === "Bulk Order" ? "Requested Product" : `Ordered Items (${order.items?.length || 0})`}
                        </p>
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                          {(orderType === "Bulk Order" && order.productName) ? (
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-[#111] border border-white/5 flex items-center justify-center shrink-0">
                                  <Package className="w-6 h-6 text-violet-400/50" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{order.productName}</p>
                                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                    Product ID: {order.productId || "N/A"}
                                  </p>
                                  {order.notes && (
                                    <p className="text-[9px] text-white/30 italic mt-0.5">
                                      {order.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                                ×{order.quantity || 1}
                              </span>
                            </div>
                          ) : (
                            order.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                              >
                                <div className="flex items-center gap-4">
                                  {item.image && (
                                    <div className="w-12 h-12 rounded-lg bg-[#111] border border-white/5 overflow-hidden shrink-0">
                                      <img
                                        src={item.image}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs font-bold text-white">{item.name}</p>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                      {item.category}
                                    </p>
                                    {item.notes && (
                                      <p className="text-[9px] text-white/30 italic mt-0.5">
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">
                                  ×{item.quantity || 1}
                                </span>
                              </div>
                            ))
                          )}
                          {orderType !== "Bulk Order" && (!order.items || order.items.length === 0) && (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                              <Layout className="w-8 h-8 text-white/10 mx-auto mb-3" />
                              <p className="text-xs font-bold text-white/20 uppercase tracking-widest">
                                No items specified
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersAdminPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white/50 text-sm">Loading...</div>}>
      <OrdersAdminContent />
    </Suspense>
  );
}
