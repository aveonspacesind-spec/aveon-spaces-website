
"use client";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsConditions() {
  return (
    <main className="bg-[#050505] text-white min-h-screen py-20 sm:py-28 md:py-32 px-4 sm:px-6 overflow-x-clip">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-accent transition-colors mb-8 sm:mb-12 uppercase text-[10px] font-black tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <AnimatedSection direction="up">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-outfit tracking-tighter mb-8 sm:mb-12">
            TERMS & <span className="text-brand-accent">CONDITIONS</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-12 sm:mb-16 font-light leading-relaxed">
            By accessing the Aveon Spaces exhibition terminal, you agree to comply with and be bound by the following high-performance standards.
          </p>
        </AnimatedSection>

        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">1. Intellectual Property</h2>
            <p className="text-gray-500 leading-relaxed">
              All designs, imagery, and text content displayed on this platform are the exclusive intellectual property of Aveon Spaces. 
              Unauthorized reproduction or use of our engineered designs is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">2. Product Specifications</h2>
            <p className="text-gray-500 leading-relaxed">
              While we strive for surgical precision in our digital catalog, actual product specifications may vary slightly due to continuous engineering improvements. 
              Aveon Spaces reserves the right to modify designs without prior notice to ensure optimal performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">3. Enquiries & Quotes</h2>
            <p className="text-gray-500 leading-relaxed">
              Submitting an enquiry via our terminal does not constitute a binding contract. 
              Formal quotations will be issued after our workspace specialists review your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">4. Limitation of Liability</h2>
            <p className="text-gray-500 leading-relaxed">
              Aveon Spaces shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our seating systems if not installed or maintained according to our official guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider">5. Governing Law</h2>
            <p className="text-gray-500 leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising from the use of this terminal shall be subject to the exclusive jurisdiction of the courts in Pune.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
