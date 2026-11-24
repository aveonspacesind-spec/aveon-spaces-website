"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import AnimatedSection, { ParallaxImage, TextReveal } from "@/components/AnimatedSection";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getHasPlayedIntro, setHasPlayedIntro } from "@/lib/introState";
import Counter from "@/components/Counter";
import Loader from "@/components/Loader";
import ProductCategories from "@/components/ProductCategories";
import ReviewModal from "@/components/ReviewModal";
import ChasingButton from "@/components/ChasingButton";
import HoverCard3D from "@/components/HoverCard3D";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";


// 1. HERO SECTION WITH SCROLL PARALLAX
function HeroSection() {
  const [heroData, setHeroData] = useState<any>(null);
  const ref = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().hero) {
        setHeroData(docSnap.data().hero);
      } else {
        // Fallback Hero Data
        setHeroData({
          title1: "ELITE",
          title2: "COMFORT.",
          subtitle: "Performance Engineered Seating",
          bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
        });
      }
    }, (error) => {
      console.error("Firestore Hero error, using fallback:", error);
      setHeroData({
        title1: "ELITE",
        title2: "COMFORT.",
        subtitle: "Performance Engineered Seating",
        bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
      });
    });
    return () => unsub();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} data-theme="dark" className="relative w-full min-h-[100dvh] flex flex-col justify-end pb-24 md:pb-32 px-6 lg:px-12 overflow-hidden bg-[#000000]" style={{ position: "relative" }}>
      {heroData ? (
        <>
          <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
            <ParallaxImage
              src={heroData.bgImage}
              alt="Modern Workspace"
              className="w-full h-full opacity-40 mix-blend-luminosity scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent" />
          </motion.div>

          <div className="relative z-20 w-full max-w-[1440px] mx-auto flex flex-col items-start">
            <div className="mb-8 block">
              <TextReveal delay={0.2}>
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/50">
                  {heroData.subtitle}
                </span>
              </TextReveal>
            </div>

            <div className="max-w-6xl mb-10 flex flex-col">
              <h1 className="group text-[clamp(3.5rem,10vw,120px)] font-black font-outfit leading-[0.85] tracking-tighter text-white cursor-default">
                <TextReveal delay={0.3}>
                  <span className="transition-all duration-500 lg:group-hover:text-transparent lg:group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.6)]">{heroData.title1}</span>
                </TextReveal>
              </h1>
              <h1 className="group text-[clamp(3.5rem,10vw,120px)] font-black font-outfit leading-[0.85] tracking-tighter cursor-default">
                <TextReveal delay={0.4}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600 transition-all duration-500 lg:group-hover:bg-none lg:group-hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.6)]">
                    {heroData.title2}
                  </span>
                </TextReveal>
              </h1>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader size="40" color="#ffffff" />
        </div>
      )}
    </section>
  );
}

