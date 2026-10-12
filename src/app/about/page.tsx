import React from "react";
import type { Metadata } from "next";
import { SITE_OWNER_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us & Methodology | US Paycheck Calculator",
  description:
    "Learn about US Paycheck Calculator, who maintains the project, our primary tax sources and calculation methodology, and tool limitations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us & Methodology | US Paycheck Calculator",
    description:
      "Learn about US Paycheck Calculator, who maintains the project, our primary tax sources and calculation methodology, and tool limitations.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <div>
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          Transparency &amp; Methodology
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About US Paycheck Calculator
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          An independent payroll withholding estimation tool providing clear, verified take-home pay calculations based directly on primary government publications.
        </p>
      </div>

      {/* Operator / Maintainer */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Who Runs This Site
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          This site is independently operated and maintained by:
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 space-y-1">
          <p className="font-semibold text-slate-900">
            {SITE_OWNER_NAME} &bull;{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-emerald-700 hover:text-emerald-800 underline font-medium"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="text-xs text-slate-500">
            This tool is built and maintained as an independent resource. It is not affiliated with, sponsored by, or endorsed by the Internal Revenue Service (IRS), the Social Security Administration, or any state Department of Revenue.
          </p>
        </div>
      </section>

      {/* Primary Sources & Methodology */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Calculation Methodology &amp; Primary Sources
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Our calculations follow primary government reference publications and statutory formulas:
        </p>
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <div className="border-l-2 border-emerald-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900">1. Federal Income Tax Withholding</h3>
            <p className="text-slate-600 leading-relaxed">
              <strong>IRS Publication 15-T (2026)</strong>, Section 1: Percentage Method Tables for Automated Payroll Systems (Worksheet 1A and annual percentage method brackets for standard and Form W-4 Step 2 checkbox selections).
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900">2. Social Security &amp; Medicare (FICA)</h3>
            <p className="text-slate-600 leading-relaxed">
              <strong>Social Security Administration, Contribution and Benefit Base (<a href="https://www.ssa.gov/oact/cola/cbb.html" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline hover:text-emerald-800">ssa.gov/oact/cola/cbb.html</a>):</strong> 2026 Social Security (OASDI) maximum taxable earnings limit of $184,500 at the statutory 6.2% employee tax rate. Medicare Hospital Insurance (HI) is computed at 1.45% on all earnings with no wage limit, plus 0.9% Additional Medicare Tax on wages exceeding statutory thresholds ($200,000 for single, $250,000 for married filing jointly) per 26 U.S.C. § 3101.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900">3. Virginia State Income Tax</h3>
            <p className="text-slate-600 leading-relaxed">
              <strong>Virginia Tax, Income Tax Withholding Guide for Employers (Document 2614086 Rev. 10/26)</strong>: Employer percentage method formula on page 21 with $8,750 standard deduction, Form VA-4 personal exemptions ($930 each), and age/blind exemptions ($800 each). Rounding of annual tax to the nearest dollar follows the guide&apos;s worked example on page 22.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-4 space-y-1">
            <h3 className="font-bold text-slate-900">4. Pennsylvania State &amp; Local Taxes</h3>
            <p className="text-slate-600 leading-relaxed">
              <strong>PA Department of Revenue Form REV-415 (SU) 01-23:</strong> Page 11 specifies withholding as compensation multiplied by the flat 3.07% PIT rate; page 6 details the inclusion of 401(k) elective deferrals in PA taxable compensation.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>PA Department of Labor &amp; Industry:</strong> Employee Unemployment Compensation (UC) page detailing 0.07% withholding on total gross compensation, applying the 3-decimal truncation and nearest-cent rounding rule.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>City of Philadelphia Department of Revenue:</strong> Wage Tax rate schedule for Philadelphia resident (3.735%) and non-resident (3.425%) rates effective July 1, 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Tool Scope &amp; Limitations
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            While we strive for calculation precision against primary publications, users should note the following scope limitations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-700 pl-2">
            <li>
              <strong>Estimates Only:</strong> Results provided by this calculator are mathematical estimates intended for personal planning and general educational comparison. They do not constitute legal, tax, or accounting advice.
            </li>
            <li>
              <strong>State Coverage:</strong> Only Virginia and Pennsylvania state taxes are currently modeled based on specific employer withholding guides.
            </li>
            <li>
              <strong>Other States:</strong> When other states are selected, the calculator models federal income tax and FICA taxes only. Unverified state formulas are kept behind an internal quality gate and are not published until confirmed against primary government publications.
            </li>
            <li>
              <strong>Employer Payroll Variance:</strong> Actual paycheck net amounts may differ due to payroll software rounding intervals, supplemental wage rules, mid-year wage accumulation caps, non-standard fringe benefits, or employer-specific pre-tax plans.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
