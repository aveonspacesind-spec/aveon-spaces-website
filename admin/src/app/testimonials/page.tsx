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
  Quote, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestimonialsCMSPage() {
  const confirm = useConfirm();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Profile picture presets
  const avatarPresets = [
    { name: "Executive Woman", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800" },
    { name: "Executive Man", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800" },
    { name: "Creative Woman", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800" },
    { name: "Corporate Leader", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "testimonials"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading testimonials:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || !author.trim() || !role.trim() || !company.trim() || !image.trim()) {
      setFormError("All fields are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "testimonials", editingId);
        await updateDoc(docRef, {
          quote: quote.trim(),
          author: author.trim(),
          role: role.trim(),
          company: company.trim(),
          image: image.trim()
        });
      } else {
        // Add new
        await addDoc(collection(db, "testimonials"), {
          quote: quote.trim(),
          author: author.trim(),
          role: role.trim(),
          company: company.trim(),
          image: image.trim()
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (testimonial: any) => {
    setEditingId(testimonial.id);
    setQuote(testimonial.quote || "");
    setAuthor(testimonial.author || "");
    setRole(testimonial.role || "");
    setCompany(testimonial.company || "");
    setImage(testimonial.image || "");
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this testimonial?" })) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuote("");
    setAuthor("");
    setRole("");
    setCompany("");
    setImage("");
    setFormError("");
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Testimonials <span className="text-brand-accent">CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage customer feedback and success stories on the home page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Quote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Testimonial" : "Create Testimonial"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify feedback properties" : "Add a customer success story"}
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

              {/* Role */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Role / Designation</label>
                <input 
                  type="text" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Design Lead"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Company / Enterprise</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Quote */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Quote / Feedback</label>
                <textarea 
                  rows={4}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Customer statement..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Profile Image"
                  value={image}
                  onChange={setImage}
                  fallback=""
                  sizeHint="400x400px (1:1)"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest px-2 block">Quick Avatar Presets:</span>
                <div className="flex flex-wrap gap-2 px-2">
                  {avatarPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                        image === preset.url
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
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Testimonial")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Testimonials List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <Quote className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Testimonials Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fill out the editor form on the left and submit to populate the home page customer voices.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((test, idx) => (
                <div 
                  key={test.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-start justify-between gap-6 transition-all group"
                >
                  {/* Left Block */}
                  <div className="flex items-start gap-6 flex-1 w-full">
                    {/* Avatar Image */}
                    <div className="w-16 h-16 rounded-full overflow-hidden relative border border-white/10 bg-[#111111] flex-shrink-0">
                      {test.image ? (
                        <img 
                          src={test.image} 
                          alt={test.author} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10 bg-brand-accent">
                          <span className="font-bold text-lg">{test.author?.[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="font-black font-outfit text-lg text-white truncate">
                          {test.author}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                          {test.role} @ {test.company}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 italic leading-relaxed font-light">
                        "{test.quote}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-shrink-0 self-center md:self-start">
                    <button 
                      onClick={() => startEdit(test)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Edit Testimonial"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(test.id)}
                      className="p-3 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Delete Testimonial"
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
