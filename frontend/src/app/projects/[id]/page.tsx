"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Layers, CheckCircle2, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";

// Fallback content for fields not in Firestore
const fallbackDetail = {
  client: "Aveon Enterprise Client",
  category: "Corporate Hub",
  units: "1,000+ Ergonomic Units",
  heroImg: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
  challenge: "Developing a unified seating strategy for a modern workforce with a focus on ergonomic performance, collaboration, and long-term durability.",
  solution: "We deployed our signature task chair series with adaptive lumbar support and high-tensile mesh, alongside modular break-out lounge seating tailored to the client's unique spatial requirements.",
  gallery: [
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
  ],
  highlights: [
    "Ergonomic compliance certified",
    "Custom colour-matched finishes",
    "On-site installation within 72 hours",
    "12-month full service warranty",
  ],
};

const MOCK_PROJECTS_DATA: Record<string, any> = {
  "tech-mahindra-campus": {
    name: "Tech Mahindra Campus",
    location: "Bangalore, India",
    year: "2025",
    scope: "Tech Campus",
    supplied: "5,000+ Task Chairs & Breakouts",
    client: "Tech Mahindra Ltd.",
    img: "",
    challenge: "Overhauling a sprawling multi-floor campus in Bangalore to accommodate high-density technical teams. The client required chairs that support sustained 9+ hour coding sessions while offering modern collaborative zones for agile standups.",
    solution: "We installed 5,000+ units of our high-tensile mesh task chairs featuring adaptive lumbar supports, coupled with modular lounge systems in the recreational breakout areas to promote visual synergy and comfort.",
    highlights: [
      "Custom mesh colors aligned with campus branding",
      "Ergonomic mesh back with dynamic seat depth glide",
      "Supplied and assembled within tight 15-day phases",
      "5-year comprehensive service warranty contract"
    ],
    gallery: [
      "",
      "",
    ]
  },
  "kpmg-headquarters": {
    name: "KPMG Headquarters",
    location: "Mumbai, India",
    year: "2024",
    scope: "Corporate Hub",
    supplied: "2,200+ Premium Ergonomic Seats",
    client: "KPMG India",
    img: "",
    challenge: "Designing seating options for elite consulting associates and intensive financial analyst desks in Mumbai. High prestige combined with durability was critical for extended work weeks.",
    solution: "We selected our premium synchron-tilt executive chairs with genuine leatherette details and 3D adjustable armrests, integrating a cohesive, refined look across all client-facing boardrooms and associate clusters.",
    highlights: [
      "Synchro-tilt mechanism with 4 multi-lock points",
      "Acoustic breakout seating for private calls",
      "Carbon-neutral frame manufacturing validation",
      "Delivered on time for the annual corporate audit"
    ],
    gallery: [
      "",
      ""
    ]
  },
  "deloitte-digital-tower": {
    name: "Deloitte Digital Tower",
    location: "Hyderabad, India",
    year: "2025",
    scope: "Corporate Hub",
    supplied: "3,500+ Agile Workstations",
    client: "Deloitte India",
    img: "",
    challenge: "The client wanted a focus on visual vibrancy and recycled, green-certified materials for their new digital innovation tower in Hyderabad to attract tech-savvy talent.",
    solution: "Our teams engineered custom seat shells utilizing 35% post-consumer ocean plastics, upholstered in high-durability fabrics with vibrant colors, perfectly matching their digital design aesthetics.",
    highlights: [
      "LEED Platinum green building certification compliance",
      "100% recyclable components at product end-of-life",
      "Modular breakout configurations for collaborative sprint planning",
      "Integrated under-seat bag hooks and smart tags"
    ],
    gallery: [
      "",
      ""
    ]
  },
  "hdfc-hub": {
    name: "HDFC Bank Hub",
    location: "Chennai, India",
    year: "2023",
    scope: "Banking Hub",
    supplied: "10,000+ Customer Service Seats",
    client: "HDFC Bank",
    img: "",
    challenge: "A nationwide scale rollout across 40 customer experience branches. Comfort for teller desks and public waiting areas required heavy-duty, highly cleanable components.",
    solution: "We deployed heavy-duty steel base task chairs upholstered in antimicrobial, easily sanitizable materials, together with public-facing modular beams and visitor chairs.",
    highlights: [
      "Antimicrobial medical-grade upholstery coverings",
      "High load-bearing steel pedestal bases (tested to 150kg)",
      "Uniform aesthetics spanning 40 geographic cities",
      "BIFMA level 3 engineering performance certified"
    ],
    gallery: [
      "",
      ""
    ]
  }
};

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [project, setProject] = useState<any>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const docRef = doc(db, "projects", resolvedParams.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setProject({
            id: docSnap.id,
            name: data.name || "Untitled Project",
            desc: data.desc || fallbackDetail.challenge,
            img: data.image || data.img || fallbackDetail.heroImg,
            location: data.location || "India",
            year: data.year || "2026",
            color: data.color || "#111111",
            isLight: data.isLight || false,
            scope: data.scope || fallbackDetail.category,
            supplied: data.supplied || fallbackDetail.units,
            client: data.client || fallbackDetail.client,
            challenge: data.challenge || fallbackDetail.challenge,
            solution: data.solution || fallbackDetail.solution,
            gallery: data.gallery || fallbackDetail.gallery,
            highlights: data.highlights || fallbackDetail.highlights,
          });
        } else {
          // Check mockup dataset fallback
          const mockData = MOCK_PROJECTS_DATA[resolvedParams.id];
          if (mockData) {
            setProject({
              id: resolvedParams.id,
              ...mockData
            });
          } else {
            // ID not found — show a graceful "not found" state with fallback
            setProject({ notFound: true, id: resolvedParams.id });
          }
        }
      } catch (err) {
        console.error("Error loading project:", err);
        const mockData = MOCK_PROJECTS_DATA[resolvedParams.id];
        if (mockData) {
          setProject({
            id: resolvedParams.id,
            ...mockData
          });
        } else {
          setProject({ notFound: true });
        }
      } finally {
        setLoading(false);
      }

      // Load a few related projects for the bottom section
      try {
        const q = query(collection(db, "projects"), limit(3));
        const snapshot = await getDocs(q);
        const related = snapshot.docs
          .filter((d) => d.id !== resolvedParams.id)
          .slice(0, 2)
          .map((d) => ({
            id: d.id,
            name: (d.data() as any).name || "Project",
            img: (d.data() as any).image || (d.data() as any).img || fallbackDetail.gallery[0],
            location: (d.data() as any).location || "India",
          }));
        setRelatedProjects(related);
      } catch (_) {}
    }

    loadProject();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <main className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading Project</span>
        </div>
      </main>
    );
  }

  if (!project || project.notFound) {
    return (
      <main className="bg-[#050505] min-h-screen flex items-center justify-center text-white">
        <div className="text-center px-6">
          <span className="text-brand-accent font-black text-xs uppercase tracking-widest block mb-6">404 — Not Found</span>
          <h1 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter mb-6">Project<br /><span className="text-brand-accent">Missing.</span></h1>
          <p className="text-gray-400 text-lg font-light mb-12 max-w-md mx-auto">This project doesn't exist or hasn't been published yet. Browse all available case studies below.</p>
          <Link href="/projects" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-accent transition-all shadow-2xl">
            Browse All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  const heroImg = (project.img && typeof project.img === "string" && project.img.trim() !== "")
    ? project.img.trim()
    : fallbackDetail.heroImg;
  const highlights = project.highlights?.length ? project.highlights : fallbackDetail.highlights;
  const gallery = (project.gallery?.length ? project.gallery : fallbackDetail.gallery).filter(
    (img: string) => img && typeof img === "string" && img.trim() !== ""
  );

  return (
    <main className="bg-[#050505] min-h-screen text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative h-[90vh] flex items-end overflow-hidden">
        {/* Background image with parallax */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImg}
            alt={project.name}
            fill
            className="object-cover scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />
        </div>

        {/* Breadcrumb + Title */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white/40 mb-6 sm:mb-8 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-accent">{project.name}</span>
            </nav>

            {/* Red eyebrow label */}
            <span className="text-brand-accent font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] block mb-3 sm:mb-4">
              Case Study
            </span>

            {/* Project name — giant */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[90px] font-black font-outfit text-white tracking-tighter leading-[0.95] sm:leading-[0.85] mb-6 sm:mb-8 max-w-4xl">
              {project.name}
            </h1>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {project.location && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
                  <MapPin className="w-3 h-3 text-brand-accent" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">{project.location}</span>
                </div>
              )}
              {project.year && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
                  <Calendar className="w-3 h-3 text-brand-accent" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">{project.year}</span>
                </div>
              )}
              {project.scope && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2">
                  <Layers className="w-3 h-3 text-brand-accent" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">{project.scope}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SPECS STRIP ── */}
      <section className="border-b border-white/5 bg-[#080808]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-12">
            {[
              { label: "Client", value: project.client || fallbackDetail.client },
              { label: "Scope", value: project.scope || fallbackDetail.category },
              { label: "Seating Supplied", value: project.supplied || fallbackDetail.units },
              { label: "Status", value: "Completed", isGreen: true },
            ].map((item, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.05}>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1 sm:mb-2">{item.label}</span>
                <span className={`font-bold text-xs sm:text-sm md:text-base ${item.isGreen ? "text-[#4CAF50]" : "text-white"}`}>
                  {item.value}
                </span>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ── */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32 items-start">
            <AnimatedSection direction="right">
              <span className="text-brand-accent font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] block mb-4 sm:mb-6">The Challenge</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8 leading-[0.95]">
                What needed<br /><span className="text-brand-accent">to be solved.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-400 font-light leading-relaxed">
                {project.challenge || project.desc || fallbackDetail.challenge}
              </p>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.1}>
              <span className="text-brand-accent font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] block mb-4 sm:mb-6">The Aveon Spaces Solution</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8 leading-[0.95]">
                How we<br /><span className="text-brand-accent">delivered.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-400 font-light leading-relaxed mb-6 sm:mb-10">
                {project.solution || fallbackDetail.solution}
              </p>

              {/* Highlights checklist */}
              <div className="space-y-3">
                {highlights.map((point: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-accent flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">{point}</span>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      {gallery.length > 0 && (
        <section className="pb-16 sm:pb-24 md:pb-32">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <AnimatedSection direction="up" className="mb-8 sm:mb-12">
              <span className="text-brand-accent font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] block mb-2 sm:mb-3">Project Gallery</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tighter">
                Inside the<br /><span className="text-brand-accent">space.</span>
              </h2>
            </AnimatedSection>

            <div className={`grid gap-4 sm:gap-6 ${gallery.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
              {gallery.map((img: string, i: number) => (
                <AnimatedSection key={i} direction="up" delay={i * 0.1}>
                  <div className="group relative aspect-video rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 hover:border-brand-accent/40 transition-all duration-500 shadow-2xl hover:shadow-[0_30px_80px_color-mix(in srgb, var(--color-brand-accent) 15%, transparent)]">
                    <Image
                      src={img}
                      alt={`${project.name} gallery ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PROJECTS ── */}
      {relatedProjects.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-white/5 bg-[#080808]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <AnimatedSection direction="up" className="mb-8 sm:mb-10">
              <span className="text-brand-accent font-black text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] block mb-2 sm:mb-3">More Projects</span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-outfit text-white tracking-tighter">
                Explore <span className="text-brand-accent">more.</span>
              </h3>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {relatedProjects.map((rp, i) => (
                <AnimatedSection key={rp.id} direction="up" delay={i * 0.1}>
                  <Link href={`/projects/${rp.id}`} className="group flex gap-4 sm:gap-5 items-center bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-accent/30 rounded-2xl p-4 sm:p-5 transition-all duration-300">
                    <div className="relative w-16 sm:w-20 h-14 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900">
                      {rp.img && typeof rp.img === "string" && rp.img.trim() !== "" ? (
                        <Image src={rp.img} alt={rp.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold font-outfit truncate group-hover:text-brand-accent transition-colors text-sm sm:text-base">{rp.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{rp.location}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-brand-accent group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM NAVIGATION ── */}
      <section className="py-16 sm:py-20 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Link
            href="/projects"
            className="group flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-2 transition-transform" />
            Back to All Projects
          </Link>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-brand-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-accent transition-all shadow-2xl shadow-brand-accent/20 hover:shadow-brand-accent/40 w-full sm:w-auto justify-center"
          >
            Enquire for Your Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
  );
}
