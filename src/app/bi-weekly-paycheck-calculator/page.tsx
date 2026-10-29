import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency } from "@/lib/tax/formatters";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bi-Weekly Paycheck Calculator 2026 | 26 Pay Periods Take-Home Pay",
  description:
    "Calculate your bi-weekly take-home pay for tax year 2026 across 26 pay periods with IRS Pub 15-T Worksheet 1A federal withholding, FICA, and state tax options.",
  alternates: {
    canonical: "/bi-weekly-paycheck-calculator",
  },
  openGraph: {
    title: "Bi-Weekly Paycheck Calculator 2026 | 26 Pay Periods Take-Home Pay",
    description:
      "Calculate your bi-weekly take-home pay for tax year 2026 across 26 pay periods with IRS Pub 15-T Worksheet 1A federal withholding, FICA, and state tax options.",
    url: "/bi-weekly-paycheck-calculator",
    type: "website",
  },
};

export default function BiWeeklyPaycheckPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Bi-Weekly Paycheck Calculator" },
  ];

  // Programmatically compute a $65,000 annual salary example ($2,500 gross bi-weekly)
  const annualSalary = 65000;
  const biWeeklyGross = annualSalary / 26; // $2,500.00

  const vaExample = calculatePaycheck({
    payType: "salary",
    grossAmount: annualSalary,
    frequency: "bi-weekly",
    stateCode: "VA",
    w4: {
      filingStatus: "single",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
    stateInputs: {
      vaPersonalExemptions: 1,
      vaAgeBlindExemptions: 0,
    },
  });

  const paExample = calculatePaycheck({
    payType: "salary",
    grossAmount: annualSalary,
    frequency: "bi-weekly",
    stateCode: "PA",
    w4: {
      filingStatus: "single",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
    stateInputs: {
      paLocalEitRate: 0.0,
    },
  });

  const faqs = [
    {
      q: "How many bi-weekly paychecks are received in a calendar year?",
      a: "A bi-weekly pay schedule distributes compensation once every two weeks (every 14 days), resulting in exactly 26 paychecks over a 52-week calendar year (52 ÷ 2 = 26).",
    },
    {
      q: "What is the difference between bi-weekly pay and semi-monthly pay?",
      a: "Bi-weekly pay occurs 26 times per year (every two weeks), meaning two months per year typically contain three paychecks (and ten months typically contain two paychecks). Semi-monthly pay occurs exactly 24 times per year (twice per month, such as the 15th and final day of each month). Gross pay per period is higher on a semi-monthly schedule (Salary ÷ 24) than on a bi-weekly schedule (Salary ÷ 26).",
    },
    {
      q: "How is gross pay calculated on a bi-weekly paycheck?",
      a: "For salaried employees, divide annual salary by 26 ($65,000 ÷ 26 = $2,500.00). For hourly workers on a standard 40-hour workweek, multiply the hourly wage by 80 hours ($25.00/hr × 80 hours = $2,000.00).",
    },
    {
      q: "What federal deductions are subtracted from each bi-weekly check?",
      a: "Federal deductions consist of federal income tax withholding computed using IRS Publication 15-T Worksheet 1A (annualize wages, subtract line 1g, apply the Annual Percentage Method Table, and divide by 26 pay periods), Social Security tax (6.2% on cumulative wages up to $184,500), and Medicare tax (1.45% on all wages).",
    },
    {
      q: "How does the Social Security cap affect bi-weekly paychecks late in the year?",
      a: "Under the 2026 Social Security wage base limit of $184,500, once an employee's cumulative year-to-date wages cross $184,500, the 6.2% Social Security deduction is no longer withheld for remaining pay periods, resulting in higher net pay for the rest of that tax year.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
          <span>•</span>
          <span>Bi-Weekly Pay Frequency (26 Periods)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Bi-Weekly Paycheck Calculator (2026)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate take-home pay for bi-weekly paychecks received every two weeks (26 pay periods per year). Based on 2026 IRS Publication 15-T Worksheet 1A formulas, statutory FICA limits, and state tax calculations.
        </p>
      </div>

      {/* Embedded PaycheckCalculator pre-configured for bi-weekly */}
      <PaycheckCalculator
        initialFrequency="bi-weekly"
        initialGrossAmount={65000}
        initialStateCode="FEDERAL_ONLY"
      />

      {/* Sourced Explanatory Content on Bi-Weekly Payroll */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How the 26-Period Bi-Weekly Pay Cycle Operates
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            A bi-weekly payroll cycle issues paychecks once every 14 days, resulting in <strong>26 pay periods each calendar year</strong> (52 weeks ÷ 2 = 26). Because months do not divide evenly into two-week blocks, employees on a bi-weekly schedule typically receive two paychecks during ten months of the year and three paychecks during two months. Gross compensation per paycheck is computed as:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900">
            Bi-Weekly Gross Pay = Annual Gross Salary ÷ 26
          </div>
          <p>
            Federal, payroll, and state withholdings apply to each bi-weekly pay distribution:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>
              <strong>Federal Withholding (Pub 15-T):</strong> Calculated using IRS Publication 15-T Worksheet 1A: annualize wages, subtract line 1g ($8,600 for single standard), apply the Annual Percentage Method Table, and divide by 26 pay periods.
            </li>
            <li>
              <strong>Social Security Deduction:</strong> 6.2% is deducted from each bi-weekly paycheck up to the statutory 2026 wage base limit of $184,500 (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>Medicare Deduction:</strong> 1.45% is deducted from all covered earnings without an annual cap (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>State Income Tax Withholding:</strong> Sourced directly from state revenue guidelines. Virginia calculates annualized withholding and divides by 26 periods; Pennsylvania deducts a flat 3.07% PIT and 0.07% employee UC from bi-weekly gross wages.
            </li>
          </ul>
        </div>
      </section>

      {/* Computed Worked Example */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Computed Worked Example: $65,000 Annual Salary Paid Bi-Weekly
        </h2>
        <p className="text-xs text-slate-500">
          Example calculation for a $65,000 annual salary paid across 26 bi-weekly periods ($2,500.00 gross per paycheck). Tax year 2026, Single filer, standard Form W-4:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Virginia Bi-Weekly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Virginia Withholding</span>
              <span className="text-[11px] text-slate-500">Form VA-4 (1 Exemption)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($65,000 ÷ 26):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(biWeeklyGross)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Federal Income Tax (Pub 15-T):</span>
              <span className="text-slate-800">-{formatCurrency(vaExample.taxes.federalIncomeTax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Social Security (6.2%):</span>
              <span className="text-slate-800">-{formatCurrency(vaExample.taxes.socialSecurity)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Medicare (1.45%):</span>
              <span className="text-slate-800">-{formatCurrency(vaExample.taxes.medicare)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Virginia State Income Tax:</span>
              <span>-{formatCurrency(vaExample.taxes.stateIncomeTax)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Bi-Weekly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(vaExample.netPay)}</span>
            </div>
          </div>

          {/* Pennsylvania Bi-Weekly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Pennsylvania Withholding</span>
              <span className="text-[11px] text-slate-500">PA REV-415 (3.07% PIT + 0.07% UC)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($65,000 ÷ 26):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(biWeeklyGross)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Federal Income Tax (Pub 15-T):</span>
              <span className="text-slate-800">-{formatCurrency(paExample.taxes.federalIncomeTax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Social Security (6.2%):</span>
              <span className="text-slate-800">-{formatCurrency(paExample.taxes.socialSecurity)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Medicare (1.45%):</span>
              <span className="text-slate-800">-{formatCurrency(paExample.taxes.medicare)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>PA State Tax (PIT &amp; UC):</span>
              <span>
                -{formatCurrency(
                  paExample.taxes.stateIncomeTax +
                    paExample.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0)
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Bi-Weekly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(paExample.netPay)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* General Basics Callout */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Compare Bi-Weekly vs. Semi-Monthly Schedules
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Read our <Link href="/paycheck-basics" className="font-semibold text-emerald-700 underline hover:text-emerald-800">Paycheck Basics Guide</Link> for an in-depth breakdown of 26-period vs. 24-period compensation calculations.
          </p>
        </div>
        <Link
          href="/paycheck-basics"
          className="whitespace-nowrap px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
        >
          View Paycheck Basics &rarr;
        </Link>
      </section>

      {/* Sourced FAQ Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions About Bi-Weekly Paychecks
        </h2>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3 space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visible Required Footer Disclosures */}
      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-semibold text-slate-800">
            {PAGE_UPDATE_INFO.taxYearLabel} • {PAGE_UPDATE_INFO.updatedLabel}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Bi-Weekly%20Paycheck%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Withholding Methodology:</strong> Federal withholding calculated using IRS Publication 15-T (2026) Worksheet 1A: annualize wages, subtract line 1g ($8,600 for single standard), apply the Annual Percentage Method Table, and divide by pay periods. FICA withholding based on SSA wage limits (6.2% Social Security up to $184,500; 1.45% Medicare). State formulas from official guides.
        </p>
        <p>
          Estimates only. Not tax advice. This independent tool is not affiliated with or endorsed by any government agency.
        </p>
      </div>
    </div>
  );
}
