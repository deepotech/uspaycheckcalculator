import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency } from "@/lib/tax/formatters";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Weekly Paycheck Calculator 2026 | 52 Pay Periods Take-Home Pay",
  description:
    "Estimate your weekly paycheck withholding and net pay for tax year 2026 across 52 annual pay periods using IRS Pub 15-T Worksheet 1A percentage method withholding.",
  alternates: {
    canonical: "/weekly-paycheck-calculator",
  },
  openGraph: {
    title: "Weekly Paycheck Calculator 2026 | 52 Pay Periods Take-Home Pay",
    description:
      "Estimate your weekly paycheck withholding and net pay for tax year 2026 across 52 annual pay periods using IRS Pub 15-T Worksheet 1A percentage method withholding.",
    url: "/weekly-paycheck-calculator",
    type: "website",
  },
};

export default function WeeklyPaycheckPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Weekly Paycheck Calculator" },
  ];

  // Programmatically compute a $52,000 annual salary example ($1,000 gross per week)
  const annualSalary = 52000;
  const weeklyGross = annualSalary / 52; // $1,000.00

  const vaExample = calculatePaycheck({
    payType: "salary",
    grossAmount: annualSalary,
    frequency: "weekly",
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
    frequency: "weekly",
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
      q: "How many pay periods are in a weekly payroll year?",
      a: "A weekly pay cycle contains 52 pay periods in a standard calendar year, with one paycheck issued every 7 days (52 weeks = 52 paychecks).",
    },
    {
      q: "How is weekly gross pay calculated from an annual salary?",
      a: "Weekly gross pay is calculated by dividing the total annual salary by 52. For instance, an annual salary of $52,000 divided by 52 equals exactly $1,000.00 in gross pay per weekly paycheck ($52,000 ÷ 52 = $1,000.00).",
    },
    {
      q: "How are Social Security and Medicare taxes calculated on weekly wages?",
      a: "For every weekly paycheck, Social Security tax is withheld at a rate of 6.2% of gross earnings up to the annual limit of $184,500. Medicare tax is withheld at 1.45% of gross earnings without an annual limit. On a $1,000 weekly gross wage, Social Security is $62.00 and Medicare is $14.50.",
    },
    {
      q: "How does IRS Publication 15-T calculate federal income tax on weekly pay?",
      a: "Federal withholding is calculated using IRS Publication 15-T Worksheet 1A: annualize wages (multiply weekly gross by 52), subtract line 1g ($8,600 for single standard W-4), apply the Annual Percentage Method Table, and divide the resulting annual tax by 52 pay periods.",
    },
    {
      q: "Can I estimate weekly state tax withholding for Virginia and Pennsylvania?",
      a: "Yes. Use the state selector to estimate state withholding. For Virginia, the calculator applies the annual formula divided by 52 weeks. For Pennsylvania, it applies the flat 3.07% PIT rate and 0.07% employee UC to each weekly paycheck.",
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
          <span>Weekly Pay Frequency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Weekly Paycheck Calculator (2026)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Calculate your weekly take-home pay across 52 annual payroll periods. Based on 2026 IRS Publication 15-T Worksheet 1A annual percentage method tables, statutory FICA tax caps, and state formulas.
        </p>
      </div>

      {/* Embedded PaycheckCalculator pre-configured for weekly */}
      <PaycheckCalculator
        initialFrequency="weekly"
        initialGrossAmount={52000}
        initialStateCode="FEDERAL_ONLY"
      />

      {/* Sourced Explanatory Content on Weekly Payroll */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Understanding the Weekly Pay Schedule (52 Pay Periods)
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            On a weekly payroll calendar, employees receive compensation every seven days, resulting in <strong>52 pay periods per year</strong>. For salaried personnel, weekly gross pay is determined by dividing the annual salary by 52:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900">
            Weekly Gross Pay = Annual Gross Salary ÷ 52
          </div>
          <p>
            Every weekly check is subjected to statutory federal and state payroll withholdings:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>
              <strong>Federal Income Tax (FIT):</strong> Calculated using IRS Publication 15-T Worksheet 1A: annualize wages, subtract line 1g ($8,600 for single standard), apply the Annual Percentage Method Table, and divide by 52 pay periods.
            </li>
            <li>
              <strong>Social Security Withholding:</strong> Withheld at 6.2% on weekly gross compensation until cumulative earnings reach the 2026 wage base limit of $184,500 (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>Medicare Withholding:</strong> Withheld at 1.45% on all covered wages without an annual earnings limit (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>State Income Withholding:</strong> Sourced directly from published state employer guides. Virginia divides its annual formula over 52 periods, while Pennsylvania applies 3.07% PIT and 0.07% employee UC directly to weekly gross wages.
            </li>
          </ul>
        </div>
      </section>

      {/* Computed Worked Example */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Computed Worked Example: $52,000 Salary on Weekly Pay Schedule
        </h2>
        <p className="text-xs text-slate-500">
          Example calculation for a $52,000 annual salary paid weekly ($1,000.00 gross per paycheck). Tax year 2026, Single filer, standard Form W-4:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Virginia Weekly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Virginia Withholding</span>
              <span className="text-[11px] text-slate-500">Form VA-4 (1 Exemption)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($52,000 ÷ 52):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(weeklyGross)}</span>
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
              <span>Weekly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(vaExample.netPay)}</span>
            </div>
          </div>

          {/* Pennsylvania Weekly Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Pennsylvania Withholding</span>
              <span className="text-[11px] text-slate-500">PA REV-415 (3.07% PIT + 0.07% UC)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay ($52,000 ÷ 52):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(weeklyGross)}</span>
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
              <span>Weekly Net Take-Home:</span>
              <span className="text-emerald-700">{formatCurrency(paExample.netPay)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* General Basics Callout */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Compare Payroll Schedules
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            See our <Link href="/paycheck-basics" className="font-semibold text-emerald-700 underline hover:text-emerald-800">Paycheck Basics Guide</Link> for side-by-side mathematical comparisons of weekly, bi-weekly, and semi-monthly pay periods.
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
          Frequently Asked Questions About Weekly Paychecks
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
            href={`mailto:${CONTACT_EMAIL}?subject=Weekly%20Paycheck%20Calculator%20Error%20Report`}
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
