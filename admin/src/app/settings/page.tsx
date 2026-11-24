"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Layers, Save, RefreshCw, Sliders, Info, BookOpen, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import ImageUploader from "@/components/ImageUploader";

export default function HomepageContentCMS() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for Hero config
  const [heroConfig, setHeroConfig] = useState({
    title1: "DESIGNED AROUND",
    title2: "PRODUCTIVITY.",
    subtitle: "Aveon Spaces",
    bgImage: ""
  });

  // States for CTA config
  const [ctaConfig, setCtaConfig] = useState({
    title: "Ready to transform your workspace?",
    desc: "Discover how Aveon Spaces engineered seating influences productivity and workplace culture, creating sustainable spaces that inspire collaboration, focus, and comfort.",
    bgImage: ""
  });

  // States for Companies Marquee
  const [companies, setCompanies] = useState<string[]>([
    "TCS", "INFOSYS", "WIPRO", "HDFC BANK", "TECH MAHINDRA", "DELOITTE"
  ]);

  // State for Projects section visibility
  const [showProjects, setShowProjects] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Listen to changes on the "general" document in site_config
    const unsubGeneral = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.hero) setHeroConfig(data.hero);
        if (data.cta) setCtaConfig(data.cta);
        if (data.companies) setCompanies(data.companies);
        if (data.showProjects !== undefined) setShowProjects(data.showProjects);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading homepage settings:", error);
      setIsLoading(false);
    });

    return () => unsubGeneral();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_config", "general"), {
        hero: heroConfig,
        cta: ctaConfig,
        companies: companies,
        showProjects: showProjects
      }, { merge: true });

      toast.success("Homepage Content saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save Homepage Content.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Synchronizing Homepage Content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Homepage <span className="text-brand-accent">Content CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Configure dynamic homepage hero elements, dynamic client marquee, and landing call-to-actions
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
              <Save className="w-4 h-4" /> Save Homepage Content
            </>
          )}
        </button>
      </div>

      <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-sm space-y-12">
        
        {/* Hero Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">Hero Header Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Title Part 1</label>
              <input
                type="text"
                value={heroConfig.title1}
                onChange={(e) => setHeroConfig({ ...heroConfig, title1: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Title Part 2</label>
              <input
                type="text"
                value={heroConfig.title2}
                onChange={(e) => setHeroConfig({ ...heroConfig, title2: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Subtitle / Brand Descriptor</label>
              <input
                type="text"
                value={heroConfig.subtitle}
                onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploader 
                label="Background Hero Image"
                value={heroConfig.bgImage}
                onChange={(url) => setHeroConfig({ ...heroConfig, bgImage: url })}
                fallback=""
                sizeHint="1920x1080px (16:9)"
              />
            </div>
          </div>
        </div>

        {/* Partner Marquee Section */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div>
            <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-2">Homepage Partner Marquee</h3>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Manage brand names that cycle horizontally across the homepage banner</p>
          </div>
          
          {/* List of current companies as tags */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Current Brands ({companies.length})</label>
            <div className="flex flex-wrap gap-3 bg-white/5 p-6 rounded-2xl border border-white/5">
              {companies.length === 0 ? (
                <p className="text-xs text-white/30 italic">No brand names added yet. The marquee will be empty.</p>
              ) : (
                companies.map((company, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-4 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
                  >
                    <span>{company}</span>
                    <button
                      type="button"
                      onClick={() => setCompanies(companies.filter((_, i) => i !== index))}
                      className="text-white/40 hover:text-brand-accent transition-colors cursor-pointer text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Brand Form */}
          <div className="flex gap-4 max-w-md">
            <input 
              type="text" 
              id="new-brand-input"
              placeholder="Add brand e.g. GOOGLE"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white uppercase tracking-wider placeholder:text-white/20 focus:outline-none focus:border-brand-accent transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !companies.includes(val.toUpperCase())) {
                    setCompanies([...companies, val.toUpperCase()]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("new-brand-input") as HTMLInputElement;
                const val = input.value.trim();
                if (val && !companies.includes(val.toUpperCase())) {
                  setCompanies([...companies, val.toUpperCase()]);
                  input.value = "";
                }
              }}
              className="px-6 py-3.5 bg-brand-accent text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors cursor-pointer flex-shrink-0"
            >
              Add Brand
            </button>
          </div>
        </div>

        {/* CTA Banner Section */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">Homepage CTA Banner Configuration</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">CTA Title</label>
              <input
                type="text"
                value={ctaConfig.title}
                onChange={(e) => setCtaConfig({ ...ctaConfig, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">CTA Description</label>
              <textarea
                value={ctaConfig.desc}
                onChange={(e) => setCtaConfig({ ...ctaConfig, desc: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploader 
                label="CTA Background Image"
                value={ctaConfig.bgImage}
                onChange={(url) => setCtaConfig({ ...ctaConfig, bgImage: url })}
                fallback=""
                sizeHint="1920x800px (landscape)"
              />
            </div>
          </div>
        </div>

        {/* Sections Visibility */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">Homepage Sections Visibility</h3>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showProjects ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-accent/10 text-brand-accent'}`}>
                {showProjects ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Featured Projects Section</h4>
                <p className="text-xs text-white/40 mt-0.5">Show or hide the "Featured Projects" section on the homepage.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${showProjects ? 'text-emerald-400' : 'text-white/30'}`}>
                {showProjects ? 'On' : 'Off'}
              </span>
              <button
                type="button"
                onClick={() => setShowProjects(!showProjects)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showProjects ? 'bg-emerald-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showProjects ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
