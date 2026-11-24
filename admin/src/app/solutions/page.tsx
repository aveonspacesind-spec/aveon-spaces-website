"use client";
import React, { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Info,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SolutionsCMSPage() {
  const confirm = useConfirm();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [desc, setDesc] = useState("");
  const [featuresText, setFeaturesText] = useState(""); // One feature per line
  const [img, setImg] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick image presets
  const imagePresets = [
    { name: "Executive Suite", url: "" },
    { name: "Modern Lecture Hall", url: "" },
    { name: "Modern Clinic Lounge", url: "" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "solutions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSolutions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading solutions:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !subtitle.trim() || !desc.trim() || !img.trim()) {
      setFormError("All fields except features list are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const features = featuresText
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "solutions", editingId);
        await updateDoc(docRef, {
          title: title.trim(),
          slug: slug.trim(),
          subtitle: subtitle.trim(),
          desc: desc.trim(),
          features,
          img: img.trim()
        });
      } else {
        // Add new
        await addDoc(collection(db, "solutions"), {
          title: title.trim(),
          slug: slug.trim(),
          subtitle: subtitle.trim(),
          desc: desc.trim(),
          features,
          img: img.trim()
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving solution:", error);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (solution: any) => {
    setEditingId(solution.id);
    setTitle(solution.title || "");
    setSlug(solution.slug || "");
    setSubtitle(solution.subtitle || "");
    setDesc(solution.desc || "");
    setFeaturesText((solution.features || []).join("\n"));
    setImg(solution.img || "");
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this solution sector?" })) return;
    try {
      await deleteDoc(doc(db, "solutions", id));
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSubtitle("");
    setDesc("");
    setFeaturesText("");
    setImg("");
    setFormError("");
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Solutions <span className="text-brand-accent">CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage industry-specific seating and planning solutions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Solution" : "Create Solution"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify solution fields" : "Define a new workspace solution"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-3">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Solution Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Collaborative Workspaces"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Slug & Subtitle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Slug</label>
                  <input 
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="e.g. corporate"
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-4 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Subtitle</label>
                  <input 
                    type="text" 
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. High-Performance..."
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-4 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Solution Description</label>
                <textarea 
                  rows={4}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Introduce the sector benefits and engineering standards..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Features (one per line) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Features List (One Per Line)</label>
                <textarea 
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Ergonomic Assessment&#10;Modular Layouts&#10;Sustainable Materials"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none font-mono"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Cover Image"
                  value={img}
                  onChange={setImg}
                  fallback=""
                  sizeHint="1200x800px (3:2)"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 block">Quick Cover Presets:</span>
                <div className="flex flex-wrap gap-2 px-2">
                  {imagePresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImg(preset.url)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                        img === preset.url
                          ? "bg-brand-accent border-brand-accent text-white"
                          : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                {editingId && (
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  disabled={submitting}
                  type="submit"
                  className="flex-1 py-4 bg-brand-accent text-white hover:bg-red-700 font-bold rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
                >
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Solution")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Solutions List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : solutions.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <Wrench className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Solutions Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fill out the editor form on the left and submit to populate the solutions catalog.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {solutions.map((sol, idx) => (
                <div 
                  key={sol.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-start justify-between gap-6 transition-all group"
                >
                  {/* Thumbnail / Image */}
                  <div className="w-32 h-24 rounded-2xl overflow-hidden relative border border-white/10 bg-[#111111] flex-shrink-0">
                    {sol.img ? (
                      <img 
                        src={sol.img} 
                        alt={sol.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <span className="text-[9px] font-bold text-brand-accent uppercase tracking-[0.2em]">
                        Sector 0{idx + 1} • {sol.subtitle}
                      </span>
                      <h4 className="font-black font-outfit text-xl text-white truncate">
                        {sol.title}
                      </h4>
                      <p className="text-xs font-mono text-white/30">/{sol.slug}</p>
                    </div>

                    <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                      {sol.desc}
                    </p>

                    {/* Features render */}
                    {sol.features && sol.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {sol.features.map((feat: string, fIdx: number) => (
                          <span 
                            key={fIdx}
                            className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-bold text-white/70 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3 text-brand-accent" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={() => startEdit(sol)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Edit Solution"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(sol.id)}
                      className="p-3 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Delete Solution"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
