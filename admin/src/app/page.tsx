"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingBag,
  ExternalLink,
  Shield,
  Activity,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  X
} from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from 'next/link';

type OrderStatus = "Pending" | "Confirmed" | "In Progress" | "In Transit" | "Cancelled";

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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Product Count
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProductCount(snapshot.size);
    });

    // Fetch Order Count
    const unsubOrders = onSnapshot(collection(db, "enquiries"), (snapshot) => {
      setOrderCount(snapshot.size);
    });

    // Fetch Recent Orders
    const qOrders = query(collection(db, "enquiries"), orderBy("createdAt", "desc"), limit(4));
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
    { label: "Total Products", value: productCount.toString(), trend: "Live", up: true, icon: Package },
    { label: "Client Orders", value: orderCount.toString(), trend: "Live", up: true, icon: ShoppingBag },
    { label: "Storage Used", value: "0.8 GB", trend: "Normal", up: true, icon: Activity },
    { label: "Admin Status", value: "Secure", trend: "Active", up: true, icon: Shield },
  ];

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Admin <span className="text-brand-accent">Dashboard</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Overview of system activity • <span className="text-brand-accent">Real-time Updates</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-[#050505] bg-[#111] flex items-center justify-center text-[10px] font-black text-white/40">
                U{i}
              </div>
            ))}
          </div>
          <button className="px-8 py-4 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:border-white/10 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-accent group-hover:text-white transition-all">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 ${
                stat.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/40 bg-white/5'
              }`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
            <h3 className="text-3xl font-black font-outfit text-white tracking-tighter relative z-10">{stat.value}</h3>
            
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <stat.icon className="w-24 h-24 text-white" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[3rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-white">Recent Orders</h3>
            </div>
            <Link 
              href="/orders"
              className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-brand-accent transition-colors"
            >
              View All Orders
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((item, i) => {
                const displayName = item.customer?.name || item.name || "Anonymous";
                const displayCompany = item.customer?.company || item.company || 'Individual';
                const rawStatus = (item.status as OrderStatus) || "Pending";
                const statusCfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG["Pending"];

                return (
                  <Link 
                    key={item.id} 
                    href="/orders"
                    className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white font-black italic text-xs group-hover:border-brand-accent/30 transition-all ${statusCfg.bg} ${statusCfg.color}`}>
                        {displayName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                          {displayName}
                          {item.orderRef && (
                            <span className="text-[9px] font-black text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded-lg tracking-widest uppercase">
                              {item.orderRef}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
                          {displayCompany} • {item.items?.length || 0} Item{item.items?.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest hidden md:block">
                        {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </span>
                      <button className="w-10 h-10 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white hover:bg-brand-accent transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-xs font-black text-white/20 uppercase tracking-widest">No recent orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM LOGS */}
        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col">
          <h3 className="text-xl font-black font-outfit uppercase tracking-tight mb-8 text-white">System Logs</h3>
          <div className="space-y-8 flex-1">
            <div className="text-center py-20 border border-dashed border-white/5 rounded-[2rem]">
              <p className="text-xs font-black text-white/20 uppercase tracking-widest">No recent system events</p>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Download Audit Report
          </button>
        </div>
      </div>
    </div>
  );
}
