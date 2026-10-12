import React from "react";
import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            $
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            USPaycheck<span className="text-emerald-600">Calculator</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-emerald-600 transition">
            Calculator
          </Link>
          <Link href="/about" className="hover:text-emerald-600 transition">
            About
          </Link>
          <Link href="/disclaimer" className="hover:text-emerald-600 transition">
            Disclaimer
          </Link>
        </nav>
      </div>
    </header>
  );
};
