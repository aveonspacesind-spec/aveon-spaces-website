"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";


const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);
const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.148.563 4.181 1.637 5.962L.194 23.368l5.525-1.448A11.97 11.97 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zM17.65 16.58c-.24.67-1.393 1.282-1.921 1.346-.496.06-1.157.175-3.32-.72-2.617-1.082-4.298-3.766-4.43-3.943-.131-.176-1.056-1.405-1.056-2.68 0-1.275.666-1.899.905-2.15.24-.251.523-.314.698-.314.175 0 .35 0 .504.007.162.008.384-.06.594.444.221.528.718 1.748.784 1.88.066.133.11.288.022.464-.087.176-.131.288-.262.443-.131.155-.276.34-.393.456-.131.132-.27.275-.115.54.155.265.69 1.138 1.481 1.841 1.018.905 1.87 1.189 2.132 1.32.262.133.415.111.568-.066.153-.177.655-.765.83-1.028.175-.264.35-.221.594-.132.245.088 1.545.728 1.808.861.263.133.438.199.504.31.066.111.066.644-.175 1.314z" /></svg>
);

const socialPlatformsData = [
  { id: 'facebook', name: "Facebook", icon: <FacebookIcon />, color: "from-[#1877F2] to-[#125ebd]", glow: "rgba(24, 119, 242, 0.4)" },
  { id: 'twitter', name: "Twitter", icon: <TwitterIcon />, color: "from-[#1DA1F2] to-[#0d84cf]", glow: "rgba(29, 161, 242, 0.4)" },
  { id: 'instagram', name: "Instagram", icon: <InstagramIcon />, color: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]", glow: "rgba(238, 42, 123, 0.4)" },
  { id: 'linkedin', name: "LinkedIn", icon: <LinkedinIcon />, color: "from-[#0A66C2] to-[#08529c]", glow: "rgba(10, 102, 194, 0.4)" },
  { id: 'whatsapp', name: "WhatsApp", icon: <WhatsappIcon />, color: "from-[#25D366] to-[#128C7E]", glow: "rgba(37, 211, 102, 0.4)" }
];

