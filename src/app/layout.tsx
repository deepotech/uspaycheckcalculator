import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "US Paycheck Calculator 2026 | Free Take-Home Pay Estimator",
  description:
    "Free 2026 US paycheck and take-home pay calculator. Instant calculations using official IRS Publication 15-T and state withholding formulas.",
  metadataBase: new URL(NEXT_PUBLIC_SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
