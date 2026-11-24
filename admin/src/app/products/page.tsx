"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc
} from "firebase/firestore";
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  X, 
  Image as ImageIcon,
  Check,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Upload,
  ChevronRight,
  Filter,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import CustomDropdown from "@/components/CustomDropdown";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  images?: string[];
  isFeatured: boolean;
  label: string;
  description: string;
}

export default function ProductsPage() {
  const confirm = useConfirm();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
  const [filterCategory, setFilterCategory] = useState("All");

  const [globalBrochure, setGlobalBrochure] = useState<string>("");
  const [globalBrochureUploading, setGlobalBrochureUploading] = useState(false);
  const [globalBrochureError, setGlobalBrochureError] = useState("");
  const globalBrochureInputRef = useRef<HTMLInputElement>(null);

  const [featuredProductId, setFeaturedProductId] = useState("");
  const [featuredBadgeText, setFeaturedBadgeText] = useState("New Arrival / Latest Upgrade");
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);

  useEffect(() => {
    // Fetch Products
    const q = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productData);
    });

    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catData = snapshot.docs.map(doc => ({
        label: (doc.data() as any).name,
        value: (doc.data() as any).name
      }));
      setCategories(catData);
    });

    // Fetch Global Config
    const unsubSiteConfig = onSnapshot(doc(db, "site_config", "product_listing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalBrochure(data.globalBrochure || "");
        if (data.featuredProductId !== undefined) setFeaturedProductId(data.featuredProductId);
        if (data.featuredBadgeText !== undefined) setFeaturedBadgeText(data.featuredBadgeText);
      }
    });

    return () => {
      unsubProducts();
      unsubCats();
      unsubSiteConfig();
    };
  }, []);

    const handleSaveFeaturedHero = async () => {
    setIsSavingFeatured(true);
    try {
      await setDoc(doc(db, "site_config", "product_listing"), {
        featuredProductId,
        featuredBadgeText
      }, { merge: true });

      toast.success("Featured Hero saved successfully!");
    } catch (error) {
      console.error("Error saving featured hero:", error);
      toast.error("Failed to save Featured Hero.");
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ message: "Are you sure you want to delete this product?" })) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const addToShowcase = async (productId: string) => {
    try {
      await updateDoc(doc(db, "products", productId), { isFeatured: true });
    } catch (error) {
      console.error("Error adding to featured showcase:", error);
    }
  };

  const removeFromShowcase = async (productId: string) => {
    try {
      await updateDoc(doc(db, "products", productId), { isFeatured: false });
    } catch (error) {
      console.error("Error removing from featured showcase:", error);
    }
  };

  const filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = filterCategory === "All" || p.category === filterCategory;
    return searchMatch && categoryMatch;
  });

  const handleGlobalBrochureUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      setGlobalBrochureError('File size exceeds 10MB limit.'); 
      return; 
    }
    setGlobalBrochureError(''); 
    setGlobalBrochureUploading(true);
    
    const fd = new FormData(); 
    fd.append('file', file);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        await setDoc(doc(db, 'site_config', 'product_listing'), { globalBrochure: data.url }, { merge: true });
        setGlobalBrochure(data.url); 
      } else { 
        setGlobalBrochureError(data.error || 'Failed.'); 
      }
    } catch { 
      setGlobalBrochureError('Network error.'); 
    } finally { 
      setGlobalBrochureUploading(false); 
    }
  };

  const handleRemoveGlobalBrochure = async () => {
    if (!await confirm({ message: 'Remove the global brochure? The Download button will be disabled for all products.' })) return;
    try {
      await setDoc(doc(db, 'site_config', 'product_listing'), { globalBrochure: '' }, { merge: true });
      setGlobalBrochure(''); 
    } catch (error) {
      console.error("Failed to remove brochure", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Products & Catalog
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your chairs, seating catalog, prices, and featured items.
          </p>
        </div>
        <button 
          onClick={() => router.push('/products/new')}
          className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* GLOBAL BROCHURE CMS */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-accent" /> Store Brochure (PDF)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              This PDF is downloaded when visitors click "Download Brochure" on any product page.
            </p>
          </div>
          {globalBrochure && (
            <button
              type="button"
              onClick={handleRemoveGlobalBrochure}
              className="text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Remove PDF
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden group">
            {globalBrochure ? (
              <>
                <FileText className="w-8 h-8 text-emerald-400 mb-1" />
                <span className="absolute bottom-2 text-[8px] font-black uppercase text-emerald-400 tracking-wider">Loaded</span>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 text-white/20 mb-1" />
                <span className="absolute bottom-2 text-[8px] font-black uppercase text-white/20 tracking-wider">Empty</span>
              </>
            )}
            {globalBrochureUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                <RefreshCw className="w-6 h-6 text-brand-accent animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-4">
            {globalBrochure ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Brochure Active</span>
                </div>
                <p className="text-xs text-white/60 font-medium truncate max-w-[360px]">{globalBrochure.split('/').pop()}</p>
                <a
                  href={globalBrochure}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] text-brand-accent font-bold uppercase tracking-wider hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview PDF
                </a>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Brochure Uploaded</h4>
                <p className="text-[10px] text-gray-400">Upload a PDF file (max 10MB). The file will be hosted securely.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                disabled={globalBrochureUploading}
                onClick={() => globalBrochureInputRef.current?.click()}
                className="px-6 py-3.5 bg-brand-accent hover:bg-[#a82222] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-brand-accent/20"
              >
                <Upload className="w-4 h-4" />
                {globalBrochureUploading ? 'Uploading...' : globalBrochure ? 'Replace Brochure' : 'Upload Brochure PDF'}
              </button>
              <input
                type="file"
                ref={globalBrochureInputRef}
                onChange={handleGlobalBrochureUpload}
                accept=".pdf,application/pdf"
                className="hidden"
              />
            </div>

            {globalBrochureError && (
              <div className="text-[10px] font-bold text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{globalBrochureError}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${globalBrochure ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-brand-accent/5 border-brand-accent/20'}`}>
          {globalBrochure ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <p className="text-xs font-bold text-gray-300">
            {globalBrochure
              ? 'The Download Brochure button is active on all product pages. Visitors can download the PDF.'
              : 'No global brochure uploaded. The Download Brochure button will be grayed-out and disabled on all product pages.'}
          </p>
        </div>
      </div>

            {/* FEATURED HERO CMS */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-accent" /> Featured Hero Banner <span className="text-xs font-bold text-white/40 uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/5 rounded-full ml-2">CMS</span>
          </h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Configure the main featured product banner at the top of the products listing page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Featured Product</label>
            <select
              value={featuredProductId}
              onChange={(e) => setFeaturedProductId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">-- Automatically show the first product --</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Banner Badge Text</label>
            <input
              type="text"
              value={featuredBadgeText}
              onChange={(e) => setFeaturedBadgeText(e.target.value)}
              placeholder="e.g. Premium or New Arrival"
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button 
            onClick={handleSaveFeaturedHero}
            disabled={isSavingFeatured}
            className="px-8 py-3 bg-brand-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/25 cursor-pointer disabled:opacity-50"
          >
            {isSavingFeatured ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSavingFeatured ? "Saving..." : "Save Featured Hero"}
          </button>
        </div>
      </div>

            {/* FEATURED HERO CMS */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-accent" /> Featured Hero Banner <span className="text-xs font-bold text-white/40 uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/5 rounded-full ml-2">CMS</span>
          </h3>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Configure the main featured product banner at the top of the products listing page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Featured Product</label>
            <select
              value={featuredProductId}
              onChange={(e) => setFeaturedProductId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">-- Automatically show the first product --</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Banner Badge Text</label>
            <input
              type="text"
              value={featuredBadgeText}
              onChange={(e) => setFeaturedBadgeText(e.target.value)}
              placeholder="e.g. Premium or New Arrival"
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button 
            onClick={handleSaveFeaturedHero}
            disabled={isSavingFeatured}
            className="px-8 py-3 bg-brand-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-brand-accent/25 cursor-pointer disabled:opacity-50"
          >
            {isSavingFeatured ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSavingFeatured ? "Saving..." : "Save Featured Hero"}
          </button>
        </div>
      </div>

      {/* MOST PICKED SHOWCASE CMS */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-8">
        <div>
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-brand-accent fill-brand-accent" /> Most Picked Showcase <span className="text-xs font-bold text-white/40 uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/5 rounded-full ml-2">CMS</span>
          </h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Featured products in the scroll-locked stacking section at the bottom of the catalog page
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4 border-t border-white/5">
          {/* Featured List */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currently Featured</label>
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest px-3 py-1 bg-brand-accent/10 rounded-full">{products.filter(p => p.isFeatured).length} Items</span>
            </div>
            <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 min-h-[250px] relative">
              {products.filter(p => p.isFeatured).length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">No Featured Products</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest max-w-[250px]">Add products from the list to display them in the showcase section.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.filter(p => p.isFeatured).map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-4 bg-[#111] border border-white/10 p-3 rounded-2xl group hover:border-brand-accent/40 hover:bg-[#161616] transition-all relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                        {(product.images?.[0] || product.image) ? (
                          <img src={product.images?.[0] || product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform duration-500">
                            <ImageIcon className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="font-bold text-sm text-white truncate">{product.name}</p>
                        <p className="text-[9px] text-brand-accent font-black uppercase tracking-widest mt-0.5">{product.category}</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeFromShowcase(product.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer z-10"
                        title="Remove from Showcase"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Select List */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available to Add</label>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{products.filter(p => !p.isFeatured).length} Items</span>
            </div>
            
            <div className="bg-black/30 p-2 rounded-[2rem] border border-white/5 h-[250px] overflow-hidden flex flex-col">
              {products.filter(p => !p.isFeatured).length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">All products are already featured.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 pr-3">
                  {products.filter(p => !p.isFeatured).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0">
                          {(p.images?.[0] || p.image) ? (
                            <img src={p.images?.[0] || p.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <ImageIcon className="w-4 h-4 text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[8px] text-white/40 uppercase tracking-widest truncate">{p.category}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToShowcase(p.id)}
                        className="shrink-0 w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-brand-accent hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-brand-accent"
                        title="Add to Showcase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all"
          />
        </div>
        <div className="flex items-center gap-4">
          <CustomDropdown 
            options={[{label: "All Categories", value: "All"}, ...categories]}
            value={filterCategory}
            onChange={setFilterCategory}
            className="w-56"
          />
          <div className="h-10 w-[1px] bg-white/5" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{filteredProducts.length} Products Available</p>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-brand-accent/30 transition-all flex flex-col"
            >
              <div className="aspect-[4/5] relative bg-[#111] overflow-hidden">
                {(product.images?.[0] || product.image) ? (
                  <img 
                    src={product.images?.[0] || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform duration-700">
                    <ImageIcon className="w-16 h-16 text-white/10" />
                  </div>
                )}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                    {product.category}
                  </span>
                  {product.label && (
                    <span className="px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-white/10">
                      {product.label}
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="px-3 py-1 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg shadow-brand-accent/20">
                      <Star className="w-2.5 h-2.5 fill-white" /> Featured
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button 
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-brand-accent hover:text-white transition-all shadow-xl"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black font-outfit text-white uppercase tracking-tight mb-2">{product.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                  
                  {/* Global brochure indicator - brochure is now global */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold pt-4 border-t border-white/5 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    <span>Brochure: Global (manage in Listing CMS)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <p className="text-lg font-black text-brand-accent font-outfit">₹{product.price}</p>
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                    ID: {product.id.slice(0, 6)} <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
