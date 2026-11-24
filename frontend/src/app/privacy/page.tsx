
"use client";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#050505] text-white min-h-screen py-20 sm:py-28 md:py-32 px-4 sm:px-6 overflow-x-clip">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-accent transition-colors mb-8 sm:mb-12 uppercase text-[10px] font-black tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <AnimatedSection direction="up">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-outfit tracking-tighter mb-8 sm:mb-12">
            PRIVACY <span className="text-brand-accent">POLICY</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-12 sm:mb-16 font-light leading-relaxed">
            Last Updated: May 2026. Your privacy is paramount to Aveon Spaces. 
            This document outlines how we handle your data with the same precision we apply to our engineering.
          </p>
        </AnimatedSection>

        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">1. Data Collection</h2>
            <p className="text-gray-500 leading-relaxed">
              We collect information you provide directly to us, such as when you create an enquiry, request a catalog, or contact our support team. 
              This may include your name, email address, phone number, and company details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">2. Use of Information</h2>
            <p className="text-gray-500 leading-relaxed">
              Your data is primarily used to process your enquiries and provide tailored workspace solutions. 
              We do not sell or trade your personal information to third parties. Every byte of data is treated as a critical asset in our service pipeline.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">3. Security Measures</h2>
            <p className="text-gray-500 leading-relaxed">
              We implement industry-standard encryption and security protocols to protect your information from unauthorized access, alteration, or destruction. 
              Our infrastructure is audited regularly to ensure the highest standards of data integrity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">4. Cookies & Tracking</h2>
            <p className="text-gray-500 leading-relaxed">
              We use minimal cookies to enhance your experience on our exhibition terminal. 
              These help us understand which products are most relevant to our users, allowing us to refine our collections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">5. Contact Us</h2>
            <p className="text-gray-500 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact our data protection officer at privacy@aveonseating.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
