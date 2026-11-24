"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  Trash2, 
  Image as ImageIcon 
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import CustomDropdown from "@/components/CustomDropdown";

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!productId);
  const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
  const [allProducts, setAllProducts] = useState<{id: string, name: string}[]>([]);

  // Complex Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Task Chairs",
    price: "",
    image: "", // Main Image
    images: [] as string[], // Gallery Images
    isFeatured: false,
    label: "",
    tagline: "",
    description: "",
    warranty: "5 Years Limited Warranty",
    shipping: "Free global shipping within 7-10 days",
    features: [""] as string[],
    highlightedFeatures: [{ icon: "Shield", title: "" }],
    specs: [{ key: "", value: "" }],
    colors: [{ name: "", hex: "" }],
    detailedFeatures: [{ icon: "LayoutGrid", title: "", description: "" }],
    storyBlock: { title: "", description: "", videoUrl: "", image: "" },
    materials: [{ title: "", description: "", image: "" }],
    comboOffer: {
      enabled: false,
      linkedProductId: "",
      comboPrice: "",
    },
    whatsInBox: [{ icon: "Package", label: "", desc: "" }],
    bulkOrder: {
      enabled: false,
      moq: "50",
    }
  });

  useEffect(() => {
    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catData = snapshot.docs.map(doc => ({
        label: (doc.data() as any).name,
        value: (doc.data() as any).name
      }));
      setCategories(catData);
    });

    // Fetch Products for Combo Dropdown
    const q = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubProds = onSnapshot(q, (snapshot) => {
      const prodData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: (doc.data() as any).name
      }));
      setAllProducts(prodData);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, "products", productId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            setFormData({
              name: data.name || "",
              category: data.category || "Task Chairs",
              price: data.price || "",
              image: data.image || "",
              images: data.images || [],
              isFeatured: !!data.isFeatured,
              label: data.label || "",
              tagline: data.tagline || "",
              description: data.description || "",
              warranty: data.warranty || "5 Years Limited Warranty",
              shipping: data.shipping || "Free global shipping within 7-10 days",
              features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [""],
              highlightedFeatures: Array.isArray(data.highlightedFeatures) && data.highlightedFeatures.length > 0 ? data.highlightedFeatures : [{ icon: "Shield", title: "" }],
              specs: Array.isArray(data.specs) && data.specs.length > 0 ? data.specs : [{ key: "", value: "" }],
              colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : [{ name: "", hex: "" }],
              detailedFeatures: Array.isArray(data.detailedFeatures) && data.detailedFeatures.length > 0 ? data.detailedFeatures : [{ icon: "LayoutGrid", title: "", description: "" }],
              storyBlock: data.storyBlock || { title: "", description: "", videoUrl: "", image: "" },
              materials: Array.isArray(data.materials) && data.materials.length > 0 ? data.materials : [{ title: "", description: "", image: "" }],
              comboOffer: data.comboOffer || { enabled: false, linkedProductId: "", comboPrice: "" },
              whatsInBox: Array.isArray(data.whatsInBox) && data.whatsInBox.length > 0 ? data.whatsInBox : [{ icon: "Package", label: "", desc: "" }],
              bulkOrder: data.bulkOrder || { enabled: false, moq: "50" }
            });
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleAddFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });
  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    if (newFeatures.length === 0) newFeatures.push("");
    setFormData({ ...formData, features: newFeatures });
  };
  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddHighlightedFeature = () => setFormData({ ...formData, highlightedFeatures: [...formData.highlightedFeatures, { icon: "Shield", title: "" }] });
  const handleRemoveHighlightedFeature = (index: number) => {
    const newFeatures = [...formData.highlightedFeatures];
    newFeatures.splice(index, 1);
    if (newFeatures.length === 0) newFeatures.push({ icon: "Shield", title: "" });
    setFormData({ ...formData, highlightedFeatures: newFeatures });
  };
  const handleHighlightedFeatureChange = (index: number, field: 'icon' | 'title', val: string) => {
    const newFeatures = [...formData.highlightedFeatures];
    newFeatures[index][field] = val;
    setFormData({ ...formData, highlightedFeatures: newFeatures });
  };

  const handleAddSpec = () => setFormData({ ...formData, specs: [...formData.specs, { key: "", value: "" }] });
  const handleRemoveSpec = (index: number) => {
    const newSpecs = [...formData.specs];
    newSpecs.splice(index, 1);
    if (newSpecs.length === 0) newSpecs.push({ key: "", value: "" });
    setFormData({ ...formData, specs: newSpecs });
  };
  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = val;
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleAddBoxItem = () => setFormData({ ...formData, whatsInBox: [...formData.whatsInBox, { icon: "Package", label: "", desc: "" }] });
  const handleRemoveBoxItem = (index: number) => {
    const newItems = [...formData.whatsInBox];
    newItems.splice(index, 1);
    if (newItems.length === 0) newItems.push({ icon: "Package", label: "", desc: "" });
    setFormData({ ...formData, whatsInBox: newItems });
  };
  const handleBoxItemChange = (index: number, field: 'icon' | 'label' | 'desc', val: string) => {
    const newItems = [...formData.whatsInBox];
    newItems[index][field] = val;
    setFormData({ ...formData, whatsInBox: newItems });
  };

  const handleAddGalleryImage = () => setFormData({ ...formData, images: [...formData.images, ""] });
  const handleRemoveGalleryImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };
  const handleGalleryImageChange = (index: number, url: string) => {
    const newImages = [...formData.images];
    newImages[index] = url;
    setFormData({ ...formData, images: newImages });
  };

  const handleAddColor = () => setFormData({ ...formData, colors: [...formData.colors, { name: "", hex: "" }] });
  const handleRemoveColor = (index: number) => {
    const newArr = [...formData.colors];
    newArr.splice(index, 1);
    setFormData({ ...formData, colors: newArr.length > 0 ? newArr : [{ name: "", hex: "" }] });
  };
  const handleColorChange = (index: number, field: 'name' | 'hex', val: string) => {
    const newArr = [...formData.colors];
    newArr[index][field] = val;
    setFormData({ ...formData, colors: newArr });
  };


  const handleAddDetailedFeature = () => setFormData({ ...formData, detailedFeatures: [...formData.detailedFeatures, { icon: "LayoutGrid", title: "", description: "" }] });
  const handleRemoveDetailedFeature = (index: number) => {
    const newArr = [...formData.detailedFeatures];
    newArr.splice(index, 1);
    setFormData({ ...formData, detailedFeatures: newArr });
  };
  const handleDetailedFeatureChange = (index: number, field: 'icon' | 'title' | 'description', val: string) => {
    const newArr = [...formData.detailedFeatures];
    newArr[index][field] = val;
    setFormData({ ...formData, detailedFeatures: newArr });
  };

  const handleAddMaterial = () => setFormData({ ...formData, materials: [...formData.materials, { title: "", description: "", image: "" }] });
  const handleRemoveMaterial = (index: number) => {
    const newArr = [...formData.materials];
    newArr.splice(index, 1);
    setFormData({ ...formData, materials: newArr });
  };
  const handleMaterialChange = (index: number, field: 'title' | 'description' | 'image', val: string) => {
    const newArr = [...formData.materials];
    newArr[index][field] = val;
    setFormData({ ...formData, materials: newArr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Clean up empty arrays before saving
    const cleanedData = {
      ...formData,
      features: formData.features.filter(f => f.trim() !== ""),
      highlightedFeatures: formData.highlightedFeatures.filter(f => f.title.trim() !== ""),
      specs: formData.specs.filter(s => s.key.trim() !== "" && s.value.trim() !== ""),
      images: formData.images.filter(img => img.trim() !== ""),
      whatsInBox: formData.whatsInBox.filter(item => item.label.trim() !== ""),
      colors: formData.colors.filter(c => c.name.trim() !== ""),
      detailedFeatures: formData.detailedFeatures.filter(f => f.title.trim() !== ""),
      materials: formData.materials.filter(m => m.title.trim() !== "")
    };

    try {
      if (productId) {
        await updateDoc(doc(db, "products", productId), cleanedData);
      } else {
        await addDoc(collection(db, "products"), cleanedData);
      }
      router.push('/products');
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product.");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/products')}
          className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter uppercase">
            {productId ? 'Edit' : 'New'} <span className="text-brand-accent">Product</span>
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Complete the detailed product profile
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* BASIC INFO */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight border-b border-white/5 pb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Product Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" />
            </div>
            
            <div>
              <CustomDropdown label="Category" options={categories} value={formData.category} onChange={val => setFormData({...formData, category: val})} placeholder="Select Category" />
            </div>
            
            <div>
              <CustomDropdown label="Product Label" options={[ { label: "None", value: "" }, { label: "New Arrival", value: "New" }, { label: "Best Seller", value: "Best Seller" }, { label: "Limited Edition", value: "Limited" }, { label: "Sustainable", value: "Eco" }, { label: "Premium", value: "Premium" } ]} value={formData.label} onChange={val => setFormData({...formData, label: val})} placeholder="Select Label" />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Price (₹)</label>
              <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-2xl border border-white/5">
              <div>
                <h4 className="font-bold text-white text-sm">Most Picked Status</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Pin to featured section</p>
              </div>
              <button type="button" onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})} className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.isFeatured ? 'bg-green-600' : 'bg-white/10'}`}>
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Tagline / Sub-Heading</label>
              <input type="text" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Ergonomic brilliance that moves with you." />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all resize-none" />
            </div>
          </div>
        </section>

        {/* MEDIA */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight border-b border-white/5 pb-4">Media Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageUploader label="Main Product Image" value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} fallback="" sizeHint="Primary thumbnail (800x1000px)" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Gallery Images</label>
                <button type="button" onClick={handleAddGalleryImage} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Image</button>
              </div>
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-[#0A0A0A] p-4 rounded-2xl border border-white/5">
                  <div className="flex-1">
                    <ImageUploader label={`Gallery Image ${idx + 1}`} value={img} onChange={(url) => handleGalleryImageChange(idx, url)} fallback="" sizeHint="Extra angles" />
                  </div>
                  <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <p className="text-xs text-white/20 italic">No additional gallery images added.</p>
              )}
            </div>
          </div>
        </section>

        {/* LOGISTICS */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight border-b border-white/5 pb-4">Logistics & Trust Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Warranty Details</label>
              <input type="text" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. 5 Years Limited Warranty" />
            </div>
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Shipping Details</label>
              <input type="text" value={formData.shipping} onChange={e => setFormData({...formData, shipping: e.target.value})} className="w-full px-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Free global shipping within 7-10 days" />
            </div>
          </div>
        </section>

        {/* FEATURES & SPECS */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight border-b border-white/5 pb-4">Technical Details</h2>
          
          {/* Highlighted Features (For Cards) */}
          <div className="border-b border-white/5 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Highlighted Features (For Product Cards)</label>
                <p className="text-[10px] text-white/40">These are the short features that show up on the product grid cards.</p>
              </div>
              <button type="button" onClick={handleAddHighlightedFeature} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Card Feature</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {formData.highlightedFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-[#0A0A0A] p-2 rounded-xl border border-white/5">
                  <select
                    value={feat.icon}
                    onChange={(e) => handleHighlightedFeatureChange(idx, 'icon', e.target.value)}
                    className="bg-transparent border-none text-xs text-white focus:outline-none appearance-none cursor-pointer p-2 w-24"
                  >
                    <option value="Shield">Shield</option>
                    <option value="Ruler">Ruler</option>
                    <option value="Zap">Zap</option>
                    <option value="Leaf">Leaf</option>
                    <option value="LayoutGrid">LayoutGrid</option>
                    <option value="Users">Users</option>
                    <option value="Star">Star</option>
                    <option value="Award">Award</option>
                  </select>
                  <input type="text" value={feat.title} onChange={e => handleHighlightedFeatureChange(idx, 'title', e.target.value)} className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none min-w-0" placeholder="e.g. Premium Material" />
                  <button type="button" onClick={() => handleRemoveHighlightedFeature(idx)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-all shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
            {/* Key Features */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Key Features (Bullet Points)</label>
                <button type="button" onClick={handleAddFeature} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Feature</button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input type="text" value={feature} onChange={e => handleFeatureChange(idx, e.target.value)} className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Ergonomic lumbar support" />
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Specifications (Key-Value)</label>
                <button type="button" onClick={handleAddSpec} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Spec</button>
              </div>
              <div className="space-y-3">
                {formData.specs.map((spec, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input type="text" value={spec.key} onChange={e => handleSpecChange(idx, 'key', e.target.value)} className="w-1/3 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Material" />
                    <input type="text" value={spec.value} onChange={e => handleSpecChange(idx, 'value', e.target.value)} className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. High-Density Foam" />
                    <button type="button" onClick={() => handleRemoveSpec(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">What's in the Box</label>
                <p className="text-[10px] text-white/40">List components and accessories included</p>
              </div>
              <button type="button" onClick={handleAddBoxItem} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Item</button>
            </div>
            <div className="space-y-4">
              {formData.whatsInBox.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <select
                    value={item.icon}
                    onChange={(e) => handleBoxItemChange(idx, 'icon', e.target.value)}
                    className="w-1/4 bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                  >
                    <option value="Package">Package (Box)</option>
                    <option value="Wrench">Wrench (Tools)</option>
                    <option value="FileText">FileText (Docs)</option>
                    <option value="Shield">Shield (Care/Warranty)</option>
                    <option value="Star">Star (Bonus)</option>
                  </select>
                  <input type="text" value={item.label} onChange={e => handleBoxItemChange(idx, 'label', e.target.value)} className="w-1/3 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Care Kit" />
                  <input type="text" value={item.desc} onChange={e => handleBoxItemChange(idx, 'desc', e.target.value)} className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="e.g. Microfiber cloth" />
                  <button type="button" onClick={() => handleRemoveBoxItem(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEW RICH CONTENT SECTIONS */}
        <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-12">
          <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight border-b border-white/5 pb-4">Rich Product Data</h2>

          {/* Colors */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Colors</label>
                <p className="text-[10px] text-white/40">Available color variants and hex codes.</p>
              </div>
              <button type="button" onClick={handleAddColor} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Color</button>
            </div>
            <div className="space-y-4">
              {formData.colors.map((color, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" value={color.name} onChange={e => handleColorChange(idx, 'name', e.target.value)} className="w-1/2 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Color Name (e.g. Space Black)" />
                  <input type="text" value={color.hex} onChange={e => handleColorChange(idx, 'hex', e.target.value)} className="w-1/3 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Hex Code (e.g. #000000)" />
                  <div className="w-8 h-8 rounded-full border border-white/20" style={{ backgroundColor: color.hex || '#000' }} />
                  <button type="button" onClick={() => handleRemoveColor(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* Detailed Features */}
          <div className="border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Detailed Features Strip</label>
                <p className="text-[10px] text-white/40">Grid of detailed features with descriptions.</p>
              </div>
              <button type="button" onClick={handleAddDetailedFeature} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Feature</button>
            </div>
            <div className="space-y-4">
              {formData.detailedFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <select
                    value={feat.icon}
                    onChange={(e) => handleDetailedFeatureChange(idx, 'icon', e.target.value)}
                    className="w-1/4 bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                  >
                    <option value="LayoutGrid">LayoutGrid</option>
                    <option value="Move">Move</option>
                    <option value="Wind">Wind</option>
                    <option value="Minimize2">Minimize2</option>
                    <option value="Shield">Shield</option>
                  </select>
                  <input type="text" value={feat.title} onChange={e => handleDetailedFeatureChange(idx, 'title', e.target.value)} className="w-1/3 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Title" />
                  <input type="text" value={feat.description} onChange={e => handleDetailedFeatureChange(idx, 'description', e.target.value)} className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Description" />
                  <button type="button" onClick={() => handleRemoveDetailedFeature(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Materials / Finishes</label>
                <p className="text-[10px] text-white/40">Images and details for materials.</p>
              </div>
              <button type="button" onClick={handleAddMaterial} className="text-[10px] text-brand-accent uppercase font-bold hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Add Material</button>
            </div>
            <div className="space-y-4">
              {formData.materials.map((mat, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
                  <div className="w-1/3">
                    <ImageUploader label={`Material Image ${idx + 1}`} value={mat.image} onChange={(url) => handleMaterialChange(idx, 'image', url)} fallback="" sizeHint="Small thumbnail" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="text" value={mat.title} onChange={e => handleMaterialChange(idx, 'title', e.target.value)} className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Material Name" />
                    <textarea value={mat.description} onChange={e => handleMaterialChange(idx, 'description', e.target.value)} rows={2} className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all resize-none" placeholder="Description" />
                  </div>
                  <button type="button" onClick={() => handleRemoveMaterial(idx)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all self-start">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Story Block */}
          <div className="border-t border-white/5 pt-12">
            <div className="mb-6">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Story Block</label>
              <p className="text-[10px] text-white/40">"Designed Around You" section.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0A0A0A] p-6 rounded-xl border border-white/5">
              <div>
                <ImageUploader label="Story Image" value={formData.storyBlock.image} onChange={(url) => setFormData({...formData, storyBlock: {...formData.storyBlock, image: url}})} fallback="" sizeHint="Lifestyle/Close-up" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-white/40 uppercase mb-2 block">Title</label>
                  <input type="text" value={formData.storyBlock.title} onChange={e => setFormData({...formData, storyBlock: {...formData.storyBlock, title: e.target.value}})} className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="Designed Around You" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase mb-2 block">Description</label>
                  <textarea value={formData.storyBlock.description} onChange={e => setFormData({...formData, storyBlock: {...formData.storyBlock, description: e.target.value}})} rows={4} className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all resize-none" placeholder="Story text..." />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase mb-2 block">Video URL (Optional)</label>
                  <input type="text" value={formData.storyBlock.videoUrl} onChange={e => setFormData({...formData, storyBlock: {...formData.storyBlock, videoUrl: e.target.value}})} className="w-full px-4 py-3 bg-[#111] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-brand-accent transition-all" placeholder="YouTube or MP4 link" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BULK ORDER SETTINGS */}
        <section className="bg-gradient-to-br from-violet-500/10 to-transparent p-8 rounded-[2rem] border border-violet-500/20 space-y-6">
          <div className="flex items-center justify-between border-b border-violet-500/10 pb-4">
            <div>
              <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight">Bulk Order Settings</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Allow B2B bulk inquiries for this product</p>
            </div>
            <button type="button" onClick={() => setFormData({...formData, bulkOrder: {...formData.bulkOrder, enabled: !formData.bulkOrder.enabled}})} className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.bulkOrder.enabled ? 'bg-violet-500' : 'bg-white/10'}`}>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.bulkOrder.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {formData.bulkOrder.enabled && (
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Minimum Order Quantity (MOQ)</label>
                <input 
                  type="text" 
                  required={formData.bulkOrder.enabled}
                  value={formData.bulkOrder.moq} 
                  onChange={e => setFormData({...formData, bulkOrder: {...formData.bulkOrder, moq: e.target.value}})} 
                  className="w-full max-w-md px-6 py-4 bg-[#050505] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-violet-500 transition-all" 
                  placeholder="e.g. 50" 
                />
              </div>
            </div>
          )}
        </section>

        {/* COMBO OFFERS */}
        <section className="bg-gradient-to-br from-brand-accent/10 to-transparent p-8 rounded-[2rem] border border-brand-accent/20 space-y-6">
          <div className="flex items-center justify-between border-b border-brand-accent/10 pb-4">
            <div>
              <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight">Combo Offer Settings</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Boost sales by pairing products</p>
            </div>
            <button type="button" onClick={() => setFormData({...formData, comboOffer: {...formData.comboOffer, enabled: !formData.comboOffer.enabled}})} className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.comboOffer.enabled ? 'bg-brand-accent' : 'bg-white/10'}`}>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.comboOffer.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {formData.comboOffer.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Target Combo Product</label>
                <select 
                  className="w-full bg-[#050505] border border-white/10 focus:border-brand-accent rounded-2xl px-6 py-4 text-sm text-white focus:outline-none transition-colors appearance-none cursor-pointer"
                  value={formData.comboOffer.linkedProductId}
                  onChange={(e) => setFormData({...formData, comboOffer: {...formData.comboOffer, linkedProductId: e.target.value}})}
                  required={formData.comboOffer.enabled}
                >
                  <option value="" disabled>Select a product to bundle...</option>
                  {allProducts.filter(p => p.id !== productId).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Total Combo Price (₹)</label>
                <input 
                  type="text" 
                  required={formData.comboOffer.enabled}
                  value={formData.comboOffer.comboPrice} 
                  onChange={e => setFormData({...formData, comboOffer: {...formData.comboOffer, comboPrice: e.target.value}})} 
                  className="w-full px-6 py-4 bg-[#050505] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-brand-accent transition-all" 
                  placeholder="e.g. 25,000" 
                />
              </div>
            </div>
          )}
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end pt-8">
          <button 
            type="submit"
            disabled={loading}
            className="px-12 py-5 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Saving...' : <><Check className="w-5 h-5" /> {productId ? 'Update Product Details' : 'Publish New Product'}</>}
          </button>
        </div>

      </form>
    </div>
  );
}
