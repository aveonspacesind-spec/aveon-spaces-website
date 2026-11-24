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
  setDoc
} from "firebase/firestore";
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon,
  Check,
  ChevronRight,
  Info,
  Sun,
  Moon,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsPage() {
  const confirm = useConfirm();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Visibility State
  const [showProjects, setShowProjects] = useState(true);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.showProjects !== undefined) {
          setShowProjects(data.showProjects);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleToggleVisibility = async () => {
    setUpdatingVisibility(true);
    try {
      await setDoc(doc(db, "site_config", "general"), {
        showProjects: !showProjects
      }, { merge: true });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update section visibility.");
    } finally {
      setUpdatingVisibility(false);
    }
  };
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [color, setColor] = useState("#111111");
  const [isLight, setIsLight] = useState(false);
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [scope, setScope] = useState("");
  const [supplied, setSupplied] = useState("");
  const [challenge, setChallenge] = useState("");
  const [solution, setSolution] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Preset Colors
  const colorPresets = [
    { name: "Pitch Black", value: "#000000" },
    { name: "Charcoal Dark", value: "#111111" },
    { name: "Deep Navy", value: "#0B1528" },
    { name: "Off White", value: "#F8F8F8" },
    { name: "Pure White", value: "#FFFFFF" }
  ];

  // Preset Images
  const imagePresets = [
    { name: "Modern Office Room", url: "" },
    { name: "Conference Room", url: "" },
    { name: "Lounge Collaborative", url: "" },
    { name: "Bright Design Hub", url: "" }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading projects:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim() || !image.trim()) {
      setFormError("All fields except background color are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const projectData = {
      name: name.trim(),
      desc: desc.trim(),
      image: image.trim(),
      img: image.trim(), // Save both fields for compatibility
      color,
      isLight,
      client: client.trim(),
      location: location.trim(),
      year: year.trim(),
      scope: scope.trim(),
      supplied: supplied.trim(),
      challenge: challenge.trim(),
      solution: solution.trim(),
      gallery,
      highlights
    };

    try {
      if (editingId) {
        // Edit existing
        const docRef = doc(db, "projects", editingId);
        await updateDoc(docRef, projectData);
      } else {
        // Add new
        await addDoc(collection(db, "projects"), projectData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
      setFormError("Failed to save project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setName(project.name || "");
    setDesc(project.desc || "");
    setImage(project.image || project.img || ""); // Read either field for compatibility
    setColor(project.color || "#111111");
    setIsLight(project.isLight ?? false);
    setClient(project.client || "");
    setLocation(project.location || "");
    setYear(project.year || "");
    setScope(project.scope || "");
    setSupplied(project.supplied || "");
    setChallenge(project.challenge || "");
    setSolution(project.solution || "");
    setGallery(project.gallery || []);
    setHighlights(project.highlights || []);
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ message: "Are you sure you want to delete this project?" })) return;
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDesc("");
    setImage("");
    setColor("#111111");
    setIsLight(false);
    setClient("");
    setLocation("");
    setYear("");
    setScope("");
    setSupplied("");
    setChallenge("");
    setSolution("");
    setGallery([]);
    setHighlights([]);
    setNewHighlight("");
    setFormError("");
  };



  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Projects <span className="text-brand-accent">CMS</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Manage the featured projects on the homepage dynamic scroll-locked section
          </p>
        </div>

      </div>

      {/* Visibility Toggle Section */}
      <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${showProjects ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-accent/10 text-brand-accent'}`}>
            {showProjects ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Featured Projects Section Visibility</h3>
            <p className="text-white/40 text-xs mt-1">Control whether the "Featured Projects" section is displayed on the homepage.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase tracking-widest ${showProjects ? 'text-emerald-400' : 'text-white/30'}`}>
            {showProjects ? 'On' : 'Off'}
          </span>
          <button
            onClick={handleToggleVisibility}
            disabled={updatingVisibility}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Editor Form (1 Col) */}
        <div className="xl:col-span-1">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit uppercase tracking-tight text-white">
                  {editingId ? "Edit Project" : "Create Project"}
                </h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {editingId ? "Modify project properties" : "Add a new showcase project"}
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

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Project Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lumina Workspace"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Short Description</label>
                <textarea 
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Case study summary text..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Showcase Image */}
              <div className="space-y-2">
                <ImageUploader 
                  label="Showcase Image"
                  value={image}
                  onChange={setImage}
                  fallback=""
                  sizeHint="1600x1000px (16:10)"
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

              {/* Color Hex & Presets */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Section Theme Color
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

              {/* Light/Dark Toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 block">
                  Contrast Mode
                </label>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLight(false);
                      if (color === "#FFFFFF" || color === "#F8F8F8") {
                        setColor("#111111");
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      !isLight
                        ? "bg-brand-accent text-white"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark Text / BG Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLight(true);
                      if (color === "#111111" || color === "#000000") {
                        setColor("#F8F8F8");
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      isLight
                        ? "bg-brand-accent text-white"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light BG Theme
                  </button>
                </div>
              </div>

              {/* Client, Location, Year */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Client Name</label>
                <input 
                  type="text" 
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. KPMG India"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Year</label>
                  <input 
                    type="text" 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Scope & Supplied */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Scope / Category</label>
                <input 
                  type="text" 
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. Corporate Hub"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Seating Supplied</label>
                <input 
                  type="text" 
                  value={supplied}
                  onChange={(e) => setSupplied(e.target.value)}
                  placeholder="e.g. 1,000+ Units"
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
                />
              </div>

              {/* Challenge & Solution */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Detailed Challenge</label>
                <textarea 
                  rows={3}
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="Detailed case study challenge..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Detailed Solution</label>
                <textarea 
                  rows={3}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Detailed case study solution..."
                  className="w-full bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 block font-outfit">Case Study Highlights</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Add highlight point..."
                    className="flex-1 bg-white/5 border border-white/5 focus:border-brand-accent rounded-2xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newHighlight.trim()) {
                          setHighlights([...highlights, newHighlight.trim()]);
                          setNewHighlight("");
                        }
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newHighlight.trim()) {
                        setHighlights([...highlights, newHighlight.trim()]);
                        setNewHighlight("");
                      }
                    }}
                    className="px-4 bg-brand-accent text-white font-bold rounded-xl text-xs uppercase"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2 px-2">
                  {highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-white/70 bg-white/5 border border-white/5 rounded-xl px-4 py-2">
                      <span className="truncate max-w-[200px]">{hl}</span>
                      <button 
                        type="button" 
                        onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-500 font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {highlights.length === 0 && <p className="text-[10px] text-white/20 italic">No highlights added.</p>}
                </div>
              </div>

              {/* Case Study Gallery */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 block font-outfit">Case Study Gallery</label>
                
                <ImageUploader 
                  label="Upload New Gallery Photo"
                  value=""
                  onChange={(url) => {
                    if (url) {
                      setGallery([...gallery, url]);
                    }
                  }}
                  sizeHint="1200x800px (3:2)"
                />

                <div className="grid grid-cols-3 gap-2 px-2 pt-2">
                  {gallery.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-[#ffffff]/10 bg-black group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {gallery.length === 0 && <p className="text-[10px] text-white/20 italic col-span-3">No gallery photos added.</p>}
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
                  {submitting ? "Saving..." : (editingId ? "Save Changes" : "Create Project")}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Project List (2 Cols) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex items-center justify-center h-[400px]">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center h-[400px] text-center space-y-4">
              <Folder className="w-12 h-12 text-white/10" />
              <h4 className="text-lg font-black uppercase tracking-tight text-white/60">No Projects Found</h4>
              <p className="text-xs text-white/40 max-w-sm">
                Filling the editor form on the left will populate the homepage featured projects.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, idx) => (
                <div 
                  key={project.id}
                  className="bg-white/5 border border-white/5 hover:border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group"
                >
                  {/* Left Block */}
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <span className="text-xl font-black font-outfit text-white/20 group-hover:text-brand-accent transition-colors w-8">
                      0{idx + 1}
                    </span>
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-white/10 bg-[#111111] flex-shrink-0">
                      {project.image || project.img ? (
                        <img 
                          src={project.image || project.img} 
                          alt={project.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-black font-outfit text-lg text-white truncate flex items-center gap-3">
                        {project.name}
                        <span 
                          className="w-2.5 h-2.5 rounded-full inline-block border border-white/10" 
                          style={{ backgroundColor: project.color }}
                          title={`Theme color: ${project.color}`}
                        />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1">
                          {project.isLight ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-sky-500" />}
                          {project.isLight ? "Light Mode" : "Dark Mode"}
                        </span>
                      </h4>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                        {project.desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                      onClick={() => startEdit(project)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-3 bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white transition-all rounded-xl cursor-pointer"
                      title="Delete Project"
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
