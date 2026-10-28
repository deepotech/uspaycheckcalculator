import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency, formatPercent } from "@/lib/tax/formatters";
import virginiaData from "@/data/states/virginia.json";
import statesMetaData from "@/data/states-meta.json";
import { CONTACT_EMAIL, PAGE_UPDATE_INFO } from "@/lib/site";
import { getSalaryPagesForState } from "@/lib/salaryPages";

export const metadata: Metadata = {
  title: "Virginia Paycheck Calculator 2026 | VA Take-Home Pay & Withholding",
  description:
    "Calculate your take-home pay in Virginia for tax year 2026. Based on the formula published in Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), Form VA-4 exemptions, and tax brackets.",
  alternates: {
    canonical: "/virginia-paycheck-calculator",
  },
  openGraph: {
    title: "Virginia Paycheck Calculator 2026 | VA Take-Home Pay & Withholding",
    description:
      "Calculate your take-home pay in Virginia for tax year 2026. Based on the formula published in Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), Form VA-4 exemptions, and tax brackets.",
    url: "/virginia-paycheck-calculator",
    type: "website",
  },
};

export default function VirginiaPaycheckPage() {
  const meta = statesMetaData.find((s) => s.stateCode === "VA")!;

  // Gating: In production, route must return 404 if not verified and active
  if (process.env.NODE_ENV !== "test" && !(meta.verified && meta.isActive)) {
    notFound();
  }

  const otherActiveStates = statesMetaData.filter(
    (s) => s.stateCode !== meta.stateCode && s.verified && s.isActive
  );

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators by State", href: "/paycheck-calculator-by-state" },
    { name: "Virginia" },
  ];

  // Programmatically generate worked examples at $50k, $75k, and $100k
  const exampleSalaries = [50000, 75000, 100000];
  const workedExamples = exampleSalaries.map((salary) => {
    const biweekly = calculatePaycheck({
      payType: "salary",
      grossAmount: salary,
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

    const monthly = calculatePaycheck({
      payType: "salary",
      grossAmount: salary,
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

    return {
      salary,
      biweekly,
      monthly,
    };
  });

  const faqs = [
    {
      q: "How is Virginia state income tax withheld from wages?",
      a: "Virginia withholding is calculated by annualizing your gross pay, subtracting the flat $8,750 standard deduction and your personal exemption allowances ($930 per personal exemption and $800 per age 65+ or blind exemption), and applying Virginia's graduated brackets (2%, 3%, 5%, and 5.75%). The annual tax is rounded to the nearest dollar and divided by your pay periods. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 21–22.",
    },
    {
      q: "Is the Virginia standard deduction increase permanent?",
      a: "No. Under current Virginia law, the $8,750 withholding standard deduction ($17,500 on annual joint returns) is scheduled to sunset after taxable year 2026, reverting to $3,000 for single filers and $6,000 for married couples. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 5 and 21.",
    },
    {
      q: "How are bonuses and supplemental pay taxed for Virginia withholding?",
      a: "If a bonus or vacation pay is included with a regular wage payment, it is added to the gross wages for that pay period and withheld using the tables or formula. If a supplemental payment is made separately, the employer computes the tax on regular plus supplemental wages and subtracts the tax computed on regular wages alone; alternatively, if Virginia tax has already been withheld from the employee's regular wages, the employer may use a flat 5.75% rate without exemptions. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 19–20.",
    },
    {
      q: "How does Virginia tax employees who live in another state?",
      a: "Virginia has reciprocity agreements with Kentucky, the District of Columbia, Maryland, West Virginia and Pennsylvania. Residents of Kentucky and the District of Columbia are not subject to Virginia withholding on wages if they commute daily to their place of employment in Virginia. Residents of Maryland, West Virginia and Pennsylvania are not subject to Virginia withholding if they maintain a legal domicile in their home state and live in Virginia less than 183 days of the taxable year (or do not live in Virginia at all), their only Virginia source income is wages or salaries, and that income is taxed by their state of residence. A qualifying employee indicates this on Form VA-4 filed with the employer. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 12.",
    },
    {
      q: "What is Form VA-4 and what happens if an employee does not file it?",
      a: "Form VA-4 is the Virginia Employee's Withholding Exemption Certificate, used by employees to declare personal and age/blind exemptions. If an employee fails to file Form VA-4, the employer is required to withhold Virginia income tax as if the employee had claimed zero exemptions. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 13.",
    },
    {
      q: "Who qualifies for an exemption from Virginia withholding?",
      a: "An employee may claim complete exemption from Virginia income tax withholding on Form VA-4 (line 3) if they meet one of the qualifying conditions: they incurred no Virginia tax liability last year and expect none this year; their expected Virginia adjusted gross income is below $11,950 (single), $23,900 (married), or $11,950 (married filing separately); they commute daily from Kentucky or DC; or they are legally domiciled in Maryland, Pennsylvania or West Virginia with only Virginia wages taxed by the home state. A new exemption certificate must be filed each year. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 14; Form VA-4 (Rev. 04/26), line 3 instructions.",
    },
    {
      q: "Can an employee request extra Virginia tax withholding?",
      a: "Yes. An employee may request that an additional dollar amount of Virginia income tax be withheld from each paycheck by entering into an agreement with the employer and specifying the amount on Form VA-4. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 14.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a,
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

      <AdPlaceholder slotId="ad-va-top" format="horizontal-banner" className="mb-4" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
          <span>•</span>
          <span>Form VA-4 &amp; Employer Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Virginia Paycheck Calculator 2026
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate your net take-home pay in the Commonwealth of Virginia. Based on the formula published in Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), personal exemption values, and tax brackets.
        </p>
      </div>

      {/* Quick Facts Box */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Virginia 2026 Paycheck Quick Facts
          </h2>
          <p className="text-xs text-slate-500">
            Key state and federal withholding values for tax year 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">State Tax Rate Range</span>
            <p className="text-sm font-bold text-slate-900">2% to 5.75%</p>
            <p className="text-slate-600 text-[11px]">
              Graduated brackets from 2% up to 5.75% on taxable wages over $17,000. Source: Guide page 21.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Standard Deduction in Formula</span>
            <p className="text-sm font-bold text-slate-900">$8,750 Flat Deduction</p>
            <p className="text-slate-600 text-[11px]">
              Flat $8,750 standard deduction in the withholding formula across all filing statuses. Source: Guide page 21.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Form VA-4 Exemptions</span>
            <p className="text-sm font-bold text-slate-900">$930 / $800</p>
            <p className="text-slate-600 text-[11px]">
              $930 per personal exemption (E1) and $800 per age 65+ or blind exemption (E2). Source: Guide page 21.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Statutory Sunset Note</span>
            <p className="text-sm font-bold text-amber-800">Sunsets After Tax Year 2026</p>
            <p className="text-slate-600 text-[11px]">
              The $8,750 withholding standard deduction ($17,500 joint) reverts to $3,000 / $6,000 after 2026 under current law. Source: Guide pages 5 and 21.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Federal Social Security (2026)</span>
            <p className="text-sm font-bold text-slate-900">6.2% up to $184,500</p>
            <p className="text-slate-600 text-[11px]">
              Social Security tax is 6.2% on wages up to the $184,500 wage base limit. Source: SSA Contribution and Benefit Base.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Federal Medicare (2026)</span>
            <p className="text-sm font-bold text-slate-900">1.45% (No Wage Cap)</p>
            <p className="text-slate-600 text-[11px]">
              Medicare withholding is 1.45% on all covered wages without an annual dollar cap. Source: SSA Contribution and Benefit Base.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Widget pre-configured for VA */}
      <PaycheckCalculator initialStateCode="VA" hideStateSelector={true} />

      <AdPlaceholder slotId="ad-va-mid" format="horizontal-banner" className="my-8" />

      {/* Content Section: How VA Withholding Works */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How Virginia State Income Tax Withholding Works
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Virginia employer withholding is computed according to the formula on printed page 21 of the <em>Income Tax Withholding Guide for Employers (2614086 Rev. 10/26)</em>:
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-800 space-y-1">
          <p className="font-semibold text-slate-900">T = (G × P) - [$8,750 + (E1 × $930) + (E2 × $800)]</p>
          <p className="text-xs font-sans text-slate-500">
            Where <strong>G</strong> is period gross wage, <strong>P</strong> is number of pay periods per year, <strong>E1</strong> is personal exemptions ($930 each), and <strong>E2</strong> is age 65+/blind exemptions ($800 each). This calculator sets T to zero if the result is negative.
          </p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Statutory Sunset Notice on Standard Deduction:</p>
          <p>
            Under current Virginia law, the increased standard deduction of <strong>$8,750</strong> in the withholding formula ($17,500 for married couples filing jointly) is scheduled to <strong>sunset after taxable year 2026</strong> and revert to $3,000 for single filers and $6,000 for married couples. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 5 and 21.
          </p>
        </div>
      </section>

      {/* New Sourced Virginia Topic Sections */}
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Bonuses and Other Supplemental Pay
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            If a bonus or vacation pay is included with a regular wage payment, it is added to the gross wages for that pay period and withheld using the tables or formula. If a supplemental payment is made separately, the employer computes the tax on regular plus supplemental wages and subtracts the tax computed on regular wages alone; alternatively, if Virginia tax has already been withheld from the employee&apos;s regular wages, the employer may use a flat 5.75% rate without exemptions. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 19–20.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Working in Virginia While Living in Another State (Reciprocity)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Virginia has reciprocity agreements with Kentucky, the District of Columbia, Maryland, West Virginia and Pennsylvania. Residents of Kentucky and the District of Columbia are not subject to Virginia withholding on wages if they commute daily to their place of employment in Virginia. Residents of Maryland, West Virginia and Pennsylvania are not subject to Virginia withholding if they maintain a legal domicile in their home state and live in Virginia less than 183 days of the taxable year (or do not live in Virginia at all), their only Virginia source income is wages or salaries, and that income is taxed by their state of residence. A qualifying employee indicates this on Form VA-4 filed with the employer. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 12.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Form VA-4 and Withholding When No Exemption Certificate Is Filed
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Form VA-4 is the Virginia Employee&apos;s Withholding Exemption Certificate, which an employee files to declare personal and age/blind exemptions. If an employee fails to file Form VA-4, the employer is required to withhold Virginia income tax as if the employee had claimed zero exemptions. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 13.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Exemption From Virginia Withholding
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            An employee may claim complete exemption from Virginia income tax withholding on Form VA-4 (line 3) if they meet one of the qualifying conditions: they incurred no Virginia tax liability last year and expect none this year; their expected Virginia adjusted gross income is below $11,950 (single), $23,900 (married), or $11,950 (married filing separately); they commute daily from Kentucky or DC; or they are legally domiciled in Maryland, Pennsylvania or West Virginia with only Virginia wages taxed by the home state. A new exemption certificate must be filed each year. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 14; Form VA-4 (Rev. 04/26), line 3 instructions.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Additional Extra Withholding
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            An employee may request that an additional dollar amount of Virginia income tax be withheld from each paycheck by entering into an agreement with the employer and specifying the amount on Form VA-4. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 14.
          </p>
        </div>
      </section>

      {/* Official VA Tax Brackets Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Virginia Tax Brackets &amp; Rates
        </h2>
        <p className="text-xs text-slate-500">
          Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 21. Formula effective for wages paid after July 1, 2025 (taxable year 2025 and after).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Taxable Income Range (T)</th>
                <th className="py-2.5 px-3">Tax Rate</th>
                <th className="py-2.5 px-3">Bracket Withholding Formula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {virginiaData.brackets.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-medium text-slate-800">
                    {formatCurrency(b.minIncome)} {b.maxIncome ? `to ${formatCurrency(b.maxIncome)}` : "and over"}
                  </td>
                  <td className="py-2 px-3 font-semibold text-emerald-700">{formatPercent(b.rate)}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                    {b.cumulativeBase > 0 ? `${formatCurrency(b.cumulativeBase)} + ` : ""}
                    {formatPercent(b.rate)} of excess over {formatCurrency(b.minIncome)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Programmatic Worked Examples at $50k, $75k, $100k */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Virginia Paycheck Examples: $50,000, $75,000 &amp; $100,000
        </h2>
        <p className="text-xs text-slate-500">
          Computed dynamically using 1 personal exemption (Form VA-4), standard single W-4, and zero pre-tax deductions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workedExamples.map((ex) => (
            <div key={ex.salary} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Annual Salary</span>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(ex.salary)}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Pay (Bi-weekly):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(ex.biweekly.grossPay)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Federal Withholding:</span>
                  <span className="text-slate-800">-{formatCurrency(ex.biweekly.taxes.federalIncomeTax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>FICA (SS &amp; Medicare):</span>
                  <span className="text-slate-800">
                    -{formatCurrency(ex.biweekly.taxes.socialSecurity + ex.biweekly.taxes.medicare)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Virginia State Tax:</span>
                  <span>-{formatCurrency(ex.biweekly.taxes.stateIncomeTax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Bi-Weekly Take-Home:</span>
                  <span className="text-emerald-700">{formatCurrency(ex.biweekly.netPay)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Monthly Take-Home:</span>
                  <span>{formatCurrency(ex.monthly.netPay)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Salary Examples — links to salary-after-tax pages */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Virginia Salary After Tax Examples
        </h2>
        <p className="text-xs text-slate-500">
          Pre-computed take-home pay for common salaries in Virginia (single filer, standard W-4, tax year 2026):
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {getSalaryPagesForState("VA").map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
            >
              ${p.salary.toLocaleString("en-US")} salary after taxes in Virginia
            </Link>
          ))}
        </div>
      </section>

      {/* More State Paycheck Calculators */}
      {otherActiveStates.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            More State Paycheck Calculators
          </h2>
          <p className="text-xs text-slate-500">
            Compare take-home pay with other states:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {otherActiveStates.map((st) => (
              <Link
                key={st.stateCode}
                href={`/${st.slug}`}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
              >
                {st.name} Paycheck Calculator ({st.topRate})
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Payroll Basics Callout */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Looking for General Payroll Definitions?
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Read our <Link href="/paycheck-basics" className="font-semibold text-emerald-700 underline hover:text-emerald-800">Paycheck Basics Guide</Link> for definitions of gross vs. net pay, pay frequency calculations, and 2026 FICA tax withholding rules.
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
          Frequently Asked Questions About Virginia Paychecks
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
            Tax Year: 2026 • Last Verified: {virginiaData.lastVerified} • {PAGE_UPDATE_INFO.updatedLabel}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Virginia%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Withholding Method:</strong> Commonwealth of Virginia employer percentage method formula from <em>Income Tax Withholding Guide for Employers (2614086 Rev. 10/26)</em>.
        </p>
        <p>
          Estimates only. Not tax advice. This tool is independent and not endorsed or verified by the Virginia Department of Taxation or the IRS.
        </p>
      </div>
    </div>
  );
}
