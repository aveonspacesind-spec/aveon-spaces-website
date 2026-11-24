"use client";

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  ArrowRight,
  Globe,
  Star,
  Layers,
  Truck,
  X
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import Link from 'next/link';

type OrderStatus = "Pending" | "Confirmed" | "In Progress" | "In Transit" | "Completed" | "Cancelled";

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
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
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

export default function Dashboard() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Product Count
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProductCount(snapshot.size);
    });

    // 2. Fetch Orders & Status Counts
    const unsubOrders = onSnapshot(collection(db, "enquiries"), (snapshot) => {
      setOrderCount(snapshot.size);
      let pending = 0;
      let completed = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.status || "Pending";
        if (status === "Pending") pending++;
        if (status === "Completed") completed++;
      });
      setPendingCount(pending);
      setCompletedCount(completed);
    });

    // 3. Fetch Recent Orders
    const qOrders = query(collection(db, "enquiries"), orderBy("createdAt", "desc"), limit(5));
    const unsubRecent = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentOrders(data);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubRecent();
    };
  }, []);

  const stats = [
    { 
      label: "Total Products", 
      value: productCount.toString(), 
      subtitle: "Active in catalog",
      icon: Package, 
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/products"
    },
    { 
      label: "Total Orders & Quotes", 
      value: orderCount.toString(), 
      subtitle: "All received",
      icon: ShoppingBag, 
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/orders"
    },
    { 
      label: "Pending Inquiries", 
      value: pendingCount.toString(), 
      subtitle: "Requires attention",
      icon: Clock, 
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      href: "/orders?filter=Pending"
    },
    { 
      label: "Completed Orders", 
      value: completedCount.toString(), 
      subtitle: "Fulfilled successfully",
      icon: CheckCircle2, 
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      href: "/orders?filter=Completed"
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Overview of your store catalog, orders, and customer messages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link 
            key={stat.label}
            href={stat.href}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-neutral-400">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <p className="text-xs text-neutral-400">{stat.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content: Recent Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Orders and Quotes</h2>
              <p className="text-xs text-neutral-400">Latest customer orders submitted online</p>
            </div>
            <Link 
              href="/orders" 
              className="text-sm font-semibold text-brand-accent hover:text-red-400 inline-flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentOrders.length > 0 ? (
              recentOrders.map((item) => {
                const displayName = item.customer?.name || item.name || "Customer";
                const displayCompany = item.customer?.company || item.company;
                const rawStatus = (item.status as OrderStatus) || "Pending";
                const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG["Pending"];
                const itemCount = item.items?.length || 1;
                const orderDate = item.createdAt?.toDate 
                  ? new Date(item.createdAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently";

                return (
                  <Link
                    key={item.id}
                    href="/orders"
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{displayName}</span>
                          {item.orderRef && (
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                              #{item.orderRef}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {displayCompany ? `${displayCompany} • ` : ""}{itemCount} {itemCount === 1 ? "item" : "items"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs text-neutral-400 hidden sm:inline-block">
                        {orderDate}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-12 text-neutral-400 text-sm">
                No orders received yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Shortcuts */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            <p className="text-xs text-neutral-400">Frequently used shortcuts</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/products/new"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Add New Product</div>
                  <div className="text-xs text-neutral-400">Upload chair or seating item</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/orders?view=contact"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Customer Messages</div>
                  <div className="text-xs text-neutral-400">View contact form inquiries</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/settings"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Edit Homepage</div>
                  <div className="text-xs text-neutral-400">Change banners and text</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/reviews"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Customer Reviews</div>
                  <div className="text-xs text-neutral-400">Approve or reply to feedback</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/products"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Product Inventory</div>
                  <div className="text-xs text-neutral-400">Edit prices, images & details</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
