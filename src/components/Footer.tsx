import React from "react";
import Link from "next/link";
import statesMetaData from "@/data/states-meta.json";

export const Footer: React.FC = () => {
  const activeStates = statesMetaData.filter((st) => st.verified && st.isActive);

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                $
              </div>
              <span className="font-bold text-slate-900 tracking-tight">
                US Paycheck Calculator (Tax Year 2026)
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              Free, instant take-home pay and payroll withholding estimator based on the IRS Publication 15-T percentage method tables for 2026 and state withholding formulas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-600">
                  Federal Paycheck Calculator
                </Link>
              </li>
              {activeStates.map((st) => (
                <li key={st.stateCode}>
                  <Link href={`/${st.slug}`} className="hover:text-emerald-600">
                    {st.name} Paycheck Calculator
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase mb-3">
              Legal &amp; Disclaimers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/disclaimer" className="hover:text-emerald-600">
                  Tax Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600">
                  About Us &amp; Methodology
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 US Paycheck Calculator. All rights reserved.</p>
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-1 font-medium">
            Estimates only. Not tax advice. Consult a licensed CPA or tax professional.
          </p>
        </div>
      </div>
    </footer>
  );
};
