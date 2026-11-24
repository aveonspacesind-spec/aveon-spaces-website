import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { ConfirmProvider } from "@/components/ConfirmProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aveon Spaces Admin Panel",
  description: "Admin panel for Aveon Spaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans bg-[#050505] text-white antialiased flex min-h-screen`}>
        <ConfirmProvider>
          <div className="sticky top-0 h-screen shrink-0 z-50">
            <Sidebar />
          </div>
          <main className="flex-1 w-full min-w-0 p-8">
            {children}
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ConfirmProvider>
      </body>
    </html>
  );
}
