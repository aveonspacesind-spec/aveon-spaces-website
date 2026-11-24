"use client";
import Link from "next/link";
import React from "react";

import { usePathname } from "next/navigation";
import { Search, ArrowUp, Package, Lightbulb, FolderOpen, MessageSquare, Info, Phone, Menu, X, FileText, User, ChevronRight } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getHasPlayedIntro, setHasPlayedIntro } from "@/lib/introState";
import { useAuth } from "./AuthContext";

const dummyProducts = [
  { id: "ergopro-executive-chair", name: "ErgoPro Executive Chair", category: "Seating", price: "₹36,000" },
  { id: "aura-mesh-task-chair", name: "Aura Mesh Task Chair", category: "Seating", price: "₹24,000" },
  { id: "lumina-standing-desk", name: "Lumina Standing Desk", category: "Desks", price: "₹48,000" },
  { id: "apex-conference-table", name: "Apex Conference Table", category: "Tables", price: "₹96,000" },
  { id: "zenith-lounge-sofa", name: "Zenith Lounge Sofa", category: "Lounge", price: "₹68,000" },
  { id: "nova-ergonomic-stool", name: "Nova Ergonomic Stool", category: "Seating", price: "₹12,000" }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [hasLoaded, setHasLoaded] = useState(() => {
    if (typeof window !== "undefined") {
      if (getHasPlayedIntro()) return true;
    }
    return !isHome;
  });
  const [theme, setTheme] = useState("dark"); // Default to dark since hero is dark
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImgError, setProfileImgError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { scrollYProgress } = useScroll();
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileImgError(false);
  }, [user?.photoURL]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // If the search is open, and we clicked outside both the dropdown AND the button
      if (isSearchOpen) {
        const clickedInsideDropdown = searchDropdownRef.current?.contains(target);
        const clickedInsideButton = searchButtonRef.current?.contains(target);
        
        if (!clickedInsideDropdown && !clickedInsideButton) {
          setIsSearchOpen(false);
        }
      }
      if (isProfileOpen) {
        const clickedInsideDropdown = profileDropdownRef.current?.contains(target);
        const clickedInsideButton = profileButtonRef.current?.contains(target);
        
        if (!clickedInsideDropdown && !clickedInsideButton) {
          setIsProfileOpen(false);
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSearchOpen, isProfileOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const searchResults = searchQuery.trim() === ""
    ? []
    : dummyProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const navLinks = [
    { name: "Products", href: "/products", widthClass: "hover:w-[115px]", icon: <Package className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" },
    { name: "Solutions", href: "/solutions", widthClass: "hover:w-[125px]", icon: <Lightbulb className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" },
    { name: "Projects", href: "/projects", widthClass: "hover:w-[115px]", icon: <FolderOpen className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" },
    { name: "Testimonials", href: "/testimonials", widthClass: "hover:w-[145px]", icon: <MessageSquare className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" },
    { name: "About Us", href: "/about", widthClass: "hover:w-[120px]", icon: <Info className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" },
    { name: "Contact", href: "/contact", widthClass: "hover:w-[115px]", icon: <Phone className="w-[18px] h-[18px] absolute inset-0 m-auto transition-transform duration-300 group-hover:scale-0" />, color: "from-brand-accent to-brand-primary", glow: "color-mix(in srgb, var(--color-brand-accent) 40%, transparent)" }
  ];

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsAtBottom(latest > 0.99);
  });

  const scrollToTop = () => {
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      // Hide navbar when outside the Hero section, only show when back at the top
      if (currentScrollY > window.innerHeight * 0.8) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = currentScrollY;

      // Detect background theme behind navbar
      const el = document.elementFromPoint(window.innerWidth / 2, 40);
      if (el) {
        const themeContainer = el.closest('[data-theme]');
        if (themeContainer) {
          setTheme(themeContainer.getAttribute('data-theme') || 'dark');
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Intro Animation Timer
    let timer: NodeJS.Timeout;
    if (isHome && !hasLoaded) {
      timer = setTimeout(() => {
        setHasLoaded(true);
        setHasPlayedIntro(true);
      }, 3200);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <LayoutGroup>


      <AnimatePresence>
        {isHome && !hasLoaded && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A] overflow-hidden"
            exit={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Impact Flash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
              className="absolute inset-0 bg-white z-0 pointer-events-none mix-blend-overlay"
            />

            {/* High-Velocity Shockwaves */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, borderWidth: "50px" }}
                animate={{ scale: 3 + i, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 + (i * 0.1) }}
                className="absolute w-[200px] h-[200px] rounded-full border-brand-accent z-0 pointer-events-none shadow-[0_0_50px_#C62828]"
              />
            ))}

            <motion.div layoutId="brand-logo" className="flex items-center relative z-10">
              <div className="flex flex-col items-center leading-none text-white group cursor-default">
                <div className="text-[80px] md:text-[180px] font-black font-outfit tracking-tighter flex items-center overflow-hidden pb-4">
                  <motion.span
                    initial={{ y: -800, scaleY: 5, scaleX: 0.2, opacity: 0 }}
                    animate={{ y: 0, scaleY: 1, scaleX: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                    className="text-brand-accent drop-shadow-[0_0_50px_color-mix(in srgb, var(--color-brand-accent) 80%, transparent)] inline-block relative z-20"
                  >
                    A
                  </motion.span>
                  <motion.span
                    initial={{ y: 800, scaleY: 5, scaleX: 0.2, opacity: 0 }}
                    animate={{ y: 0, scaleY: 1, scaleX: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                    className="inline-block relative z-20"
                  >
                    VEON
                  </motion.span>
                </div>

                <motion.div
                  className="h-[4px] bg-brand-accent w-full mt-[-15px] mb-6 shadow-[0_0_30px_#C62828] relative z-10"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1.5, 1], opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeInOut" }}
                />

                <motion.span
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 120, delay: 1.1 }}
                  className="text-sm md:text-lg font-black uppercase tracking-[0.5em] text-brand-accent bg-brand-accent/10 border border-brand-accent/40 px-6 py-2 rounded-full shadow-[0_0_24px_color-mix(in_srgb,var(--color-brand-accent)_30%,transparent)]"
                >
                  SPACES
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 pt-2.5 sm:pt-4 transition-all duration-500 ${!hasLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isHidden ? '-translate-y-[150%]' : 'translate-y-0'}`}>
        <motion.nav
          layout
          animate={{
            backgroundColor: isScrolled
              ? (theme === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(10, 10, 10, 0.85)")
              : "rgba(255, 255, 255, 0.05)",
            backdropFilter: isScrolled ? "blur(12px)" : "blur(4px)",
            borderColor: isScrolled
              ? (theme === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)")
              : "rgba(255, 255, 255, 0.1)",
            color: theme === "light" && isScrolled ? "#111111" : "#ffffff",
            y: isScrolled ? 0 : 10,
          }}
          initial={false}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full max-w-[1440px] ${isScrolled ? 'py-1 px-2.5 sm:px-4' : 'py-2 sm:py-3 px-2.5 sm:px-6'} flex items-center ${hasLoaded ? 'justify-between' : 'justify-center'} rounded-2xl border shadow-2xl transition-all duration-500`}
        >
          {/* Logo */}
          <motion.div layoutId="brand-logo" className={`flex items-center transition-all duration-500 shrink-0 ${isScrolled ? 'scale-75 origin-left' : 'scale-100'}`}>
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer">
              <div className={`text-xl sm:text-[26px] font-black font-outfit tracking-tighter flex items-center transition-colors leading-none ${theme === "light" && isScrolled ? "text-[#111111]" : "text-white"}`}>
                <span className="text-brand-accent group-hover:scale-110 transition-transform origin-bottom inline-block">A</span>VEON
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black tracking-[0.2em] sm:tracking-[0.22em] uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-all duration-300
                group-hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-brand-accent)_40%,transparent)]
                ${
                  theme === "light" && isScrolled
                    ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent"
                    : "bg-brand-accent/10 border-brand-accent/30 text-brand-accent"
                }`}>
                SPACES
              </span>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          {hasLoaded && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", x: -20 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hidden lg:flex items-center gap-3"
            >
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={`group relative w-10 h-10 rounded-full border flex items-center overflow-hidden transition-all duration-500 ease-[0.16,1,0.3,1] ${link.widthClass} hover:border-transparent hover:shadow-2xl ${theme === "light" && isScrolled ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10"
                    }`}
                >
                  {/* 1. Gradient Overlay (::before equivalent) */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0`} />

                  {/* 2. Blurred Glow (::after equivalent) */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
                    style={{ backgroundColor: link.glow }}
                  />

                  {/* 3. Shrinking Icon (scale(0) on hover) */}
                  <div className={`relative z-10 w-10 h-10 shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-0 ${theme === "light" && isScrolled ? "text-black" : "text-white"
                    }`}>
                    {/* Note: Icon is already in link.icon but we want to ensure it scales down */}
                    {React.cloneElement(link.icon as React.ReactElement<any>, {
                      className: "w-[18px] h-[18px] transition-transform duration-500 group-hover:scale-0"
                    })}
                  </div>

                  {/* 4. Scaling Text (scale(1) on hover) */}
                  <div className="absolute inset-0 pl-10 flex items-center z-10 pointer-events-none">
                    <span className="text-white font-outfit font-bold text-[13px] tracking-wide whitespace-nowrap opacity-0 scale-50 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-500 origin-left">
                      {link.name}
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          {hasLoaded && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", x: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-2 sm:gap-4 md:gap-5 shrink-0"
            >

              <button
                ref={searchButtonRef}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
                className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border items-center justify-center transition-all ${
                  theme === "light" && isScrolled 
                    ? "bg-black/5 border-black/10 text-black hover:bg-black/10" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>

              <div className="relative hidden md:block">
                {user ? (
                  <button
                    ref={profileButtonRef}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-label="User account profile"
                    title={user.displayName || user.email || "Profile"}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center overflow-hidden transition-all ${
                      theme === "light" && isScrolled 
                        ? "bg-black/5 border-black/10 text-black hover:bg-black/10" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {user.photoURL && user.photoURL.trim() !== "" && !profileImgError ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "Profile"} 
                        className="w-full h-full object-cover" 
                        onError={() => setProfileImgError(true)}
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Log in"
                    title="Log in"
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center overflow-hidden transition-all ${
                      theme === "light" && isScrolled 
                        ? "bg-black/5 border-black/10 text-black hover:bg-black/10" 
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </Link>
                )}
                
                <AnimatePresence>
                  {isProfileOpen && user && (
                    <motion.div
                      ref={profileDropdownRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] w-60 bg-[#0E0E0E] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 backdrop-blur-xl"
                    >
                      <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-white/[0.03]">
                        <div className="w-9 h-9 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center shrink-0 overflow-hidden text-brand-accent">
                          {user.photoURL && user.photoURL.trim() !== "" && !profileImgError ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName || "Profile"} 
                              className="w-full h-full object-cover"
                              onError={() => setProfileImgError(true)}
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">
                            {user.displayName || user.email?.split("@")[0] || "User"}
                          </span>
                          {user.email && (
                            <span className="text-[10px] text-gray-400 truncate">
                              {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2 flex flex-col gap-0.5">
                        <Link 
                          href="/account?tab=profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2.5 group"
                        >
                          <User className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
                          Visit Profile
                        </Link>
                        <Link 
                          href="/account?tab=orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2.5 group"
                        >
                          <Package className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
                          My Orders
                        </Link>
                        <Link 
                          href="/account?tab=addresses"
                          onClick={() => setIsProfileOpen(false)}
                          className="px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-2.5 group"
                        >
                          <FileText className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
                          Saved Address
                        </Link>
                        <div className="h-px bg-white/10 my-1.5" />
                        <button
                          onClick={async () => {
                            setIsProfileOpen(false);
                            await logout();
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-semibold flex items-center gap-2.5"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                className={`lg:hidden w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border flex items-center justify-center transition-all ${
                  theme === "light" && isScrolled 
                    ? "bg-black/5 border-black/10 text-black" 
                    : "bg-white/5 border-white/10 text-white"
                }`}
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    ref={searchDropdownRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 top-full mt-4 sm:mt-6 w-[calc(100vw-2rem)] max-w-[320px] rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 z-[200] ${theme === "light" && isScrolled
                        ? "bg-white/95 backdrop-blur-2xl border-black/10 text-black"
                        : "bg-[#0A0A0A]/95 backdrop-blur-2xl border-white/10 text-white"
                      }`}
                  >
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 opacity-50" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className={`w-full bg-transparent border-b pb-2 pl-10 focus:outline-none text-base md:text-sm font-medium transition-colors ${theme === "light" && isScrolled
                            ? "border-black/20 focus:border-brand-accent placeholder:text-black/40"
                            : "border-white/20 focus:border-brand-accent placeholder:text-white/40"
                          }`}
                      />
                    </div>

                    {searchQuery.trim() !== "" && (
                      <div className="mt-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto overflow-x-hidden">
                        {searchResults.length > 0 ? (
                          searchResults.map(product => (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              className={`flex justify-between items-center p-3 rounded-xl transition-colors ${theme === "light" && isScrolled
                                  ? "hover:bg-black/5"
                                  : "hover:bg-white/5"
                                }`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <div>
                                <h4 className="text-sm font-bold">{product.name}</h4>
                                <span className={`text-[10px] uppercase tracking-wider ${theme === "light" && isScrolled ? "text-black/50" : "text-white/50"
                                  }`}>{product.category}</span>
                              </div>
                              <span className="text-xs font-medium text-brand-accent">{product.price}</span>
                            </Link>
                          ))
                        ) : (
                          <div className={`p-4 text-center text-sm ${theme === "light" && isScrolled ? "text-black/50" : "text-white/50"}`}>
                            No products found matching &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[84%] sm:w-[75%] max-w-[320px] h-[100dvh] z-[200] bg-[#0D0D0D] border-l border-white/10 flex flex-col p-4 sm:p-5 pt-5 shadow-2xl lg:hidden overflow-y-auto"
            >
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-outfit text-white tracking-tighter">
                    <span className="text-brand-accent">A</span>VEON
                  </span>
                  <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
                    SPACES
                  </span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu drawer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:bg-brand-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col space-y-1 relative z-10">
                <span className="text-brand-accent font-black text-[9px] tracking-[0.35em] uppercase mb-1 opacity-70">
                  Explore Spaces
                </span>
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <div
                      key={i}
                      className="animate-in fade-in slide-in-from-right-4 duration-300"
                      style={{ animationDelay: `${50 + i * 35}ms`, animationFillMode: 'both' }}
                    >
                      <Link 
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isActive 
                            ? "bg-brand-accent/15 border-brand-accent/30 text-white shadow-sm" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05] text-white/90"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive 
                              ? "bg-brand-accent text-white" 
                              : "bg-white/5 border border-white/10 text-gray-400 group-hover:text-brand-accent"
                          }`}>
                            {link.name === "Products" && <Package className="w-3.5 h-3.5" />}
                            {link.name === "Solutions" && <Lightbulb className="w-3.5 h-3.5" />}
                            {link.name === "Projects" && <FolderOpen className="w-3.5 h-3.5" />}
                            {link.name === "Testimonials" && <MessageSquare className="w-3.5 h-3.5" />}
                            {link.name === "About Us" && <Info className="w-3.5 h-3.5" />}
                            {link.name === "Contact" && <Phone className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[13px] font-bold font-outfit tracking-tight ${
                            isActive ? "text-brand-accent" : "text-white"
                          }`}>
                            {link.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & Contact Section */}
              <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2.5 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Customer Support</span>
                    <a href="tel:+919876543210" className="text-white font-bold text-xs active:text-brand-accent transition-colors flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-brand-accent" />
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href="/request-quote"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center gap-2 text-white/80 active:text-brand-accent transition-colors text-xs font-bold"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-accent" />
                    <span className="truncate">Get Quote</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center gap-2 text-white/80 active:text-brand-accent transition-colors text-xs font-bold"
                  >
                    <Package className="w-3.5 h-3.5 text-brand-accent" />
                    <span className="truncate">Track Order</span>
                  </Link>
                </div>

                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white/90 active:text-brand-accent transition-colors font-bold text-xs mt-1"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent overflow-hidden shrink-0">
                      {user.photoURL && user.photoURL.trim() !== "" && !profileImgError ? (
                        <img
                          src={user.photoURL}
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={() => setProfileImgError(true)}
                        />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-xs font-bold">{user.displayName || user.email?.split("@")[0] || "My Profile"}</span>
                      <span className="text-[9px] text-gray-400 font-normal">View Account</span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-brand-accent text-white font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-transform mt-1 shadow-md shadow-brand-accent/20"
                  >
                    <User className="w-3.5 h-3.5" />
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Persistent Floating Progress Pill (Desktop Only) */}
      <div className="hidden md:flex fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100]">
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Scroll to Top Arrow (Appears at bottom) */}
              <AnimatePresence>
                {isAtBottom && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={scrollToTop}
                    className="group flex flex-col items-center gap-1 text-brand-accent hover:scale-110 transition-transform"
                  >
                    <ArrowUp className="w-6 h-6 stroke-[3px]" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Top</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* The Pill Progress */}
              <div className={`relative w-1.5 h-24 rounded-full overflow-hidden backdrop-blur-md border ${theme === "light" ? "bg-black/5 border-black/5" : "bg-white/10 border-white/10"
                }`}>
                <motion.div
                  className="absolute top-0 left-0 right-0 bg-brand-accent rounded-full shadow-[0_0_10px_#C62828]"
                  style={{
                    height: "100%",
                    scaleY: scrollYProgress,
                    originY: 0
                  }}
                />
              </div>

              <span className={`text-[10px] font-bold font-outfit uppercase tracking-tighter transition-colors ${theme === "light" ? "text-black/60" : "text-white/60"
                }`}>
                {Math.round(scrollYProgress.get() * 100)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
