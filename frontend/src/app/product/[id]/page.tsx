"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Check, Download, Shield, Truck, ShoppingBag, CheckCircle2, Package, Wrench, FileText, Star, X, Plus, LayoutGrid, Move, Wind, Minimize2, ShoppingCart, Zap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc, query, where, orderBy, addDoc } from "firebase/firestore";
import { FastAverageColor } from 'fast-average-color';
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { Camera, Trash2, MessageSquare, Star as StarOutline, Maximize, ChevronLeft, User } from "lucide-react";

const getFeatureIcon = (name: string) => {
  switch (name) {
    case 'Shield': return <Shield className="w-6 h-6" />;
    case 'Star': return <Star className="w-6 h-6" />;
    case 'CheckCircle': return <CheckCircle2 className="w-6 h-6" />;
    case 'LayoutGrid': return <LayoutGrid className="w-6 h-6" />;
    case 'Move': return <Move className="w-6 h-6" />;
    case 'Wind': return <Wind className="w-6 h-6" />;
    case 'Minimize2': return <Minimize2 className="w-6 h-6" />;
    default: return <CheckCircle2 className="w-6 h-6" />;
  }
};

const getBoxIcon = (name: string) => {
  switch (name) {
    case 'Package': return <Package className="w-8 h-8" />;
    case 'Wrench': return <Wrench className="w-8 h-8" />;
    case 'FileText': return <FileText className="w-8 h-8" />;
    case 'Shield': return <Shield className="w-8 h-8" />;
    case 'Star': return <Star className="w-8 h-8" />;
    case 'CheckCircle': return <CheckCircle2 className="w-8 h-8" />;
    default: return <Package className="w-8 h-8" />;
  }
};

