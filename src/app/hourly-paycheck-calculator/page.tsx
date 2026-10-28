import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency } from "@/lib/tax/formatters";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hourly Paycheck Calculator 2026 | Hourly Take-Home Pay & Taxes",
  description:
    "Calculate your net take-home pay for hourly wages in 2026. Computes federal income tax withholding via IRS Pub 15-T, Social Security, and Medicare.",
  alternates: {
    canonical: "/hourly-paycheck-calculator",
  },
  openGraph: {
    title: "Hourly Paycheck Calculator 2026 | Hourly Take-Home Pay & Taxes",
    description:
      "Calculate your net take-home pay for hourly wages in 2026. Computes federal income tax withholding via IRS Pub 15-T, Social Security, and Medicare.",
    url: "/hourly-paycheck-calculator",
    type: "website",
  },
};

export default function HourlyPaycheckPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Hourly Paycheck Calculator" },
  ];

  // Programmatically compute a $25/hr worked example (bi-weekly, 80 hours = $2,000 gross)
  const hourlyRate = 25;
  const hoursPerPeriod = 80;
  const grossPay = hourlyRate * hoursPerPeriod; // $2,000

  const vaExample = calculatePaycheck({
    payType: "hourly",
    grossAmount: hourlyRate,
    hoursPerWeek: 40,
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
    payType: "hourly",
    grossAmount: hourlyRate,
    hoursPerWeek: 40,
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
      q: "How is gross pay determined for an hourly paycheck?",
      a: "Hourly gross pay is calculated by multiplying your agreed hourly rate by the number of hours worked during that payroll cycle. For example, working 80 hours across a two-week period at $25.00 per hour produces $2,000.00 in gross earnings (80 × $25.00 = $2,000.00).",
    },
    {
      q: "How many paychecks do hourly employees receive each year?",
      a: "The number of paychecks depends on your employer's pay schedule. On a weekly payroll schedule, employees receive 52 paychecks annually. On a bi-weekly schedule, employees receive 26 paychecks annually (once every two weeks).",
    },
    {
      q: "What mandatory payroll deductions apply to hourly wages?",
      a: "All covered hourly wages are subject to federal payroll taxes: Social Security tax of 6.2% up to the 2026 wage base limit of $184,500, Medicare tax of 1.45% with no annual limit, federal income tax withholding calculated via IRS Publication 15-T Worksheet 1A annual percentage method tables, and any applicable state or local income taxes.",
    },
    {
      q: "Can I use this calculator for both federal-only and state-specific hourly withholding?",
      a: "Yes. By default, the calculator estimates federal withholding and FICA deductions. You can select an active, verified state (such as Virginia or Pennsylvania) from the state selector to calculate exact state withholding and local taxes.",
    },
    {
      q: "What happens to Social Security tax if hourly earnings exceed $184,500?",
      a: "Social Security tax is capped at the 2026 statutory wage limit of $184,500 per year. Once your cumulative earnings within the calendar year reach $184,500, the 6.2% Social Security deduction stops for the remainder of that year. Medicare withholding continues on all earnings without a cap.",
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
          <span>IRS Pub 15-T Worksheet 1A</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hourly Paycheck Calculator (2026)
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate your net take-home pay from hourly earnings. Calculates federal income tax withholding using 2026 IRS Publication 15-T Worksheet 1A annual percentage method tables, statutory Social Security and Medicare taxes, and state withholding for verified states.
        </p>
      </div>

      {/* Embedded PaycheckCalculator pre-configured for hourly */}
      <PaycheckCalculator
        initialPayType="hourly"
        initialGrossAmount={30}
        initialStateCode="FEDERAL_ONLY"
      />

      {/* Sourced Explanatory Content on Hourly Payroll */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How Hourly Pay &amp; Payroll Withholding Work
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            An hourly employee is paid based on the exact number of hours worked during each payroll cycle. Hourly pay frequency is typically distributed either weekly (52 pay periods per year) or bi-weekly (26 pay periods per year). Gross pay for each period is calculated simply:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900">
            Hourly Gross Pay = Hourly Pay Rate × Hours Worked in Period
          </div>
          <p>
            From every paycheck, mandatory taxes are withheld according to federal and state tax codes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>
              <strong>Federal Income Tax Withholding:</strong> Computed using IRS Publication 15-T (2026) Worksheet 1A: annualize wages, subtract line 1g ($8,600 for single standard), apply the Annual Percentage Method Table, and divide by pay periods.
            </li>
            <li>
              <strong>Social Security (OASDI):</strong> 6.2% withheld on covered wages up to the 2026 annual wage base limit of $184,500. Wages above this statutory cap are not subject to the 6.2% deduction (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>Medicare (HI):</strong> 1.45% withheld on all covered wages without an annual dollar limit (Source: SSA Contribution and Benefit Base).
            </li>
            <li>
              <strong>State Income Tax:</strong> Determined by state-specific withholding formulas (for example, Virginia graduated rates from 2% to 5.75% or Pennsylvania flat 3.07% PIT plus 0.07% employee UC).
            </li>
          </ul>
        </div>
      </section>

      {/* Computed Worked Example */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Computed Worked Example: $25.00/Hour Bi-Weekly Paycheck
        </h2>
        <p className="text-xs text-slate-500">
          Example for an employee earning $25.00/hour working 40 hours per week on a bi-weekly payroll schedule (80 hours per period; gross pay = $2,000.00). Tax year 2026, Single filer, standard Form W-4:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Virginia Worked Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Virginia Withholding</span>
              <span className="text-[11px] text-slate-500">Form VA-4 (1 Exemption)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay (80 hrs × $25.00):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(grossPay)}</span>
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

          {/* Pennsylvania Worked Example */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">Pennsylvania Withholding</span>
              <span className="text-[11px] text-slate-500">PA REV-415 (3.07% PIT + 0.07% UC)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Gross Pay (80 hrs × $25.00):</span>
              <span className="font-semibold text-slate-900">{formatCurrency(grossPay)}</span>
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
            Learn More About Payroll Definitions
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Read our <Link href="/paycheck-basics" className="font-semibold text-emerald-700 underline hover:text-emerald-800">Paycheck Basics Guide</Link> for comprehensive explanations of gross versus net pay, pay frequency formulas, and 2026 FICA tax guidelines.
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
          Frequently Asked Questions About Hourly Paychecks
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
            href={`mailto:${CONTACT_EMAIL}?subject=Hourly%20Paycheck%20Calculator%20Error%20Report`}
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
