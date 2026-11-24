"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PhoneCall, Save, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function ContactCMSPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // States for Contact Details
  const [contactConfig, setContactConfig] = useState({
    phone: "+91 98765 43210",
    phoneSub: "Mon-Sat, 9am - 7pm",
    email: "info@aveonseating.com",
    emailSub: "Response within 24 hours",
    address: "Industrial Area Phase II,",
    addressSub: "Bangalore, KA 560001",
    hours: "8:00 AM - 6:00 PM",
    hoursSub: "Sunday Closed",
    mapTitle: "Aveon Main Office",
    mapLocation: "Bangalore, Karnataka"
  });

  // States for Socials
  const [socialsConfig, setSocialsConfig] = useState<Record<string, { url: string; show: boolean }>>({
    whatsapp: { url: "", show: false },
    instagram: { url: "", show: false },
    facebook: { url: "", show: false },
    twitter: { url: "", show: false },
    linkedin: { url: "", show: false }
  });

  useEffect(() => {
    setIsLoading(true);
    // Listen to changes on the "general" document in site_config
    const unsubGeneral = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.contact) {
          setContactConfig(data.contact);
        }
        if (data.socials) {
          setSocialsConfig(data.socials);
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading contact settings:", error);
      setIsLoading(false);
    });

    return () => unsubGeneral();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "site_config", "general"), {
        contact: contactConfig,
        socials: socialsConfig
      }, { merge: true });
      toast.success("Contact Details & Socials saved successfully!");
    } catch (error) {
      console.error("Error saving contact config:", error);
      toast.error("Failed to save Contact Details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
        <span className="text-white/40 text-xs tracking-widest uppercase font-bold">Synchronizing Contact Info...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Contact <span className="text-brand-accent">Details CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Configure hotline support, office details, production house address, and map coordinates
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
              <Save className="w-4 h-4" /> Save Contact Details
            </>
          )}
        </button>
      </div>

      <div className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-sm space-y-8">
        <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight flex items-center gap-3 border-b border-white/5 pb-4">
          <PhoneCall className="w-5 h-5 text-brand-accent" /> Contact Info & Interactive Map Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
            <input
              type="text"
              value={contactConfig.phone}
              onChange={(e) => setContactConfig({ ...contactConfig, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Phone Availability (Subtitle)</label>
            <input
              type="text"
              value={contactConfig.phoneSub}
              onChange={(e) => setContactConfig({ ...contactConfig, phoneSub: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <input
              type="email"
              value={contactConfig.email}
              onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email SLA (Subtitle)</label>
            <input
              type="text"
              value={contactConfig.emailSub}
              onChange={(e) => setContactConfig({ ...contactConfig, emailSub: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          {/* Visit */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Office Address</label>
            <input
              type="text"
              value={contactConfig.address}
              onChange={(e) => setContactConfig({ ...contactConfig, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Office City / ZIP (Subtitle)</label>
            <input
              type="text"
              value={contactConfig.addressSub}
              onChange={(e) => setContactConfig({ ...contactConfig, addressSub: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Factory Hours</label>
            <input
              type="text"
              value={contactConfig.hours}
              onChange={(e) => setContactConfig({ ...contactConfig, hours: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Factory Weekend Details (Subtitle)</label>
            <input
              type="text"
              value={contactConfig.hoursSub}
              onChange={(e) => setContactConfig({ ...contactConfig, hoursSub: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>

          {/* Map Pin Metadata */}
          <div className="space-y-2 md:col-span-2 pt-4 border-t border-white/5">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight px-1">Interactive Map Widget Metadata</h4>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Map Marker Title</label>
            <input
              type="text"
              value={contactConfig.mapTitle}
              onChange={(e) => setContactConfig({ ...contactConfig, mapTitle: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Map Marker Coordinates / Label</label>
            <input
              type="text"
              value={contactConfig.mapLocation}
              onChange={(e) => setContactConfig({ ...contactConfig, mapLocation: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>

        {/* Social Media Section */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2 flex items-center gap-3">
            Social Media Mapping
          </h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Manage your social presence and WhatsApp floating button.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(socialsConfig).map(([key, config]) => (
              <div key={key} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm capitalize">{key}</h4>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.show ? 'text-emerald-400' : 'text-white/30'}`}>
                      {config.show ? 'Visible' : 'Hidden'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSocialsConfig({ ...socialsConfig, [key]: { ...config, show: !config.show } })}
                      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.show ? 'bg-emerald-600' : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.show ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={`${key} URL`}
                  value={config.url}
                  onChange={(e) => setSocialsConfig({ ...socialsConfig, [key]: { ...config, url: e.target.value } })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
