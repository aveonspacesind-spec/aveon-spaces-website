"use client";
import React, { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import ImageUploader from "@/components/ImageUploader";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InsightsCMSPage() {
  const confirm = useConfirm();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [time, setTime] = useState("");
  const [img, setImg] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Image presets
  const imagePresets = [
    { name: "Workspace", url: "" },
    { name: "Manufacturing", url: "" },
    { name: "Office", url: "" },
    { name: "Ergonomics", url: "" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "articles"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by order ascending
      data.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
      setArticles(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading articles:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !author.trim() || !time.trim() || !img.trim()) {
      setFormError("All fields are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "articles", editingId);
        await updateDoc(docRef, {
          title: title.trim(),
          category: category.trim(),
          author: author.trim(),
          time: time.trim(),
          img: img.trim(),
          order: Number(order)
        });
      } else {
        // Add new
        await addDoc(collection(db, "articles"), {
          title: title.trim(),
          category: category.trim(),
          author: author.trim(),
          time: time.trim(),
          img: img.trim(),
          order: Number(order)
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving article:", error);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (article: any) => {
    setEditingId(article.id);
    setTitle(article.title || "");
    setCategory(article.category || "");
    setAuthor(article.author || "");
    setTime(article.time || "");
    setImg(article.img || "");
    setOrder(article.order ?? 0);
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this article?" })) return;
    try {
      await deleteDoc(doc(db, "articles", id));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("");
    setAuthor("");
    setTime("");
    setImg("");
    setOrder(0);
    setFormError("");
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Insights <span className="text-brand-accent">CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage educational insights, corporate articles, and design news on the homepage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Article" : "Create Article"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify article properties" : "Add an educational article"}
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Article Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ergonomics in Modern Space"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#151515] border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-white/30">Select Category</option>
                  <option value="Design" className="bg-[#111111] text-white">Design</option>
                  <option value="Workplace" className="bg-[#111111] text-white">Workplace</option>
                  <option value="Manufacturing" className="bg-[#111111] text-white">Manufacturing</option>
                </select>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Author Name</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Reading Time */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Reading Time</label>
                <input 
                  type="text" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 5 min, 12 min"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Display Order</label>
                <input 
                  type="number" 
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Banner Image"
                  value={img}
                  onChange={(url) => setImg(url)}
                  fallback=""
                  sizeHint="800x600px"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 block">Quick Image Presets:</span>
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
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Article")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Articles List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <BookOpen className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Articles Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fill out the editor form on the left and submit to populate the home page latest insights.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((art, idx) => (
                <div 
                  key={art.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-start justify-between gap-6 transition-all group"
                >
                  {/* Left Block */}
                  <div className="flex items-start gap-6 flex-1 w-full">
                    {/* Banner Image */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-white/10 bg-[#111111] flex-shrink-0">
                      {art.img ? (
                        <img 
                          src={art.img} 
                          alt={art.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 bg-brand-accent">
                          <span className="font-bold text-lg">{art.category?.[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-accent">
                          {art.category} • {art.time}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          Order: {art.order ?? 999}
                        </span>
                      </div>
                      <h4 className="font-black font-outfit text-lg text-white leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">
                        Written by <span className="font-bold text-white/60">{art.author}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-shrink-0 self-center md:self-start">
                    <button 
                      onClick={() => startEdit(art)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(art.id)}
                      className="p-3 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Delete Article"
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
