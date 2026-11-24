import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aveon Spaces | Engineered Seating Solutions",
  description: "Custom-built office seating systems for productivity & comfort.",
};

import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import { WishlistProvider } from "@/components/WishlistContext";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans bg-[#0A0A0A] text-white antialiased`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PublicLayoutWrapper>
                {children}
              </PublicLayoutWrapper>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

