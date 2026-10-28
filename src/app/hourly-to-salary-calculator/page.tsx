import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PayConversionCalculator } from "@/components/calculator/PayConversionCalculator";
import { HourlySalaryComparisonTable } from "@/components/calculator/HourlySalaryComparisonTable";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hourly to Salary Calculator | Convert Hourly Wage to Annual Income",
  description:
    "Convert an hourly pay rate to annual, monthly, bi-weekly, and weekly gross income. Includes custom work hours per week, annual weeks, and unpaid days off.",
  alternates: {
    canonical: "/hourly-to-salary-calculator",
  },
  openGraph: {
    title: "Hourly to Salary Calculator | Convert Hourly Wage to Annual Income",
    description:
      "Convert an hourly pay rate to annual, monthly, bi-weekly, and weekly gross income. Includes custom work hours per week, annual weeks, and unpaid days off.",
    url: "/hourly-to-salary-calculator",
    type: "website",
  },
};

export default function HourlyToSalaryPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Hourly to Salary Calculator" },
  ];

  const faqs = [
    {
      q: "How do you convert an hourly wage into an annual gross salary?",
      a: "Multiply your hourly wage by the total number of hours worked in a year. In a standard full-time schedule of 40 hours per week across 52 weeks, an employee works 2,080 hours annually (40 × 52 = 2,080). For example, earning $25.00 per hour produces an annual gross salary of $52,000 (25 × 2,080 = 52,000).",
    },
    {
      q: "Why is the standard conversion factor 2,080 hours per year?",
      a: "A calendar year contains 52 weeks. If you work a regular schedule of 40 hours each week, multiplying 40 hours per week by 52 weeks yields exactly 2,080 working hours (40 × 52 = 2,080).",
    },
    {
      q: "How do unpaid days off affect the calculated annual salary?",
      a: "Unpaid days reduce the total paid working hours in the year. If you work 40 hours over 5 days each week, one workday equals 8 hours (40 ÷ 5 = 8). Each unpaid day off subtracts 8 hours from your annual total before multiplying by your hourly rate.",
    },
    {
      q: "How is monthly gross pay derived from an hourly pay rate?",
      a: "First calculate the annual gross pay by multiplying the hourly wage by annual hours (e.g., $25/hr × 2,080 hours = $52,000). Then divide that annual gross total by 12 calendar months ($52,000 ÷ 12 = $4,333.33 per month).",
    },
    {
      q: "What is the difference between bi-weekly gross pay and semi-monthly gross pay?",
      a: "Bi-weekly pay occurs 26 times per year (every two weeks), so bi-weekly gross equals annual salary divided by 26. Semi-monthly pay occurs 24 times per year (twice per month), so semi-monthly gross equals annual salary divided by 24.",
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
          Hourly to Salary Calculator
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Convert any hourly pay rate into its equivalent annual salary, monthly, semi-monthly, bi-weekly, weekly, and daily gross earnings. Customize weekly working hours, weeks per year, and unpaid days off to match your schedule.
        </p>
      </div>

      {/* Interactive Tool */}
      <PayConversionCalculator initialMode="hourly-to-salary" />

      {/* Explanatory Context: Understanding 40 x 52 = 2,080 Hours */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          The 2,080-Hour Annual Formula Explained
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            When converting an hourly pay rate to an annualized salary, standard payroll arithmetic uses a baseline of <strong>2,080 working hours</strong> per calendar year. This number is derived from the standard schedule of full-time work:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 space-y-1">
            <p><strong>Standard Full-Time Baseline:</strong> 40 hours per week × 52 weeks per year = 2,080 hours</p>
            <p><strong>Gross Annual Formula:</strong> Hourly Rate × 2,080 hours = Annual Gross Salary</p>
            <p><strong>Example at $25.00/hr:</strong> $25.00 × 2,080 = $52,000.00 Annual Gross</p>
          </div>
          <p>
            If you take unpaid days off during the year, your total compensated hours decrease. For a 40-hour work week divided over 5 working days, each unpaid day equals 8 working hours (40 ÷ 5 = 8). If an employee takes 10 unpaid days off, their total working hours decrease by 80 hours (10 × 8 = 80), leaving 2,000 compensated hours (2,080 - 80 = 2,000). At $25.00 per hour, the resulting annual gross is $50,000.00 ($25 × 2,000 = $50,000).
          </p>
        </div>
      </section>

      {/* Computed Table ($15 to $50) with Take-Home Examples */}
      <HourlySalaryComparisonTable />

      {/* Related Paycheck Calculators Navigation */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Explore Paycheck &amp; Pay Period Calculators
        </h2>
        <p className="text-xs text-slate-600">
          Need to estimate net take-home pay with federal withholding and state payroll taxes? Explore our frequency-specific calculators:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/hourly-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Hourly Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/salary-to-hourly-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Salary to Hourly Calculator &rarr;
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
          Frequently Asked Questions About Hourly to Salary Conversion
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
            href={`mailto:${CONTACT_EMAIL}?subject=Hourly%20to%20Salary%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Arithmetic Methodology:</strong> Standard payroll arithmetic based on 40 hours per week and 52 weeks per year (2,080 annual hours). Take-home calculations use IRS Publication 15-T (2026) percentage method tables and state formulas.
        </p>
        <p>
          Estimates only. Not tax advice. This independent tool is not affiliated with or endorsed by any government agency.
        </p>
      </div>
    </div>
  );
}
