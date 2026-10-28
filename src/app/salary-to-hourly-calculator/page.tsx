import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PayConversionCalculator } from "@/components/calculator/PayConversionCalculator";
import { HourlySalaryComparisonTable } from "@/components/calculator/HourlySalaryComparisonTable";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Salary to Hourly Calculator | Convert Annual Salary to Hourly Wage",
  description:
    "Convert an annual salary into equivalent hourly, daily, weekly, bi-weekly, and monthly gross wages based on work hours, weeks per year, and unpaid days off.",
  alternates: {
    canonical: "/salary-to-hourly-calculator",
  },
  openGraph: {
    title: "Salary to Hourly Calculator | Convert Annual Salary to Hourly Wage",
    description:
      "Convert an annual salary into equivalent hourly, daily, weekly, bi-weekly, and monthly gross wages based on work hours, weeks per year, and unpaid days off.",
    url: "/salary-to-hourly-calculator",
    type: "website",
  },
};

export default function SalaryToHourlyPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Salary to Hourly Calculator" },
  ];

  const faqs = [
    {
      q: "How do you calculate an hourly wage from an annual salary?",
      a: "Divide the total annual salary by the number of compensated working hours in the year. For a standard 40-hour workweek across 52 weeks, the annual working hours total 2,080 (40 × 52 = 2,080). For an annual salary of $52,000, dividing by 2,080 yields an equivalent hourly wage of $25.00 per hour ($52,000 ÷ 2,080 = $25.00).",
    },
    {
      q: "What is the formula for converting a salary to an hourly rate with unpaid time off?",
      a: "First determine the net working hours: multiply weeks worked per year by hours per week, then subtract unpaid hours (unpaid days × daily hours). Finally, divide the annual salary by the net working hours. For instance, a $52,000 salary with 2,000 net working hours equals $26.00 per hour ($52,000 ÷ 2,000 = $26.00).",
    },
    {
      q: "How does annual salary translate to daily and weekly earnings?",
      a: "Weekly gross pay equals annual salary divided by 52 weeks ($52,000 ÷ 52 = $1,000.00/week). Daily gross pay equals the weekly gross pay divided by the 5 working days in a week ($1,000 ÷ 5 = $200.00/day).",
    },
    {
      q: "Why do bi-weekly and semi-monthly pay calculations produce different amounts for the same annual salary?",
      a: "Bi-weekly pay occurs 26 times per year (once every two weeks), so each paycheck is Annual Salary ÷ 26. Semi-monthly pay occurs 24 times per year (twice per month), so each paycheck is Annual Salary ÷ 24. Because there are fewer pay periods in a semi-monthly schedule, each individual semi-monthly check is larger than a bi-weekly check.",
    },
    {
      q: "Does this salary-to-hourly calculator deduct federal or state taxes?",
      a: "No, this conversion tool calculates gross pay before any payroll deductions or taxes. To calculate net take-home pay after federal income tax, Social Security, Medicare, and state withholding, use our dedicated paycheck calculators.",
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
          <span>Pay Conversion Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Salary to Hourly Calculator
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Convert an annual fixed salary into its exact hourly wage rate, daily rate, weekly, bi-weekly, semi-monthly, and monthly gross earnings. Adjust weekly hours, annual working weeks, and unpaid time off to view precise compensation figures.
        </p>
      </div>

      {/* Interactive Tool */}
      <PayConversionCalculator initialMode="salary-to-hourly" />

      {/* Arithmetic Explanation Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How to Convert an Annual Salary to an Hourly Wage
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            To convert an annual salary to an hourly wage rate, divide the gross salary by the total compensated hours in the year. The mathematical baseline for full-time work consists of 40 hours per week across 52 weeks in a calendar year, giving exactly <strong>2,080 hours</strong>:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 space-y-1">
            <p><strong>Full-Time Hours Formula:</strong> 40 hours/week × 52 weeks/year = 2,080 hours/year</p>
            <p><strong>Hourly Wage Formula:</strong> Annual Salary ÷ 2,080 hours = Hourly Rate</p>
            <p><strong>Example ($52,000 Salary):</strong> $52,000 ÷ 2,080 = $25.00 / hour</p>
          </div>
          <p>
            When an employee has unpaid days off, the number of actual working hours is reduced. For example, 10 unpaid days off in a standard 8-hour workday schedule removes 80 hours (10 × 8 = 80). The remaining annual working hours are 2,000 (2,080 - 80 = 2,000). Dividing the same $52,000 salary by 2,000 hours results in an equivalent hourly rate of $26.00 per hour worked ($52,000 ÷ 2,000 = $26.00).
          </p>
        </div>
      </section>

      {/* Computed Table ($15 to $50) with Take-Home Examples */}
      <HourlySalaryComparisonTable />

      {/* Related Navigation */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Related Paycheck &amp; Period Calculators
        </h2>
        <p className="text-xs text-slate-600">
          Explore calculators configured for specific payroll frequencies and state tax withholding:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/hourly-to-salary-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Hourly to Salary Calculator &rarr;
          </Link>
          <Link
            href="/hourly-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Hourly Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/weekly-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Weekly Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/bi-weekly-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Bi-Weekly Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/monthly-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Monthly Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/paycheck-basics"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Paycheck Basics Guide &rarr;
          </Link>
        </div>
      </section>

      {/* Sourced FAQ Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions About Salary to Hourly Conversion
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
            href={`mailto:${CONTACT_EMAIL}?subject=Salary%20to%20Hourly%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Arithmetic Methodology:</strong> Arithmetic based on 40 hours per week and 52 weeks per year (2,080 annual hours). Take-home calculations use IRS Publication 15-T (2026) percentage method tables and state formulas.
        </p>
        <p>
          Estimates only. Not tax advice. This independent tool is not affiliated with or endorsed by any government agency.
        </p>
      </div>
    </div>
  );
}
