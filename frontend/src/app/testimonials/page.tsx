"use client";
import { Star, Quote, ChevronRight, User, RefreshCw } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { ParallaxImage } from "@/components/AnimatedSection";
import Link from "next/link";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import Counter from "@/components/Counter";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const fallbackTestimonials = [
  {
    name: "Rathan",
    role: "Operations Director, TechNova Solutions",
    content: "Aveon's seating systems have completely transformed our office dynamics. The ergonomic design isn't just a marketing buzzword—our team has seen a genuine increase in focus and comfort over 12-hour shifts.",
    rating: 5,
    avatar: "",
    category: "Corporate"
  },
  {
    name: "Rashmi",
    role: "Head of Infrastructure, Global Edu Campus",
    content: "Designing a university library requires a balance between durability and aesthetics. Aveon delivered workstations that withstand heavy daily use while maintaining a premium, modern look that our students love.",
    rating: 5,
    avatar: "",
    category: "Education"
  },
  {
    name: "Hemanth",
    role: "Chief Architect, Skyline Spaces",
    content: "As an architect, I'm extremely picky about proportions and materials. Aveon is the only manufacturer that truly understands bespoke engineering. They adapted their manufacturing line to meet our specific design language.",
    rating: 5,
    avatar: "",
    category: "Hospitality"
  },
  {
    name: "Rahil",
    role: "Facility Manager, Prime Healthcare",
    content: "Hygiene and comfort are paramount in healthcare. The antimicrobial fabrics and easy-to-clean finishes on Aveon chairs have made them the standard for our waiting areas and consultation rooms.",
    rating: 5,
    avatar: "",
    category: "Healthcare"
  },
  {
    name: "Bavish",
    role: "Founder, Zenith Studios",
    content: "The aesthetic appeal of our studio is part of our brand. Aveon provided custom-colored executive chairs that look incredible in our meeting rooms and feel even better. Exceptional craftsmanship.",
    rating: 5,
    avatar: "",
    category: "Startup"
  },
  {
    name: "Priya Sharma",
    role: "Procurement Lead, Horizon IT",
    content: "Managing a bulk order for 500+ workstations was daunting, but Aveon's delivery and installation team were flawless. The consistency across every single unit is a testament to their industrial precision.",
    rating: 5,
    avatar: "",
    category: "Corporate"
  }
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>(["Google", "Microsoft", "Adobe", "Infosys", "Wipro", "TCS"]);
  const [loading, setLoading] = useState(true);
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [lenis]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "testimonials"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data() as any;
          return {
            id: doc.id,
            name: docData.author || docData.name || "",
            role: docData.role || "",
            content: docData.quote || docData.content || "",
            rating: docData.rating || 5,
            avatar: docData.img || docData.image || docData.avatar || "",
            category: docData.category || "Corporate",
            company: docData.company || ""
          };
        });
        setTestimonials(data);
        
        // Extract unique capitalized company brand names
        const companyNames = data.map(d => d.company).filter(Boolean);
        const uniqueCompanies = Array.from(new Set(companyNames)).map(c => c.toUpperCase());
        if (uniqueCompanies.length > 0) {
          setBrandsList(uniqueCompanies);
        }
      } else {
        setTestimonials(fallbackTestimonials);
        setBrandsList(["GOOGLE", "MICROSOFT", "ADOBE", "INFOSYS", "WIPRO", "TCS"]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading testimonials from Firestore:", error);
      setTestimonials(fallbackTestimonials);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = [
    { label: "Satisfied Clients", value: 5000, suffix: "+" },
    { label: "Projects Completed", value: 12000, suffix: "+" },
    { label: "Retention Rate", value: 98, suffix: "%" },
    { label: "Cities Covered", value: 45, suffix: "+" }
  ];

  return (
    <div className="bg-[#0A0A0A] min-h-screen overflow-x-clip">
      {/* HERO SECTION */}
      <section className="relative min-h-[500px] h-[65vh] sm:h-[75vh] md:h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Workspace" 
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10 w-full pt-16">
          <AnimatedSection direction="right">
            <span className="text-brand-accent font-bold text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 sm:mb-6 block">Our Impact</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[90px] font-black font-outfit text-white tracking-tighter leading-[0.95] sm:leading-[0.9] mb-6 sm:mb-8">
              VOICES OF <br /><span className="text-brand-accent">EXCELLENCE.</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-300 font-light max-w-xl leading-relaxed">
              We don&apos;t just sell furniture; we engineer success stories. Hear from the leaders who have redefined their workspaces with Aveon.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-black/5 dark:border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 md:gap-12">
            {stats.map((stat, i) => (
              <AnimatedSection key={i} direction="up" delay={i * 0.1} className="text-center">
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-white mb-1 sm:mb-2">
                  <Counter value={stat.value} suffix={stat.suffix} delay={i * 0.1} />
                </h2>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS GRID */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((item, i) => (
                <AnimatedSection key={i} direction="up" delay={i * 0.1}>
                  <div className="h-full p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-brand-accent/30 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-6 sm:mb-8 text-brand-accent">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-brand-accent/20 mb-4 sm:mb-6" />
                      <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed mb-8 sm:mb-10 italic">
                        &quot;{item.content}&quot;
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-6 sm:pt-8 border-t border-white/10">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-brand-accent/20 group-hover:border-brand-accent transition-colors relative bg-zinc-800 flex-shrink-0">
                        {item.avatar && typeof item.avatar === "string" && item.avatar.trim() !== "" ? (
                          <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white/20 m-auto mt-3 sm:mt-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-bold font-outfit text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400 font-medium truncate">{item.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED LOGOS */}
      <section className="py-16 sm:py-24 bg-[#0F0F0F] border-t border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-10 sm:mb-16">Trusted by Industry Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all">
            {brandsList.map((brand, i) => (
              <div key={i} className="text-xl sm:text-2xl md:text-3xl font-black font-outfit text-white/60">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <AnimatedSection direction="up">
          <div className="max-w-6xl mx-auto bg-brand-accent rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-8 sm:p-14 md:p-24 text-center text-white relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-black/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tighter mb-6 sm:mb-8 leading-[0.95] sm:leading-[0.9]">
              JOIN OUR <br />SUCCESS STORY.
            </h2>
            <p className="text-base sm:text-xl text-white/80 mb-8 sm:mb-12 font-light max-w-xl mx-auto leading-relaxed">
              Experience the difference that engineered ergonomics can make in your workplace.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-accent hover:text-white transition-all shadow-xl"
            >
              Start Your Project <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
