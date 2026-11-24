"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection, { ParallaxImage } from "@/components/AnimatedSection";
import * as LucideIcons from "lucide-react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const getIconComponent = (iconName: any) => {
  if (!iconName) return LucideIcons.HelpCircle;
  if (typeof iconName === 'string') {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.HelpCircle;
  }
  return iconName;
};

const sectorData: Record<string, any> = {
  corporate: {
    title: "Corporate Workspaces",
    subtitle: "High-Performance Office Ecosystems",
    heroImg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
    description: "In the modern corporate world, the workspace is more than just a place to work—it's a tool for productivity and a reflection of company culture. Aveon's corporate solutions are engineered to support long-hour focus while providing the aesthetic sophistication required by global enterprises.",
    points: [
      { title: "Dynamic Ergonomics", desc: "Adaptive seating that responds to user movement throughout the workday.", icon: LucideIcons.Zap },
      { title: "Modular Scalability", desc: "Seating systems that can be easily reconfigured as your team grows.", icon: LucideIcons.Target },
      { title: "Executive Refinement", desc: "Premium materials and finishes that align with brand identity.", icon: LucideIcons.Shield },
      { title: "Wellbeing Focused", desc: "Designed to reduce fatigue and promote long-term musculoskeletal health.", icon: LucideIcons.Users },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80"
    ]
  },
  education: {
    title: "Educational Institutions",
    subtitle: "Dynamic Learning Environments",
    heroImg: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
    description: "Modern education requires flexibility, durability, and comfort. From collaborative research hubs to high-density lecture halls, Aveon provides seating systems that stand up to the rigors of institutional use while fostering an environment of active learning and engagement.",
    points: [
      { title: "Heavy-Duty Durability", desc: "Materials tested for extreme usage cycles and impact resistance.", icon: LucideIcons.Shield },
      { title: "Collaborative Layouts", desc: "Mobile and swivel-integrated designs for interactive group work.", icon: LucideIcons.Users },
      { title: "Space Optimization", desc: "Stackable and high-density solutions for multi-purpose halls.", icon: LucideIcons.Target },
      { title: "Ergonomic Support", desc: "Correct posture support for students of all age groups.", icon: LucideIcons.Zap },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80"
    ]
  },
  healthcare: {
    title: "Healthcare Facilities",
    subtitle: "Healing & Supportive Environments",
    heroImg: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80",
    description: "In healthcare, comfort and hygiene are paramount. Aveon's healthcare solutions feature antimicrobial surfaces, ergonomic support for administrative staff, and heavy-duty waiting area seating that provides comfort to patients and families during stressful times.",
    points: [
      { title: "Clinical Hygiene", desc: "Easy-to-clean antimicrobial finishes that meet healthcare standards.", icon: LucideIcons.Shield },
      { title: "Patient Comfort", desc: "Supportive contours designed for extended waiting periods.", icon: LucideIcons.Users },
      { title: "Administrative Focus", desc: "High-end ergonomic task chairs for 24/7 hospital staff.", icon: LucideIcons.Zap },
      { title: "Robust Engineering", desc: "Structural integrity that withstands constant high-volume use.", icon: LucideIcons.Target },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80"
    ]
  }
};

export default function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const fallback = sectorData[resolvedParams.slug] || sectorData.corporate;
  const [data, setData] = React.useState<any>(fallback);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, "solutions"), (snapshot) => {
      if (!snapshot.empty) {
        const found = snapshot.docs.find(doc => {
          const docData = doc.data();
          return docData.slug === resolvedParams.slug;
        });

        if (found) {
          const docData = found.data();
          setData({
            title: docData.title || docData.name || fallback.title,
            subtitle: docData.subtitle || fallback.subtitle,
            heroImg: docData.heroImg || docData.img || docData.photo || docData.image || fallback.heroImg,
            description: docData.desc || docData.description || fallback.description,
            points: docData.points ? docData.points.map((p: any) => ({
              title: p.title,
              desc: p.desc || p.description,
              icon: getIconComponent(p.icon || p.iconName)
            })) : (docData.features ? docData.features.map((feat: string, idx: number) => {
              const defaultIcons = [LucideIcons.Zap, LucideIcons.Target, LucideIcons.Shield, LucideIcons.Users];
              return {
                title: feat,
                desc: `High-performance ${feat.toLowerCase()} integration.`,
                icon: defaultIcons[idx % defaultIcons.length]
              };
            }) : fallback.points),
            gallery: docData.gallery || fallback.gallery
          });
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore fetch error for solutions:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [resolvedParams.slug, fallback]);

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white overflow-x-clip">
      {/* HERO SECTION */}
      <section className="relative min-h-[500px] h-[65vh] sm:h-[75vh] md:h-[80vh] flex items-center overflow-hidden bg-black pt-20">
        <div className="absolute inset-0 z-0 opacity-50">
          <ParallaxImage 
            src={data.heroImg} 
            alt={data.title} 
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-[1]" />
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
          <AnimatedSection direction="up">
            <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white/60 mb-6 sm:mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/solutions" className="hover:text-white transition-colors">Solutions</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-accent">{data.title}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[90px] font-black font-outfit text-white tracking-tighter leading-[0.95] sm:leading-[0.85] mb-6 sm:mb-8">
              {data.title.split(' ')[0]} <br />
              <span className="text-brand-accent">{data.title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed">
              {data.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-start">
            <AnimatedSection direction="right">
              <span className="text-brand-accent font-bold text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-6 block">The Aveon Spaces Standard</span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black font-outfit text-white tracking-tighter leading-tight mb-6 sm:mb-8">
                Redefining the <br className="hidden sm:inline" /> Industry Benchmark.
              </h2>
              <p className="text-base sm:text-lg text-gray-400 font-light leading-relaxed">
                {data.description}
              </p>
              
              <div className="mt-8 sm:mt-12 flex flex-col gap-4">
                <Link href="/contact" className="group inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-brand-accent text-white font-bold rounded-full hover:bg-white hover:text-black transition-all shadow-xl w-fit text-xs sm:text-sm uppercase tracking-wider">
                  Request Sector Consultation
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {data.points.map((point: any, idx: number) => (
                <AnimatedSection key={idx} direction="up" delay={idx * 0.1}>
                  <div className="p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:border-brand-accent/30 transition-colors group">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                      <point.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 font-outfit text-white">{point.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-light">{point.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {data.gallery.map((img: string, idx: number) => (
              <AnimatedSection key={idx} direction="up" delay={idx * 0.1}>
                <div className="aspect-[4/5] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/10 relative group shadow-2xl">
                  <ParallaxImage 
                    src={img} 
                    alt={`Gallery ${idx}`} 
                    className="w-full h-full transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-black py-16 sm:py-24 text-center px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">
          <AnimatedSection direction="up">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8">
              Build Your <span className="text-brand-accent">Legacy</span> Space.
            </h2>
            <Link href="/contact" className="inline-flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-5 bg-white text-black font-bold rounded-full hover:bg-brand-accent hover:text-white transition-all text-xs sm:text-sm uppercase tracking-widest font-black">
              Talk to an Expert <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
