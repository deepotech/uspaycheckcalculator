import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import statesMetaData from "@/data/states-meta.json";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Paycheck Calculators by State 2026 | Free State Take-Home Pay Estimators",
  description:
    "Directory of state paycheck calculators for tax year 2026. Calculate take-home pay based on official state withholding guides, exemption rules, and tax rates.",
  alternates: {
    canonical: "/paycheck-calculator-by-state",
  },
  openGraph: {
    title: "Paycheck Calculators by State 2026 | Free State Take-Home Pay Estimators",
    description:
      "Directory of state paycheck calculators for tax year 2026. Calculate take-home pay based on official state withholding guides, exemption rules, and tax rates.",
    url: "/paycheck-calculator-by-state",
    type: "website",
  },
};

export default function PaycheckCalculatorByStatePage() {
  const activeStates = statesMetaData.filter((st) => st.verified && st.isActive);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators by State" },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Paycheck Calculators by State (2026)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Select a state below to calculate your net take-home pay for tax year 2026. Each calculator uses formulas and withholding rules sourced from official state revenue department publications.
        </p>
      </div>

      {/* Site intro */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-700 leading-relaxed">
          This site provides free paycheck calculators that estimate take-home pay using
          formulas drawn directly from official state employer withholding guides and IRS
          Publication 15-T. Each calculator is published only after its figures are verified
          against a primary source document. Additional states will be added as their
          official withholding guides are reviewed and verified.
        </p>
      </section>

      {/* Active State Calculators Directory */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Active State Calculators
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Currently verified states with official withholding formulas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeStates.map((st) => (
            <div
              key={st.stateCode}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{st.name}</h3>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {st.incomeTaxType}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Top statutory withholding rate: <strong className="text-slate-900">{st.topRate}</strong>
                </p>

                {st.stateCode === "VA" && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Virginia computes withholding via graduated rates (2% to 5.75%), a flat $8,750 standard deduction in the withholding formula, and personal exemptions ($930 / $800).
                    Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 21.
                  </p>
                )}

                {st.stateCode === "PA" && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pennsylvania applies a flat 3.07% Personal Income Tax rate on gross compensation, mandatory 0.07% Employee Unemployment Compensation (UC), and local taxes where applicable.
                    Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 11; PA Dept of Labor &amp; Industry.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <Link
                  href={`/${st.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Open {st.name} Paycheck Calculator &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclosures */}
      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-semibold text-slate-800">
            {PAGE_UPDATE_INFO.taxYearLabel} • {PAGE_UPDATE_INFO.updatedLabel}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=State%20Calculators%20Directory%20Inquiry`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error or request a state
          </a>
        </div>
        <p>
          Estimates only. Not tax advice. Formulas are derived from official employer withholding guides published by state tax agencies and the IRS.
        </p>
      </div>
    </div>
  );
}
