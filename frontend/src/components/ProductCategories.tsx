"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import HoverCard3D from "./HoverCard3D";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

const FALLBACK_PRODUCTS = [
  {
    id: "f1",
    name: "AeroMesh Pro Executive",
    category: "Executive Seating",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    href: "/products?category=executive",
  },
  {
    id: "f2",
    name: "Collaborative Zones",
    category: "Collaborative",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    isFeatured: false,
    href: "/products?category=workstations",
  },
  {
    id: "f3",
    name: "Conference Suites",
    category: "Conference",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800",
    isFeatured: false,
    href: "/products?category=conference",
  },
  {
    id: "f4",
    name: "Ergonomic Tasking",
    category: "Ergonomic",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    href: "/products?category=chairs",
  },
];

export default function ProductCategories() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from Firestore
    const q = query(collection(db, "products"), limit(12));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => {
            const d = doc.data() as any;
            const resolvedImg = 
              d.image || 
              (Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : "") || 
              d.img || 
              (Array.isArray(d.colors) && d.colors[0]?.image) || 
              "";
            return {
              id: doc.id,
              name: d.name || "Untitled",
              category: d.category || "Collection",
              image: resolvedImg,
              isFeatured: d.isFeatured || false,
              label: d.label || null,
              href: `/product/${(d.name || doc.id).toLowerCase().replace(/\s+/g, "-")}`,
            };
          });

          // Prioritize items that have images and featured ones
          const withImages = data.filter((p) => p.image);
          withImages.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          
          if (withImages.length > 0) {
            setProducts(withImages.slice(0, 4));
          } else {
            setProducts(FALLBACK_PRODUCTS);
          }
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
        setLoading(false);
      },
      (err) => {
        console.warn("ProductCategories: Firestore fetch failed, using fallback.", err);
        setProducts(FALLBACK_PRODUCTS);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const displayProducts = loading ? [] : products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="pt-16 pb-0 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <AnimatedSection direction="up">
            <span className="text-brand-accent font-bold text-xs tracking-[0.4em] uppercase mb-4 block">
              Collections
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tighter text-black leading-[0.95] sm:leading-[0.9]">
              THE <span className="text-brand-accent">AVEON</span> <br />CATALOGUE
            </h2>
          </AnimatedSection>

          <AnimatedSection direction="up" delay={0.2}>
            <Link
              href="/products"
              className="group flex items-center gap-4 font-black uppercase tracking-widest text-xs border-b-2 border-black/10 pb-2 hover:border-brand-accent transition-all"
            >
              Explore Full Collection
              <ArrowRight className="w-5 h-5 text-brand-accent group-hover:translate-x-2 transition-transform" />
            </Link>
          </AnimatedSection>
        </div>

        {/* Grid / Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:pb-0 md:overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scrollbar-none">
          <AnimatePresence>
            {loading
              ? // Skeleton placeholders
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="min-w-[85vw] sm:min-w-[45vw] md:min-w-0 shrink-0 snap-center aspect-[3/4.5] rounded-[1.75rem] sm:rounded-[2.5rem] bg-gray-100 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))
              : displayProducts.map((product, i) => (
                  <AnimatedSection key={product.id} direction="up" delay={i * 0.1} className="min-w-[85vw] sm:min-w-[45vw] md:min-w-0 shrink-0">
                    <HoverCard3D className="w-full h-full block">
                      <Link
                        href={product.href}
                        className="group relative block w-full aspect-[3/4.5] overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] bg-gray-100 transition-all duration-700 ease-[0.22,1,0.36,1] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)]"
                      >
                      {/* Background Image */}
                      <div className="absolute inset-0 transition-all duration-1000 ease-[0.22,1,0.36,1] group-hover:scale-110">
                        {(() => {
                          const imgSrc = product.image || "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800";
                          const isSvgOrRaw = typeof imgSrc === "string" && (
                            imgSrc.includes("/raw/upload/") || 
                            imgSrc.endsWith(".svg") || 
                            imgSrc.includes(".svg?")
                          );
                          return (
                            <Image
                              src={imgSrc}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 25vw"
                              className="object-cover transition-opacity duration-700 group-hover:opacity-40"
                              unoptimized={isSvgOrRaw}
                            />
                          );
                        })()}
                        {/* Brand color overlay on hover */}
                        <div className="absolute inset-0 bg-brand-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-multiply" />
                        {/* Gradient for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                      </div>

                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 opacity-95 sm:opacity-0 group-hover:opacity-100 translate-y-0 sm:translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-brand-accent text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            <Sparkles className="w-2.5 h-2.5 fill-white" />
                            Featured
                          </span>
                        </div>
                      )}

                      {/* Label Badge */}
                      {product.label && (
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 opacity-95 sm:opacity-0 group-hover:opacity-100 translate-y-0 sm:translate-y-2 group-hover:translate-y-0 transition-all duration-500 sm:delay-75">
                          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            {product.label}
                          </span>
                        </div>
                      )}

                      {/* Bottom content */}
                      <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 md:bottom-10 md:left-10 md:right-10">
                        {/* Category pill */}
                        <div className="flex items-center gap-3 mb-2 sm:mb-4 translate-y-0 sm:translate-y-10 opacity-100 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[0.22,1,0.36,1] sm:delay-100">
                          <div className="w-6 sm:w-8 h-[1px] bg-brand-accent" />
                          <span className="text-white/90 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
                            {product.category}
                          </span>
                        </div>

                        {/* Product Name */}
                        <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-black font-outfit tracking-tight leading-none transition-all duration-500">
                          {product.name.split(" ")[0]} <br />
                          <span className="text-white/60 group-hover:text-white/70 transition-colors">
                            {product.name.split(" ").slice(1).join(" ")}
                          </span>
                        </h3>

                        {/* View CTA */}
                        <div className="mt-4 sm:mt-6 overflow-hidden">
                          <div className="translate-y-0 sm:translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1] sm:delay-150">
                            <span className="text-white/80 group-hover:text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                              View Product 
                              <span className="p-1.5 sm:p-2 rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-brand-accent group-hover:text-white">
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover border */}
                      <div className="absolute inset-3 sm:inset-4 border border-white/0 group-hover:border-white/10 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-700 pointer-events-none" />
                    </Link>
                    </HoverCard3D>
                  </AnimatedSection>
                ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