export default function Footer() {
  const [showAgency, setShowAgency] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterPhone, setNewsletterPhone] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [socialsConfig, setSocialsConfig] = useState<any>(null);
  const agencyRef = useRef<HTMLDivElement>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterPhone) return;
    setNewsletterStatus("submitting");
    try {
      await addDoc(collection(db, "newsletter_subscriptions"), {
        email: newsletterEmail,
        phone: newsletterPhone,
        createdAt: serverTimestamp()
      });
      setNewsletterStatus("success");
      setNewsletterEmail("");
      setNewsletterPhone("");
      setTimeout(() => setNewsletterStatus("idle"), 3000);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      alert("Failed to subscribe. Please try again.");
      setNewsletterStatus("idle");
    }
  };


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (agencyRef.current && !agencyRef.current.contains(event.target as Node)) {
        setShowAgency(false);
      }
    }
    if (showAgency) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.socials) setSocialsConfig(data.socials);
      }
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsub();
    };
  }, [showAgency]);

  const visibleSocials = socialsConfig 
    ? socialPlatformsData.filter(p => socialsConfig[p.id]?.show && socialsConfig[p.id]?.url)
    : [];

  return (
    <>


      {/* Main Footer */}
      <footer data-theme="dark" className="bg-[#0A0A0A] text-gray-400 pt-20 pb-28 md:pb-8">
        
        {/* Newsletter Subscription Row */}
        <div className="max-w-[1440px] mx-auto px-6 mb-12 md:mb-16 pb-12 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
          <div className="w-full text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black font-outfit text-white uppercase tracking-tight">Subscribe to our newsletter</h3>
            <p className="text-xs md:text-sm text-gray-400 mt-2 md:mt-1">Get the latest updates on ergonomic workplace designs and exclusive releases.</p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-[420px] bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all duration-300">
            {/* Ambient background glow inside the card on hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-brand-accent/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  required
                  type="email" 
                  placeholder="Work email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-accent focus:bg-white/[0.08] transition-all placeholder:text-gray-500"
                />
              </div>
              <div className="relative w-full sm:w-[160px]">
                <input 
                  required
                  type="tel" 
                  placeholder="Phone number"
                  value={newsletterPhone}
                  onChange={(e) => setNewsletterPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-accent focus:bg-white/[0.08] transition-all placeholder:text-gray-500"
                />
              </div>
            </div>

            <button 
              disabled={newsletterStatus !== "idle"}
              type="submit"
              className={`w-full font-black text-[10px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] shrink-0 ${
                newsletterStatus === "success" 
                  ? "bg-green-600 text-white shadow-[0_4px_20px_rgba(22,163,74,0.4)]" 
                  : "bg-brand-accent hover:bg-brand-accent text-white hover:shadow-[0_4px_20px_color-mix(in srgb, var(--color-brand-accent) 30%, transparent)]"
              }`}
            >
              {newsletterStatus === "submitting" ? "Subscribing..." : newsletterStatus === "success" ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-y-10 sm:gap-y-12 gap-x-4 sm:gap-x-8 mb-12 md:mb-16">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col items-center text-center md:items-start md:text-left">
            <Link href="/" className="flex flex-col items-center md:items-start leading-none mb-6">
              <div className="text-3xl font-black font-outfit tracking-tighter text-white flex items-center">
                <span className="text-brand-accent">A</span>VEON
              </div>
              <span className="text-[9px] font-bold tracking-[0.2em] text-gray-400 mt-1">SEATING SYSTEMS</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm mb-8 text-gray-400 mx-auto md:mx-0">
              We are a leading manufacturer of ergonomic seating systems and workspace solutions.
            </p>
            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              {visibleSocials.map((social, i) => (
                <Link 
                  key={i} 
                  href={socialsConfig[social.id].url} 
                  target="_blank"
                  className="group relative w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center overflow-hidden transition-all duration-500 ease-[0.16,1,0.3,1] lg:hover:w-[130px] lg:hover:border-transparent lg:hover:shadow-2xl active:scale-95"
                >
                  {/* 1. Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${social.color} opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-0`} />

                  {/* 2. Blurred Glow */}
                  <div 
                    className="absolute inset-0 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
                    style={{ backgroundColor: social.glow }}
                  />
                  
                  {/* 3. Shrinking Icon (scale(0) on hover) */}
                  <div className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center transition-all duration-500 lg:group-hover:scale-0 text-white/50 lg:group-hover:text-white">
                    {/* Cloned icon for scaling */}
                    <div className="w-[18px] h-[18px] flex items-center justify-center transition-transform duration-500 lg:group-hover:scale-0">
                      {social.icon}
                    </div>
                  </div>

                  {/* 4. Scaling Text (scale(1) on hover) */}
                  <div className="absolute inset-0 pl-10 flex items-center z-10 pointer-events-none">
                    <span className="text-white font-outfit font-bold text-[13px] tracking-wide whitespace-nowrap opacity-0 scale-50 translate-x-2 lg:group-hover:opacity-100 lg:group-hover:scale-100 lg:group-hover:translate-x-0 transition-all duration-500 origin-left">
                      {social.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-white text-sm font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm hover:text-brand-accent transition-colors">Products</Link></li>
              <li><Link href="/solutions" className="text-sm hover:text-brand-accent transition-colors">Solutions</Link></li>
              <li><Link href="/projects" className="text-sm hover:text-brand-accent transition-colors">Projects</Link></li>
              <li><Link href="/testimonials" className="text-sm hover:text-brand-accent transition-colors">Testimonials</Link></li>
              <li><Link href="/about" className="text-sm hover:text-brand-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-brand-accent transition-colors">Contact Us</Link></li>
              <li><Link href="/orders" className="text-sm hover:text-brand-accent transition-colors font-bold">Track Order →</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h4 className="text-white text-sm font-bold mb-6">Categories</h4>
            <ul className="space-y-3">
              <li><Link href="/products?category=chairs" className="text-sm hover:text-brand-accent transition-colors">Chairs</Link></li>
              <li><Link href="/products?category=workstations" className="text-sm hover:text-brand-accent transition-colors">Workstations</Link></li>
              <li><Link href="/products?category=executive" className="text-sm hover:text-brand-accent transition-colors">Executive</Link></li>
              <li><Link href="/products?category=conference" className="text-sm hover:text-brand-accent transition-colors">Conference</Link></li>
              <li><Link href="/products?category=desks" className="text-sm hover:text-brand-accent transition-colors">Desks</Link></li>
            </ul>

          </div>

          {/* Contact Us */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-white text-sm font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                <span className="text-sm text-gray-400 leading-relaxed">
                  Aveon Spaces<br />
                  Plot No. 123, Industrial Area,<br />
                  Phase 2, Pune - 411019, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-400">info@aveonseating.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-400">+91 98765 43210</span>
              </li>
              {(() => {
                const whatsappUrl = socialsConfig?.whatsapp?.url || "https://wa.me/919876543210";
                return (
                  <li className="flex items-center gap-3">
                    <WhatsappIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-[#25D366] transition-colors">Chat on WhatsApp</a>
                  </li>
                );
              })()}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-[1440px] mx-auto px-6 border-t border-gray-900 pt-8 pb-4 flex flex-col md:flex-row items-center md:justify-between gap-6 relative">
          <p className="text-[11px] text-gray-400 text-center md:text-left flex-1 md:order-1 order-2">
            © {new Date().getFullYear()} Aveon Spaces. All Rights Reserved.
          </p>

          <div className="flex items-center justify-center relative flex-1 md:order-2 order-1" ref={agencyRef}>
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              Made with <span className="text-brand-accent animate-pulse">❤️</span> by
              <button
                onClick={() => setShowAgency(!showAgency)}
                className="font-bold text-gray-400 hover:text-white transition-colors relative"
              >
                Aurex
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-gray-600 opacity-50"></span>
              </button>
            </p>

            <AnimatePresence>
              {showAgency && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[240px] bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col gap-4"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Agency</span>
                    <Link href="https://aurexdigitals.in" target="_blank" className="text-sm text-white hover:text-brand-accent font-bold flex items-center gap-2 group transition-colors">
                      Aurex Digitals Website
                      <svg className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </Link>
                  </div>
                  <div className="w-full h-px bg-white/5"></div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-1">Lead Developer</span>
                    <span className="text-sm text-white font-medium">Rathan H N</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 md:gap-6 justify-center md:justify-end flex-1 md:order-3 order-3">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
