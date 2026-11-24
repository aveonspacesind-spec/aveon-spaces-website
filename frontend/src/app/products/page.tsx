
"use client";
import Link from "next/link";
import { ArrowRight, Download, ShoppingBag, Check, Search, Sparkles, Eye, X, Ruler, Shield, Zap, ChevronDown, Star, Leaf, Users, MoreVertical, LayoutGrid, Award, Package, ImageIcon, Heart } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useState, useRef, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import Loader, { SkeletonList } from "@/components/Loader";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

const IconMap: Record<string, any> = {
  Shield, Ruler, Zap, Leaf, LayoutGrid, Users, Star, Award, Package, Check
};

interface MostPickedItemProps {
  p: any;
  i: number;
  total: number;
  scrollYProgress: any;
  setSelectedProduct: (p: any) => void;
  addItem: (p: any) => void;
  items: any[];
}

function MostPickedItem({ p, i, total, scrollYProgress, setSelectedProduct, addItem, items }: MostPickedItemProps) {
  const step = 1 / total;
  const start = i * step;
  const end = Math.min(start + step * 0.8, 1);
  const exitStart = end;
  const exitEnd = Math.min(end + step * 0.5, 1);

  // The first item should already be visible when the section is reached
  const isLast = i === total - 1;
  const y = useTransform(scrollYProgress, [start, end], [i === 0 ? "0vh" : "100vh", "0vh"]);
  const scale = useTransform(scrollYProgress, [exitStart, exitEnd], [1, isLast ? 1 : 0.92 - (i * 0.01)]);
  const opacity = 1; // Keep container opaque to prevent underlying cards from peeking through
  const contentOpacity = useTransform(scrollYProgress, [exitStart, exitEnd], [1, isLast ? 1 : 0]);

  return (
    <motion.div 
      style={{ y, scale, opacity, zIndex: i }}
      className="absolute inset-0 flex items-center justify-center animate-none"
    >
      <div className="w-full h-full relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl flex flex-col md:flex-row">
        {/* PRODUCT IMAGE SIDE */}
        <motion.div 
          style={{ opacity: contentOpacity }}
          className="w-full md:w-1/2 h-[42%] sm:h-1/2 md:h-full relative overflow-hidden bg-[#111] shrink-0"
        >
          {p.img && typeof p.img === "string" && p.img.trim() !== "" ? (
            <motion.img 
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={p.img} 
              alt={p.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 md:from-black/20 to-transparent" />
        </motion.div>
        
        {/* DETAILS SIDE */}
        <motion.div 
          style={{ opacity: contentOpacity }}
          className="w-full md:w-1/2 p-5 sm:p-8 md:p-14 lg:p-20 flex flex-col justify-center bg-[#0A0A0A] overflow-y-auto md:overflow-visible"
        >
          <div className="mb-4 sm:mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <span className="text-brand-accent font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.4em] block">
                Premium Series 0{i+1}
              </span>
              <button 
                onClick={() => setSelectedProduct(p)}
                className="text-white/40 hover:text-white transition-colors p-1"
                aria-label="Quick View"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black font-outfit tracking-tighter text-white mb-2 sm:mb-6 leading-tight">
              {p.name}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-md mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-none">
              Experience the pinnacle of ergonomic engineering. Designed for high-performance environments where comfort meets cinematic aesthetic.
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-10">
              {['Ergonomic', 'Premium Fabric', '4D Armrests'].map((feature) => (
                <span key={feature} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
            <button 
              onClick={() => addItem({...p, id: p.name, category: p.cat, image: p.img})}
              className={`px-6 sm:px-10 py-3 sm:py-4 rounded-full font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center gap-2 sm:gap-3 ${
                items.find(item => item.id === p.name)
                  ? "bg-green-600 text-white"
                  : "bg-brand-accent text-white lg:hover:bg-white lg:hover:text-black"
              }`}
            >
              {items.find(item => item.id === p.name) ? "Added" : "Add to Enquiry"} 
              {items.find(item => item.id === p.name) ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <Link 
              href={`/product/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest lg:hover:text-brand-accent transition-colors flex items-center gap-1.5 sm:gap-2 group py-2"
            >
              Explore <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProductsContent() {
  const { addItem, items } = useCart();
  const { toggleItem, isSaved } = useWishlist();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState(initialCategory ? (initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)) : "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [hoveredProductColor, setHoveredProductColor] = useState<string | null>(null);
  const [colorCache, setColorCache] = useState<Record<string, string>>({});
  const [visibleCount, setVisibleCount] = useState(9); // Number of products to show initially
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  
  const targetRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isFetchingRef = useRef(false);
  useEffect(() => {
    isFetchingRef.current = isFetchingNext;
  }, [isFetchingNext]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingRef.current) {
        setIsFetchingNext(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 9);
          setIsFetchingNext(false);
        }, 800);
      }
    }, { rootMargin: "200px" });
    
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []); // Setup observer once



  const [fbProducts, setFbProducts] = useState<any[]>([]);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [globalBrochure, setGlobalBrochure] = useState("");
  const [featuredProductId, setFeaturedProductId] = useState("");
  const [featuredBadgeText, setFeaturedBadgeText] = useState("Premium");

  useEffect(() => {
    // Fetch global brochure and featured product config from site_config
    const unsubConfig = onSnapshot(doc(db, "site_config", "product_listing"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.globalBrochure !== undefined) setGlobalBrochure(data.globalBrochure);
        if (data.featuredProductId !== undefined) setFeaturedProductId(data.featuredProductId);
        if (data.featuredBadgeText !== undefined) setFeaturedBadgeText(data.featuredBadgeText);
      }
    });
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      const catNames = snapshot.docs.map(doc => (doc.data() as any).name);
      setCategories(['All', ...catNames]);
    });

    // Fetch Products from Firestore
    const q = query(collection(db, "products"), orderBy("name", "asc"));
    const unsubProducts = onSnapshot(q, (snapshot) => {
      const fbData = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        console.log("Product from DB:", data);
        return {
          id: doc.id,
          ...data,
          cat: data.category,
          img: data.image || (data.images && data.images.length > 0 ? data.images[0] : ""),
          mostPicked: data.isFeatured,
          label: data.label
        };
      });
      setFbProducts(fbData);
    }, (error) => {
      console.warn("Firestore Error:", error.message);
      // Let the app continue with dummy API data
    });

    return () => {
      unsubCats();
      unsubProducts();
    };
  }, []);

  useEffect(() => {
    // Fetch from Dummy API ONCE
    const fetchDummyData = async () => {
      try {
        const response = await fetch('https://furniture-dummy-data-api.vercel.app/data');
        const result = await response.json();
        const dummyData = result.payload || [];
        
        const apiData = dummyData.map((p: any) => {
          let inrPrice = p.price;
          if (typeof inrPrice === 'number') {
            inrPrice = `₹${Math.round(inrPrice * 83).toLocaleString('en-IN')}`;
          } else if (typeof inrPrice === 'string') {
            inrPrice = inrPrice.replace('$', '₹');
          }
          return {
            id: `api-${p.id}`,
            name: p.name,
            cat: p.type || p.category || "Furniture",
            img: p.img_link || p.image,
            price: inrPrice,
            description: p.description,
            mostPicked: p.isFeatured || false,
            label: p.label || null
          };
        });
        
        setApiProducts(apiData);
      } catch (error) {
        console.warn("Could not fetch external dummy data. Browser extension or CORS may be blocking it.");
      }
    };
    
    fetchDummyData();
  }, []);

  useEffect(() => {
    // Merge data whenever either source updates
    const combined = [...fbProducts, ...apiProducts];
    setAllProducts(combined);

    // Update categories if API has new ones
    if (apiProducts.length > 0) {
      const apiCats = Array.from(new Set(apiProducts.map((p: any) => p.cat as string)));
      setCategories((prev: string[]) => {
        const uniqueCats = Array.from(new Set([...prev, ...apiCats]));
        return uniqueCats as string[];
      });
    }

    if (combined.length > 0) {
      setIsInitialLoading(false);
    }
  }, [fbProducts, apiProducts]);


  const mostPicked = allProducts.filter(p => p.mostPicked);
  
  let filteredProducts = allProducts.filter(p => {
    const categoryMatch = activeCategory === "All" || p.cat === activeCategory;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Pull out the explicitly featured product to the front if it's in the filtered list
  if (featuredProductId) {
    const explicitFeaturedIndex = filteredProducts.findIndex(p => p.name === featuredProductId);
    if (explicitFeaturedIndex !== -1) {
      const explicitFeatured = filteredProducts.splice(explicitFeaturedIndex, 1)[0];
      filteredProducts = [explicitFeatured, ...filteredProducts];
    }
  }

  // Reset visible count when category or search changes
  useEffect(() => {
    setVisibleCount(9);
  }, [activeCategory, searchQuery]);

  // Native IntersectionObserver handles the infinite scroll loading logic now.

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Vertical Scroll Lock & Stacking Logic
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  return (
    <div className="bg-[#050505] text-white relative">
      {/* HOVER GRADIENT BACKGROUND */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-out"
        style={{
          background: hoveredProductColor ? `radial-gradient(circle at 50% 50%, ${hoveredProductColor}20 0%, transparent 70%)` : 'transparent',
          opacity: hoveredProductColor ? 1 : 0
        }}
      />
      
      {/* HERO */}
      <section className="pt-28 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand-accent font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">
            Exhibition Hub
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black font-outfit tracking-tighter leading-[0.9] mb-4">
            CURATED <br />
            <span className="italic font-light text-gray-500 text-[clamp(2rem,5vw,3.5rem)]">COLLECTIONS.</span>
          </h1>
        </motion.div>
      </section>

      {/* FILTER BAR */}
      <section className="sticky top-0 z-40 bg-[#050505] border-b border-white/10 py-3 sm:py-4 md:py-6 px-4 md:px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-8 items-center justify-between">
          <div className="flex overflow-x-auto no-scrollbar md:flex-wrap gap-4 sm:gap-6 items-center w-full md:w-auto pb-1 sm:pb-2 md:pb-0">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-1 whitespace-nowrap ${
                  activeCategory === cat ? "text-brand-accent" : "text-gray-500 lg:hover:text-white"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div layoutId="catUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent" />
                )}
              </button>
            ))}
            
            {categories.length > 4 && (
              <div className="relative group shrink-0">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  onBlur={() => setTimeout(() => setShowMoreMenu(false), 200)}
                  className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-1 whitespace-nowrap ${
                    categories.slice(4).includes(activeCategory) ? "text-brand-accent" : "text-gray-500 lg:hover:text-white"
                  }`}
                >
                  More <ChevronDown className={`w-3 h-3 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`} />
                  {categories.slice(4).includes(activeCategory) && (
                    <motion.div layoutId="catUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-4 left-0 md:left-1/2 md:-translate-x-1/2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 flex flex-col"
                    >
                      {categories.slice(4).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setShowMoreMenu(false);
                          }}
                          className={`text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                            activeCategory === cat ? "text-brand-accent bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="EXPLORE SERIES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 sm:py-3.5 pl-10 sm:pl-12 pr-5 sm:pr-6 text-base md:text-[10px] uppercase tracking-widest focus:outline-none focus:border-brand-accent transition-all text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </section>

      {/* STANDARD VERTICAL GRID */}
      <section className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="w-full h-[380px] sm:h-[450px] md:h-[500px] bg-[#111] rounded-[1.75rem] sm:rounded-[2rem] border border-white/5 flex flex-col p-5 sm:p-6 overflow-hidden relative">
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-20" />
                
                <div className="h-4 w-20 bg-white/5 rounded-full mb-4 animate-pulse" />
                <div className="h-8 w-3/4 bg-white/5 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded-full mb-auto animate-pulse" />
                <div className="w-full aspect-[4/3] md:aspect-square bg-white/5 rounded-2xl my-4 sm:my-6 animate-pulse" />
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-4 w-24 bg-white/5 rounded-full animate-pulse" />
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {displayedProducts.map((p, idx) => {
              // If a featured product is set, only feature it if it's the first item. If not set, default to first item.
              const isFeatured = idx === 0 && (!featuredProductId || p.name === featuredProductId);

              const getMockFeatures = (category: string) => {
                const cat = category?.toLowerCase() || '';
                if (cat.includes('seating') || cat.includes('chair')) {
                  return [
                    { icon: Shield, title: "Premium Material" },
                    { icon: Ruler, title: "Adjustable Base" },
                    { icon: Zap, title: "Dynamic Support" }
                  ];
                }
                if (cat.includes('desk') || cat.includes('table')) {
                  return [
                    { icon: Leaf, title: "Eco-friendly" },
                    { icon: LayoutGrid, title: "Modern Design" },
                    { icon: Shield, title: "Durable Core" }
                  ];
                }
                return [
                  { icon: LayoutGrid, title: "Space Saving" },
                  { icon: Star, title: "Premium Quality" },
                  { icon: Award, title: "Certified" }
                ];
              };

              let features = [];
              if (p.highlightedFeatures && Array.isArray(p.highlightedFeatures) && p.highlightedFeatures.length > 0) {
                features = p.highlightedFeatures.map((f: any) => ({
                  icon: IconMap[f.icon] || Shield,
                  title: f.title
                }));
              } else {
                features = getMockFeatures(p.cat);
              }

              const categoryIcon = p.cat?.toLowerCase().includes('seating') ? <Star className="w-5 h-5" /> : p.cat?.toLowerCase().includes('desk') ? <Leaf className="w-5 h-5" /> : <Users className="w-5 h-5" />;

              if (isFeatured) {
                // FEATURED HORIZONTAL CARD
                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="md:col-span-2 lg:col-span-3 group relative z-10 flex flex-col md:flex-row bg-[#151515] rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden border border-white/5 mb-6 sm:mb-8 lg:hover:border-white/10 transition-colors shadow-2xl"
                  >
                    {/* Image Area: order-1 on mobile, order-2 on desktop */}
                    <div className="order-1 md:order-2 w-full md:w-1/2 lg:w-[55%] relative flex flex-col md:flex-row">
                      <div className="flex-1 relative bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center p-0 min-h-[220px] sm:min-h-[280px] md:min-h-[400px] overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none mix-blend-screen transition-opacity lg:group-hover:opacity-40" />
                        
                        {p.img ? (
                          <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-105 lg:group-hover:drop-shadow-2xl z-10" />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-white/5 flex items-center justify-center z-10">
                            <ImageIcon className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        
                        {/* Action buttons: visible on mobile, hover on desktop */}
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex gap-2">
                          <button 
                            onClick={() => toggleItem({ id: p.name, name: p.name, category: p.cat, image: p.img, price: p.price })}
                            className={`w-9 h-9 sm:w-10 sm:h-10 backdrop-blur-md border border-white/15 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                              isSaved(p.name) ? "bg-white text-brand-accent border-brand-accent/40" : "bg-black/60 md:bg-white/10 text-white hover:text-brand-accent"
                            }`}
                            aria-label={isSaved(p.name) ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`w-4 h-4 ${isSaved(p.name) ? "fill-brand-accent text-brand-accent" : ""}`} />
                          </button>
                          <button 
                            onClick={() => setSelectedProduct(p)}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-black/60 md:bg-white/10 backdrop-blur-md border border-white/15 text-white rounded-full flex items-center justify-center lg:hover:bg-white lg:hover:text-black transition-all active:scale-90"
                            aria-label="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => addItem({...p, id: p.name, category: p.cat, image: p.img})}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                              items.find(item => item.id === p.name)
                                ? "bg-green-600 text-white"
                                : "bg-brand-accent text-white lg:hover:bg-white lg:hover:text-black shadow-lg shadow-brand-accent/25"
                            }`}
                            aria-label="Add to Selection"
                          >
                            {items.find(item => item.id === p.name) ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Desktop Accent Bar */}
                      <Link 
                        href={`/product/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="hidden md:flex w-20 bg-[#657351] lg:hover:bg-[#525e40] transition-colors flex-col items-center justify-between py-8 cursor-pointer relative z-10"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white rotate-180 [writing-mode:vertical-rl]">
                          Explore Product
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                          <ArrowRight className="w-4 h-4 -rotate-45" />
                        </div>
                      </Link>
                    </div>

                    {/* Content: order-2 on mobile, order-1 on desktop */}
                    <div className="order-2 md:order-1 flex-1 p-5 sm:p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-3 sm:mb-4">
                        <span className="inline-block px-3 py-1 border border-brand-accent/30 text-brand-accent text-[9px] font-black uppercase tracking-widest rounded-full mb-3 md:mb-6">
                          {featuredBadgeText}
                        </span>
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-outfit tracking-tighter text-white mb-2 md:mb-4">
                            {p.name}
                          </h2>
                          {p.price && (
                            <div className="text-lg sm:text-2xl font-bold text-white shrink-0 md:hidden font-outfit">
                              {p.price === 'Request Quote' ? 'Quote Required' : (typeof p.price === 'number' 
                                ? `₹${p.price.toLocaleString('en-IN')}` 
                                : String(p.price).startsWith('₹') ? p.price : `₹${p.price}`)}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-sm mb-4 md:mb-8">
                          {p.description || "Ergonomic brilliance that moves with you. Crafted for superior comfort and timeless style."}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-6 md:mb-8">
                        {features.slice(0, 3).map((feat: any, i: number) => (
                          <div key={i} className="flex items-center gap-2.5 sm:gap-3 md:gap-4 border-b border-white/5 pb-2 sm:pb-3 md:pb-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                              <feat.icon className="w-3 h-3 md:w-4 md:h-4 text-brand-accent" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-300">{feat.title}</span>
                          </div>
                        ))}
                      </div>
                      
                      {p.price && (
                        <div className="hidden md:block text-2xl font-bold text-white mt-auto">
                          {p.price === 'Request Quote' ? 'Quote Required' : (typeof p.price === 'number' 
                            ? `₹${p.price.toLocaleString('en-IN')}` 
                            : String(p.price).startsWith('₹') ? p.price : `₹${p.price}`)}
                        </div>
                      )}

                      {/* Mobile Full-width CTA Button */}
                      <Link 
                        href={`/product/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="md:hidden mt-2 w-full py-3 px-5 bg-brand-accent active:bg-white active:text-black rounded-xl flex items-center justify-between text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg shadow-brand-accent/20"
                      >
                        <span>Explore Series</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              }

              // STANDARD VERTICAL CARD - Mobile-First Redesign
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative z-10 flex flex-col bg-[#111] rounded-[1.75rem] sm:rounded-[2rem] border border-white/5 overflow-hidden lg:hover:border-white/10 transition-colors h-full shadow-lg"
                >
                  {/* ── Image Area (order-1 on mobile, order-2 on desktop) ── */}
                  <div className="order-1 md:order-2 relative aspect-[4/3] md:aspect-square w-full flex items-center justify-center p-0 bg-gradient-to-b from-[#181818] to-[#0A0A0A] overflow-hidden shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 lg:group-hover:opacity-60 transition-opacity duration-700">
                      <div className="w-48 h-48 rounded-full bg-white/5 blur-3xl" />
                    </div>
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      {p.img ? (
                        <img src={p.img} alt={p.name} className="absolute inset-0 z-10 w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-110 drop-shadow-2xl" />
                      ) : (
                        <div className="absolute inset-0 z-10 w-full h-full bg-white/5 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Category Pill on Mobile Image */}
                    <span className="md:hidden absolute top-3.5 left-3.5 z-20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-brand-accent border border-white/10">
                      {p.cat}
                    </span>
                    
                    {/* Action Overlay: Always visible on mobile, hover on desktop */}
                    <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleItem({ id: p.name, name: p.name, category: p.cat, image: p.img, price: p.price })}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 backdrop-blur-md border border-white/15 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                          isSaved(p.name) ? "bg-white text-brand-accent border-brand-accent/40" : "bg-black/60 text-white hover:text-brand-accent"
                        }`}
                        aria-label={isSaved(p.name) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSaved(p.name) ? "fill-brand-accent text-brand-accent" : ""}`} />
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(p)}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-black/60 backdrop-blur-md border border-white/15 text-white rounded-full flex items-center justify-center active:scale-90 lg:hover:bg-white lg:hover:text-black transition-all"
                        aria-label="Quick View"
                      >
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => addItem({...p, id: p.name, category: p.cat, image: p.img})}
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center active:scale-90 transition-all backdrop-blur-md border border-white/15 ${
                          items.find(item => item.id === p.name)
                            ? "bg-green-600 text-white"
                            : "bg-brand-accent text-white lg:hover:bg-white lg:hover:text-black shadow-md shadow-brand-accent/20"
                        }`}
                        aria-label="Add to Selection"
                      >
                        {items.find(item => item.id === p.name) ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Content / Header (order-2 on mobile, order-1 on desktop) ── */}
                  <div className="order-2 md:order-1 p-4 sm:p-6 md:p-8 flex justify-between items-start z-10">
                    <div className="flex-1 pr-3 sm:pr-4">
                      <span className="hidden md:block text-[10px] font-bold text-brand-accent uppercase tracking-[0.2em] mb-2">
                        {p.cat}
                      </span>
                      <h3 className="text-base sm:text-xl md:text-2xl font-black font-outfit tracking-tighter text-white mb-1 md:mb-2 line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {p.description || "Thoughtfully designed to inspire comfort and style."}
                      </p>
                    </div>
                    {p.price && (
                      <div className="text-sm sm:text-lg md:text-xl font-bold text-white shrink-0 mt-0.5 md:mt-1 font-outfit">
                        {p.price === 'Request Quote' ? 'Quote Required' : (typeof p.price === 'number' 
                          ? `₹${p.price.toLocaleString('en-IN')}` 
                          : String(p.price).startsWith('₹') ? p.price : `₹${p.price}`)}
                      </div>
                    )}
                  </div>

                  {/* ── Bottom: Features & CTA (order-3) ── */}
                  <div className="order-3 mt-auto p-4 sm:p-5 md:p-6 border-t border-white/5 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-3 sm:gap-4">
                    <div className="flex flex-wrap gap-2 sm:gap-4 flex-1 overflow-hidden">
                      {features.slice(0, 2).map((feat: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 md:gap-2.5 shrink-0 px-2 py-0.5 sm:px-0 sm:py-0 rounded-md bg-white/5 sm:bg-transparent">
                          <feat.icon className="w-3 h-3 md:w-4 md:h-4 text-brand-accent md:text-gray-500" />
                          <span className="text-[10px] sm:text-xs font-medium text-gray-300 md:text-gray-400 whitespace-nowrap truncate">{feat.title}</span>
                        </div>
                      ))}
                    </div>
                    <Link 
                      href={`/product/${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="w-full sm:w-10 sm:h-10 md:w-12 md:h-12 py-2 sm:py-0 rounded-xl sm:rounded-full bg-white/5 sm:bg-[#1A1A1A] lg:hover:bg-brand-accent transition-colors flex items-center justify-center shrink-0 border border-white/10 lg:group-hover:border-transparent text-xs font-bold uppercase tracking-wider text-white gap-2 sm:gap-0"
                    >
                      <span className="sm:hidden">Explore Details</span>
                      <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}
        
        {/* INFINITE SCROLL LOADER (REF ALWAYS MOUNTED) */}
        <div ref={loadMoreRef} className="w-full h-20 flex justify-center items-center mt-10">
          {!isInitialLoading && visibleCount < filteredProducts.length && isFetchingNext && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-accent animate-spin" />
            </motion.div>
          )}
        </div>
      </section>

      {/* MOST PICKED - NOW AT BOTTOM WITH SCROLL LOCK */}
      <section ref={targetRef} className="relative h-[400vh] mt-16 sm:mt-24" style={{ position: "relative" }}>
        <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden">
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 text-center z-50">
             <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent mb-2">Most Picked Showcase</h2>
             <div className="w-12 h-px bg-brand-accent mx-auto opacity-50" />
          </div>

          <div className="relative w-full max-w-7xl h-[80vh] sm:h-[74vh] md:h-[70vh] px-3 sm:px-6">
            {mostPicked.map((p, i) => (
              <MostPickedItem 
                key={p.id}
                p={p}
                i={i}
                total={mostPicked.length}
                scrollYProgress={scrollYProgress}
                setSelectedProduct={setSelectedProduct}
                addItem={addItem}
                items={items}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section id="catalog-footer" className="relative z-50 py-24 sm:py-32 md:py-40 bg-[#050505] border-t border-white/5 text-center px-4">
        <AnimatedSection direction="up" delay={0.2}>
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-outfit tracking-tighter mb-8 sm:mb-12 text-white">
            READY TO <br />
            <span className="text-brand-accent italic font-light text-gray-500">TRANSFORM?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-brand-accent text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] rounded-full lg:hover:scale-105 transition-all shadow-2xl">
              Download Full Catalog
            </button>
            <Link href="/contact" className="text-white font-black uppercase tracking-widest text-[10px] lg:hover:text-brand-accent transition-colors border-b border-white/20 pb-1 py-2">
              Connect with us
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-5xl max-h-[92dvh] overflow-y-auto bg-[#0F0F0F] border border-white/10 rounded-[1.75rem] sm:rounded-[3rem] flex flex-col md:flex-row shadow-2xl"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 sm:bg-white/5 border border-white/10 flex items-center justify-center text-white lg:hover:bg-brand-accent transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="w-full md:w-1/2 h-[30vh] sm:h-[38vh] md:h-auto min-h-[220px] md:min-h-[460px] relative bg-[#111] overflow-hidden shrink-0">
                {selectedProduct.img && typeof selectedProduct.img === "string" && selectedProduct.img.trim() !== "" ? (
                  <img src={selectedProduct.img} alt={selectedProduct.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
              </div>

              <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-14 flex flex-col justify-center">
                <span className="text-brand-accent font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mb-2 sm:mb-4 block">
                  {selectedProduct.cat} • Series
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tighter text-white mb-3 sm:mb-6 leading-tight">
                  {selectedProduct.name}
                </h2>
                
                <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed mb-6 sm:mb-8">
                  Engineered for maximum endurance and cinematic appeal. This piece represents Aveon's commitment to ergonomic perfection and modern workspace aesthetics.
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-xl bg-white/5">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/5 flex items-center justify-center text-brand-accent shrink-0">
                      <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase block leading-tight">Fit</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase">Adjustable</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-xl bg-white/5">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/5 flex items-center justify-center text-brand-accent shrink-0">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase block leading-tight">Warranty</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase">5 Years</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-xl bg-white/5">
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-white/5 flex items-center justify-center text-brand-accent shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase block leading-tight">Comfort</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase">Premium</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
                  <button 
                    onClick={() => {
                      addItem({...selectedProduct, id: selectedProduct.name, category: selectedProduct.cat, image: selectedProduct.img});
                      setSelectedProduct(null);
                    }}
                    className={`flex-1 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                      items.find(item => item.id === selectedProduct.name)
                        ? "bg-green-600 text-white"
                        : "bg-brand-accent text-white lg:hover:bg-white lg:hover:text-black shadow-xl"
                    }`}
                  >
                    {items.find(item => item.id === selectedProduct.name) ? "In Cart" : "Add to Enquiry"}
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  {globalBrochure ? (
                    <a 
                      href={globalBrochure}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 sm:px-6 py-3.5 sm:py-4 bg-emerald-600 lg:hover:bg-emerald-700 text-white rounded-full font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                      <Download className="w-4 h-4" /> Brochure
                    </a>
                  ) : (
                    <button 
                      disabled
                      className="px-5 sm:px-6 py-3.5 sm:py-4 bg-white/5 border border-white/5 text-white/20 rounded-full font-black uppercase tracking-widest text-[9px] sm:text-[10px] cursor-not-allowed flex items-center justify-center gap-2 opacity-50"
                      title="Brochure Unavailable"
                    >
                      <Download className="w-4 h-4" /> Brochure N/A
                    </button>
                  )}

                  <Link 
                    href={`/product/${selectedProduct.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSelectedProduct(null)}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 border border-white/10 text-white rounded-full font-black uppercase tracking-widest text-[9px] sm:text-[10px] lg:hover:bg-white lg:hover:text-black transition-all flex items-center justify-center"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full px-4 py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="h-12 bg-zinc-900/50 rounded-lg w-48 animate-pulse" />
          <SkeletonList count={6} />
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}