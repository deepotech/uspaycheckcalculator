import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency } from "@/lib/tax/formatters";
import pennsylvaniaData from "@/data/states/pennsylvania.json";
import statesMetaData from "@/data/states-meta.json";
import { CONTACT_EMAIL, PAGE_UPDATE_INFO } from "@/lib/site";
import { getSalaryPagesForState } from "@/lib/salaryPages";

export const metadata: Metadata = {
  title: "Pennsylvania Paycheck Calculator 2026 | PA Take-Home Pay & UC Tax",
  description:
    "Calculate your take-home pay in Pennsylvania for tax year 2026. Includes the flat 3.07% PA PIT, 0.07% Employee UC tax, 401(k) gross wage rules, and local EIT options.",
  alternates: {
    canonical: "/pennsylvania-paycheck-calculator",
  },
  openGraph: {
    title: "Pennsylvania Paycheck Calculator 2026 | PA Take-Home Pay & UC Tax",
    description:
      "Calculate your take-home pay in Pennsylvania for tax year 2026. Includes the flat 3.07% PA PIT, 0.07% Employee UC tax, 401(k) gross wage rules, and local EIT options.",
    url: "/pennsylvania-paycheck-calculator",
    type: "website",
  },
};

export default function PennsylvaniaPaycheckPage() {
  const meta = statesMetaData.find((s) => s.stateCode === "PA")!;

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
    { name: "Pennsylvania" },
  ];

  // Programmatically generate worked examples at $50k, $75k, and $100k
  const exampleSalaries = [50000, 75000, 100000];
  const workedExamples = exampleSalaries.map((salary) => {
    const biweekly = calculatePaycheck({
      payType: "salary",
      grossAmount: salary,
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
        paLocalEitRate: 0.0, // Default 0% local EIT
      },
    });

    const monthly = calculatePaycheck({
      payType: "salary",
      grossAmount: salary,
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

    return {
      salary,
      biweekly,
      monthly,
    };
  });

  const faqs = [
    {
      q: "What is the difference between gross pay and net pay?",
      a: "Gross pay is the total compensation earned before any taxes, payroll withholdings, or voluntary deductions are taken out. Net pay (take-home pay) is the remaining amount of compensation received by the employee after all federal, state, and local taxes, mandatory payroll contributions, and elective deductions have been subtracted.",
    },
    {
      q: "What is pay frequency?",
      a: "Pay frequency refers to the recurring schedule upon which an employer distributes wages to employees, such as weekly, bi-weekly, semi-monthly, or monthly.",
    },
    {
      q: "What is the difference between bi-weekly and semi-monthly pay?",
      a: "Bi-weekly pay occurs once every two weeks, resulting in 26 paychecks over a calendar year. Semi-monthly pay occurs twice per month (for example, on the 15th and the last day of the month), resulting in 24 paychecks per year.",
    },
    {
      q: "What is the Pennsylvania Personal Income Tax (PIT) withholding rate?",
      a: "Pennsylvania personal income tax is withheld at a flat rate of 3.07% on gross compensation. REV-415 describes withholding as compensation multiplied by 3.07% and does not mention a standard deduction or personal exemptions. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 11.",
    },
    {
      q: "What is the Pennsylvania Employee Unemployment Compensation (UC) deduction?",
      a: "Pennsylvania requires employees to contribute 0.07% of their total gross wages toward state Unemployment Compensation. Unlike employer UC contributions, employee withholding applies to total gross compensation without an annual wage cap. Source: PA Department of Labor & Industry, Employee Withholding Rates.",
    },
    {
      q: "Are 401(k) contributions exempt from Pennsylvania state income tax?",
      a: "No. Under REV-415, payments into 401(k) plans made by salary reduction are classified as taxable benefits and are included in Pennsylvania gross compensation subject to the 3.07% state tax. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 6.",
    },
    {
      q: "How are bonuses and supplemental pay taxed for Pennsylvania withholding?",
      a: "When bonuses or supplemental compensation are paid, the supplemental amount is added to the compensation paid for the payroll period and Pennsylvania personal income tax is computed on the total at the 3.07% withholding rate. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 12.",
    },
    {
      q: "How does Pennsylvania reciprocity work for employees working in reciprocal states?",
      a: "Pennsylvania has reciprocal tax agreements with Indiana, Maryland, New Jersey, Ohio, Virginia and West Virginia. If a Pennsylvania resident works in one of these states, the employer in that state withholds Pennsylvania personal income tax from the compensation and remits it to Pennsylvania. If a resident of one of these states works in Pennsylvania, the Pennsylvania employer does not withhold Pennsylvania personal income tax provided the employee files Form REV-419 (Employee's Nonwithholding Application Certificate); the Pennsylvania employer withholds the income tax of the state where the employee lives instead. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 10.",
    },
    {
      q: "Must Pennsylvania employers withhold PA tax for residents working outside Pennsylvania?",
      a: "When a Pennsylvania resident performs services entirely in another state, the employer subject to Pennsylvania withholding must withhold Pennsylvania tax on the entire compensation, unless the other state has an income tax and the employer is withholding that state's tax. If the services are performed partly inside and partly outside Pennsylvania, and the other state has an income tax that the employer withholds, the employer also withholds Pennsylvania tax on the compensation for services performed in Pennsylvania (based on working days); if the other state has no income tax, the employer withholds on all compensation. Source: PA Department of Revenue Form REV-415 (SU) 01-23, pages 9–10.",
    },
    {
      q: "How are local earned income taxes and Philadelphia wage taxes administered?",
      a: "PA REV-415 directs all questions regarding local earned income tax withholding and Act 32 to the Pennsylvania Department of Community and Economic Development (DCED). For employees subject to Philadelphia taxation, the City of Philadelphia Department of Revenue sets separate City Wage Tax withholding rates of 3.735% for residents and 3.425% for nonresidents. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 22; City of Philadelphia Department of Revenue rate schedule.",
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

      <AdPlaceholder slotId="ad-pa-top" format="horizontal-banner" className="mb-4" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
          <span>•</span>
          <span>PA REV-415 &amp; L&amp;I Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pennsylvania Paycheck Calculator 2026
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate your net salary and paycheck withholding in Pennsylvania. Accounts for the flat 3.07% PA PIT rate, PA Employee Unemployment Compensation (0.07% uncapped), 401(k) gross wage rules, and local Earned Income Taxes.
        </p>
      </div>

      {/* Quick Facts Box */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pennsylvania 2026 Paycheck Quick Facts
          </h2>
          <p className="text-xs text-slate-500">
            Key state and federal withholding values for tax year 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Flat Withholding Rate</span>
            <p className="text-sm font-bold text-slate-900">3.07% Flat PIT</p>
            <p className="text-slate-600 text-[11px]">
              Pennsylvania withholding is gross compensation multiplied by 3.07%; REV-415 does not mention a standard deduction. Source: REV-415 page 11.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Employee UC Tax</span>
            <p className="text-sm font-bold text-slate-900">0.07% Uncapped</p>
            <p className="text-slate-600 text-[11px]">
              State Employee Unemployment Compensation withholding is 0.07% of total gross wages with no annual wage cap. Source: PA Dept of L&amp;I.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Philadelphia Wage Tax</span>
            <p className="text-sm font-bold text-slate-900">3.735% / 3.425%</p>
            <p className="text-slate-600 text-[11px]">
              Philadelphia City Wage Tax is 3.735% for residents and 3.425% for nonresidents. Source: City of Philadelphia rate table.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold uppercase text-slate-500">401(k) Treatment</span>
            <p className="text-sm font-bold text-amber-800">401(k) Is Taxed</p>
            <p className="text-slate-600 text-[11px]">
              Payments into 401(k) plans by salary reduction are taxable benefits included in PA gross wages. Source: REV-415 page 6.
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

      {/* Calculator Widget pre-configured for PA */}
      <PaycheckCalculator initialStateCode="PA" hideStateSelector={true} />

      <AdPlaceholder slotId="ad-pa-mid" format="horizontal-banner" className="my-8" />

      {/* Content Section: How PA Withholding Works */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How Pennsylvania State &amp; Payroll Taxes Work
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Pennsylvania personal income tax withholding follows statutory guidelines set out in Department of Revenue publication <strong>REV-415 (SU) 01-23</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-2">
            <li>
              <strong>Flat 3.07% Tax Rate:</strong> REV-415 describes withholding as compensation multiplied by 3.07% and does not mention a standard deduction. Source: REV-415, page 11.
            </li>
            <li>
              <strong>401(k) Retirement Plans:</strong> Payments into 401(k) plans made by salary reduction are taxable benefits and are included in PA gross wages. Source: REV-415, page 6.
            </li>
            <li>
              <strong>Health Insurance Note (Assumption):</strong> REV-415 covers employer payments for medical welfare plans but does not explicitly address employee Section 125 salary reductions. As an assumption, employee Section 125 health insurance deductions are treated as taxable for PA state withholding.
            </li>
            <li>
              <strong>Employee Unemployment Compensation (UC):</strong> Employees pay a state UC tax of <strong>0.07%</strong> on total gross wages with no dollar wage cap. Source: PA Dept of Labor &amp; Industry, Employee Withholding Rates.
            </li>
            <li>
              <strong>Local EIT (Act 32):</strong> PA REV-415 directs local earned income tax questions to DCED (Quick Reference Guide for Payroll Providers, &quot;Act 32&quot;, printed page 22). Philadelphia imposes a separate City Wage Tax of 3.735% (residents) and 3.425% (nonresidents). Source: City of Philadelphia rate schedule.
            </li>
          </ul>
        </div>
      </section>

      {/* New Sourced Pennsylvania Topic Sections */}
      <section className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Bonuses and Supplemental Pay
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            When bonuses or supplemental compensation are paid, the supplemental amount is added to the compensation paid for the payroll period and Pennsylvania personal income tax is computed on the total at the 3.07% withholding rate. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 12.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Working in a Reciprocal State
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pennsylvania has reciprocal tax agreements with six states: Indiana, Maryland, New Jersey, Ohio, Virginia and West Virginia. If a Pennsylvania resident works in one of these states, the employer in that state withholds Pennsylvania personal income tax from the compensation and remits it to Pennsylvania. If a resident of one of these states works in Pennsylvania, the Pennsylvania employer does not withhold Pennsylvania personal income tax provided the employee files Form REV-419 (Employee&apos;s Nonwithholding Application Certificate); the Pennsylvania employer withholds the income tax of the state where the employee lives instead. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 10.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Pennsylvania Residents Working Outside Pennsylvania
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            When a Pennsylvania resident performs services entirely in another state, the employer subject to Pennsylvania withholding must withhold Pennsylvania tax on the entire compensation, unless the other state has an income tax and the employer is withholding that state&apos;s tax. If the services are performed partly inside and partly outside Pennsylvania, and the other state has an income tax that the employer withholds, the employer also withholds Pennsylvania tax on the compensation for services performed in Pennsylvania (based on working days); if the other state has no income tax, the employer withholds on all compensation. Source: PA Department of Revenue Form REV-415 (SU) 01-23, pages 9–10.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Local Taxes and Act 32 Compliance
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Pennsylvania Department of Revenue withholding guide directs all inquiries concerning local earned income tax withholding and Act 32 requirements to the Pennsylvania Department of Community and Economic Development (DCED). For employees working or residing in Philadelphia, the City of Philadelphia Department of Revenue levies a separate City Wage Tax of 3.735% for residents and 3.425% for nonresidents. Source: PA Department of Revenue Form REV-415 (SU) 01-23, page 22; City of Philadelphia Department of Revenue rate schedule.
          </p>
        </div>
      </section>

      {/* Programmatic Worked Examples at $50k, $75k, $100k */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pennsylvania Paycheck Examples: $50,000, $75,000 &amp; $100,000
        </h2>
        <p className="text-xs text-slate-500">
          Dynamic calculations showing flat 3.07% PA PIT, 0.07% PA UC tax, standard single W-4, and zero local EIT.
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
                  <span>PA State PIT (3.07%):</span>
                  <span>-{formatCurrency(ex.biweekly.taxes.stateIncomeTax)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>PA Employee UC (0.07%):</span>
                  <span>-{formatCurrency(ex.biweekly.taxes.statePayrollTaxes[0]?.amount || 0)}</span>
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
          Pennsylvania Salary After Tax Examples
        </h2>
        <p className="text-xs text-slate-500">
          Pre-computed take-home pay for common salaries in Pennsylvania (single filer, standard W-4, 0% local EIT, tax year 2026):
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {getSalaryPagesForState("PA").map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
            >
              ${p.salary.toLocaleString("en-US")} salary after taxes in Pennsylvania
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

      {/* Sourced FAQ Section */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions About Pennsylvania Paychecks
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
            Tax Year: 2026 • Last Verified: {pennsylvaniaData.lastVerified}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Pennsylvania%20Calculator%20Error%20Report`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Withholding Method:</strong> PA Department of Revenue Form REV-415 (SU) 01-23 (3.07% flat PIT) and PA Dept of Labor &amp; Industry Employee UC guidelines.
        </p>
        <p>
          Estimates only. Not tax advice. This tool is independent and not endorsed or verified by the Pennsylvania Department of Revenue or the IRS.
        </p>
      </div>
    </div>
  );
}
