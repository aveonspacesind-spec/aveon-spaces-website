"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import EnquiryFloatingButton from "./EnquiryFloatingButton";
import MobileBottomNav from "./MobileBottomNav";
import SmoothScroll from "./SmoothScroll";
import { ReactNode } from "react";

export default function PublicLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen bg-[#070707]">{children}</main>;
  }

  return (
    <SmoothScroll>
      <Navbar />
      <main className="min-h-screen bg-[#050505]">
        {children}
      </main>
      <EnquiryFloatingButton />
      <MobileBottomNav />
      <Footer />
    </SmoothScroll>
  );
}
