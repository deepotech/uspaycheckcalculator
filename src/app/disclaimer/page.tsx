import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Disclaimer | US Paycheck Calculator",
  description:
    "Legal and tax disclaimer: US Paycheck Calculator provides estimates only and does not constitute tax, legal, or accounting advice.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "Tax Disclaimer | US Paycheck Calculator",
    description:
      "Legal and tax disclaimer: US Paycheck Calculator provides estimates only and does not constitute tax, legal, or accounting advice.",
    url: "/disclaimer",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <div>
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          Legal Notice
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tax &amp; Legal Disclaimer
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Please review this disclaimer before using calculations or estimates generated on this website.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          1. Estimates Only — Not Tax Advice
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          The calculations, breakdowns, and figures provided by US Paycheck Calculator are mathematical estimates prepared for personal reference, informational, and educational purposes only.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nothing on this website constitutes professional tax, accounting, financial, or legal advice. Tax laws, withholding formulas, personal exemption eligibility, and payroll deductions depend on individual circumstances that automated online tools cannot fully evaluate.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          2. No Government Affiliation or Endorsement
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          US Paycheck Calculator is an independent, privately run website. This tool is <strong>not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-700 pl-2">
          <li>The Internal Revenue Service (IRS) or the United States Department of the Treasury</li>
          <li>The Social Security Administration (SSA)</li>
          <li>The Virginia Department of Taxation</li>
          <li>The Pennsylvania Department of Revenue</li>
          <li>Any other federal, state, county, or municipal revenue authority</li>
        </ul>
        <p className="text-sm text-slate-600 leading-relaxed">
          All references to official tax publications (e.g., IRS Publication 15-T, VA Employer Guide 2614086, PA Form REV-415) are citations identifying the underlying source formulas and do not imply government review, verification, or approval.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          3. Verification with Your Employer&apos;s Payroll
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Individual employers may utilize different payroll calculation methods (such as wage bracket tables, alternative percentage formulas, annualized calculations, or specific software rounding conventions). Furthermore, factors such as mid-year cumulative earnings caps, employer-specific Section 125 plan designs, supplemental wage rates, and local tax collection jurisdictions can produce differences between these estimates and your actual paycheck.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed font-medium text-slate-800">
          Always consult your employer&apos;s payroll department, your official pay stub, or a licensed Certified Public Accountant (CPA) / qualified tax professional for binding tax determinations.
        </p>
      </section>
    </div>
  );
}
