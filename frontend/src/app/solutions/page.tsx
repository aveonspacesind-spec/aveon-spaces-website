"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import AnimatedSection, { ParallaxImage, TextReveal } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackSolutions = [
    { 
      title: 'Corporate Workspaces', 
      slug: 'corporate',
      subtitle: 'High-Performance Environments',
      desc: 'We provide specialized ergonomic configurations that meet the rigorous standards and functional requirements of modern corporate workspaces. Our modular designs adapt to changing needs while maintaining aesthetic integrity and employee wellbeing.',
      features: ['Ergonomic Assessment', 'Modular Layouts', 'Sustainable Materials', 'Acoustic Integration'],
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'
    },
    { 
      title: 'Educational Institutions', 
      slug: 'education',
      subtitle: 'Dynamic Learning Spaces',
      desc: 'Durable, comfortable, and collaborative seating systems designed specifically for modern learning environments. From lecture halls to interactive pods, our solutions foster engagement and focus.',
      features: ['Collaborative Pods', 'Lecture Hall Systems', 'Durable Finishes', 'Flexible Configurations'],
      img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80'
    },
    { 
      title: 'Healthcare Facilities', 
      slug: 'healthcare',
      subtitle: 'Healing Environments',
      desc: 'Hygienic, supportive, and heavy-duty seating solutions for waiting areas, patient rooms, and administrative staff. Built to withstand 24/7 use while providing essential comfort.',
      features: ['Antimicrobial Surfaces', 'Ergonomic Support', 'Easy Maintenance', 'Patient-Centric Design'],
      img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80'
    }
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "solutions"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data() as any;
          return {
            id: doc.id,
            title: docData.title || docData.name || "",
            slug: docData.slug || "",
            subtitle: docData.subtitle || "",
            desc: docData.desc || docData.description || "",
            features: docData.features || [],
            img: docData.img || docData.image || docData.photo || ""
          };
        });
        setSolutions(data);
      } else {
        setSolutions(fallbackSolutions);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading solutions from Firestore:", error);
      setSolutions(fallbackSolutions);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white">
      {/* HERO SECTION */}
      <section className="relative h-[50vh] sm:h-[60vh] min-h-[340px] flex items-center justify-center overflow-hidden bg-black pt-16 sm:pt-20">
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src="" 
            alt="Solutions Hero" 
            className="w-full h-full opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection direction="up">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-outfit text-white tracking-tighter mb-4 sm:mb-6 leading-tight">
              OUR <span className="text-brand-accent">SOLUTIONS</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Tailored seating and workstation ecosystems designed for the unique demands of every professional sector.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* SOLUTIONS LISTING */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : (
            <div className="space-y-20 sm:space-y-32 md:space-y-40">
              {solutions.map((sol, i) => (
              <div key={i} className={`flex flex-col ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 sm:gap-12 lg:gap-24 items-center`}>
                <div className="flex-1 w-full relative">
                  <AnimatedSection direction={i % 2 === 0 ? "right" : "left"}>
                    <div className="aspect-[4/3] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl group">
                      <ParallaxImage 
                        src={sol.img} 
                        alt={sol.title} 
                        className="w-full h-full transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>
                  </AnimatedSection>
                </div>

                <div className="flex-1 w-full">
                  <AnimatedSection direction="up" delay={0.2}>
                    <div className="w-12 sm:w-16 h-1 bg-brand-accent mb-6 sm:mb-8"></div>
                    <span className="text-brand-accent font-bold text-xs tracking-[0.3em] uppercase mb-3 sm:mb-4 block">
                      Sector 0{i + 1} • {sol.subtitle}
                    </span>
                    <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black font-outfit mb-4 sm:mb-8 text-white leading-tight">
                      {sol.title}
                    </h2>
                    <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-10 leading-relaxed font-light">
                      {sol.desc}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
                      {sol.features.map((feature: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-brand-accent shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link 
                      href={`/solutions/${sol.slug}`}
                      className="group inline-flex items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-bold rounded-full hover:bg-brand-accent hover:text-white transition-all shadow-xl text-sm"
                    >
                      Enquire for {sol.title}
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                  </AnimatedSection>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* FINAL CTA - FULL WIDTH */}
      <section className="pb-0 overflow-hidden">
        <AnimatedSection direction="up">
          <div className="bg-brand-accent py-16 sm:py-24 md:py-32 text-center text-white relative overflow-hidden group">
            {/* Background elements for depth */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
            
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
              <h2 className="text-3xl sm:text-5xl md:text-8xl font-black font-outfit tracking-tighter mb-4 sm:mb-8 leading-[0.95] sm:leading-[0.9]">
                WANT A CUSTOM <br /><span className="text-white/30">SEATING PLAN?</span>
              </h2>
              <p className="text-base sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 font-light max-w-2xl mx-auto leading-relaxed">
                Our design engineers will collaborate with you to craft a workspace that perfectly aligns with your operational dynamics.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-6 bg-white text-black font-black uppercase tracking-widest text-xs sm:text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-black hover:text-white"
              >
                Get Free Consultation
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

    </main>
  );
}