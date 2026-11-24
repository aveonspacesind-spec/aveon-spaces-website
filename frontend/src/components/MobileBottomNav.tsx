"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Search, 
  ShoppingBag, 
  LayoutGrid, 
  Heart, 
  X, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Check,
  Clock,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useAuth } from "./AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RECENT_PRODUCTS_KEY = "aveon_recent_products";

interface RecentProductItem {
  id?: string;
  name: string;
  category?: string;
  price?: string;
  image?: string;
}

const defaultDummyProducts = [
  { id: "ergopro-executive-chair", name: "ErgoPro Executive Chair", category: "Task Chairs", price: "₹36,000", image: "https://images.unsplash.com/photo-1580481077111-e6e224e75653?auto=format&fit=crop&q=80&w=600" },
  { id: "aura-mesh-task-chair", name: "Aura Mesh Task Chair", category: "Task Chairs", price: "₹24,000", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=600" },
  { id: "lumina-standing-desk", name: "Lumina Standing Desk", category: "Desks", price: "₹48,000", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600" },
  { id: "apex-conference-table", name: "Apex Conference Table", category: "Conference", price: "₹96,000", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600" },
  { id: "zenith-lounge-sofa", name: "Zenith Lounge Sofa", category: "Lounge", price: "₹68,000", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600" },
  { id: "nova-ergonomic-stool", name: "Nova Ergonomic Stool", category: "Stool", price: "₹12,000", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=600" }
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount, setIsCartOpen, addItem, items: cartItems } = useCart();
  const { items: wishlistItems, removeItem: removeWishlistItem, count: wishlistCount } = useWishlist();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<any[]>(defaultDummyProducts);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProductItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === "object" && parsed[0]?.name) {
            setRecentProducts(parsed);
            return;
          }
          if (typeof parsed[0] === "string") {
            const mapped = parsed.map((name: string) => {
              const found = defaultDummyProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
              return found || { id: name, name, category: "Seating", price: "", image: "" };
            });
            setRecentProducts(mapped);
            return;
          }
        }
      }
      // Check legacy searches
      const legacy = localStorage.getItem("aveon_recent_searches");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((name: string) => {
            const found = defaultDummyProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
            return found || { id: name, name, category: "Seating", price: "", image: "" };
          });
          setRecentProducts(mapped);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const addRecentProduct = (product: RecentProductItem) => {
    const cleanName = product.name?.trim();
    if (!cleanName) return;

    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.name.toLowerCase() !== cleanName.toLowerCase());
      const itemToSave: RecentProductItem = {
        id: product.id || cleanName,
        name: cleanName,
        category: product.category || "Seating",
        price: product.price || "",
        image: product.image || ""
      };
      const updated = [itemToSave, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeRecentProduct = (name: string) => {
    setRecentProducts((prev) => {
      const updated = prev.filter((p) => p.name.toLowerCase() !== name.toLowerCase());
      try {
        localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearRecentProducts = () => {
    setRecentProducts([]);
    try {
      localStorage.removeItem(RECENT_PRODUCTS_KEY);
      localStorage.removeItem("aveon_recent_searches");
    } catch (e) {}
  };

  // Fetch Firestore products to enrich mobile search
  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (!snap.empty) {
          const list = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || doc.id,
              category: data.category || "Seating",
              price: typeof data.price === 'number' ? `₹${data.price.toLocaleString('en-IN')}` : (data.price || "Quote Required"),
              image: data.image || data.images?.[0] || ""
            };
          });
          setCatalogProducts(prev => {
            const map = new Map();
            [...list, ...prev].forEach(p => map.set(p.name, p));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        // Fallback to dummy data
      }
    }
    fetchProducts();
  }, []);

  // Auto focus search input when search modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
      document.body.style.overflow = "hidden";
    } else if (!isWishlistOpen) {
      document.body.style.overflow = "unset";
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else if (!isSearchOpen) {
      document.body.style.overflow = "unset";
    }
  }, [isWishlistOpen]);

  // Close modals on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setIsWishlistOpen(false);
  }, [pathname]);

  const isHomeActive = pathname === "/";
  const isProductsActive = pathname === "/products" || pathname.startsWith("/product/");
  const isCartActive = pathname === "/checkout" || pathname === "/cart";
  const isProfileActive = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/login";

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return catalogProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [catalogProducts, searchQuery]);

  return (
    <>
      {/* ── FLOATING PILL BOTTOM NAVIGATION (Mobile/Tablet Only) ── */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden pointer-events-auto w-[94%] max-w-[400px] sm:max-w-[420px]"
      >
        <div className="w-full bg-[#0D0D0D]/90 text-white border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl rounded-full p-2 flex items-center justify-between">
          
          {/* 1. HOME BUTTON */}
          <Link
            href="/"
            aria-label="Home"
            className={`flex items-center justify-center transition-all duration-200 ${
              isHomeActive && !isSearchOpen
                ? "bg-white/10 text-brand-accent border border-white/15 shadow-inner px-4 py-2 rounded-full" 
                : "text-gray-400 hover:text-white px-3.5 py-2 rounded-full active:scale-95"
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2px]" />
          </Link>

          {/* 2. SEARCH BUTTON */}
          <button
            onClick={() => {
              setIsWishlistOpen(false);
              setIsSearchOpen(true);
            }}
            aria-label="Search Catalog"
            className={`flex items-center justify-center transition-all duration-200 ${
              isSearchOpen
                ? "bg-white/10 text-brand-accent border border-white/15 px-4 py-2 rounded-full"
                : "text-gray-400 hover:text-white px-3.5 py-2 rounded-full active:scale-95"
            }`}
          >
            <Search className="w-5 h-5 stroke-[2.2px]" />
          </button>

          {/* 3. CENTER BUTTON: PRODUCTS CATALOGUE (Elevated Circle in Brand Accent) */}
          <Link
            href="/products"
            aria-label="Products Catalog"
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-[0_0_24px_rgba(198,40,40,0.45),0_6px_16px_rgba(0,0,0,0.6)] border border-white/20 active:scale-90 transition-all duration-200 relative shrink-0 ${
              isProductsActive && !isSearchOpen ? "ring-2 ring-white/50 scale-105" : ""
            }`}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2.2px]" />
          </Link>

          {/* 4. CART BUTTON */}
          <Link
            href="/cart"
            aria-label={`Open Cart (${itemCount} items)`}
            className={`flex items-center justify-center transition-all duration-200 relative ${
              isCartActive && !isSearchOpen
                ? "bg-white/10 text-brand-accent border border-white/15 shadow-inner px-4 py-2 rounded-full"
                : "text-gray-400 hover:text-white px-3.5 py-2 rounded-full active:scale-95"
            }`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2px]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-0.5 bg-brand-accent text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[#0D0D0D] shadow-md animate-in zoom-in-50 duration-200">
                {itemCount}
              </span>
            )}
          </Link>

          {/* 5. PROFILE BUTTON */}
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Account Profile" : "Sign In"}
            className={`flex items-center justify-center transition-all duration-200 ${
              isProfileActive && !isSearchOpen
                ? "bg-white/10 text-brand-accent border border-white/15 shadow-inner px-4 py-2 rounded-full"
                : "text-gray-400 hover:text-white px-3.5 py-2 rounded-full active:scale-95"
            }`}
          >
            {user && user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "Profile"} 
                className={`w-5 h-5 rounded-full object-cover border ${isProfileActive ? "border-brand-accent" : "border-gray-500"}`}
              />
            ) : (
              <User className="w-5 h-5 stroke-[2.2px]" />
            )}
          </Link>

        </div>
      </nav>

      {/* ── SEARCH MODAL / DRAWER ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              data-lenis-prevent="true"
              className="fixed inset-x-0 bottom-0 z-[70] bg-[#111111] border-t border-white/10 rounded-t-[2rem] h-[82vh] max-h-[85vh] flex flex-col p-4 sm:p-6 shadow-2xl md:hidden overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-outfit uppercase tracking-wider text-white">Search Catalogue</h3>
                    <p className="text-[10px] text-gray-400">Engineered office furniture & seating</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Input */}
              <div className="mt-4 relative flex items-center shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredSearchResults.length > 0) {
                      const top = filteredSearchResults[0];
                      addRecentProduct(top);
                      setIsSearchOpen(false);
                      router.push(`/product/${top.name.toLowerCase().replace(/\s+/g, "-")}`);
                    }
                  }}
                  placeholder="Search products by name, series, desk..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-3 text-gray-400 hover:text-white text-xs p-1"
                    aria-label="Clear query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Results & Recent Products List with Native Smooth Scroll */}
              <div 
                data-lenis-prevent="true"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-2 pr-1 mt-4"
              >
                {searchQuery.trim() === "" ? (
                  /* INITIAL STATE: ONLY SHOW RECENTLY SEARCHED PRODUCTS */
                  recentProducts.length > 0 ? (
                    <div className="pt-1">
                      <div className="flex items-center justify-between pb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-accent" />
                          Recently Searched Products
                        </span>
                        <button
                          onClick={clearRecentProducts}
                          className="text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="space-y-2">
                        {recentProducts.map((prod) => (
                          <div
                            key={prod.id || prod.name}
                            onClick={() => {
                              addRecentProduct(prod);
                              setIsSearchOpen(false);
                              router.push(`/product/${prod.name.toLowerCase().replace(/\s+/g, "-")}`);
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 active:bg-white/[0.06] transition-all cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {prod.category && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block truncate">
                                  {prod.category}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-accent transition-colors">
                                {prod.name}
                              </h4>
                              {prod.price && (
                                <span className="text-[11px] font-bold text-gray-400">{prod.price}</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentProduct(prod.name);
                              }}
                              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
                              aria-label={`Remove ${prod.name}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* KEPT BLANK INITIALLY AS REQUESTED */
                    <div className="py-24 text-center">
                      <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400">Search Aveon Catalogue</p>
                      <p className="text-[11px] text-gray-600 mt-1 max-w-[220px] mx-auto">
                        Type a product name to search
                      </p>
                    </div>
                  )
                ) : (
                  /* ACTIVE FILTERED SEARCH RESULTS */
                  filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((prod) => (
                      <div
                        key={prod.id || prod.name}
                        onClick={() => {
                          addRecentProduct(prod);
                          setIsSearchOpen(false);
                          router.push(`/product/${prod.name.toLowerCase().replace(/\s+/g, "-")}`);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 active:bg-white/[0.06] transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block truncate">
                            {prod.category}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-accent transition-colors">
                            {prod.name}
                          </h4>
                          <span className="text-[11px] font-bold text-gray-400">{prod.price}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="py-14 text-center">
                      <p className="text-gray-400 text-xs">No matching products found.</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-xs text-brand-accent font-bold"
                      >
                        Clear search query
                      </button>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── WISHLIST / SHORTLIST MODAL ── */}
      <AnimatePresence>
        {isWishlistOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              data-lenis-prevent="true"
              className="fixed inset-x-0 bottom-0 z-[70] bg-[#111111] border-t border-white/10 rounded-t-[2rem] h-[82vh] max-h-[85vh] flex flex-col p-4 sm:p-6 shadow-2xl md:hidden overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                    <Heart className="w-4 h-4 fill-brand-accent/30" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-outfit uppercase tracking-wider text-white">Your Shortlist</h3>
                    <p className="text-[10px] text-gray-400">{wishlistCount} saved {wishlistCount === 1 ? 'chair' : 'items'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label="Close wishlist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div 
                data-lenis-prevent="true"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-2 pr-1 mt-4"
              >
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <div className="w-14 h-14 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent block truncate">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                        <span className="text-[11px] font-bold text-gray-400 block">{item.price}</span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            addItem({
                              id: item.id,
                              name: item.name,
                              category: item.category,
                              image: item.image,
                              price: item.price
                            });
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs transition-colors ${
                            cartItems.some(c => c.id === item.id || c.name === item.name)
                              ? "bg-green-600"
                              : "bg-brand-accent active:bg-white active:text-black"
                          }`}
                          title="Add to Enquiry"
                          aria-label="Add to Enquiry"
                        >
                          {cartItems.some(c => c.id === item.id || c.name === item.name) ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeWishlistItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 active:scale-95 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-14 text-center">
                    <Heart className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-40" />
                    <h4 className="text-sm font-bold text-white mb-1">Your shortlist is empty</h4>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto mb-5">
                      Save chairs you like to compare and request custom quotes easily.
                    </p>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        router.push("/products");
                      }}
                      className="px-6 py-2.5 rounded-full bg-brand-accent text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      Explore Chairs
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
