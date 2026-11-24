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
  doc, 
  writeBatch 
} from "firebase/firestore";
import { 
  Sliders, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CapabilitiesPage() {
  const confirm = useConfirm();
  const [keypoints, setKeypoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [color, setColor] = useState("#111111");
  const [order, setOrder] = useState<number>(0);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Preset Colors
  const colorPresets = [
    { name: "Charcoal Dark", value: "#111111" },
    { name: "Asphalt Grey", value: "#1A1A1A" },
    { name: "Slate Deep", value: "#0F172A" },
    { name: "Crimson Maroon", value: "#2E1010" },
    { name: "Pitch Black", value: "#000000" },
    { name: "Deep Navy", value: "#0B1528" },
    { name: "Forest Tint", value: "#0F281E" }
  ];

  // Preset Images for easy populating
  const imagePresets = [
    { name: "Executive Desk", url: "" },
    { name: "Modern Office", url: "" },
    { name: "Collaborative Hub", url: "" },
    { name: "Workspace Layout", url: "" },
    { name: "Quality Control", url: "" },
    { name: "Ergonomic Focus", url: "" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "keypoints"), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data() as any;
        return {
          id: doc.id,
          ...docData,
          desc: docData.desc || docData.description || "",
          img: docData.img || docData.photo || ""
        };
      });
      // Sort by order ascending
      data.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
      setKeypoints(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading keypoints:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !img.trim()) {
      setFormError("All fields except color are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "keypoints", editingId);
        await updateDoc(docRef, {
          title: title.trim(),
          desc: desc.trim(),
          img: img.trim(),
          color,
          order: Number(order)
        });
      } else {
        // Add new
        const newOrder = keypoints.length > 0 ? Math.max(...keypoints.map(k => k.order ?? 0)) + 1 : 1;
        await addDoc(collection(db, "keypoints"), {
          title: title.trim(),
          desc: desc.trim(),
          img: img.trim(),
          color,
          order: newOrder
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving capability:", error);
      setFormError("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (keypoint: any) => {
    setEditingId(keypoint.id);
    setTitle(keypoint.title || "");
    setDesc(keypoint.desc || "");
    setImg(keypoint.img || "");
    setColor(keypoint.color || "#111111");
    setOrder(keypoint.order ?? 0);
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this capability?" })) return;
    try {
      await deleteDoc(doc(db, "keypoints", id));
      // Re-index remaining keypoints to prevent order gaps
      const updatedList = keypoints.filter(k => k.id !== id);
      const batch = writeBatch(db);
      updatedList.forEach((key, index) => {
        const ref = doc(db, "keypoints", key.id);
        batch.update(ref, { order: index + 1 });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting capability:", error);
      toast.error("Failed to delete capability.");
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= keypoints.length) return;

    try {
      const batch = writeBatch(db);
      const currentItem = keypoints[index];
      const targetItem = keypoints[targetIndex];

      const currentRef = doc(db, "keypoints", currentItem.id);
      const targetRef = doc(db, "keypoints", targetItem.id);

      batch.update(currentRef, { order: targetItem.order ?? 0 });
      batch.update(targetRef, { order: currentItem.order ?? 0 });

      await batch.commit();
    } catch (error) {
      console.error("Error swapping orders:", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDesc("");
    setImg("");
    setColor("#111111");
    setOrder(0);
    setFormError("");
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Core <span className="text-brand-accent">Capabilities</span> CMS
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage the scroll-locked key points section on the frontend home page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Capability" : "Add New Capability"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify capability properties" : "Create a new homepage keypoint"}
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
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ergonomic Design"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Description</label>
                <textarea 
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Summarize the capability in 1-2 sentences..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Showcase Image */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Showcase Image"
                  value={img}
                  onChange={setImg}
                  fallback=""
                  sizeHint="800x600px (4:3)"
                />
              </div>

              {/* Preset Image Helper */}
              <div className="space-y-3">
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

              {/* Color Hex & Presets */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Hover Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-6 h-6 bg-transparent border-0 rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white/60">{color}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 px-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setColor(preset.value)}
                      className="group flex items-center justify-center w-8 h-8 rounded-full border border-white/10 relative shadow-md transition-transform active:scale-95"
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    >
                      {color === preset.value && (
                        <Check className="w-3.5 h-3.5 text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
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
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Capability")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Capability List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : keypoints.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <Sliders className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Capabilities Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Fill out the editor form on the left and submit to populate the home page keypoints list.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {keypoints.map((keypoint, idx) => (
                <div 
                  key={keypoint.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group"
                >
                  {/* Left block (Order, thumbnail, details) */}
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <span className="text-xl font-black font-outfit text-white/20 group-hover:text-brand-accent transition-colors w-8">
                      0{idx + 1}
                    </span>
                    
                    {/* Image Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/10 bg-[#111111] flex-shrink-0">
                      {keypoint.img ? (
                        <img 
                          src={keypoint.img} 
                          alt={keypoint.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-black font-outfit text-lg text-white truncate flex items-center gap-3">
                        {keypoint.title}
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" 
                          style={{ backgroundColor: keypoint.color }}
                          title={`Hover background color: ${keypoint.color}`}
                        />
                      </h4>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                        {keypoint.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Reordering */}
                    <div className="flex bg-white/5 border border-white/5 rounded-xl p-1">
                      <button 
                        onClick={() => moveOrder(idx, "up")}
                        disabled={idx === 0}
                        className="p-2 text-white/40 hover:text-white disabled:opacity-20 transition-all rounded-lg"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => moveOrder(idx, "down")}
                        disabled={idx === keypoints.length - 1}
                        className="p-2 text-white/40 hover:text-white disabled:opacity-20 transition-all rounded-lg"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit/Delete */}
                    <button 
                      onClick={() => startEdit(keypoint)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Edit Capability"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(keypoint.id)}
                      className="p-3 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Delete Capability"
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
