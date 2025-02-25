'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { Providers } from "@/providers/Providers";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#FCFCFC] dark:bg-black">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </AuthProvider>
    </Providers>
  );
}