// 2. KEYPOINT HOVERS (Upgraded with 5 Features & Alternative Words)
function KeypointsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [keypoints, setKeypoints] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "keypoints"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data() as any;
          return {
            id: doc.id,
            ...docData,
            title: docData.title || "",
            desc: docData.desc || docData.description || "",
            img: docData.img || docData.photo || "",
            color: docData.color || "#111111",
            order: docData.order ?? 999
          };
        });
        data.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
        setKeypoints(data);
      } else {
        // Fallback Keypoints
        const DEFAULT_KEYPOINT_IMAGES = [
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80"
        ];
        setKeypoints([
          { title: "Ergonomic Design", desc: "Scientific precision for maximum comfort.", img: DEFAULT_KEYPOINT_IMAGES[0], color: "#111111" },
          { title: "Premium Materials", desc: "Sourced from the finest global suppliers.", img: DEFAULT_KEYPOINT_IMAGES[1], color: "#1a1a1a" },
          { title: "Cinematic Aesthetic", desc: "Beauty that inspires your workspace.", img: DEFAULT_KEYPOINT_IMAGES[2], color: "#000000" },
          { title: "Sustainable Craft", desc: "Eco-friendly manufacturing without compromise.", img: DEFAULT_KEYPOINT_IMAGES[3], color: "#161616" },
          { title: "Dynamic Adaptability", desc: "Intelligent mechanisms that respond to your body.", img: DEFAULT_KEYPOINT_IMAGES[4], color: "#0a0a0a" }
        ]);
      }
    }, (error) => {
      console.error("Firestore Keypoints error, using fallback:", error);
      const DEFAULT_KEYPOINT_IMAGES = [
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80"
      ];
      setKeypoints([
        { title: "Ergonomic Design", desc: "Scientific precision for maximum comfort.", img: DEFAULT_KEYPOINT_IMAGES[0], color: "#111111" },
        { title: "Premium Materials", desc: "Sourced from the finest global suppliers.", img: DEFAULT_KEYPOINT_IMAGES[1], color: "#1a1a1a" },
        { title: "Cinematic Aesthetic", desc: "Beauty that inspires your workspace.", img: DEFAULT_KEYPOINT_IMAGES[2], color: "#000000" },
        { title: "Sustainable Craft", desc: "Eco-friendly manufacturing without compromise.", img: DEFAULT_KEYPOINT_IMAGES[3], color: "#161616" },
        { title: "Dynamic Adaptability", desc: "Intelligent mechanisms that respond to your body.", img: DEFAULT_KEYPOINT_IMAGES[4], color: "#0a0a0a" }
      ]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Only run on mobile
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = parseInt(entry.target.getAttribute('data-index') || '-1', 10);
        if (idx === -1) return;

        if (entry.isIntersecting) {
          setHoveredIndex(idx);
        } else {
          setHoveredIndex(prev => (prev === idx ? null : prev));
        }
      });
    }, {
      rootMargin: "-45% 0px -45% 0px"
    });

    const elements = document.querySelectorAll('.capability-item');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [keypoints]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (keypoints.length === 0) return null;

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      animate={{ backgroundColor: hoveredIndex !== null ? keypoints[hoveredIndex].color : "#FFFFFF" }}
      className="py-24 md:py-32 relative overflow-hidden transition-colors duration-700"
    >
      {/* Dynamic Cursor Tooltip (Desktop only) */}
      <AnimatePresence>
        {hoveredIndex !== null && keypoints[hoveredIndex]?.img && keypoints[hoveredIndex].img.trim() !== "" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: mousePos.x + 20,
              y: mousePos.y - 340
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
            className="hidden lg:block fixed top-0 left-0 w-[240px] h-[320px] rounded-2xl overflow-hidden z-[40] pointer-events-none shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <Image src={keypoints[hoveredIndex].img} alt="Tooltip" fill className="object-cover" sizes="(max-width: 768px) 100vw, 240px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <AnimatedSection direction="up" className="mb-12 sm:mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-6xl font-black font-outfit tracking-tighter transition-colors duration-500"
            animate={{ color: hoveredIndex !== null ? "#FFFFFF" : "#000000" }}
          >
            Our Core <br /><span className="text-brand-accent">Capabilities</span>
          </motion.h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className={`flex flex-col border-t transition-colors duration-500 ${hoveredIndex !== null ? 'border-white/10' : 'border-black/10'}`}
        >
          {keypoints.map((point, idx) => (
            <motion.div
              key={idx}
              data-index={idx}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              onHoverStart={() => setHoveredIndex(idx)}
              onHoverEnd={() => setHoveredIndex(null)}
              className={`capability-item group relative border-b py-6 sm:py-8 md:py-12 overflow-hidden cursor-pointer transition-colors duration-500 ${hoveredIndex !== null ? 'border-white/5' : 'border-black/10'}`}
            >
              {/* Content */}
              <Link href="/solutions" className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 px-2 sm:px-4">
                <div className="flex items-center gap-4 sm:gap-8 md:gap-16">
                  <motion.span
                    animate={{ color: hoveredIndex === idx ? "var(--color-brand-accent)" : (hoveredIndex !== null ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }}
                    className="text-lg sm:text-xl md:text-3xl font-black font-outfit transition-colors shrink-0"
                  >
                    0{idx + 1}
                  </motion.span>
                  <motion.h3
                    animate={{
                      x: hoveredIndex === idx ? 20 : 0,
                      color: hoveredIndex !== null ? (hoveredIndex === idx ? "#FFFFFF" : "rgba(255,255,255,0.2)") : "#000000"
                    }}
                    className="text-2xl sm:text-3xl md:text-5xl font-black font-outfit tracking-tighter"
                  >
                    {point.title}
                  </motion.h3>
                </div>
                <div className="w-full md:w-1/3 flex justify-between items-center mt-2 md:mt-0">
                  <motion.p
                    animate={{
                      opacity: hoveredIndex === idx ? 1 : 0,
                      x: hoveredIndex === idx ? 0 : -20
                    }}
                    className="text-gray-400 font-medium text-sm md:text-lg transition-all max-md:!opacity-80 max-md:!translate-x-0"
                  >
                    {point.desc}
                  </motion.p>
                  <motion.div
                    animate={{
                      opacity: hoveredIndex === idx ? 1 : 0,
                      rotate: hoveredIndex === idx ? 0 : -45,
                      scale: hoveredIndex === idx ? 1 : 0.8
                    }}
                    className={`p-2.5 sm:p-3 rounded-full transition-colors duration-500 shrink-0 max-md:!opacity-100 max-md:!rotate-0 max-md:!scale-100 ${hoveredIndex === idx ? 'bg-brand-accent/20' : 'bg-transparent'}`}
                  >
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-brand-accent" />
                  </motion.div>
                </div>
              </Link>

              {/* Row Background Glow */}
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="hover-pill"
                  className="absolute inset-0 bg-white/5 backdrop-blur-md z-0"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* SECTION CTA BUTTON */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <ChasingButton
            href="/solutions"
            icon={ArrowRight}
            className={`btn-stroke-animated shadow-[0_0_30px_rgba(255,255,255,0.1)] py-5 px-10`}
          >
            View All Solutions
          </ChasingButton>
        </motion.div>
      </div>
    </motion.section>
  );
}

const DEFAULT_PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80"
];

// 3. FEATURED PROJECTS (Cinematic Sticky Scroll)
function ParallaxProjects() {
  const containerRef = useRef(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "projects"), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc, idx) => {
          const docData = doc.data() as any;
          const isLight = docData.isLight !== undefined ? docData.isLight : (idx % 2 === 1);
          const defaultColor = isLight ? "#f5f5f5" : "#111111";
          const rawImg = docData.image || docData.img;
          const validImg = rawImg && typeof rawImg === "string" && rawImg.trim() !== ""
            ? rawImg.trim()
            : DEFAULT_PROJECT_IMAGES[idx % DEFAULT_PROJECT_IMAGES.length];
          return {
            id: doc.id,
            ...docData,
            name: docData.name || docData.title || "",
            desc: docData.desc || docData.description || "",
            img: validImg,
            color: docData.color || defaultColor,
            isLight: isLight
          };
        });
        setProjects(data);
      } else {
        // Fallback Projects
        setProjects([
          {
            id: 'p1',
            name: "Lumina Workspace",
            desc: "A futuristic office environment designed for deep focus and high-performance collaboration.",
            img: DEFAULT_PROJECT_IMAGES[0],
            color: "#111111",
            isLight: false
          },
          {
            id: 'p2',
            name: "Zenith Executive",
            desc: "The pinnacle of executive comfort, blending ergonomic precision with timeless cinematic aesthetic.",
            img: DEFAULT_PROJECT_IMAGES[1],
            color: "#f5f5f5",
            isLight: true
          },
          {
            id: 'p3',
            name: "Apex Studio",
            desc: "Creative spaces crafted for modern teams, ensuring maximum adaptability and ergonomic health.",
            img: DEFAULT_PROJECT_IMAGES[2],
            color: "#0a0a0a",
            isLight: false
          },
          {
            id: 'p4',
            name: "Nexus Corporate",
            desc: "A seamless blend of robust industrial design and sophisticated corporate elegance.",
            img: DEFAULT_PROJECT_IMAGES[3],
            color: "#ffffff",
            isLight: true
          },
          {
            id: 'p5',
            name: "Echo Hub",
            desc: "Dynamic co-working environment maximizing spatial efficiency and acoustic performance.",
            img: DEFAULT_PROJECT_IMAGES[4],
            color: "#1a1a1a",
            isLight: false
          },
          {
            id: 'p6',
            name: "Vertex Pavilion",
            desc: "Light-filled architectural wonder utilizing sustainable seating solutions for a greener footprint.",
            img: DEFAULT_PROJECT_IMAGES[5],
            color: "#f9f9f9",
            isLight: true
          }
        ]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Projects error, using fallback:", error);
      setProjects([
        {
          id: 'p1',
          name: "Lumina Workspace",
          desc: "A futuristic office environment designed for deep focus and high-performance collaboration.",
          img: DEFAULT_PROJECT_IMAGES[0],
          color: "#111111",
          isLight: false
        },
        {
          id: 'p2',
          name: "Zenith Executive",
          desc: "The pinnacle of executive comfort, blending ergonomic precision with timeless cinematic aesthetic.",
          img: DEFAULT_PROJECT_IMAGES[1],
          color: "#f5f5f5",
          isLight: true
        },
        {
          id: 'p3',
          name: "Apex Studio",
          desc: "Creative spaces crafted for modern teams, ensuring maximum adaptability and ergonomic health.",
          img: DEFAULT_PROJECT_IMAGES[2],
          color: "#0a0a0a",
          isLight: false
        },
        {
          id: 'p4',
          name: "Nexus Corporate",
          desc: "A seamless blend of robust industrial design and sophisticated corporate elegance.",
          img: DEFAULT_PROJECT_IMAGES[3],
          color: "#ffffff",
          isLight: true
        },
        {
          id: 'p5',
          name: "Echo Hub",
          desc: "Dynamic co-working environment maximizing spatial efficiency and acoustic performance.",
          img: DEFAULT_PROJECT_IMAGES[4],
          color: "#1a1a1a",
          isLight: false
        },
        {
          id: 'p6',
          name: "Vertex Pavilion",
          desc: "Light-filled architectural wonder utilizing sustainable seating solutions for a greener footprint.",
          img: DEFAULT_PROJECT_IMAGES[5],
          color: "#f9f9f9",
          isLight: true
        }
      ]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (projects.length === 0) return;
    let index = Math.floor(latest * projects.length);
    if (index >= projects.length) index = projects.length - 1;
    if (index < 0) index = 0;
    if (index !== activeIndex) setActiveIndex(index);
  });

  const currentProject = projects[activeIndex] || projects[0] || { color: '#0a0a0a', isLight: false };
  const bgColor = currentProject.color || (currentProject.isLight ? '#f5f5f5' : '#0a0a0a');
  const headerTextColor = currentProject.isLight ? '#111111' : '#ffffff';

  return (
    <section ref={containerRef} className="relative w-full" style={{ position: "relative", height: `${Math.max(projects.length, 1) * 100}vh` }}>
      {(!loading && projects.length > 0) ? (
        <div 
          className="sticky top-0 w-full h-[100dvh] overflow-hidden flex flex-col"
          style={{ backgroundColor: bgColor }}
        >
          {/* Fixed Section Title — always centered at top of sticky viewport */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center pt-5 sm:pt-8 md:pt-14 z-20 pointer-events-none px-4">
            <h2
              className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-outfit tracking-tighter uppercase whitespace-nowrap leading-none"
              style={{ color: headerTextColor }}
            >
              Featured <span className="text-brand-accent">Projects</span>
            </h2>
          </div>

          {/* Dynamic Content Container */}
          <div className="relative w-full max-w-[1440px] mx-auto flex-1 mt-14 sm:mt-22 md:mt-36 pb-6 md:pb-12 px-4 sm:px-6 lg:px-12 z-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {projects.map((p, i) => 
                activeIndex === i && (
                  <ProjectCard 
                    key={p.id} 
                    project={p} 
                    index={i} 
                    total={projects.length} 
                  />
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="sticky top-0 h-[100dvh] flex items-center justify-center bg-[#0a0a0a]">
          <Loader size="40" color="var(--color-brand-accent)" />
        </div>
      )}
    </section>
  );
}

function ProjectCard({ project, index, total }: any) {
  const isEven = index % 2 === 0;
  const rawImg = project.img || project.image;
  const projectImg = rawImg && typeof rawImg === "string" && rawImg.trim() !== ""
    ? rawImg.trim()
    : DEFAULT_PROJECT_IMAGES[index % DEFAULT_PROJECT_IMAGES.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12 lg:gap-16 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Image Side — hover: zoom image + border glow */}
      <div className={`group/img w-full md:w-[50%] h-[20vh] sm:h-[26vh] md:h-[65vh] max-h-[190px] sm:max-h-[240px] md:max-h-none relative rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl flex-shrink-0 border transition-all duration-500 cursor-pointer
        ${project.isLight
          ? 'border-black/10 lg:hover:border-black/30 lg:hover:shadow-[0_30px_80px_rgba(0,0,0,0.25)]'
          : 'border-white/10 lg:hover:border-brand-accent/60 lg:hover:shadow-[0_30px_80px_color-mix(in srgb, var(--color-brand-accent) 25%, transparent)]'
        }`}>
        {projectImg ? (
          <Image
            src={projectImg}
            alt={project.name || "Aveon Project"}
            fill
            className="object-cover transition-transform duration-[2s] ease-out lg:group-hover/img:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-900" />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent opacity-40 transition-opacity duration-500 lg:group-hover/img:opacity-20 ${project.isLight ? 'from-black/10' : 'from-black/60'}`} />
        
        {/* Hover overlay badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 lg:group-hover/img:opacity-100 transition-all duration-500">
          <div className="bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 translate-y-4 lg:group-hover/img:translate-y-0 transition-transform duration-500">
            View Project <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="group/content w-full md:w-[45%] flex flex-col justify-center">
        <div className="flex items-center gap-3 sm:gap-4 mb-2 md:mb-6">
           <span className="h-px w-6 sm:w-8 md:w-12 bg-brand-accent transition-all duration-500 lg:group-hover/content:w-16 md:lg:group-hover/content:w-20" />
           <span className="font-bold text-[9px] sm:text-[10px] md:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-brand-accent">
             Project 0{index + 1}
           </span>
        </div>

        <h3 className={`text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black font-outfit tracking-tighter leading-[1.1] mb-2 sm:mb-4 md:mb-6 transition-colors duration-300
          ${project.isLight
            ? 'text-[#111111] lg:group-hover/content:text-brand-accent'
            : 'text-white lg:group-hover/content:text-brand-accent'
          }`}>
           {project.name}
        </h3>

        <p className={`text-xs sm:text-sm md:text-lg font-light leading-relaxed mb-2 md:mb-4 line-clamp-2 md:line-clamp-none transition-opacity duration-300 lg:group-hover/content:opacity-100 ${project.isLight ? 'text-gray-600 opacity-80' : 'text-gray-300 opacity-70'}`}>
           {project.desc}
        </p>

        {/* Project Specs Grid — each cell hoverable */}
        <div className={`grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 my-2 sm:my-4 md:my-6 py-2 sm:py-4 md:py-6 border-t border-b ${project.isLight ? 'border-black/5' : 'border-white/5'}`}>
          {[
            { label: "Location", value: project.location || (index % 3 === 0 ? "Mumbai, India" : index % 3 === 1 ? "Bangalore, India" : "Delhi NCR, India") },
            { label: "Scope", value: project.scope || (index % 3 === 0 ? "Corporate Headquarters" : index % 3 === 1 ? "Agile Executive Hub" : "Creative Collaborative Studio") },
            { label: "Seating Supplied", value: project.supplied || (index % 3 === 0 ? "Aveon Elite-X Mesh Series" : index % 3 === 1 ? "Aveon Zenith Premium Leather" : "Aveon Apex Ergonomic Task") },
            { label: "Project Timeline", value: project.year || "Completed 2026" },
          ].map((spec, si) => (
            <div key={si} className={`group/spec rounded-xl p-1.5 sm:p-3 -mx-1 sm:-mx-3 transition-all duration-300 cursor-default
              ${project.isLight
                ? 'lg:hover:bg-black/5'
                : 'lg:hover:bg-white/5'
              }`}>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5 transition-colors duration-300 lg:group-hover/spec:text-brand-accent">
                {spec.label}
              </span>
              <span className={`text-[11px] sm:text-xs md:text-sm font-bold truncate block transition-colors duration-300 ${project.isLight ? 'text-gray-800' : 'text-white'}`}>
                {spec.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-3 sm:gap-6">
          <Link
            href={`/projects/${project.id}`}
            className={`btn-stroke-animated group/btn inline-flex w-fit items-center gap-2.5 sm:gap-4 px-5 sm:px-8 py-2.5 sm:py-4 rounded-full font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs transition-all duration-300 backdrop-blur-md border active:scale-95 ${project.isLight 
              ? 'bg-black text-white lg:hover:bg-brand-accent lg:hover:border-brand-accent border-black shadow-[0_10px_30px_rgba(0,0,0,0.15)] lg:hover:shadow-[0_10px_40px_color-mix(in srgb, var(--color-brand-accent) 35%, transparent)]' 
              : 'bg-white text-black lg:hover:bg-brand-accent lg:hover:text-white lg:hover:border-brand-accent border-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] lg:hover:shadow-[0_10px_40px_color-mix(in srgb, var(--color-brand-accent) 35%, transparent)]'
            }`}
          >
            Explore Case Study
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 lg:group-hover/btn:translate-x-1" />
          </Link>
          
          {index === total - 1 && (
            <Link href="/projects" className={`group/all font-bold tracking-widest text-[10px] sm:text-xs uppercase border-b pb-0.5 sm:pb-1 transition-all duration-300 ${project.isLight
              ? 'text-black/40 lg:hover:text-brand-accent border-black/10 lg:hover:border-brand-accent'
              : 'text-white/40 lg:hover:text-brand-accent border-white/10 lg:hover:border-brand-accent'
              }`}>
              See all projects
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 4. TESTIMONIALS SECTION (Animated Paired Cards Carousel)
// 4. TESTIMONIALS SECTION (Scroll-Locked Paired Cards Carousel)
function Testimonials() {
  const containerRef = useRef(null);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "testimonials"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const defaultImgs = [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
      ];
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc, idx) => {
          const docData = doc.data() as any;
          return {
            id: doc.id,
            ...docData,
            img: docData.image || docData.img || defaultImgs[idx % defaultImgs.length]
          };
        });
        setTestimonialsData(data);
      } else {
        // Fallback Testimonials
        setTestimonialsData([
          {
            id: 't1',
            quote: "Aveon's seating systems have completely transformed our office dynamics.",
            author: "Rathan",
            role: "Operations Director",
            company: "TechNova Solutions",
            image: defaultImgs[0],
            img: defaultImgs[0]
          },
          {
            id: 't2',
            quote: "Designing a university library requires a balance between durability and aesthetics.",
            author: "Rashmi",
            role: "Head of Infrastructure",
            company: "Global Edu Campus",
            image: defaultImgs[1],
            img: defaultImgs[1]
          },
          {
            id: 't3',
            quote: "As an architect, I'm extremely picky about proportions and materials.",
            author: "Hemanth",
            role: "Chief Architect",
            company: "Skyline Spaces",
            image: defaultImgs[2],
            img: defaultImgs[2]
          },
          {
            id: 't4',
            quote: "Hygiene and comfort are paramount in healthcare.",
            author: "Rahil",
            role: "Facility Manager",
            company: "Prime Healthcare",
            image: defaultImgs[3],
            img: defaultImgs[3]
          },
          {
            id: 't5',
            quote: "The aesthetic appeal of our studio is part of our brand.",
            author: "Bavish",
            role: "Founder",
            company: "Zenith Studios",
            image: defaultImgs[4],
            img: defaultImgs[4]
          }
        ]);
      }
    }, (error) => {
      console.error("Firestore Testimonials error, using fallback:", error);
      const defaultImgs = [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
      ];
      setTestimonialsData([
        {
          id: 't1',
          quote: "Aveon's seating systems have completely transformed our office dynamics.",
          author: "Rathan",
          role: "Operations Director",
          company: "TechNova Solutions",
          image: defaultImgs[0],
          img: defaultImgs[0]
        },
        {
          id: 't2',
          quote: "Designing a university library requires a balance between durability and aesthetics.",
          author: "Rashmi",
          role: "Head of Infrastructure",
          company: "Global Edu Campus",
          image: defaultImgs[1],
          img: defaultImgs[1]
        },
        {
          id: 't3',
          quote: "As an architect, I'm extremely picky about proportions and materials.",
          author: "Hemanth",
          role: "Chief Architect",
          company: "Skyline Spaces",
          image: defaultImgs[2],
          img: defaultImgs[2]
        },
        {
          id: 't4',
          quote: "Hygiene and comfort are paramount in healthcare.",
          author: "Rahil",
          role: "Facility Manager",
          company: "Prime Healthcare",
          image: defaultImgs[3],
          img: defaultImgs[3]
        },
        {
          id: 't5',
          quote: "The aesthetic appeal of our studio is part of our brand.",
          author: "Bavish",
          role: "Founder",
          company: "Zenith Studios",
          image: defaultImgs[4],
          img: defaultImgs[4]
        }
      ]);
    });
    return () => unsubscribe();
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const totalSteps = testimonialsData.length + 1; // n testimonials + 1 CTA

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (testimonialsData.length === 0) return;
    let index = Math.floor(latest * totalSteps);
    if (index >= totalSteps) index = totalSteps - 1;
    if (index < 0) index = 0;
    setActiveIndex(index);
  });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[600vh] bg-black"
    >
      {testimonialsData.length > 0 ? (
        <>
          {/* STICKY SCROLL VIEW (Desktop & Mobile) */}
          <div className="flex sticky top-0 h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-black">
            
            {/* Ambient Glow for Glassmorphism */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-r from-brand-accent/30 to-transparent rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Header stays pinned and visible AT THE ABSOLUTE TOP */}
            <div className="absolute top-6 sm:top-12 md:top-24 left-0 w-full text-center z-[200] pointer-events-none px-4">
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-xl">
                Industry Voices
              </h2>
            </div>

            {/* 3D Container for slides - Maximized Height */}
            <div className="relative w-full max-w-[1400px] px-3 sm:px-6 md:px-8 h-[68vh] sm:h-[75vh] md:h-[80vh] mt-14 sm:mt-20 md:mt-28 z-10 perspective-[1000px]">
              <AnimatePresence mode="wait">
                {activeIndex < testimonialsData.length ? (
                  <motion.div 
                    key={`test-${activeIndex}`}
                    className="absolute inset-0 flex flex-col md:flex-row w-full h-full"
                  >
                    {/* Left Card: Text Content */}
                    <motion.div 
                      initial={{ x: "-50%", opacity: 0 }}
                      animate={{ x: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full md:w-1/2 h-1/2 md:h-full bg-white/10 backdrop-blur-2xl border border-white/20 p-5 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center rounded-t-2xl sm:rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
                    >
                      <div className="mb-2 sm:mb-6">
                        <span className="text-brand-accent font-black text-4xl sm:text-6xl md:text-8xl font-serif leading-none block h-8 sm:h-10 md:h-14 drop-shadow-md">&quot;</span>
                        <p className="text-white text-sm sm:text-base md:text-xl lg:text-2xl font-medium leading-relaxed italic drop-shadow-sm line-clamp-4 md:line-clamp-none">
                          {testimonialsData[activeIndex]?.quote || "Excellence in seating, redefined."}
                        </p>
                      </div>
                      <div className="mt-auto md:mt-12">
                        <h4 className="text-base sm:text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
                          {testimonialsData[activeIndex]?.author || "Loading..."}
                        </h4>
                        <p className="text-brand-accent font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-widest mt-0.5 sm:mt-1 md:mt-2">
                          {testimonialsData[activeIndex]?.role} — {testimonialsData[activeIndex]?.company}
                        </p>
                      </div>
                    </motion.div>

                    {/* Right Card: Image Profile */}
                    <motion.div 
                      initial={{ x: "50%", opacity: 0 }}
                      animate={{ x: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none shadow-2xl"
                    >
                      {(() => {
                        const currentImg = testimonialsData[activeIndex]?.img || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800";
                        const isSvgOrRaw = typeof currentImg === "string" && (
                          currentImg.includes("/raw/upload/") || 
                          currentImg.endsWith(".svg") || 
                          currentImg.includes(".svg?")
                        );
                        return (
                          <Image
                            src={currentImg}
                            alt={testimonialsData[activeIndex]?.company || "Company Testimonial"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={activeIndex === 0}
                            unoptimized={isSvgOrRaw}
                          />
                        );
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent" />
                      
                      {/* Decorative Brand Initial */}
                      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                        <span className="text-white font-black text-3xl md:text-5xl drop-shadow-md">
                          {testimonialsData[activeIndex]?.company?.[0] || "A"}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="cta"
                    className="absolute inset-0 flex flex-col md:flex-row w-full h-full"
                  >
                    {/* Left Card: CTA Text */}
                    <motion.div 
                      initial={{ x: "-50%", opacity: 0 }}
                      animate={{ x: "0%", opacity: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full md:w-1/2 h-1/2 md:h-full bg-black/40 backdrop-blur-2xl p-8 md:p-16 flex flex-col justify-center rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none z-10 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
                    >
                      <span className="text-brand-accent font-black tracking-[0.4em] text-xs mb-4 block uppercase drop-shadow-md">
                        Sequence Complete
                      </span>
                      <h3 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-none drop-shadow-md">
                        JOIN THE <span className="text-brand-accent">ELITE.</span>
                      </h3>
                      <p className="text-gray-300 text-sm md:text-lg font-medium leading-relaxed drop-shadow-sm">
                        Engineered for the high-performance culture. Join <span className="text-white font-bold"><Counter value={500} suffix="+" /></span> enterprises redefining their workspaces with Aveon.
                      </p>

                    </motion.div>

                    {/* Right Card: Actions */}
                    <motion.div 
                      initial={{ x: "50%", opacity: 0 }}
                      animate={{ x: "0%", opacity: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full md:w-1/2 h-1/2 md:h-full bg-white/5 backdrop-blur-2xl p-8 md:p-16 flex flex-col items-center justify-center rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none border border-white/20 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    >
                      {/* Glowing Ambient Background */}
                      <div className="absolute inset-0 opacity-40 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_color-mix(in_srgb,_var(--color-brand-accent)_33%,_transparent)_0%,_transparent_70%)]" />
                      </div>

                      <div className="flex flex-col gap-4 relative z-10 w-full max-w-[320px]">
                        <Link
                          href="/testimonials"
                          className="btn-stroke-animated w-full px-6 py-4 md:py-6 bg-white text-black text-center font-black uppercase tracking-widest rounded-xl transition-all lg:hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                          View More <ArrowRight className="w-5 h-5" />
                        </Link>
                        
                        <button
                          onClick={() => setIsReviewModalOpen(true)}
                          className="btn-stroke-animated w-full px-6 py-4 md:py-6 bg-black/20 backdrop-blur-md border border-white/30 text-white text-center font-bold uppercase tracking-widest rounded-xl transition-all lg:hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                        >
                          Write a Review <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scroll Progress Bar at Bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 flex flex-col items-center gap-3 z-[200]">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">
                Keep Scrolling
              </span>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  style={{ scaleX: scrollYProgress }} 
                  className="h-full bg-brand-accent origin-left"
                />
              </div>
            </div>
            
            {/* Background Decor */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>
        </>
      ) : (
        <div className="sticky top-0 h-screen flex items-center justify-center bg-black">
          <Loader size="40" color="var(--color-brand-accent)" />
        </div>
      )}
      
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
      />
    </section>
  );
}



// 6. UPGRADED FINAL CTA (Frosted Glass Card + Heavy Parallax)
function TransformCTA() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);
  const cardX = useTransform(scrollYProgress, [0, 1], ["-15%", "0%"]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const [ctaData, setCtaData] = useState<any>({
    title: "Ready to transform your workspace?",
    subtitle: "Discover how Aveon's engineered seating influences productivity and workplace culture, creating sustainable spaces that inspire collaboration, focus, and comfort.",
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().cta) {
        setCtaData(docSnap.data().cta);
      }
    }, (error) => {
      console.error("Firestore CTA error, using fallback:", error);
    });
    return () => unsub();
  }, []);

  const ctaBgSrc = ctaData.bgImage && typeof ctaData.bgImage === "string" && ctaData.bgImage.trim() !== ""
    ? ctaData.bgImage
    : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80";

  return (
    <section ref={containerRef} data-theme="light" className="relative w-full h-auto min-h-[480px] sm:min-h-[520px] md:h-screen md:min-h-[600px] bg-[#FFFFFF] py-8 sm:py-12 px-3 sm:px-6 md:px-8 flex items-center justify-center overflow-hidden" style={{ position: "relative" }}>
      <motion.div
        style={{ scale }}
        className="w-full max-w-[1500px] h-full relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden flex items-center shadow-2xl py-8 sm:py-0"
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div style={{ y: imgY }} className="w-full h-[140%] -top-[20%] relative">
            <Image
              src={ctaBgSrc}
              alt="Premium Workspace"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </div>

        <motion.div
          style={{ x: cardX, opacity: cardOpacity }}
          className="relative z-10 w-[95%] sm:w-[85%] md:w-[600px] bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-16 mx-auto md:ml-16 shadow-2xl flex flex-col justify-center items-center md:items-start text-center md:text-left"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light font-outfit text-white tracking-tight mb-3 sm:mb-4 md:mb-6 leading-tight">
            {ctaData.title}
          </h2>
          <p className="text-gray-300 font-light text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed">
            {ctaData.subtitle}
          </p>

          <ChasingButton
            href="/contact"
            className="rounded-xl px-6 py-3.5 sm:px-8 sm:py-4 md:px-10 md:py-5 w-full md:w-auto text-xs sm:text-sm"
          >
            Contact Us
          </ChasingButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ImpactStats() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().stats) {
        setStats(docSnap.data().stats);
      } else {
        setStats([
          { label: "SATISFIED CLIENTS", value: 5000, suffix: "+" },
          { label: "PROJECTS COMPLETED", value: 12000, suffix: "+" },
          { label: "RETENTION RATE", value: 98, suffix: "%" },
          { label: "CITIES COVERED", value: 45, suffix: "+" }
        ]);
      }
    }, (error) => {
      console.error("Firestore Stats error, using fallback:", error);
      setStats([
        { label: "SATISFIED CLIENTS", value: 5000, suffix: "+" },
        { label: "PROJECTS COMPLETED", value: 12000, suffix: "+" },
        { label: "RETENTION RATE", value: 98, suffix: "%" },
        { label: "CITIES COVERED", value: 45, suffix: "+" }
      ]);
    });
    return () => unsub();
  }, []);

  if (stats.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#0A0A0A] border-b border-white/5 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12 md:gap-20">
          {stats.map((stat: any, i: number) => (
            <AnimatedSection key={i} direction="up" delay={i * 0.1} className="text-center group">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center w-8 sm:w-12 h-px bg-brand-accent group-hover:w-20 transition-all duration-500" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-outfit text-white tracking-tighter mb-1.5 sm:mb-2">
                <Counter value={stat.value} suffix={stat.suffix} delay={i * 0.1} />
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] sm:tracking-[0.4em]">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

const DEFAULT_ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80"
];

function InsightsSection() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "articles"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map((doc, idx) => {
          const docData = doc.data() as any;
          const rawImg = docData.img || docData.image;
          const validImg = rawImg && typeof rawImg === "string" && rawImg.trim() !== ""
            ? rawImg.trim()
            : DEFAULT_ARTICLE_IMAGES[idx % DEFAULT_ARTICLE_IMAGES.length];
          return {
            id: doc.id,
            ...docData,
            img: validImg
          };
        });
        // Sort by order ascending
        data.sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999));
        setArticles(data);
      } else {
        // Fallback static articles
        setArticles([
          {
            id: "1",
            category: "Design",
            title: "The Future of Ergonomics in 2026",
            author: "Elena Rostova",
            time: "5 min",
            img: DEFAULT_ARTICLE_IMAGES[0]
          },
          {
            id: "2",
            category: "Manufacturing",
            title: "Sustainable Materials in Seating",
            author: "Marcus Chen",
            time: "8 min",
            img: DEFAULT_ARTICLE_IMAGES[1]
          },
          {
            id: "3",
            category: "Workplace",
            title: "Designing for Deep Work",
            author: "Sarah Jenkins",
            time: "12 min",
            img: DEFAULT_ARTICLE_IMAGES[2]
          }
        ]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Articles error, using fallback:", error);
      setArticles([
        {
          id: "1",
          category: "Design",
          title: "The Future of Ergonomics in 2026",
          author: "Elena Rostova",
          time: "5 min",
          img: DEFAULT_ARTICLE_IMAGES[0]
        },
        {
          id: "2",
          category: "Manufacturing",
          title: "Sustainable Materials in Seating",
          author: "Marcus Chen",
          time: "8 min",
          img: DEFAULT_ARTICLE_IMAGES[1]
        },
        {
          id: "3",
          category: "Workplace",
          title: "Designing for Deep Work",
          author: "Sarah Jenkins",
          time: "12 min",
          img: DEFAULT_ARTICLE_IMAGES[2]
        }
      ]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0A] overflow-hidden border-b border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="mb-16 flex items-center justify-between">
          <AnimatedSection direction="up">
            <h2 className="text-4xl md:text-6xl font-black font-outfit text-white tracking-tighter">
              Latest <span className="text-brand-accent">Insights</span>
            </h2>
          </AnimatedSection>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:pb-0 md:overflow-hidden -mx-6 px-6 md:mx-0 md:px-0">
            {articles.map((article, i) => (
              <AnimatedSection key={article.id} direction="up" delay={i * 0.1} className="min-w-[85vw] md:min-w-0 shrink-0 snap-center">
                <HoverCard3D className="w-full h-[400px] z-10 hover:z-20" scaleOnHover={1.05}>
                <article className="group relative w-full h-full bg-[#111111] lg:hover:bg-[#151515] rounded-[12px] overflow-hidden shadow-[0_13px_10px_-7px_rgba(0,0,0,0.1)] transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0,1)] lg:hover:shadow-[0_30px_18px_-8px_rgba(0,0,0,0.3)] border border-white/5 cursor-pointer">
                  
                  {/* Hover Info (Top) */}
                  <div className="absolute top-0 left-0 w-full p-4 opacity-0 transition-opacity duration-200 lg:group-hover:opacity-100 z-20 flex justify-between items-center text-white bg-gradient-to-b from-black/80 to-transparent">
                    <svg className="w-5 h-5 fill-current text-white lg:hover:text-brand-accent cursor-pointer transition-colors" viewBox="0 0 24 24">
                      <path d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
                    </svg>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 fill-brand-accent -mt-[1px]" viewBox="0 0 24 24">
                        <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" />
                      </svg>
                      <span className="text-[12px] font-bold text-white tracking-wide">{article.time}</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="absolute top-0 left-0 w-full h-[235px] lg:group-hover:h-full transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0,1)] z-0 overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-300 ease-out lg:group-hover:opacity-20"
                      style={{ backgroundImage: `url(${article.img})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent lg:group-hover:opacity-0 transition-opacity duration-300" />
                  </div>

                  {/* Info block */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-[#111111]/90 backdrop-blur-sm lg:group-hover:bg-transparent transition-colors duration-[400ms] ease-[cubic-bezier(0.175,0.885,0,1)] z-10 flex flex-col">
                    <span className="font-outfit uppercase text-[11px] tracking-[2px] font-bold text-white/40 lg:group-hover:text-white/60 transition-colors duration-[400ms]">
                      {article.category}
                    </span>
                    <h3 className="mt-[5px] mb-[10px] font-outfit text-[22px] font-bold text-white leading-tight">
                      {article.title}
                    </h3>
                    <span className="text-[12px] font-medium text-white/60 lg:group-hover:text-white/80 transition-colors duration-[400ms]">
                      by <span className="font-bold text-brand-accent lg:hover:underline transition-colors">{article.author}</span>
                    </span>
                  </div>
                </article>
                </HoverCard3D>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PartnerMarquee() {
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "testimonials"), (snapshot) => {
      if (!snapshot.empty) {
        const companyNames = snapshot.docs
          .map(doc => (doc.data() as any).company)
          .filter(Boolean);
        // Get unique capitalized brand names
        const uniqueCompanies = Array.from(new Set(companyNames)).map(c => c.toUpperCase());
        setCompanies(uniqueCompanies.length > 0 ? uniqueCompanies : ["TCS", "INFOSYS", "WIPRO", "HDFC BANK", "TECH MAHINDRA", "DELOITTE"]);
      } else {
        // Fallback default companies
        setCompanies(["TCS", "INFOSYS", "WIPRO", "HDFC BANK", "TECH MAHINDRA", "DELOITTE"]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Testimonials error in PartnerMarquee, using fallback:", error);
      setCompanies(["TCS", "INFOSYS", "WIPRO", "HDFC BANK", "TECH MAHINDRA", "DELOITTE"]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || companies.length === 0) {
    return (
      <div data-theme="dark" className="w-full bg-[#000000] py-12 border-b border-white/10 flex items-center justify-center">
        <div className="animate-pulse flex space-x-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-24 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-theme="dark" className="w-full bg-[#000000] py-12 overflow-hidden flex border-b border-white/10">
      <motion.div
        animate={{ x: [0, -1035] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        className="flex w-max"
      >
        {[...Array(4)].map((_, j) => (
          <div key={j} className="flex gap-24 px-12 items-center">
            {companies.map((company, i) => (
              <span key={i} className="text-3xl font-black font-outfit text-white/30 uppercase tracking-widest lg:hover:text-white transition-colors duration-300 whitespace-nowrap">
                {company}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [hasLoaded, setHasLoaded] = useState(() => {
    if (typeof window !== "undefined") return getHasPlayedIntro();
    return false;
  });
  const [showProjects, setShowProjects] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.showProjects !== undefined) {
          setShowProjects(data.showProjects);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (getHasPlayedIntro()) {
      setHasLoaded(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setHasLoaded(true);
      setHasPlayedIntro(true);
    }, 3200); // Matches navbar loading duration
    return () => clearTimeout(timer);
  }, []);

  if (!hasLoaded) {
    return <div className="min-h-screen bg-[#000000]" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col bg-white overflow-x-clip selection:bg-[#111111] selection:text-white"
    >
      <HeroSection />

      {/* STATS MARQUEE */}
      <PartnerMarquee />

      {/* IMPACT STATS SECTION */}
      <ImpactStats />

      <KeypointsSection />
      <ProductCategories />
      {showProjects && <ParallaxProjects />}
      <Testimonials />
      <InsightsSection />
      <TransformCTA />
    </motion.div>
  );
}
