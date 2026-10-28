import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency } from "@/lib/tax/formatters";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Monthly Paycheck Calculator 2026 | 12 Pay Periods Take-Home Pay",
  description:
    "Calculate your monthly net pay for 2026 across 12 calendar pay periods using IRS Pub 15-T Worksheet 1A percentage method withholding, Social Security, and Medicare.",
  alternates: {
    canonical: "/monthly-paycheck-calculator",
  },
  openGraph: {
    title: "Monthly Paycheck Calculator 2026 | 12 Pay Periods Take-Home Pay",
    description:
      "Calculate your monthly net pay for 2026 across 12 calendar pay periods using IRS Pub 15-T Worksheet 1A percentage method withholding, Social Security, and Medicare.",
    url: "/monthly-paycheck-calculator",
    type: "website",
  },
};

export default function MonthlyPaycheckPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Monthly Paycheck Calculator" },
  ];

  // Programmatically compute a $60,000 annual salary example ($5,000 gross monthly)
  const annualSalary = 60000;
  const monthlyGross = annualSalary / 12; // $5,000.00

  const vaExample = calculatePaycheck({
    payType: "salary",
    grossAmount: annualSalary,
    frequency: "monthly",
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
    frequency: "monthly",
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
      q: "How many pay periods occur under a monthly payroll schedule?",
      a: "A monthly pay schedule consists of exactly 12 pay periods per year, with compensation distributed once per calendar month (usually on the last working day of the month or a designated calendar date).",
    },
    {
      q: "How do you calculate monthly gross earnings from an annual salary?",
      a: "Monthly gross pay is determined by dividing the annual salary by 12. For example, an employee with a $60,000 salary earns $5,000.00 in gross pay each month ($60,000 ÷ 12 = $5,000.00).",
    },
    {
      q: "How are FICA deductions computed for a monthly paycheck?",
      a: "Social Security tax is 6.2% of gross earnings up to the annual limit of $184,500. Medicare tax is 1.45% of all gross earnings without an annual limit. On a $5,000 monthly gross paycheck, Social Security tax is $310.00 and Medicare tax is $72.50, totaling $382.50 in FICA deductions.",
    },
    {
      q: "Why do monthly paychecks show higher tax withholding than bi-weekly checks?",
      a: "Because a monthly paycheck covers an entire calendar month (approximately 4.33 weeks), the gross dollar amount is more than double a bi-weekly check (2 weeks). IRS Publication 15-T Worksheet 1A annualizes monthly gross, applies the annual percentage method table, and divides by 12 periods, so the withholding amounts are proportional to the larger gross payment.",
    },
    {
      q: "How does IRS Publication 15-T calculate monthly federal withholding?",
      a: "Federal withholding is calculated using IRS Publication 15-T Worksheet 1A: annualize wages (multiply monthly gross by 12), subtract line 1g ($8,600 for single standard W-4), apply the Annual Percentage Method Table, and divide the resulting annual tax by 12 pay periods.",
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
          <span>Monthly Pay Frequency (12 Periods)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Monthly Paycheck Calculator (2026)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate take-home pay for monthly salaries across 12 annual calendar pay periods. Features official 2026 IRS Publication 15-T Worksheet 1A annual percentage withholding tables, statutory FICA caps, and state tax calculations.
        </p>
      </div>

      {/* Embedded PaycheckCalculator pre-configured for monthly */}
      <PaycheckCalculator
        initialFrequency="monthly"
        initialGrossAmount={60000}
        initialStateCode="FEDERAL_ONLY"
      />

      {/* Sourced Explanatory Content on Monthly Payroll */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Understanding the 12-Period Monthly Pay Schedule
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            Under a monthly payroll schedule, employees receive <strong>12 paychecks per year</strong>, distributed once per calendar month. Monthly gross compensation is computed by dividing the total annual salary by 12:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900">
            Monthly Gross Pay = Annual Gross Salary ÷ 12
          </div>
          <p>
            Each monthly paycheck is subject to statutory payroll tax deductions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>
              <strong>Federal Income Tax (Pub 15-T):</strong> Calculated using IRS Publication 15-T Worksheet 1A: annualize wages, subtract line 1g ($8,600 for single standard), apply the Annual Percentage Method Table, and divide by 12 pay periods.
            </li>
            <li>
              <strong>Social Security Withholding:</strong> Withheld at 6.2% on monthly wages up to the 2026 annual limit of $184,500 (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>Medicare Withholding:</strong> Withheld at 1.45% on all covered wages without an annual wage cap (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>State Income Tax Withholding:</strong> Calculated according to state formulas. Virginia applies its graduated brackets divided across 12 monthly periods; Pennsylvania deducts a flat 3.07% PIT and 0.07% employee UC from monthly gross compensation.
            </li>
          </ul>
        </div>
      </section>

      {/* Computed Worked Example */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Computed Worked Example: $60,000 Annual Salary Paid Monthly
        </h2>
        <p className="text-xs text-slate-500">
          Example calculation for a $60,000 annual salary paid across 12 monthly periods ($5,000.00 gross per paycheck). Tax year 2026, Single filer, standard Form W-4:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Virginia Monthly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Virginia Withholding</span>
              <span className="text-[11px] text-slate-500">Form VA-4 (1 Exemption)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($60,000 ÷ 12):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(monthlyGross)}</span>
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
              <span>Monthly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(vaExample.netPay)}</span>
            </div>
          </div>

          {/* Pennsylvania Monthly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Pennsylvania Withholding</span>
              <span className="text-[11px] text-slate-500">PA REV-415 (3.07% PIT + 0.07% UC)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($60,000 ÷ 12):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(monthlyGross)}</span>
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
              <span>Monthly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(paExample.netPay)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* General Basics Callout */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Compare Monthly vs. Bi-Weekly Pay
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            See our <Link href="/paycheck-basics" className="font-semibold text-emerald-700 underline hover:text-emerald-800">Paycheck Basics Guide</Link> for detailed comparisons of payroll periods and deductions.
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
          Frequently Asked Questions About Monthly Paychecks
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
            href={`mailto:${CONTACT_EMAIL}?subject=Monthly%20Paycheck%20Calculator%20Error%20Report`}
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
