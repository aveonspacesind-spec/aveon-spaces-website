"use client";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useState, useEffect } from "react";
import { useLenis } from "lenis/react";
import CustomDropdown from "@/components/CustomDropdown";

import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.148.563 4.181 1.637 5.962L.194 23.368l5.525-1.448A11.97 11.97 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zM17.65 16.58c-.24.67-1.393 1.282-1.921 1.346-.496.06-1.157.175-3.32-.72-2.617-1.082-4.298-3.766-4.43-3.943-.131-.176-1.056-1.405-1.056-2.68 0-1.275.666-1.899.905-2.15.24-.251.523-.314.698-.314.175 0 .35 0 .504.007.162.008.384-.06.594.444.221.528.718 1.748.784 1.88.066.133.11.288.022.464-.087.176-.131.288-.262.443-.131.155-.276.34-.393.456-.131.132-.27.275-.115.54.155.265.69 1.138 1.481 1.841 1.018.905 1.87 1.189 2.132 1.32.262.133.415.111.568-.066.153-.177.655-.765.83-1.028.175-.264.35-.221.594-.132.245.088 1.545.728 1.808.861.263.133.438.199.504.31.066.111.066.644-.175 1.314z" /></svg>
);

export default function ContactPage() {
  const [formState, setFormState] = useState("idle");
  const [contactData, setContactData] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [socialsConfig, setSocialsConfig] = useState<any>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [lenis]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "site_config"), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        if (data.contact) {
          setContactData(data.contact);
        } else {
          setContactData({
            phone: "+91 98765 43210",
            phoneSub: "Mon-Sat, 9am - 7pm",
            email: "info@aveonseating.com",
            emailSub: "Response within 24 hours",
            address: "Industrial Area Phase II,",
            addressSub: "Bangalore, KA 560001",
            hours: "8:00 AM - 6:00 PM",
            hoursSub: "Sunday Closed",
            mapTitle: "Aveon Main Office",
            mapLocation: "Bangalore, Karnataka"
          });
        }
      } else {
        setContactData({
          phone: "+91 98765 43210",
          phoneSub: "Mon-Sat, 9am - 7pm",
          email: "info@aveonseating.com",
          emailSub: "Response within 24 hours",
          address: "Industrial Area Phase II,",
          addressSub: "Bangalore, KA 560001",
          hours: "8:00 AM - 6:00 PM",
          hoursSub: "Sunday Closed",
          mapTitle: "Aveon Main Office",
          mapLocation: "Bangalore, Karnataka"
        });
      }
    }, (error) => {
      console.error("Firestore Contact error, using fallback:", error);
      setContactData({
        phone: "+91 98765 43210",
        phoneSub: "Mon-Sat, 9am - 7pm",
        email: "info@aveonseating.com",
        emailSub: "Response within 24 hours",
        address: "Industrial Area Phase II,",
        addressSub: "Bangalore, KA 560001",
        hours: "8:00 AM - 6:00 PM",
        hoursSub: "Sunday Closed",
        mapTitle: "Aveon Main Office",
        mapLocation: "Bangalore, Karnataka"
      });
    });

    const unsubGeneral = onSnapshot(doc(db, "site_config", "general"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.socials) setSocialsConfig(data.socials);
      }
    });

    return () => {
      unsub();
      unsubGeneral();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    try {
      await addDoc(collection(db, "enquiries"), {
        name,
        email,
        phone: "",
        company: service || "General Inquiry",
        message,
        customer: {
          name,
          email,
          phone: "",
          company: service || "General Inquiry",
          message
        },
        items: [],
        status: "Pending",
        createdAt: serverTimestamp()
      });
      setFormState("success");
      // Reset form
      setName("");
      setEmail("");
      setService("");
      setMessage("");
      setTimeout(() => setFormState("idle"), 3000);
    } catch (error) {
      console.error("Error submitting contact inquiry:", error);
      alert("Failed to submit message. Please try again.");
      setFormState("idle");
    }
  };

  const contactInfo: any[] = contactData ? [
    { icon: <Phone className="w-6 h-6" />, label: "Call Us", value: contactData.phone, sub: contactData.phoneSub },
    { icon: <Mail className="w-6 h-6" />, label: "Email Us", value: contactData.email, sub: contactData.emailSub },
    { icon: <MapPin className="w-6 h-6" />, label: "Visit Us", value: contactData.address, sub: contactData.addressSub },
    { icon: <Clock className="w-6 h-6" />, label: "Factory Hours", value: contactData.hours, sub: contactData.hoursSub }
  ] : [];

  const whatsappUrl = socialsConfig?.whatsapp?.url || "https://wa.me/919876543210";

  contactInfo.push({
    icon: <WhatsappIcon className="w-6 h-6" />,
    label: "WhatsApp",
    value: "Chat with Us",
    sub: "Instant Support",
    isLink: true,
    url: whatsappUrl,
    accentColor: "text-[#25D366]",
    borderColor: "hover:border-[#25D366]/50"
  });

  return (
    <main className="bg-[#0A0A0A] min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-20 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* LEFT CONTENT */}
          <div className="space-y-8 sm:space-y-12">
            <AnimatedSection direction="right">
              <span className="text-brand-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 sm:mb-6 block">Get in Touch</span>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-outfit text-white tracking-tighter leading-none mb-4 sm:mb-8">
                LET'S BUILD <br />YOUR <span className="text-brand-accent">SPACE.</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-400 font-light leading-relaxed max-w-lg">
                Whether you're furnishing a new office or upgrading your current setup, our ergonomic experts are ready to assist.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {contactInfo.map((info, i) => (
                <AnimatedSection key={i} direction="up" delay={i * 0.1}>
                  {info.isLink ? (
                    <a href={info.url} target="_blank" rel="noreferrer" className={`group block h-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 transition-all ${info.borderColor || 'hover:border-brand-accent/30'}`}>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-[#111111] rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform ${info.accentColor || 'text-brand-accent'}`}>
                        {info.icon}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{info.label}</span>
                      <h3 className="text-base sm:text-lg font-black font-outfit text-white mb-1">{info.value}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-light">{info.sub}</p>
                    </a>
                  ) : (
                    <div className="group h-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 hover:border-brand-accent/30 transition-all">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#111111] rounded-xl flex items-center justify-center text-brand-accent mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        {info.icon}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">{info.label}</span>
                      <h3 className="text-base sm:text-lg font-black font-outfit text-white mb-1">{info.value}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-light">{info.sub}</p>
                    </div>
                  )}
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* RIGHT FORM */}
          <AnimatedSection direction="left">
            <div className="bg-[#111111] p-5 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent blur-[120px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>
              
              <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white mb-6 sm:mb-8 relative z-10">Request a Consultation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 text-white text-base md:text-sm placeholder:text-gray-500 focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="work-email@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 text-white text-base md:text-sm placeholder:text-gray-500 focus:outline-none focus:border-brand-accent transition-colors"
                    />
                  </div>
                </div>

                <CustomDropdown 
                  label="Service Needed"
                  options={[
                    { label: "Bulk Seating Order", value: "Bulk Seating Order" },
                    { label: "Custom Office Design", value: "Custom Office Design" },
                    { label: "Product Inquiry", value: "Product Inquiry" },
                    { label: "Partnership", value: "Partnership" }
                  ]}
                  value={service}
                  onChange={(val) => setService(val)}
                  placeholder="Select Service"
                />

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Briefly describe your workspace requirements or specific products you're interested in..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-3.5 sm:py-4 text-white text-base md:text-sm placeholder:text-gray-500 focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={formState !== "idle"}
                  type="submit"
                  className={`w-full py-4 sm:py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                    formState === "success" 
                      ? "bg-green-600 text-white" 
                      : "bg-brand-accent text-white hover:bg-brand-accent active:scale-[0.98]"
                  }`}
                >
                  {formState === "idle" && <><Send className="w-4 h-4" /> Send Message</>}
                  {formState === "submitting" && "Sending..."}
                  {formState === "success" && "Message Sent Successfully!"}
                </button>
              </form>
            </div>
          </AnimatedSection>

        </div>
      </div>

      {/* MAP PLACEHOLDER */}
      <section className="mt-20 sm:mt-32 max-w-[1440px] mx-auto px-4 sm:px-6">
        <AnimatedSection direction="up">
          <div className="h-[280px] sm:h-[400px] w-full rounded-[2rem] sm:rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden relative grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-crosshair">
            <div className="absolute inset-0 flex items-center justify-center p-4">
               <div className="bg-[#111111] p-4 sm:p-6 rounded-2xl shadow-xl flex items-center gap-3 sm:gap-4 border border-brand-accent max-w-full">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-black font-outfit text-white text-sm sm:text-base truncate">{contactData?.mapTitle || "Aveon Main Office"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{contactData?.mapLocation || "Bangalore, Karnataka"}</p>
                  </div>
               </div>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </main>
  );
}