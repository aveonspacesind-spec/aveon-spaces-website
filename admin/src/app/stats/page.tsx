"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BarChart, Save, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function StatsCMSPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for stats config
  const [statsConfig, setStatsConfig] = useState([
    { label: "Satisfied Clients", value: 5000, suffix: "+" },
    { label: "Projects Completed", value: 12000, suffix: "+" },
    { label: "Retention Rate", value: 98, suffix: "%" },
    { label: "Cities Covered", value: 45, suffix: "+" }
  ]);

  useEffect(() => {
    setIsLoading(true);
    // Listen to changes on the "general" document in site_config
    const unsubGeneral = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.stats) {
          setStatsConfig(data.stats);
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading stats config:", error);
      setIsLoading(false);
    });

    return () => unsubGeneral();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_config", "general"), {
        stats: statsConfig
      }, { merge: true });
      toast.success("Impact Stats saved successfully!");
    } catch (error) {
      console.error("Error saving stats config:", error);
      toast.error("Failed to save Impact Stats.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Synchronizing Impact Stats...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Impact <span className="text-brand-accent">Stats CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage dynamic numerical metrics, achievements, and statistics on the homepage
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/25 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Stats Configuration
            </>
          )}
        </button>
      </div>

      <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-sm space-y-8">
        <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight flex items-center gap-3">
          <BarChart className="w-5 h-5 text-brand-accent" /> Impact Statistics (4 Grid Blocks)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {statsConfig.map((stat, idx) => (
            <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest">Stat Block #{idx + 1}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">Metric Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...statsConfig];
                      newStats[idx].label = e.target.value;
                      setStatsConfig(newStats);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">Value</label>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...statsConfig];
                      newStats[idx].value = parseInt(e.target.value) || 0;
                      setStatsConfig(newStats);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1">Suffix (e.g. "+", "%")</label>
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={(e) => {
                      const newStats = [...statsConfig];
                      newStats[idx].suffix = e.target.value;
                      setStatsConfig(newStats);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
