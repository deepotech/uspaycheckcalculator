import React from "react";
import type { Metadata } from "next";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import statesMetaData from "@/data/states-meta.json";
import Link from "next/link";
import { CONTACT_EMAIL, NEXT_PUBLIC_SITE_URL, PAGE_UPDATE_INFO } from "@/lib/site";

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
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
        </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              State Paycheck Calculators
            </h2>
            <Link
              href="/paycheck-calculator-by-state"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Browse All State Calculators →
            </Link>
          </div>
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

      {/* Pay Conversion & Pay Period Calculators */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mt-10 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pay Period &amp; Wage Conversion Calculators
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculate take-home pay by payroll frequency or convert between hourly rates and annual salaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/hourly-to-salary-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hourly to Salary Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Convert hourly rates to annual, monthly, bi-weekly, and weekly gross wages using the 2,080-hour formula.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Convert Hourly to Salary &rarr;
            </span>
          </Link>

          <Link
            href="/salary-to-hourly-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Salary to Hourly Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Convert annual salary into equivalent hourly, daily, weekly, and monthly rates with unpaid time off options.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Convert Salary to Hourly &rarr;
            </span>
          </Link>

          <Link
            href="/hourly-paycheck-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hourly Paycheck Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Estimate net take-home pay from hourly wages with federal withholding and FICA deductions.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Calculate Hourly Paycheck &rarr;
            </span>
          </Link>

          <Link
            href="/weekly-paycheck-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Paycheck Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Calculate paycheck deductions across 52 weekly pay periods using IRS Pub 15-T Worksheet 1A.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Calculate Weekly Paycheck &rarr;
            </span>
          </Link>

          <Link
            href="/bi-weekly-paycheck-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bi-Weekly Paycheck Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Calculate take-home pay across 26 bi-weekly periods (every two weeks) with federal and state taxes.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Calculate Bi-Weekly Paycheck &rarr;
            </span>
          </Link>

          <Link
            href="/monthly-paycheck-calculator"
            className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Paycheck Calculator</h3>
              <p className="text-xs text-slate-500 mt-1">
                Estimate monthly take-home pay across 12 calendar periods using IRS Pub 15-T Worksheet 1A.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 mt-3 inline-flex items-center gap-1">
              Calculate Monthly Paycheck &rarr;
            </span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">Need definitions of gross vs. net pay, pay frequency, and FICA?</span>
          <Link href="/paycheck-basics" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
            Read Paycheck Basics Guide &rarr;
          </Link>
        </div>
      </section>


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
