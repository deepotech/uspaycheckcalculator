import React from "react";
import type { Metadata } from "next";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import statesMetaData from "@/data/states-meta.json";
import Link from "next/link";
import { CONTACT_EMAIL, NEXT_PUBLIC_SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "2026 US Paycheck & Take-Home Pay Calculator | Free Tax Estimator",
  description:
    "Estimate your take-home pay using the IRS Publication 15-T percentage method for 2026. Free federal calculator with Virginia and Pennsylvania state tax.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "2026 US Paycheck & Take-Home Pay Calculator | Free Tax Estimator",
    description:
      "Estimate your take-home pay using the IRS Publication 15-T percentage method for 2026. Free federal calculator with Virginia and Pennsylvania state tax.",
    url: "/",
    type: "website",
  },
};

export default function HomePage() {
  // Only show states that are both verified and active
  const activeStates = statesMetaData.filter((st) => st.verified && st.isActive);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "US Paycheck Calculator",
    "url": NEXT_PUBLIC_SITE_URL,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description":
      "Free 2026 US paycheck and take-home pay calculator estimating federal and FICA payroll withholding using IRS Publication 15-T percentage tables.",
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {/* Main H1 Hero */}
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          2026 US Paycheck &amp; Take-Home Pay Calculator
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate your net salary and paycheck withholding instantly for tax year 2026. Based on the IRS Publication 15-T percentage method tables for 2026, updated Social Security wage limits, and state withholding formulas.
        </p>
      </div>

      {/* Interactive Calculator Container */}
      <PaycheckCalculator initialStateCode="FEDERAL_ONLY" />

      {/* In-content Ad Slot — hidden when no ad provider is configured */}
      <AdPlaceholder slotId="ad-mid-content" format="horizontal-banner" className="my-8" />

      {/* State Directory / Hub — only verified, active states */}
      {activeStates.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mt-10">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            State Paycheck Calculators
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Access specialized state paycheck calculators with state tax brackets, local payroll rules, and worked examples.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeStates.map((st) => (
              <div
                key={st.stateCode}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{st.name}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {st.incomeTaxType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Top Rate: <span className="font-medium text-slate-800">{st.topRate}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                  <Link
                    href={`/${st.slug}`}
                    className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View {st.name} Calculator →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Disclosures & Error Reporting */}
      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-semibold text-slate-800">
            Tax Year: 2026 • IRS Publication 15-T Percentage Method Tables
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Paycheck%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          Estimates only. Not tax advice. This independent tool is not affiliated with or endorsed by the IRS or any state revenue agency.
        </p>
      </div>
    </div>
  );
}
