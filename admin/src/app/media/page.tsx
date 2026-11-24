"use client";

import React, { useState, useEffect } from 'react';
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { ImageIcon, Upload, Grid, List, Search, Trash2, ExternalLink, Filter, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc } from "firebase/firestore";

import CustomDropdown from '@/components/CustomDropdown';

interface MediaAsset {
  id: string;
  url: string;
  name: string;
  category: string;
  productName: string;
  isProduct: boolean;
}

export default function MediaPage() {
  const confirm = useConfirm();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen to both products and a dedicated media collection
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productAssets: MediaAsset[] = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().image || doc.data().img,
        name: doc.data().name + ".jpg",
        category: doc.data().category || "Product Image",
        productName: doc.data().name,
        isProduct: true
      })).filter(asset => asset.url);
      
      setAssets(prev => {
        const nonProduct = prev.filter(a => !a.isProduct);
        const combined = [...nonProduct, ...productAssets];
        // Deduplicate by URL
        return Array.from(new Map(combined.map(item => [item.url, item])).values());
      });
      setLoading(false);
    });

    const unsubMedia = onSnapshot(collection(db, "media"), (snapshot) => {
      const manualAssets: MediaAsset[] = snapshot.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url,
        name: doc.data().name,
        category: doc.data().category || "Upload",
        productName: "Manual Upload",
        isProduct: false
      }));

      setAssets(prev => {
        const productOnly = prev.filter(a => a.isProduct);
        const combined = [...productOnly, ...manualAssets];
        return Array.from(new Map(combined.map(item => [item.url, item])).values());
      });
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubMedia();
    };
  }, []);

  const filteredAssets = assets.filter(asset => 
    asset.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (asset: MediaAsset) => {
    if (await confirm({ message: `Are you sure you want to delete this asset? ${asset.isProduct ? "This will also remove the associated product." : ""}` })) {
      try {
        if (asset.isProduct) {
          await deleteDoc(doc(db, "products", asset.id));
        } else {
          await deleteDoc(doc(db, "media", asset.id));
        }
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  const handleUploadSuccess = async (result: any) => {
    try {
      const { secure_url, original_filename } = result.info;
      await addDoc(collection(db, "media"), {
        url: secure_url,
        name: original_filename || "upload_" + Date.now(),
        category: "Upload",
        uploadedAt: new Date().toISOString()
      });
      toast.success("Asset saved to library!");
    } catch (error) {
      console.error("Error saving upload to Firestore:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        await handleUploadSuccess({
          info: {
            secure_url: data.url,
            original_filename: file.name
          }
        });
      } else {
        toast.error(data.error || "Failed to upload image. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Network error occurred during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            Media <span className="text-brand-accent">Library</span>
          </h1>
          <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-2">
            Centralized asset management • <span className="text-brand-accent">Real-time Sync</span>
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button 
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Add Assets
              </>
            )}
          </button>
          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest md:text-right px-1">
            PNG, JPG, WEBP (Max 10MB • Rec. 1200x800px)
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('grid')}
            className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-brand-accent text-white' : 'text-white/20 hover:bg-white/5'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-brand-accent text-white' : 'text-white/20 hover:bg-white/5'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-white/5 mx-2" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
            {loading ? "Scanning..." : `${filteredAssets.length} Assets Found`}
          </span>
        </div>
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl w-full md:w-[300px] text-xs text-white focus:outline-none focus:border-brand-accent transition-all"
            />
          </div>
          <CustomDropdown 
            options={[
              { label: "All Assets", value: "All" },
              { label: "Product Images", value: "Product Image" },
              { label: "Manual Uploads", value: "Upload" }
            ]}
            value={searchQuery === "" ? "All" : searchQuery} // Simplistic filter for now
            onChange={(val) => setSearchQuery(val === "All" ? "" : val)}
            className="w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Loading Library...</p>
        </div>
      ) : (
        <div className={view === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "space-y-4"}>
          <AnimatePresence mode='popLayout'>
            {filteredAssets.map((asset, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                key={asset.id} 
                className={view === 'grid' 
                  ? "group relative bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-sm hover:border-brand-accent/30 transition-all aspect-square"
                  : "group flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all"
                }
              >
                {view === 'grid' ? (
                  <>
                    <img 
                      src={asset.url} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      alt={asset.name}
                    />
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6 p-6">
                      <div className="flex gap-3">
                        <a 
                          href={asset.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all transform hover:scale-110"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => handleDelete(asset)}
                          className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-full px-2">{asset.name}</p>
                        <p className="text-[9px] font-bold text-brand-accent uppercase tracking-tighter mt-1">{asset.category}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-8 flex-1">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5">
                      <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-black uppercase text-xs tracking-wider">{asset.productName}</h4>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{asset.category} • Image Reference</p>
                    </div>
                    <div className="flex gap-4">
                       <a href={asset.url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all">View</a>
                       <button 
                         onClick={() => handleDelete(asset)}
                         className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                       >
                         Delete
                       </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredAssets.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
          <ImageIcon className="w-16 h-16 text-white/5 mx-auto mb-6" />
          <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">No media assets found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