const fallbackProducts: Record<string, any> = {
  "aeromesh-pro-executive": {
    id: "aeromesh-pro-executive",
    name: "AeroMesh Pro Executive",
    category: "Executive Seating",
    description: "The AeroMesh Pro redefines executive comfort with its adaptive lumbar support system and breathable tension-mesh back. Engineered for 24/7 intensive use environments, it seamlessly blends industrial durability with premium corporate aesthetics.",
    tagline: "Ergonomic brilliance that moves with you.",
    price: "Request Quote",
    colors: [
      { name: "Space Black", hex: "#111111" },
      { name: "Cloud Grey", hex: "#E5E7EB" },
      { name: "Olive Green", hex: "#556b2f" }
    ],
    features: [
      "Adaptive 3D Lumbar Support",
      "Breathable High-Tension Mesh",
      "Synchronized Tilt Mechanism",
      "4D Adjustable Armrests",
      "Polished Aluminum Base"
    ],
    highlightedFeatures: [
      { icon: "Shield", title: "Ergonomic Support" },
      { icon: "Star", title: "Premium Materials" },
      { icon: "CheckCircle", title: "12 Year Warranty" }
    ],
    hotspots: [
      { title: "2D Adjustable Headrest", description: "Provides personalized neck support to reduce strain during long hours.", top: "15", left: "50" },
      { title: "Adaptive Lumbar Support", description: "Dynamically adjusts to your spine's natural curve.", top: "60", left: "50" },
      { title: "4D Armrests", description: "Fully adjustable armrests to perfectly align with your desk height.", top: "50", left: "80" },
      { title: "Breathable Mesh", description: "Maintains optimal temperature and comfort all day.", top: "40", left: "50" }
    ],
    detailedFeatures: [
      { icon: "LayoutGrid", title: "Dynamic Lumbar Support", description: "Automatically adjusts to your spine's natural curve, providing constant lower back support." },
      { icon: "Move", title: "Synchro-Tilt Mechanism", description: "Maintains proper ergonomic alignment as you recline, keeping your feet flat on the floor." },
      { icon: "Wind", title: "Breathable Mesh Back", description: "High-tension, elastomer mesh promotes air circulation to keep you cool and comfortable." },
      { icon: "Minimize2", title: "Adjustable Seat Depth", description: "Allows you to fine-tune the seat pan for optimal thigh support and blood flow." }
    ],
    storyBlock: {
      title: "Designed Around You",
      description: "Aeronix adapts to your body's micro-movements, ensuring perfect posture and comfort throughout your longest days. It's not just a chair; it's a precision instrument for your productivity.",
      videoUrl: "#",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
    },
    materials: [
      { title: "Premium Mesh", description: "High-tension elastomeric mesh engineered for active thermal dissipation and ergonomic micro-adjustments.", image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800" },
      { title: "High-Density Foam", description: "Cold-cure moulded polyurethane seat cushion that preserves structural contour over 100,000+ compressions.", image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&q=80&w=800" },
      { title: "Aviation Aluminium", description: "Die-cast 5-star polished aluminium base engineered for 1500 kg static load resistance.", image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800" },
      { title: "Smooth PU Casters", description: "Noise-dampened 65mm polyurethane dual-wheel casters floor-safe for hardwoods and carpets.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800" }
    ],
    specs: {
      "Overall Height": '44" - 48"',
      "Seat Width": '21.5"',
      "Seat Depth": '19" - 21.5"',
      "Weight Capacity": "350 lbs",
      "Warranty": "12 Years Limited",
      "Materials": "Recycled Aluminum, Premium Mesh, Polyurethane"
    },
    images: [
      "https://res.cloudinary.com/dzb6lofy2/image/upload/v1783721809/m1cjmgtuef9es8x01yla.webp",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800"
    ]
  },
  "ergopro-executive": {
    id: "ergopro-executive",
    name: "ErgoPro Executive",
    category: "Executive Seating",
    description: "The ErgoPro Executive is designed for ultimate posture control, featuring a genuine leather high-back and high-density memory foam padding. Perfect for boardroom leadership and high-focus executive environments.",
    price: "Request Quote",
    features: [
      "High-Back Premium Leather",
      "Memory Foam Seat Cushion",
      "Tilt Lock & Tension Tension Tuning",
      "3D Padded Armrests",
      "Polished Chrome Base"
    ],
    specs: {
      "Overall Height": '45" - 49"',
      "Seat Width": '22"',
      "Seat Depth": '20" - 22"',
      "Weight Capacity": "375 lbs",
      "Warranty": "10 Years Limited",
      "Materials": "Premium Leather, Aluminum, High-Density Foam"
    },
    images: [
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80"
    ]
  },
  "aura-mesh-task": {
    id: "aura-mesh-task",
    name: "Aura Mesh Task",
    category: "Task Seating",
    description: "The Aura Mesh Task offers sleek minimalist design combined with light-weight, highly supportive polymers. Its self-weight adjusting mechanism makes it ideal for flexible desking and co-working environments.",
    price: "Request Quote",
    features: [
      "Weight-Activated Auto Tilt",
      "Breathable Elastomeric Mesh",
      "Sleek Polyurethane Frame",
      "Height Adjustable Armrests",
      "Reinforced Nylon Base"
    ],
    specs: {
      "Overall Height": '38" - 42"',
      "Seat Width": '19.5"',
      "Seat Depth": '18"',
      "Weight Capacity": "275 lbs",
      "Warranty": "8 Years Limited",
      "Materials": "Elastomeric Mesh, Engineered Polymers, Steel"
    },
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80"
    ]
  },
  "zenith-lounge": {
    id: "zenith-lounge",
    name: "Zenith Lounge",
    category: "Lounge Seating",
    description: "The Zenith Lounge is the pinnacle of relaxed comfort. Designed for reception areas, waiting rooms, and break-out areas, it features premium textiles and a contoured structural shell.",
    price: "Request Quote",
    features: [
      "Contoured Sculptural Shell",
      "Premium Stain-Resistant Textile",
      "Polished Steel Swivel Base",
      "Integrated Head Support",
      "Elegant Piping Detail"
    ],
    specs: {
      "Overall Height": '40"',
      "Seat Width": '24"',
      "Seat Depth": '22"',
      "Weight Capacity": "300 lbs",
      "Warranty": "5 Years Limited",
      "Materials": "Structural Shell, Premium Textile, Steel Swivel"
    },
    images: [
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80"
    ]
  }
};

const mapProductData = (p: any) => {
  const rawImages = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (p.img || p.image || p.img_link
       ? [p.img || p.image || p.img_link]
       : []);

  const images = rawImages.filter((img: string) => typeof img === "string" && img.trim() !== "");
  if (images.length === 0) {
    // We only push empty strings if we really have no fallback, but we should handle empty strings in rendering
  }

  const features = Array.isArray(p.features) && p.features.length > 0
    ? p.features
    : [
        "Adaptive Lumbar Support",
        "High-Tension Breathable Mesh",
        "Pneumatic Seat Height Adjustment",
        "Tilt-Tension Control",
        "Dual-Wheel Casters"
      ];

  let parsedSpecs = p.specs;
  if (!parsedSpecs || (Array.isArray(parsedSpecs) && parsedSpecs.length === 0)) {
    parsedSpecs = [
      { key: "Overall Height", value: p.height || '40" - 45"' },
      { key: "Seat Width", value: p.width || '20"' },
      { key: "Seat Depth", value: p.depth || '18" - 20"' },
      { key: "Weight Capacity", value: p.weightCapacity || "300 lbs" },
      { key: "Materials", value: p.materials || "Premium Mesh, Polyurethane, Steel" }
    ];
  } else if (!Array.isArray(parsedSpecs) && typeof parsedSpecs === 'object') {
    // Convert old object specs to array
    parsedSpecs = Object.entries(parsedSpecs).map(([k, v]) => ({ key: k, value: v }));
  }

  return {
    id: p.id || p.name.toLowerCase().replace(/\s+/g, '-'),
    name: p.name,
    category: p.category || p.cat || "Premium Seating",
    description: p.description || p.desc || "Uncompromising comfort and modern styling crafted for long-hour productivity and active posture support.",
    tagline: p.tagline || "Ergonomic brilliance that moves with you.",
    price: typeof p.price === 'number' ? `₹${Math.round(p.price * 83).toLocaleString('en-IN')}` : (typeof p.price === 'string' ? p.price.replace('$', '₹') : (p.price || "Request Quote")),
    warranty: p.warranty || "5 Years Limited Warranty",
    shipping: p.shipping || "Free global shipping within 7-10 days",
    features,
    highlightedFeatures: Array.isArray(p.highlightedFeatures) && p.highlightedFeatures.length > 0 ? p.highlightedFeatures : [{ icon: "Shield", title: "Ergonomic Support" }, { icon: "Star", title: "Premium Materials" }, { icon: "CheckCircle", title: "5 Year Warranty" }],
    specs: parsedSpecs,
    images,
    colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: "Space Black", hex: "#111111" }],
    hotspots: Array.isArray(p.hotspots) && p.hotspots.length > 0 ? p.hotspots : [],
    detailedFeatures: Array.isArray(p.detailedFeatures) && p.detailedFeatures.length > 0 ? p.detailedFeatures : [],
    storyBlock: p.storyBlock || null,
    materials: Array.isArray(p.materials) && p.materials.length > 0 ? p.materials : [],
    brochure: p.brochure || "",
    comboOffer: p.comboOffer || null,
    bulkOrder: p.bulkOrder || null,
    whatsInBox: Array.isArray(p.whatsInBox) && p.whatsInBox.length > 0 
      ? p.whatsInBox 
      : [
          { icon: "Package", label: "Product Parts", desc: "Base, Cylinder, Seat, Backrest" },
          { icon: "Wrench", label: "Assembly Tool", desc: "T-Handle Allen Key & Bolts" },
          { icon: "FileText", label: "Documentation", desc: "Manual & Warranty Card" },
          { icon: "Shield", label: "Care Kit", desc: "Microfiber cloth & cleaner" }
        ],
  };
};

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  
  const fallbackKey = resolvedParams.id === "aeromesh-pro" ? "aeromesh-pro-executive" : resolvedParams.id;
  const initialFallback = fallbackProducts[fallbackKey] || fallbackProducts["aeromesh-pro-executive"];
  
  const [product, setProduct] = useState<any>(initialFallback);
  const [comboProduct, setComboProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<any>(initialFallback.colors?.[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'specifications' | 'materials' | 'reviews' | 'dimensions'>('features');
  const [addedToCart, setAddedToCart] = useState(false);
  const [comboAddedToCart, setComboAddedToCart] = useState(false);
  const { addItem, setIsCartOpen, setCartStep } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleBuyNow = () => {
    const buyItem = {
      ...product,
      id: product.id || product.name,
      category: product.category,
      image: selectedColor?.image || product.images?.[0] || "",
      quantity: 1,
    };
    // Store direct-buy item in sessionStorage — checkout will read this
    sessionStorage.setItem('aveon_buy_now', JSON.stringify(buyItem));
    router.push('/checkout?mode=buynow');
  };
  
  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", photoFile: null as File | null, photoPreview: "" as string });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Bulk Order State
  const [bulkForm, setBulkForm] = useState({ name: "", email: "", phone: "", company: "", quantity: "", notes: "" });
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  
  // Gallery State
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);

  // Pre-fill bulk form if user is logged in
  useEffect(() => {
    if (user && !bulkForm.name && !bulkForm.email) {
      setBulkForm(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user, bulkForm.name, bulkForm.email]);

  // Fetch reviews when product is loaded
  useEffect(() => {
    if (!product?.id) return;
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", product.id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [product?.id]);

  const handleReviewPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewForm({ 
        ...reviewForm, 
        photoFile: file, 
        photoPreview: URL.createObjectURL(file) 
      });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const moq = product?.bulkOrder?.moq || 1;
    if (parseInt(bulkForm.quantity) < moq) {
      alert(`Minimum order quantity is ${moq} units.`);
      return;
    }
    setIsSubmittingBulk(true);
    try {
      const orderRef = `BLK-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      await addDoc(collection(db, "enquiries"), {
        orderRef,
        type: "Bulk Order",
        productId: product.id,
        productName: product.name,
        ...bulkForm,
        status: "Pending",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setBulkSuccess(true);
      setTimeout(() => setBulkSuccess(false), 5000);
      setBulkForm({ name: "", email: "", phone: "", company: "", quantity: "", notes: "" });
    } catch (error) {
      console.error("Error submitting bulk order:", error);
      alert("Failed to submit bulk order inquiry.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to leave a review.");
    if (!reviewForm.comment.trim()) return alert("Please enter a comment.");

    setIsSubmittingReview(true);
    let uploadedPhotoURL = "";

    try {
      if (reviewForm.photoFile) {
        const formData = new FormData();
        formData.append("file", reviewForm.photoFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        uploadedPhotoURL = data.url;
      }

      await addDoc(collection(db, "reviews"), {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhotoURL: user.photoURL || "",
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        photoURL: uploadedPhotoURL,
        createdAt: new Date()
      });

      setReviewForm({ rating: 5, comment: "", photoFile: null, photoPreview: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), async (snapshot) => {
      let foundProduct = null;
      if (!snapshot.empty) {
        const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const matched = dbItems.find((p: any) => {
          const name = p.name || p.title || "";
          return name.toLowerCase().replace(/\s+/g, '-') === resolvedParams.id ||
                 p.id === resolvedParams.id ||
                 name.toLowerCase().replace(/\s+/g, '-') === fallbackKey;
        });
        if (matched) {
          foundProduct = mapProductData(matched);
        }
      }

      if (!foundProduct) {
        try {
          const res = await fetch('https://furniture-dummy-data-api.vercel.app/data');
          if (res.ok) {
            const result = await res.json();
            const payload = result.payload || [];
            const matched = payload.find((p: any) => {
              const name = p.name || "";
              return name.toLowerCase().replace(/\s+/g, '-') === resolvedParams.id ||
                     `api-${p.id}` === resolvedParams.id ||
                     name.toLowerCase().replace(/\s+/g, '-') === fallbackKey;
            });
            if (matched) {
              foundProduct = mapProductData(matched);
            }
          }
        } catch (err) {
          console.warn("Could not fetch product from external API:", err);
        }
      }

      if (foundProduct) {
        setProduct(foundProduct);
        // Fetch combo product if it exists
        if (foundProduct.comboOffer?.enabled && foundProduct.comboOffer?.linkedProductId) {
          const comboRef = doc(db, "products", foundProduct.comboOffer.linkedProductId);
          const comboSnap = await getDoc(comboRef);
          if (comboSnap.exists()) {
            setComboProduct({ id: comboSnap.id, ...comboSnap.data() });
          }
        }
      } else {
        setProduct(initialFallback);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore fetch error:", error);
      setProduct(initialFallback);
      setLoading(false);
    });

    return () => unsub();
  }, [resolvedParams.id, fallbackKey, initialFallback]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-brand-accent selection:text-black">
      {/* 2-Column Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
            {/* Left Column - Product Details */}
            <div className="w-full lg:w-5/12 flex flex-col justify-center order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-xs sm:text-sm font-semibold tracking-widest text-brand-accent uppercase mb-3 sm:mb-4">
                  {product.category || 'Executive Seating'}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-outfit tracking-tighter text-white mb-4 sm:mb-6 leading-[1.05]">
                  {product.name}
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 font-light leading-relaxed">
                  {product.description}
                </p>

                {/* Hotspot triggers or variants could go here */}
                <div className="flex gap-4 mb-6 sm:mb-10 border-t border-white/10 pt-6 sm:pt-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-2">Colors</span>
                    <div className="flex gap-2">
                      {product.colors?.map((c: any) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor?.name === c.name ? "border-brand-accent" : "border-transparent"
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-center justify-between mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Price</span>
                    {product.price === 'Request Quote' ? (
                      <span className="inline-flex items-center gap-2 text-brand-accent font-black text-lg uppercase tracking-wide">
                        Request Quote
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-brand-accent font-black text-2xl">&#8377;{product.price}</span>
                        <span className="text-[10px] text-white/40 font-medium">+ GST</span>
                      </div>
                    )}
                  </div>
                  {product.price !== 'Request Quote' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
                      In Stock
                    </span>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Buy Now — primary CTA */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_24px_color-mix(in_srgb,var(--color-brand-accent)_40%,transparent)] hover:shadow-[0_0_36px_color-mix(in_srgb,var(--color-brand-accent)_60%,transparent)] hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <Zap className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Buy Now
                  </motion.button>

                  {/* Add to Cart — icon button with tooltip */}
                  <div className="relative group/cart">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        addItem({
                          ...product,
                          id: product.id || product.name,
                          category: product.category,
                          image: selectedColor?.image || product.images?.[0]
                        });
                        setAddedToCart(true);
                        setTimeout(() => setAddedToCart(false), 2000);
                      }}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0
                        ${ addedToCart
                          ? 'bg-green-500 border-green-500 text-white scale-110'
                          : 'border-white/20 bg-white/5 hover:border-brand-accent hover:bg-brand-accent/10 text-white hover:text-brand-accent'
                        }`}
                    >
                      <AnimatePresence mode="wait">
                        {addedToCart ? (
                          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <ShoppingCart className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover/cart:opacity-100 transition-opacity duration-200">
                      <div className="bg-[#111] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                        {addedToCart ? 'Added!' : 'Add to Cart'}
                      </div>
                      <div className="w-2 h-2 bg-[#111] border-b border-r border-white/10 rotate-45 mx-auto -mt-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Product Image */}
            <div className="w-full lg:w-7/12 flex flex-col gap-4 sm:gap-6 order-1 lg:order-2">
              <div className="w-full relative aspect-square bg-white/5 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none z-10" />
                  {(() => {
                    const src = activeImage || selectedColor?.image || product.colors?.[0]?.image || product.images?.[0] || fallbackProducts["aeromesh-pro-executive"].images[0];
                    return src ? (
                      <Image
                        src={src}
                        alt={product.name}
                        fill
                        className="object-contain object-center transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                        <Camera className="w-32 h-32 text-gray-200" />
                        <span className="text-gray-400 font-bold mt-4 tracking-widest uppercase text-sm">Image Coming Soon</span>
                      </div>
                    );
                  })()}
                </motion.div>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.filter((img: string) => img).length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {product.images.filter((img: string) => img).map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                        (activeImage === img || (!activeImage && idx === 0 && !selectedColor?.image)) 
                          ? 'border-brand-accent scale-105' 
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Combo Offer Section */}
      {product.comboOffer?.enabled && comboProduct && (
        <section className="border-t border-white/5 bg-[#111] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-brand-accent/20 to-transparent border border-brand-accent/30 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                  <Star className="w-4 h-4" /> Perfect Pairing
                </div>
                <h3 className="text-3xl md:text-4xl font-black font-outfit text-white mb-4">
                  {product.comboOffer.promotionalText || `Bundle with ${comboProduct.name}`}
                </h3>
                <p className="text-gray-400 text-lg mb-8">
                  Save {product.comboOffer.discountPercentage || 10}% when purchased together.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      addItem({ ...comboProduct, id: comboProduct.id, image: comboProduct.images?.[0] });
                      setComboAddedToCart(true);
                      alert("Combo item added to cart!");
                    }}
                    className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Add Combo to Cart
                  </button>
                  <Link href={`/product/${comboProduct.id}`}>
                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-square relative bg-white/5 rounded-[2rem] overflow-hidden">
                {comboProduct.images?.[0] ? (
                  <Image src={comboProduct.images[0]} alt={comboProduct.name} fill className="object-contain p-4" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><Camera className="w-16 h-16 text-gray-400" /></div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Navigation (Sticky) */}
      <div className="sticky top-[64px] sm:top-[72px] md:top-[80px] z-30 bg-[#111]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
            {["features", "specifications", "materials", "dimensions", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overview' | 'features' | 'specifications' | 'materials' | 'reviews' | 'dimensions')}
                className={`py-4 sm:py-6 text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "border-brand-accent text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="bg-[#111]">
        <AnimatePresence mode="wait">
          {activeTab === "features" && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24"
            >
              {/* Story Block */}
              {product.storyBlock?.title && (
                <div className="mb-16 sm:mb-24 flex flex-col lg:flex-row gap-8 lg:gap-10 items-center bg-white/5 border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 overflow-hidden">
                  <div className="lg:w-1/2 relative z-10">
                    <div className="text-xs sm:text-sm font-bold tracking-widest text-brand-accent uppercase mb-3 sm:mb-4">The Story</div>
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit mb-4 sm:mb-6">{product.storyBlock.title}</h3>
                    <p className="text-gray-400 text-base sm:text-lg leading-relaxed">{product.storyBlock.description}</p>
                  </div>
                  <div className="lg:w-1/2 w-full h-[260px] sm:h-[380px] relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/10 group">
                    <Image 
                      src={
                        product.storyBlock?.image || 
                        product.images?.[1] || 
                        product.images?.[0] || 
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                      } 
                      alt={product.storyBlock.title} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Features Grid */}
              <div className="mb-16 sm:mb-24">
                <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-8 sm:mb-12">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {product.features?.map((feature: any, idx: number) => {
                    const featureName = typeof feature === 'string' ? feature : feature.title;
                    const defaultDescriptions: Record<string, string> = {
                      "Adaptive 3D Lumbar Support": "Dynamically conforms to lumbar vertebrae for active posture alignment.",
                      "Breathable High-Tension Mesh": "Multi-layer engineered weave providing thermal dissipation all day.",
                      "Synchronized Tilt Mechanism": "Maintains 2:1 back-to-seat kinetic ratio for balanced recline.",
                      "4D Adjustable Armrests": "Precision height, depth, angle, and width personalization.",
                      "Polished Aluminum Base": "Tested for 1,500 kg static load with structural integrity guarantee."
                    };
                    const featureDesc = typeof feature === 'string' 
                      ? (defaultDescriptions[featureName] || 'Engineered with commercial-grade specifications') 
                      : feature.description;
                    return (
                      <div key={idx} className="bg-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10">
                        <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center mb-6 shadow-sm text-brand-accent">
                          {getFeatureIcon(featureName)}
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold mb-3">{featureName}</h4>
                        <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{featureDesc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Features */}
              {product.detailedFeatures && product.detailedFeatures.length > 0 && (
                <div className="mb-16 sm:mb-24">
                  <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-8 sm:mb-12">Ergonomic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {product.detailedFeatures.map((feat: any, idx: number) => (
                      <div key={idx} className="bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex gap-4 sm:gap-6 hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#111] rounded-2xl shrink-0 flex items-center justify-center shadow-sm text-brand-accent">
                          {getFeatureIcon(feat.icon || feat.title)}
                        </div>
                        <div>
                          <h4 className="text-lg sm:text-xl font-bold mb-2">{feat.title}</h4>
                          <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feat.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bento Grid Gallery */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-8 sm:mb-12">Design Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
                  <div className="sm:col-span-2 md:col-span-2 md:row-span-2 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 relative overflow-hidden group flex items-center justify-center min-h-[240px] md:min-h-0 aspect-square md:aspect-auto">
                    {product.images?.[0] || fallbackProducts["aeromesh-pro-executive"].images[0] ? (
                      <Image
                         src={product.images?.[0] || fallbackProducts["aeromesh-pro-executive"].images[0]}
                         alt="Detail 1"
                         fill
                         className="object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Camera className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <div className="sm:col-span-2 md:col-span-2 md:row-span-1 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 relative overflow-hidden group flex items-center justify-center min-h-[180px] md:min-h-0 aspect-[16/10] md:aspect-auto">
                    {product.images?.[1] || fallbackProducts["aeromesh-pro-executive"].images[1] ? (
                      <Image
                         src={product.images?.[1] || fallbackProducts["aeromesh-pro-executive"].images[1]}
                         alt="Detail 2"
                         fill
                         className="object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Camera className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  <div className="sm:col-span-1 md:col-span-1 md:row-span-1 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 relative overflow-hidden group flex items-center justify-center min-h-[160px] md:min-h-0 aspect-square md:aspect-auto">
                    {product.images?.[2] || fallbackProducts["aeromesh-pro-executive"].images[2] ? (
                      <Image
                         src={product.images?.[2] || fallbackProducts["aeromesh-pro-executive"].images[2]}
                         alt="Detail 3"
                         fill
                         className="object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                  <div className="sm:col-span-1 md:col-span-1 md:row-span-1 rounded-[1.5rem] sm:rounded-[2rem] bg-brand-accent relative flex flex-col items-center justify-center text-white p-6 min-h-[160px] md:min-h-0 aspect-square md:aspect-auto">
                    <Star className="w-10 h-10 mb-4 opacity-50" />
                    <span className="text-center font-bold text-base sm:text-lg">Award Winning Design</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "specifications" && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24"
            >
              <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-8 sm:mb-12">Technical Specifications</h3>
              <div className="bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 md:p-12">
                <div className="divide-y divide-white/5">
                  {(Array.isArray(product.specs) ? product.specs : Object.entries(product.specs || {}).map(([k, v]) => ({ key: k, value: v }))).map((spec: any, idx: number) => {
                    const rawVal = spec.value ?? spec.description ?? '';
                    let displayVal: string;
                    if (Array.isArray(rawVal)) {
                      // Array of objects (e.g. materials) — extract title, name, or label
                      displayVal = rawVal.map((item: any) =>
                        typeof item === 'string' ? item : (item.title || item.name || item.label || JSON.stringify(item))
                      ).join(', ');
                    } else if (rawVal !== null && typeof rawVal === 'object') {
                      displayVal = Object.values(rawVal).join(', ');
                    } else {
                      displayVal = String(rawVal);
                    }
                    return (
                      <div key={idx} className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <span className="text-gray-400 font-medium text-sm sm:text-base">{spec.key || spec.title}</span>
                        <span className="text-white font-bold text-left sm:text-right max-w-full sm:max-w-xs text-sm sm:text-base break-words">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "materials" && (
            <motion.div
              key="materials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24"
            >
              <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-8 sm:mb-12">Premium Materials</h3>
              {product.materials && product.materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {product.materials.map((mat: any, idx: number) => {
                    const fallbackImgs = [
                      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
                      "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&q=80&w=800",
                      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
                      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
                    ];
                    const matImg = mat.image || fallbackImgs[idx % fallbackImgs.length];
                    return (
                      <div key={idx} className="bg-white/5 rounded-[2rem] overflow-hidden group border border-white/5 hover:border-brand-accent/30 transition-all hover:bg-white/[0.07]">
                        <div className="h-48 sm:h-56 relative w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                          <Image src={matImg} alt={mat.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <span className="absolute bottom-3 left-4 text-[10px] font-black uppercase tracking-widest text-brand-accent bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                            Grade A Component
                          </span>
                        </div>
                        <div className="p-6">
                          <h4 className="text-lg font-bold text-white mb-2">{mat.title}</h4>
                          <p className="text-gray-400 leading-relaxed text-sm">{mat.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">No materials information available for this product.</p>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
                <h3 className="text-3xl font-black font-outfit">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex text-brand-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(reviews.length > 0 ? reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length : 0) ? 'fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-lg">
                    {reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-gray-400 font-medium">({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {reviews.length > 0 ? reviews.map((review, idx) => (
                  <div key={idx} className="bg-white/5 rounded-[2rem] p-8 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        {review.userPhotoURL ? (
                          <img src={review.userPhotoURL} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{review.userName || review.name || "Anonymous"}</h4>
                        <div className="flex text-brand-accent">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (review.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 leading-relaxed text-sm">"{review.comment || review.text}"</p>
                    {review.photoURL && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                        <img src={review.photoURL} alt="Review attachment" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-400 col-span-full py-8 text-center bg-white/5 rounded-[2rem]">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              {/* Write a Review Form */}
              <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-12">
                <h3 className="text-2xl font-black font-outfit mb-6">Write a Review</h3>
                {!user ? (
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                    <p className="text-gray-400">Please sign in to share your thoughts and photos.</p>
                    <Link href="/login" className="px-6 py-3 bg-brand-accent text-white font-bold rounded-full hover:bg-brand-accent/90 transition-colors">Sign In</Link>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {/* Rating Selector */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`transition-colors ${star <= reviewForm.rating ? 'text-brand-accent' : 'text-gray-600 hover:text-gray-400'}`}
                          >
                            <Star className="w-8 h-8 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Your Review</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="What do you love about this product? How is the quality?"
                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      ></textarea>
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Add a Photo (Optional)</label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white font-medium flex items-center gap-2">
                          <Camera className="w-5 h-5 text-gray-400" />
                          Upload Photo
                          <input type="file" accept="image/*" onChange={handleReviewPhotoSelect} className="hidden" />
                        </label>
                        
                        {reviewForm.photoPreview && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
                            <img src={reviewForm.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, photoFile: null, photoPreview: "" })}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full md:w-auto px-10 py-4 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingReview ? "Submitting..." : "Post Review"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
          
          {activeTab === "dimensions" && (
            <motion.div
              key="dimensions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24"
            >
               <h3 className="text-2xl sm:text-3xl font-black font-outfit mb-3">Product Dimensions & Engineering</h3>
               <p className="text-gray-400 text-sm mb-8 sm:mb-12">Precise architectural tolerances designed for ergonomic executive layouts.</p>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10">
                  {/* Visual Blueprint / Diagram */}
                  <div className="lg:col-span-7 aspect-[4/3] bg-neutral-900/90 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 group">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    
                    {/* Architectural Blueprint Graphic */}
                    <div className="relative w-48 sm:w-56 h-60 sm:h-72 flex items-center justify-center">
                      <Image
                        src={product.images?.[0] || "https://res.cloudinary.com/dzb6lofy2/image/upload/v1783721809/m1cjmgtuef9es8x01yla.webp"}
                        alt={`${product.name} blueprint`}
                        fill
                        className="object-contain filter grayscale contrast-125 opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      
                      {/* Height Caliper Line */}
                      <div className="absolute -left-5 top-4 bottom-4 w-px bg-brand-accent/80 flex flex-col justify-between items-center text-[10px] font-mono text-brand-accent font-bold">
                        <span className="w-2 h-px bg-brand-accent" />
                        <span className="bg-black/90 px-1 py-0.5 rounded -rotate-90 whitespace-nowrap border border-brand-accent/30">
                          {product.specs?.["Overall Height"] || '44"-48"'}
                        </span>
                        <span className="w-2 h-px bg-brand-accent" />
                      </div>

                      {/* Width Caliper Line */}
                      <div className="absolute -bottom-4 left-6 right-6 h-px bg-brand-accent/80 flex justify-between items-center text-[10px] font-mono text-brand-accent font-bold">
                        <span className="h-2 w-px bg-brand-accent" />
                        <span className="bg-black/90 px-1 py-0.5 rounded whitespace-nowrap border border-brand-accent/30">
                          {product.specs?.["Seat Width"] || '21.5"'}
                        </span>
                        <span className="h-2 w-px bg-brand-accent" />
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 text-[10px] uppercase font-mono tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full">
                      CAD Tolerance ±2mm
                    </div>
                  </div>

                  {/* Dimension Metrics Breakdown */}
                  <div className="lg:col-span-5 space-y-3">
                    {[
                      { label: "Overall Height", val: product.specs?.["Overall Height"] || '44" – 48"', metric: "1120 – 1220 mm" },
                      { label: "Seat Width", val: product.specs?.["Seat Width"] || '21.5"', metric: "546 mm" },
                      { label: "Seat Depth", val: product.specs?.["Seat Depth"] || '19" – 21.5"', metric: "482 – 546 mm" },
                      { label: "Backrest Height", val: '26"', metric: "660 mm" },
                      { label: "Base Diameter", val: '27.5"', metric: "700 mm" },
                      { label: "Weight Capacity", val: product.specs?.["Weight Capacity"] || '350 lbs', metric: "160 kg" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                        <div>
                          <span className="text-xs font-semibold text-gray-300 block">{item.label}</span>
                          <span className="text-[10px] font-mono text-gray-500">{item.metric}</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-brand-accent">{item.val}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Support / Help Section */}
      <section className="bg-[#0A0A0A] py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111] border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-white mb-4 sm:mb-6 leading-tight">Need Project Guidance?</h2>
              <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">Our commercial seating experts are ready to assist with space planning, fabric selection, and bulk pricing.</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Link href="/contact" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-8 py-4 bg-brand-accent text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-brand-accent/20">
                    Contact Sales
                  </button>
                </Link>
                {product.brochure ? (
                  <a href={product.brochure} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-[#222] transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" /> Download Brochure
                    </button>
                  </a>
                ) : (
                  <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-[#222] transition-colors flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> Download Catalog
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
