"use client";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import AnimatedSection, { ParallaxImage } from "@/components/AnimatedSection";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";

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

import Counter from "@/components/Counter";

export default function AboutPage() {
  const [aboutConfig, setAboutConfig] = useState<any>(null);
  const [socialsConfig, setSocialsConfig] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "site_config", "about"), (docSnap) => {
      if (docSnap.exists()) {
        setAboutConfig(docSnap.data());
      } else {
        // Fallback static configuration
        setAboutConfig({
          heroTitle: "ENGINEERING THE FUTURE",
          heroSubtitle: "For over a decade, Aveon has been at the intersection of ergonomics, industrial design, and manufacturing excellence.",
          heroBgImage: "",
          storyTitle: "EVERYTHING YOUR WORKSPACE NEEDS.",
          storyYears: 12,
          storyP1: "Aveon Spaces started with a simple mission: to bridge the gap between high-end ergonomic science and accessible industrial manufacturing. We believed that everyone, from the CEO to the intern, deserves a chair that respects their body.",
          storyP2: "Today, we operate a state-of-the-art facility where modern robotics meet artisan craftsmanship. Our components are sourced globally and assembled locally, ensuring that every piece of furniture that leaves our floor is a testament to quality.",
          storyImg: "",
          mfgTitle: "PRECISION MEETS PASSION.",
          mfgSubtitle: "Global Standards, Local Execution",
          mfgBgImage: "",
          values: [
            { iconName: "Shield", title: "Built to Last", desc: "Our products undergo rigorous testing to ensure they withstand the demands of modern intensive workspaces.", img: "" },
            { iconName: "Target", title: "User Centric", desc: "Every curve and mechanism is designed around human physiology to maximize comfort and productivity.", img: "" },
            { iconName: "Zap", title: "Rapid Delivery", desc: "Our localized manufacturing allows for industry-leading turnaround times without compromising on quality.", img: "" },
            { iconName: "CheckCircle2", title: "Eco Conscious", desc: "We prioritize recyclable materials and lean manufacturing to minimize our environmental footprint.", img: "" }
          ]
        });
      }
    }, (error) => {
      console.error("Firestore About error, using fallback:", error);
      setAboutConfig({
        heroTitle: "ENGINEERING THE FUTURE",
        heroSubtitle: "For over a decade, Aveon has been at the intersection of ergonomics, industrial design, and manufacturing excellence.",
        heroBgImage: "",
        storyTitle: "EVERYTHING YOUR WORKSPACE NEEDS.",
        storyYears: 12,
        storyP1: "Aveon Spaces started with a simple mission: to bridge the gap between high-end ergonomic science and accessible industrial manufacturing. We believed that everyone, from the CEO to the intern, deserves a chair that respects their body.",
        storyP2: "Today, we operate a state-of-the-art facility where modern robotics meet artisan craftsmanship. Our components are sourced globally and assembled locally, ensuring that every piece of furniture that leaves our floor is a testament to quality.",
        storyImg: "",
        mfgTitle: "PRECISION MEETS PASSION.",
        mfgSubtitle: "Global Standards, Local Execution",
        mfgBgImage: "",
        values: [
          { iconName: "Shield", title: "Built to Last", desc: "Our products undergo rigorous testing to ensure they withstand the demands of modern intensive workspaces.", img: "" },
          { iconName: "Target", title: "User Centric", desc: "Every curve and mechanism is designed around human physiology to maximize comfort and productivity.", img: "" },
          { iconName: "Zap", title: "Rapid Delivery", desc: "Our localized manufacturing allows for industry-leading turnaround times without compromising on quality.", img: "" },
          { iconName: "CheckCircle2", title: "Eco Conscious", desc: "We prioritize recyclable materials and lean manufacturing to minimize our environmental footprint.", img: "" }
        ]
      });
    });

    const unsubGeneral = onSnapshot(doc(db, "site_config", "general"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().socials) {
        setSocialsConfig(docSnap.data().socials);
      } else {
        setSocialsConfig({
          facebook: { show: true, url: "#" },
          twitter: { show: true, url: "#" },
          instagram: { show: true, url: "#" },
          linkedin: { show: true, url: "#" }
        });
      }
    }, (error) => {
      console.error("Firestore General config error:", error);
      setSocialsConfig({
        facebook: { show: true, url: "#" },
        twitter: { show: true, url: "#" },
        instagram: { show: true, url: "#" },
        linkedin: { show: true, url: "#" }
      });
    });

    const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(data);
    });

    return () => {
      unsub();
      unsubGeneral();
      unsubTeam();
    };
  }, []);

  if (!aboutConfig) return null;

  return (
    <main className="bg-[#0A0A0A] min-h-screen text-white overflow-x-clip">
      {/* HERO */}
      <section className="relative min-h-[500px] h-[65vh] sm:h-[70vh] flex items-center overflow-hidden bg-black pt-20">
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src={aboutConfig.heroBgImage || ""} 
            alt="About Hero" 
            className="w-full h-full opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
          <AnimatedSection direction="right">
            <span className="text-brand-accent font-bold text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase mb-4 sm:mb-6 block">Our Legacy</span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8 leading-[0.95] sm:leading-[0.9] uppercase break-words">
              {aboutConfig.heroTitle}
            </h1>
            <p className="text-base sm:text-xl text-gray-400 max-w-xl font-light leading-relaxed">
              {aboutConfig.heroSubtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* THE STORY */}
      <section className="py-16 sm:py-24 md:py-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-black/5 dark:border-white/5">
                  <ParallaxImage src={aboutConfig.storyImg || ""} alt="Factory" className="w-full h-full" />
                </div>
                {aboutConfig.storyYears > 0 && (
                  <div className="absolute -bottom-6 -right-6 sm:-bottom-10 sm:-right-10 bg-brand-accent p-6 sm:p-10 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] hidden sm:block">
                    <span className="text-white text-4xl sm:text-5xl md:text-6xl font-black font-outfit block">
                      <Counter value={aboutConfig.storyYears} suffix="+" />
                    </span>
                    <span className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Years of Trust</span>
                  </div>
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <span className="text-brand-accent font-bold text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6 block">The Aveon Spaces Philosophy</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8 leading-none uppercase">
                {aboutConfig.storyTitle}
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-400 font-light leading-relaxed">
                <p>{aboutConfig.storyP1}</p>
                {aboutConfig.storyP2 && <p>{aboutConfig.storyP2}</p>}
                <div className="pt-4 sm:pt-8">
                  <button className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs group">
                    Learn about our process <ArrowRight className="w-5 h-5 text-brand-accent group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="bg-[#0F0F0F] py-16 sm:py-24 md:py-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-24">
            <AnimatedSection direction="up">
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit text-white tracking-tighter mb-4 sm:mb-6">
                OUR CORE <span className="text-brand-accent">VALUES</span>
              </h2>
              <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                The principles that guide every design decision and manufacturing step we take.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {(aboutConfig.values || []).map((v: any, i: number) => {
              const IconComponent = (Icons as any)[v.iconName || "HelpCircle"] || Icons.HelpCircle;
              return (
                <AnimatedSection key={i} direction="up" delay={i * 0.1} className="h-full">
                  <div className="group relative w-full h-[340px] sm:h-[380px] md:h-[450px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl">
                    {/* Background Image that scales on hover */}
                    <div className="absolute inset-0 transition-transform duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-110">
                      {v.img && typeof v.img === "string" && v.img.trim() !== "" ? (
                        <img src={v.img} alt={v.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-900" />
                      )}
                    </div>
                    
                    {/* Gradient Overlay that darkens on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 md:via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                    <div className="absolute inset-0 bg-brand-accent/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-multiply" />

                    {/* Content Container - Always legible on mobile, hover-interactive on desktop */}
                    <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end transition-transform duration-500 ease-out transform translate-y-0 md:translate-y-8 md:group-hover:translate-y-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white border border-white/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:shadow-[0_0_30px_color-mix(in srgb, var(--color-brand-accent) 60%, transparent)]">
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black font-outfit text-white mb-2 tracking-tight drop-shadow-md">
                        {v.title}
                      </h3>
                      
                      {/* Description reveals on hover on desktop, permanently readable on mobile */}
                      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[0.25,0.46,0.45,0.94]">
                        <div className="overflow-hidden">
                          <p className="text-gray-300 font-light leading-relaxed text-sm sm:text-base opacity-100 md:opacity-0 transition-opacity duration-500 delay-100 md:group-hover:opacity-100 pt-2">
                            {v.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOUNDER / TEAM SECTION */}
      {teamMembers.length > 0 && (
        <section className="py-24 md:py-40 bg-[#0A0A0A]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 sm:mb-24">
              <AnimatedSection direction="up">
                <span className="text-brand-accent font-bold text-xs uppercase tracking-[0.3em] mb-4 sm:mb-6 block">The People Behind Aveon Spaces</span>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit text-white tracking-tighter mb-4 sm:mb-6">
                  OUR <span className="text-brand-accent">TEAM</span>
                </h2>
                <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                  Meet the visionary minds driving innovation in ergonomic design and manufacturing excellence.
                </p>
              </AnimatedSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {teamMembers.map((member, i) => (
                <AnimatedSection key={member.id} direction="up" delay={i * 0.1}>
                  <div className="group relative bg-[#111111] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500">
                    <div className="aspect-square overflow-hidden relative">
                      {member.image && typeof member.image === "string" && member.image.trim() !== "" ? (
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Icons.Image className="w-16 h-16 sm:w-20 sm:h-20 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent opacity-80" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end">
                        <h3 className="text-2xl sm:text-3xl font-black font-outfit text-white mb-1 uppercase tracking-tight">{member.name}</h3>
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 sm:p-8 pt-4 sm:pt-6">
                      <p className="text-gray-400 font-light leading-relaxed text-sm sm:text-base line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                        {member.bio}
                      </p>
                      
                      {(member.linkedin || member.twitter) && (
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex gap-4">
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#0A66C2] transition-colors">
                              <LinkedinIcon className="w-5 h-5" />
                            </a>
                          )}
                          {member.twitter && (
                            <a href={member.twitter} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#1DA1F2] transition-colors">
                              <TwitterIcon className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MANUFACTURING IMAGE SECTION */}
      <section className="min-h-[380px] h-[50vh] sm:h-[60vh] md:h-[80vh] relative overflow-hidden">
        <ParallaxImage 
          src={aboutConfig.mfgBgImage || ""} 
          alt="Manufacturing" 
          className="w-full h-full grayscale opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 sm:px-6">
            <AnimatedSection direction="up">
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-outfit text-white tracking-tighter mb-6 sm:mb-8 max-w-4xl uppercase">
                {aboutConfig.mfgTitle}
              </h2>
              <div className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-accent rounded-full animate-pulse"></span>
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest">{aboutConfig.mfgSubtitle}</span>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
      {/* CSS 3D SOCIAL TILES */}
      <section className="py-20 sm:py-32 bg-[#050505] overflow-hidden flex flex-col items-center justify-center relative px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in srgb, var(--color-brand-accent) 5%, transparent)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="text-center mb-16 sm:mb-24 relative z-10">
          <AnimatedSection direction="up">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-outfit text-white tracking-tighter mb-4">
              JOIN THE <span className="text-brand-accent">NETWORK</span>
            </h2>
            <p className="text-gray-500 font-light text-sm sm:text-base">Connect with our community across social platforms</p>
          </AnimatedSection>
        </div>
        
        <AnimatedSection direction="up" delay={0.2} className="w-full flex justify-center">
          <ul className="social-tiles flex flex-wrap justify-center gap-y-16 sm:gap-y-20 gap-x-10 sm:gap-x-16 lg:gap-x-24">
            {[
              { id: "facebook", name: "Facebook", icon: <FacebookIcon className="w-5 h-5 sm:w-6 sm:h-6" />, class: "facebook" },
              { id: "twitter", name: "Twitter", icon: <TwitterIcon className="w-5 h-5 sm:w-6 sm:h-6" />, class: "twitter" },
              { id: "instagram", name: "Instagram", icon: <InstagramIcon className="w-5 h-5 sm:w-6 sm:h-6" />, class: "instagram" },
              { id: "linkedin", name: "LinkedIn", icon: <LinkedinIcon className="w-5 h-5 sm:w-6 sm:h-6" />, class: "linkedin" }
            ]
            .filter(social => socialsConfig?.[social.id]?.show && socialsConfig?.[social.id]?.url)
            .map((social, i) => (
              <li key={i} className={`social-tile ${social.class} group`}>
                <a href={socialsConfig[social.id].url} target="_blank" rel="noreferrer" className="flex items-center gap-3 sm:gap-4 w-full h-full absolute inset-0 pl-4 sm:pl-6 md:pl-10">
                  <div className="text-white/40 group-hover:text-white transition-colors duration-500 transform group-hover:scale-110">
                    {social.icon}
                  </div>
                  <span className="text-white/40 font-outfit font-black text-xs sm:text-sm md:text-lg group-hover:text-white transition-colors duration-500 tracking-widest uppercase">
                    {social.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </AnimatedSection>
 
        <style dangerouslySetInnerHTML={{ __html: `
          .social-tiles {
            list-style: none;
            padding: 0;
            margin: 0;
            transform-style: preserve-3d;
            padding-top: 40px;
            padding-bottom: 80px;
          }
          .social-tile {
            position: relative;
            width: 170px;
            height: 60px;
            background: #111111;
            transition: 0.5s;
            transform: rotate(-30deg) skew(25deg);
            box-shadow: -20px 20px 10px rgba(0,0,0,0.5);
            cursor: pointer;
            z-index: 10;
            border: 1px solid rgba(255,255,255,0.05);
          }
          @media (min-width: 480px) {
            .social-tile {
              width: 200px;
              height: 70px;
            }
          }
          @media (min-width: 768px) {
            .social-tile {
              width: 280px;
              height: 85px;
            }
          }
          .social-tile::before {
            content: '';
            position: absolute;
            top: 0;
            left: -20px;
            width: 20px;
            height: 100%;
            background: #0a0a0a;
            transform-origin: right;
            transform: skewY(-45deg);
            transition: 0.5s;
          }
          .social-tile::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            width: 100%;
            height: 20px;
            background: #050505;
            transform-origin: top;
            transform: skewX(-45deg);
            transition: 0.5s;
          }
          
          .social-tile:hover {
            transform: rotate(-30deg) skew(25deg) translate(20px, -20px);
            z-index: 20;
          }
          
          /* Facebook */
          .social-tile.facebook:hover {
            background: #1877F2 !important;
            border: 1px solid #4292f4 !important;
            box-shadow: -50px 50px 50px rgba(24, 119, 242, 0.4), -20px 20px 10px rgba(0,0,0,0.5) !important;
          }
          .social-tile.facebook:hover::before {
            background: #125ebd !important;
          }
          .social-tile.facebook:hover::after {
            background: #0f4d9b !important;
          }
          
          /* Twitter */
          .social-tile.twitter:hover {
            background: #1DA1F2 !important;
            border: 1px solid #4cb5f5 !important;
            box-shadow: -50px 50px 50px rgba(29, 161, 242, 0.4), -20px 20px 10px rgba(0,0,0,0.5) !important;
          }
          .social-tile.twitter:hover::before {
            background: #0d84cf !important;
          }
          .social-tile.twitter:hover::after {
            background: #0b6fae !important;
          }
          
          /* Instagram */
          .social-tile.instagram:hover {
            background: linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7) !important;
            border: 1px solid #ee2a7b !important;
            box-shadow: -50px 50px 50px rgba(238, 42, 123, 0.4), -20px 20px 10px rgba(0,0,0,0.5) !important;
          }
          .social-tile.instagram:hover::before {
            background: #ee2a7b !important;
          }
          .social-tile.instagram:hover::after {
            background: #6228d7 !important;
          }
          
          /* LinkedIn */
          .social-tile.linkedin:hover {
            background: #0A66C2 !important;
            border: 1px solid #3b88d3 !important;
            box-shadow: -50px 50px 50px rgba(10, 102, 194, 0.4), -20px 20px 10px rgba(0,0,0,0.5) !important;
          }
          .social-tile.linkedin:hover::before {
            background: #08529c !important;
          }
          .social-tile.linkedin:hover::after {
            background: #06417c !important;
          }
          
          .social-tile a {
            text-decoration: none;
            z-index: 10;
          }
        `}} />
      </section>
    </main>
  );
}