"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Info, Save, Shield, Target, Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import ImageUploader from "@/components/ImageUploader";

export default function AboutCMSPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for About page config
  const [aboutConfig, setAboutConfig] = useState({
    heroTitle: "ENGINEERING THE FUTURE",
    heroSubtitle: "For over a decade, Aveon has been at the intersection of ergonomics, industrial design, and manufacturing excellence.",
    heroBgImage: "",
    storyImg: "",
    storyYears: 12,
    storyTitle: "EVERYTHING YOUR WORKSPACE NEEDS.",
    storyP1: "Aveon Spaces started with a simple mission: to bridge the gap between high-end ergonomic science and accessible industrial manufacturing. We believed that everyone, from the CEO to the intern, deserves a chair that respects their body.",
    storyP2: "Today, we operate a state-of-the-art facility where modern robotics meet artisan craftsmanship. Our components are sourced globally and assembled locally, ensuring that every piece of furniture that leaves our floor is a testament to quality.",
    mfgBgImage: "",
    mfgTitle: "PRECISION MEETS PASSION.",
    mfgSubtitle: "Global Standards, Local Execution",
    values: [
      { iconName: "Shield", title: "Built to Last", desc: "Our products undergo rigorous testing to ensure they withstand the demands of modern intensive workspaces.", img: "" },
      { iconName: "Target", title: "User Centric", desc: "Every curve and mechanism is designed around human physiology to maximize comfort and productivity.", img: "" },
      { iconName: "Zap", title: "Rapid Delivery", desc: "Our localized manufacturing allows for industry-leading turnaround times without compromising on quality.", img: "" },
      { iconName: "CheckCircle2", title: "Eco Conscious", desc: "We prioritize recyclable materials and lean manufacturing to minimize our environmental footprint.", img: "" }
    ]
  });

  useEffect(() => {
    setIsLoading(true);
    // Listen to changes on the "about" document in site_config
    const unsubAbout = onSnapshot(doc(db, "site_config", "about"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAboutConfig(prev => ({
          ...prev,
          ...data
        }));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading about settings:", error);
      setIsLoading(false);
    });

    return () => unsubAbout();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_config", "about"), aboutConfig);
      toast.success("About Page content saved successfully!");
    } catch (error) {
      console.error("Error saving about settings:", error);
      toast.error("Failed to save About Page details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Synchronizing About Content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            About <span className="text-brand-accent">Page CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Configure company history, core values, experience records, and factory spotlights
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
              <Save className="w-4 h-4" /> Save About Configuration
            </>
          )}
        </button>
      </div>

      <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-sm space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">Hero Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Hero Title</label>
              <input
                type="text"
                value={aboutConfig.heroTitle}
                onChange={(e) => setAboutConfig({ ...aboutConfig, heroTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Hero Subtitle</label>
              <textarea
                value={aboutConfig.heroSubtitle}
                onChange={(e) => setAboutConfig({ ...aboutConfig, heroSubtitle: e.target.value })}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploader 
                label="Hero Background Image"
                value={aboutConfig.heroBgImage}
                onChange={(url) => setAboutConfig({ ...aboutConfig, heroBgImage: url })}
                fallback=""
                sizeHint="1920x1080px (16:9)"
              />
            </div>
          </div>
        </div>

        {/* History & Story Section */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">History & Story Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Story Title</label>
              <input
                type="text"
                value={aboutConfig.storyTitle}
                onChange={(e) => setAboutConfig({ ...aboutConfig, storyTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Years of Experience Counter</label>
              <input
                type="number"
                value={aboutConfig.storyYears}
                onChange={(e) => setAboutConfig({ ...aboutConfig, storyYears: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Paragraph 1</label>
              <textarea
                value={aboutConfig.storyP1}
                onChange={(e) => setAboutConfig({ ...aboutConfig, storyP1: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Paragraph 2</label>
              <textarea
                value={aboutConfig.storyP2}
                onChange={(e) => setAboutConfig({ ...aboutConfig, storyP2: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent resize-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploader 
                label="Story Main Image"
                value={aboutConfig.storyImg}
                onChange={(url) => setAboutConfig({ ...aboutConfig, storyImg: url })}
                fallback=""
                sizeHint="1200x800px (3:2)"
              />
            </div>
          </div>
        </div>

        {/* Manufacturing Highlights */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">Manufacturing Highlight</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Highlight Title</label>
              <input
                type="text"
                value={aboutConfig.mfgTitle}
                onChange={(e) => setAboutConfig({ ...aboutConfig, mfgTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Highlight Subtitle</label>
              <input
                type="text"
                value={aboutConfig.mfgSubtitle}
                onChange={(e) => setAboutConfig({ ...aboutConfig, mfgSubtitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUploader 
                label="Highlight Banner Image"
                value={aboutConfig.mfgBgImage}
                onChange={(url) => setAboutConfig({ ...aboutConfig, mfgBgImage: url })}
                fallback=""
                sizeHint="1920x800px (landscape)"
              />
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4">Core Values (4 Blocks)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aboutConfig.values.map((val, idx) => (
              <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest block">Value Block #{idx + 1}</span>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Icon Name (Lucide)</label>
                      <input
                        type="text"
                        value={val.iconName}
                        onChange={(e) => {
                          const newVals = [...aboutConfig.values];
                          newVals[idx].iconName = e.target.value;
                          setAboutConfig({ ...aboutConfig, values: newVals });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => {
                          const newVals = [...aboutConfig.values];
                          newVals[idx].title = e.target.value;
                          setAboutConfig({ ...aboutConfig, values: newVals });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-accent"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                    <textarea
                      value={val.desc}
                      onChange={(e) => {
                        const newVals = [...aboutConfig.values];
                        newVals[idx].desc = e.target.value;
                        setAboutConfig({ ...aboutConfig, values: newVals });
                      }}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <ImageUploader 
                      label="Value Image"
                      value={val.img}
                      onChange={(url) => {
                        const newVals = [...aboutConfig.values];
                        newVals[idx].img = url;
                        setAboutConfig({ ...aboutConfig, values: newVals });
                      }}
                      fallback=""
                      sizeHint="800x600px (4:3)"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
