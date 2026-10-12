import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { formatCurrency, formatPercent } from "@/lib/tax/formatters";
import pennsylvaniaData from "@/data/states/pennsylvania.json";
import statesMetaData from "@/data/states-meta.json";
import { CONTACT_EMAIL } from "@/lib/site";

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
      q: "What is the Pennsylvania Personal Income Tax (PIT) rate?",
      a: "Pennsylvania withholding is gross compensation x 3.07% (REV-415, page 11). We apply no standard deduction.",
    },
    {
      q: "Are 401(k) contributions exempt from Pennsylvania state tax?",
      a: "No. Under REV-415 (printed page 6, \"Taxable Benefits\"), payments into 401(k) plans made by salary reduction are taxable and should be included in Pennsylvania gross wages.",
    },
    {
      q: "What is the Pennsylvania Employee Unemployment Compensation (UC) deduction?",
      a: "Pennsylvania requires employees to contribute 0.07% of their gross wages toward state Unemployment Compensation. Unlike employer UC contributions, employee withholding applies to total gross wages without an annual wage cap. Source: PA Department of Labor & Industry, Employee Withholding Rates.",
    },
    {
      q: "How does Local Earned Income Tax (EIT) and Philadelphia Wage Tax work?",
      a: "PA REV-415 directs questions on Act 32 / local earned income tax to DCED (Quick Reference Guide for Payroll Providers, \"Act 32\", printed page 22). The calculator accepts any rate the user enters (default 0%). For Philadelphia, the City Wage Tax rate is 3.735% for residents and 3.425% for non-residents working in the city, effective July 1, 2026 (City of Philadelphia Department of Revenue rate schedule).",
    },
    {
      q: "Do health insurance deductions reduce PA taxable wages?",
      a: "Employer-paid medical benefit plans are exempt from PA tax (REV-415, page 6, \"Nontaxable Benefits\"), but the withholding guide does not explicitly state that employee pre-tax Section 125 deductions reduce state compensation. We therefore treat employee health insurance premiums as taxable for Pennsylvania withholding. Check your pay stub to confirm. Source: PA Department of Revenue Form REV-415 (SU), page 6.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <AdPlaceholder slotId="ad-pa-top" format="horizontal-banner" className="mb-4" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>Tax Year 2026</span>
          <span>•</span>
          <span>PA REV-415 & L&I Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pennsylvania Paycheck Calculator 2026
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Estimate your net salary and paycheck withholding in Pennsylvania. Accounts for the flat 3.07% PA PIT rate, PA Employee Unemployment Compensation (0.07% uncapped), 401(k) gross wage rules, and local Earned Income Taxes.
        </p>
      </div>

      {/* Calculator Widget pre-configured for PA */}
      <PaycheckCalculator initialStateCode="PA" hideStateSelector={true} />

      <AdPlaceholder slotId="ad-pa-mid" format="horizontal-banner" className="my-8" />

      {/* Content Section: How PA Withholding Works */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How Pennsylvania State & Payroll Taxes Work
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Pennsylvania personal income tax withholding follows statutory guidelines set out in Department of Revenue publication <strong>REV-415 (SU) 01-23</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 pl-2">
            <li>
              <strong>Flat 3.07% Tax Rate:</strong> REV-415 describes withholding as compensation multiplied by 3.07% and does not mention a standard deduction.
            </li>
            <li>
              <strong>401(k) & Health Premiums:</strong> Payments into 401(k) plans made by salary reduction are taxable and included in PA gross wages (REV-415, page 6, "Taxable Benefits"). Employee Section 125 health insurance deductions are treated as taxable by default.
            </li>
            <li>
              <strong>Employee Unemployment Compensation (UC):</strong> Employees pay a state UC tax of <strong>0.07%</strong> on total gross wages with no dollar wage cap (PA Dept of Labor & Industry, Employee Withholding Rates).
            </li>
            <li>
              <strong>Local EIT (Act 32):</strong> PA REV-415 directs local earned income tax questions to DCED (Quick Reference Guide for Payroll Providers, "Act 32", printed page 22). Philadelphia imposes a separate City Wage Tax of 3.735% (residents) / 3.425% (nonresidents).
            </li>
          </ul>
        </div>
      </section>

      {/* Programmatic Worked Examples at $50k, $75k, $100k */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pennsylvania Paycheck Examples: $50,000, $75,000 & $100,000
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
                  <span>FICA (SS & Medicare):</span>
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
          <strong>Withholding Method:</strong> PA Department of Revenue Form REV-415 (SU) 01-23 (3.07% flat PIT) and PA Dept of Labor & Industry Employee UC guidelines.
        </p>
        <p>
          Estimates only. Not tax advice. This tool is independent and not endorsed or verified by the Pennsylvania Department of Revenue or the IRS.
        </p>
      </div>
    </div>
  );
}
