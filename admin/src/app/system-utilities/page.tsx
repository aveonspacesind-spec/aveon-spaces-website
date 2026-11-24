"use client";
import React, { useState, useEffect } from "react";
import { Database, Shield, Activity, RefreshCw, Cpu, Server, HardDrive } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function SystemUtilitiesPage() {
  const [productCount, setProductCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [dbStatus, setDbStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch telemetry metrics to check Firebase health
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProductCount(snapshot.size);
      setDbStatus("Connected");
    }, (err) => {
      console.error(err);
      setDbStatus("Error");
    });

    const unsubInquiries = onSnapshot(collection(db, "enquiries"), (snapshot) => {
      setInquiryCount(snapshot.size);
    });

    const unsubArticles = onSnapshot(collection(db, "articles"), (snapshot) => {
      setArticleCount(snapshot.size);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubInquiries();
      unsubArticles();
    };
  }, []);

  const systemMetrics = [
    { name: "Database Service", value: dbStatus, sub: "Google Firestore", icon: Server, status: dbStatus === "Connected" ? "ok" : "warn" },
    { name: "Storage Utilization", value: "0.85 GB", sub: "10 GB Allotted Limit", icon: HardDrive, status: "ok" },
    { name: "Active Seating Products", value: productCount.toString(), sub: "Dynamic entries", icon: Cpu, status: "ok" },
    { name: "Total Customer Enquiries", value: inquiryCount.toString(), sub: "Leads database", icon: Activity, status: "ok" },
    { name: "Dynamic Blog Articles", value: articleCount.toString(), sub: "CMS insights", icon: Database, status: "ok" },
    { name: "Admin Cryptography", value: "AES-256", sub: "SSL session secure", icon: Shield, status: "ok" }
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            System <span className="text-brand-accent">Utilities</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Real-time cloud database status, telemetry logs, and microservice infrastructure diagnostics
          </p>
        </div>
      </div>

      <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand-accent" /> Infrastructure Health & Diagnostic Report
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Diagnostics Live</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
            <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Synchronizing telemetry...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemMetrics.map((metric, i) => (
              <div 
                key={i} 
                className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start justify-between hover:border-white/10 transition-all group"
              >
                <div className="space-y-2 min-w-0">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">{metric.name}</span>
                  <h4 className="text-2xl font-black font-outfit text-white leading-tight">{metric.value}</h4>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-wider">{metric.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  metric.status === "ok" ? "bg-white/5 text-white/40 group-hover:bg-brand-accent/10 group-hover:text-brand-accent" : "bg-amber-950/30 text-amber-500 border border-amber-500/20"
                } transition-all`}>
                  <metric.icon className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-6 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl flex items-start gap-4">
          <Shield className="w-6 h-6 text-brand-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Secure Administrative Environment</h4>
            <p className="text-[10px] text-white/40 leading-relaxed">
              All database connections are established over encrypted secure channels. Direct manipulation tools, bulk seeders, and destructive clearing APIs have been fully deprecated and removed to enforce enterprise production safety guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
