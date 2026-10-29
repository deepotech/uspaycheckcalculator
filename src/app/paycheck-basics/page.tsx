import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PAGE_UPDATE_INFO, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Paycheck Basics Guide: Gross vs Net Pay, Pay Frequency & FICA",
  description:
    "Understand how US paychecks work: definitions of gross vs net pay, payroll frequencies (bi-weekly vs semi-monthly), and 2026 statutory FICA tax rates.",
  alternates: {
    canonical: "/paycheck-basics",
  },
  openGraph: {
    title: "Paycheck Basics Guide: Gross vs Net Pay, Pay Frequency & FICA",
    description:
      "Understand how US paychecks work: definitions of gross vs net pay, payroll frequencies (bi-weekly vs semi-monthly), and 2026 statutory FICA tax rates.",
    url: "/paycheck-basics",
    type: "website",
  },
};

export default function PaycheckBasicsPage() {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators", href: "/paycheck-calculator-by-state" },
    { name: "Paycheck Basics" },
  ];

  const faqs = [
    {
      q: "What is the difference between gross pay and net pay?",
      a: "Gross pay is the total compensation earned before any taxes, payroll withholdings, or voluntary deductions are taken out. Net pay (take-home pay) is the remaining amount of compensation received by the employee after all federal, state, and local taxes, mandatory payroll contributions, and elective deductions have been subtracted.",
    },
    {
      q: "What is pay frequency?",
      a: "Pay frequency refers to the recurring schedule upon which an employer distributes wages to employees, such as weekly (52 periods), bi-weekly (26 periods), semi-monthly (24 periods), or monthly (12 periods).",
    },
    {
      q: "What is the difference between bi-weekly and semi-monthly pay?",
      a: "Bi-weekly pay occurs once every two weeks, resulting in 26 paychecks over a calendar year. Semi-monthly pay occurs twice per month (for example, on the 15th and the last day of the month), resulting in 24 paychecks per year. Because annual salary is divided across fewer checks, each semi-monthly paycheck is larger than a bi-weekly paycheck for the same annual salary.",
    },
    {
      q: "What is FICA and what tax rates are withheld from employee paychecks?",
      a: "FICA stands for the Federal Insurance Contributions Act. It consists of two mandatory taxes: Social Security tax at 6.2% on wages up to $184,500, and Medicare tax at 1.45% on all covered wages without an annual cap (Source: SSA Contribution and Benefit Base).",
    },
    {
      q: "What is the 2026 Social Security wage base limit?",
      a: "For tax year 2026, the Social Security wage base limit is $184,500. Wages earned above this statutory threshold in a calendar year are no longer subject to the 6.2% employee Social Security withholding (Source: SSA Contribution and Benefit Base).",
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
          <span>Payroll Fundamentals Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Paycheck Basics: Gross vs. Net Pay, Pay Schedules &amp; FICA Taxes
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          A clear, factual overview of core payroll concepts: understanding gross versus net compensation, the mathematical structure of recurring pay schedules, and statutory FICA withholding rates.
        </p>
      </div>

      {/* 1. Gross Pay vs. Net Pay */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Gross Pay vs. Net Pay
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            Understanding your compensation starts with distinguishing between gross earnings and net take-home pay:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Gross Pay
              </span>
              <p className="text-sm font-semibold text-slate-900">Total Compensation Before Deductions</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gross pay is the full amount of agreed compensation earned before any taxes, statutory payroll withholdings, or elective benefit contributions are subtracted. For salaried workers, this is your annualized pay divided by your pay periods. For hourly workers, this is your hourly wage multiplied by total hours worked.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Net Pay (Take-Home Pay)
              </span>
              <p className="text-sm font-semibold text-slate-900">Remaining Amount Distributed to Employee</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Net pay is the actual cash compensation delivered to the employee (via direct deposit or check) after all federal, state, and local income taxes, mandatory FICA contributions, and voluntary pre-tax or post-tax deductions are subtracted.
              </p>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg font-mono text-xs text-slate-900">
            Net Pay = Gross Pay - (Federal Income Tax + Social Security + Medicare + State/Local Taxes + Elective Deductions)
          </div>
        </div>
      </section>

      {/* 2. Common Pay Frequencies */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pay Frequencies &amp; Annual Pay Periods
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            Pay frequency defines the recurring timetable on which an employer distributes wages. The annual number of pay periods directly governs how much gross pay is included in each individual paycheck:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Weekly</span>
              <p className="text-lg font-extrabold text-slate-900">52 Pay Periods</p>
              <p className="text-xs text-slate-600">Paid once every 7 days (52 paychecks per year). Gross pay per period = Annual Salary ÷ 52.</p>
              <Link href="/weekly-paycheck-calculator" className="text-xs font-semibold text-emerald-700 hover:underline block pt-2">
                Weekly Calculator &rarr;
              </Link>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Bi-Weekly</span>
              <p className="text-lg font-extrabold text-slate-900">26 Pay Periods</p>
              <p className="text-xs text-slate-600">Paid once every 14 days (26 paychecks per year). Gross pay per period = Annual Salary ÷ 26.</p>
              <Link href="/bi-weekly-paycheck-calculator" className="text-xs font-semibold text-emerald-700 hover:underline block pt-2">
                Bi-Weekly Calculator &rarr;
              </Link>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Semi-Monthly</span>
              <p className="text-lg font-extrabold text-slate-900">24 Pay Periods</p>
              <p className="text-xs text-slate-600">Paid twice per month (24 paychecks per year, e.g., 15th and end of month). Gross pay = Annual Salary ÷ 24.</p>
              <Link href="/hourly-to-salary-calculator" className="text-xs font-semibold text-emerald-700 hover:underline block pt-2">
                Conversion Tool &rarr;
              </Link>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Monthly</span>
              <p className="text-lg font-extrabold text-slate-900">12 Pay Periods</p>
              <p className="text-xs text-slate-600">Paid once per calendar month (12 paychecks per year). Gross pay per period = Annual Salary ÷ 12.</p>
              <Link href="/monthly-paycheck-calculator" className="text-xs font-semibold text-emerald-700 hover:underline block pt-2">
                Monthly Calculator &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bi-Weekly vs. Semi-Monthly Mathematical Breakdown */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Bi-Weekly vs. Semi-Monthly: The Arithmetic Difference
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            While bi-weekly and semi-monthly schedules both result in pay arriving approximately twice each month, they differ mathematically in period count and paycheck amount:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Feature</th>
                  <th className="py-2.5 px-3">Bi-Weekly Schedule</th>
                  <th className="py-2.5 px-3">Semi-Monthly Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Paychecks per Year</td>
                  <td className="py-2 px-3">26 pay periods (52 weeks ÷ 2)</td>
                  <td className="py-2 px-3">24 pay periods (12 months × 2)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Payment Schedule</td>
                  <td className="py-2 px-3">Every 14 days (e.g., every other Friday)</td>
                  <td className="py-2 px-3">Specific calendar dates (e.g., 15th &amp; last day)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Three-Paycheck Months</td>
                  <td className="py-2 px-3">Typically 2 months per year contain 3 paychecks (and 10 months contain 2 paychecks)</td>
                  <td className="py-2 px-3">0 months (always 2 paychecks/mo)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Gross at $60,000 Salary</td>
                  <td className="py-2 px-3 font-mono font-medium text-emerald-800">$2,307.69 per paycheck ($60k ÷ 26)</td>
                  <td className="py-2 px-3 font-mono font-medium text-emerald-800">$2,500.00 per paycheck ($60k ÷ 24)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">
            Because a semi-monthly schedule divides annual earnings into 24 installments instead of 26, each semi-monthly check is approximately 8.33% larger than a bi-weekly check for the identical salary.
          </p>
        </div>
      </section>

      {/* 4. Sourced FICA Explanation */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Understanding FICA Payroll Taxes (Social Security &amp; Medicare)
        </h2>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p>
            The Federal Insurance Contributions Act (FICA) mandates payroll tax withholding from employee wages to finance Social Security and Medicare. These statutory contributions are governed by federal law and published by the Social Security Administration:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-900 text-sm">Social Security (OASDI)</span>
              <p className="text-slate-700">
                <strong>Employee Withholding Rate:</strong> 6.2% of covered gross wages.
              </p>
              <p className="text-slate-700">
                <strong>2026 Wage Base Limit:</strong> $184,500.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Wages up to $184,500 in the calendar year are subject to the 6.2% employee tax. Any wages earned above $184,500 within the same calendar year are exempt from further Social Security employee deductions. Employers pay an equal matching 6.2% contribution. Source: Social Security Administration, Contribution and Benefit Base (2026).
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-bold text-slate-900 text-sm">Medicare (HI)</span>
              <p className="text-slate-700">
                <strong>Employee Withholding Rate:</strong> 1.45% of all covered wages.
              </p>
              <p className="text-slate-700">
                <strong>Annual Wage Limit:</strong> None (unlimited).
              </p>
              <p className="text-slate-600 leading-relaxed">
                The 1.45% Medicare tax applies to all covered earnings without an annual dollar cap. Employers pay an equal matching 1.45% base Medicare contribution. Source: Social Security Administration, Contribution and Benefit Base (2026); IRS Pub 15-T.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Navigation to Calculators */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Try Our Paycheck &amp; Conversion Calculators
        </h2>
        <p className="text-xs text-slate-600">
          Estimate your take-home pay using federal and state withholding models:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/hourly-to-salary-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Hourly to Salary Calculator &rarr;
          </Link>
          <Link
            href="/salary-to-hourly-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Salary to Hourly Calculator &rarr;
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
            href="/virginia-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Virginia Paycheck Calculator &rarr;
          </Link>
          <Link
            href="/pennsylvania-paycheck-calculator"
            className="px-3 py-1.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
          >
            Pennsylvania Paycheck Calculator &rarr;
          </Link>
        </div>
      </section>

      {/* Sourced FAQ Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions About Paycheck Basics
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
            href={`mailto:${CONTACT_EMAIL}?subject=Paycheck%20Basics%20Guide%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Sources:</strong> Social Security Administration, Contribution and Benefit Base (2026); IRS Publication 15-T (2026), Employer&apos;s Tax Guide.
        </p>
        <p>
          Estimates only. Not tax advice. This independent informational guide is not affiliated with or endorsed by any government agency.
        </p>
      </div>
    </div>
  );
}
