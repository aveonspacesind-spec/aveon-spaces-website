"use client";
import Link from "next/link";
import { ArrowRight, ExternalLink, MapPin, Layers, RefreshCw, Search, Calendar } from "lucide-react";
import AnimatedSection, { ParallaxImage } from "@/components/AnimatedSection";
import Counter from "@/components/Counter";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackProjects = [
    { 
      id: "tech-mahindra-campus",
      name: "Tech Mahindra Campus", 
      location: "Bangalore, India",
      desc: "Complete workspace ergonomic overhaul for 5,000+ employees across 12 floors. Focus on agile collaborative zones.", 
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      stats: "5,000+ Units",
      scope: "Tech Campus",
      year: "2025"
    },
    { 
      id: "kpmg-headquarters",
      name: "KPMG Headquarters", 
      location: "Mumbai, India",
      desc: "Executive seating and high-density trading floors. Custom engineered for 14-hour workday comfort.", 
      img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
      stats: "2,200+ Units",
      scope: "Corporate Hub",
      year: "2024"
    },
    { 
      id: "deloitte-digital-tower",
      name: "Deloitte Digital Tower", 
      location: "Hyderabad, India",
      desc: "Premium workstation and meeting room integration with a focus on sustainable materials and aesthetics.", 
      img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
      stats: "3,500+ Units",
      scope: "Corporate Hub",
      year: "2025"
    },
    { 
      id: "hdfc-hub",
      name: "HDFC Bank Hub", 
      location: "Chennai, India",
      desc: "Nationwide rollout of lounge areas and customer service counters designed for durability and accessibility.", 
      img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80",
      stats: "10,000+ Units",
      scope: "Banking Hub",
      year: "2023"
    }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc, idx) => {
          const docData = doc.data() as any;
          const rawImg = docData.image || docData.img;
          const validImg = rawImg && typeof rawImg === "string" && rawImg.trim() !== ""
            ? rawImg.trim()
            : fallbackProjects[idx % fallbackProjects.length].img;
          return {
            id: doc.id,
            name: docData.name || "",
            location: docData.location || "Corporate HQ",
            desc: docData.desc || docData.challenge || "",
            img: validImg,
            stats: docData.stats || docData.supplied || "Featured Project",
            color: docData.color || "#111111",
            isLight: docData.isLight || false,
            scope: docData.scope || "Corporate Hub",
            year: docData.year || "2026",
            client: docData.client || ""
          };
        });
        setProjects(data);
      } else {
        setProjects(fallbackProjects);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading projects from Firestore:", error);
      setProjects(fallbackProjects);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white">
      {/* HERO */}
      <section className="relative h-[50vh] sm:h-[65vh] min-h-[360px] flex items-center justify-center overflow-hidden bg-black pt-16 sm:pt-20">
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src="" 
            alt="Projects Hero" 
            className="w-full h-full opacity-45 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection direction="up">
            <span className="text-brand-accent font-black text-xs uppercase tracking-[0.4em] block mb-3 sm:mb-4">Case Studies & Showcase</span>
            <h1 className="text-3xl sm:text-6xl md:text-8xl font-black font-outfit text-white tracking-tighter mb-4 sm:mb-6 leading-tight">
              FEATURED <span className="text-brand-accent">PROJECTS</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Discover how Aveon has engineered high-performance workspace environments for India's leading enterprises.
            </p>
          </AnimatedSection>
        </div>
      </section>


      {/* PROJECTS GRID */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 lg:gap-24 w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] sm:aspect-[16/10] min-h-[340px] sm:min-h-0 rounded-[2rem] sm:rounded-[3rem] bg-white/5 border border-white/10 animate-pulse flex flex-col justify-end p-6 sm:p-10 space-y-4">
                    <div className="h-8 bg-white/10 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 sm:py-32 text-center border border-white/5 border-dashed rounded-[2rem] sm:rounded-[3rem] max-w-4xl mx-auto space-y-6 px-4"
              >
                <div className="text-4xl text-white/20">📂</div>
                <h3 className="text-2xl font-black font-outfit text-white uppercase tracking-tight">No Projects Found</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">There are currently no featured projects to display.</p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 lg:gap-24"
              >
                {projects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-black py-12 sm:py-20 overflow-hidden border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12">
            {[
              { label: "Projects Delivered", value: 500, suffix: "+" },
              { label: "Enterprises Served", value: 200, suffix: "+" },
              { label: "Cities Reached", value: 45, suffix: "+" },
              { label: "Years Excellence", value: 12, suffix: "+" }
            ].map((stat, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.1} className="text-center">
                <h4 className="text-3xl sm:text-5xl md:text-6xl font-black font-outfit text-white mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} delay={i * 0.1} />
                </h4>
                <p className="text-brand-accent font-bold text-[10px] sm:text-xs uppercase tracking-widest">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#0A0A0A]">
        <AnimatedSection direction="up">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit text-white tracking-tighter mb-4 sm:mb-8">
              HAVE A VISION <br />FOR YOUR <span className="text-brand-accent">OFFICE?</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-12 font-light max-w-2xl mx-auto">
              From boutique startups to Fortune 500 campuses, we bring the same level of engineered precision to every project.
            </p>
            <Link 
              href="/contact"
              className="group inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-6 bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-accent transition-all shadow-2xl shadow-brand-accent/20"
            >
              Start Your Project <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </main>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <AnimatedSection direction="up" delay={(index % 2) * 0.1}>
      <motion.div
        layout
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group relative perspective-1000"
      >
        <Link 
          href={`/projects/${project.id}`}
          className="block"
        >
          {/* Card Body */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] min-h-[350px] sm:min-h-0 rounded-[1.75rem] sm:rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/10 transition-all duration-500 group-hover:border-brand-accent/50 group-hover:shadow-[0_0_50px_color-mix(in srgb, var(--color-brand-accent) 10%, transparent)]">
            
            {/* Image Parallax */}
            <div className="absolute inset-0 scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out">
              <ParallaxImage 
                src={project.img} 
                alt={project.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shine Effect */}
            <motion.div 
              style={{ left: shineX, top: shineY }}
              className="absolute -inset-[100%] z-10 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
            />

            {/* Content Container */}
            <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-between z-20">
              {/* Top Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 transition-all duration-500">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent bg-black/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-white/10 w-fit shadow-lg">
                    {project.scope}
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-accent group-hover:border-brand-accent">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="space-y-3 sm:space-y-6">
                <div className="transition-all duration-700">
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black font-outfit text-white leading-[0.95] sm:leading-[0.9] tracking-tighter mb-2 sm:mb-4 group-hover:text-gray-100 transition-colors">
                    {project.name.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i === project.name.split(' ').length - 1 ? "text-brand-accent" : ""}>
                        {word}{' '}
                      </span>
                    ))}
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm font-light max-w-md line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    {project.desc}
                  </p>
                </div>

                <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-6 border-t border-white/20 transition-all duration-500 group-hover:border-white/40">
                   <div className="flex items-center gap-2.5 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center group-hover:bg-brand-accent transition-colors shrink-0">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-accent group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest truncate">{project.location}</span>
                   </div>
                   <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="block text-[8px] font-black text-brand-accent uppercase tracking-[0.2em] mb-0.5">Impact</span>
                        <span className="block text-sm sm:text-lg font-black text-white">{project.stats}</span>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-black/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/10 transition-colors">
                        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </AnimatedSection>
  );
}