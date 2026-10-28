import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency, formatPercent } from "@/lib/tax/formatters";
import { getAllSalaryPages, parseSalarySlug, getSalaryNeighbors, SALARY_PAGE_SALARIES } from "@/lib/salaryPages";
import {
  computeMultiPeriod,
  computeVAStateSteps,
  computePAStateSteps,
  computeFederalSteps,
  computeNeighborRows,
  computeMarginalRaise,
  computeMarriedJointBreakdown,
  compute401kBreakdown,
  buildSalaryPageMetadata,
} from "@/lib/salaryPageCalc";
import { CONTACT_EMAIL, PAGE_UPDATE_INFO } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import virginiaData from "@/data/states/virginia.json";
import pennsylvaniaData from "@/data/states/pennsylvania.json";

// ─── Static params ──────────────────────────────────────────────────────────
// params is a Promise in Next.js 16 App Router (per docs).
// generateStaticParams returns all verified+active salary page slugs.
// Unknown slugs call notFound() in the page body.

export function generateStaticParams(): { slug: string }[] {
  return getAllSalaryPages().map((p) => ({ slug: p.slug }));
}

// ─── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = parseSalarySlug(slug);
  if (!page) return {};

  const { title, description, canonicalPath } = buildSalaryPageMetadata(page);

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
    },
  };
}

// ─── Page component ──────────────────────────────────────────────────────────

export default async function SalaryAfterTaxPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const page = parseSalarySlug(slug);

  // Guard: 404 for any slug that isn't a verified+active salary page
  if (!page) notFound();

  const { stateCode, stateName, salary, calculatorSlug } = page;
  const salaryStr = salary.toLocaleString("en-US");
  const isVA = stateCode === "VA";
  const isPA = stateCode === "PA";

  // ── Engine computations ──────────────────────────────────────────────────
  const mpd = computeMultiPeriod(salary, stateCode);
  const annual = mpd.annual;
  const monthly = mpd.monthly;
  const biWeekly = mpd.biWeekly;
  const weekly = mpd.weekly;
  const hourly = mpd.hourly;

  // Annual effective rate (annual basis)
  const annualEffectiveRate = annual.grossPay > 0
    ? annual.taxes.totalTaxes / annual.grossPay
    : 0;

  // Federal steps
  const fedSteps = computeFederalSteps(salary);

  // State-specific steps
  const vaSteps = isVA ? computeVAStateSteps(salary) : null;
  const paSteps = isPA ? computePAStateSteps(salary) : null;

  // Neighbors
  const { below, above } = getSalaryNeighbors(salary, stateCode);
  const belowSlugs = below.map((p) => p.slug);
  const aboveSlugs = above.map((p) => p.slug);
  const neighborSalaries = [...below.map((p) => p.salary), ...above.map((p) => p.salary)];
  const neighborSlugs = [...belowSlugs, ...aboveSlugs];
  const neighborRows = computeNeighborRows(salary, stateCode, neighborSalaries, neighborSlugs);

  // Marginal raise
  const marginal = computeMarginalRaise(salary, stateCode);

  // Married filing jointly
  const marriedMpd = computeMarriedJointBreakdown(salary, stateCode);
  const marriedAnnual = marriedMpd.annual;

  // 5% 401(k)
  const k401Mpd = compute401kBreakdown(salary, stateCode);
  const k401Annual = k401Mpd.annual;

  // Prev/next salary for page-to-page nav
  const salaryIdx = SALARY_PAGE_SALARIES.indexOf(salary);
  const prevPage = below.length > 0 ? below[below.length - 1] : null;
  const nextPage = above.length > 0 ? above[0] : null;

  // FAQ (state-specific, ≤3 questions, sourced only)
  const faqs = isVA
    ? buildVAFaqs(salary)
    : buildPAFaqs(salary);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // UC for annual PA row
  const paUcAnnual = isPA ? annual.taxes.statePayrollTaxes.find((t) => t.name.includes("Unemployment") || t.name.includes("UC"))?.amount ?? 0 : 0;

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Paycheck Calculators by State", href: "/paycheck-calculator-by-state" },
    { name: stateName, href: `/${calculatorSlug}` },
    { name: `$${salaryStr} Salary After Tax` },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbs} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* H1 */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          <span>{PAGE_UPDATE_INFO.taxYearLabel}</span>
          <span>•</span>
          <span>{PAGE_UPDATE_INFO.updatedLabel}</span>
          <span>•</span>
          <span>{isVA ? "Form VA-4 & Employer Guide" : "PA REV-415 & L&I Guidelines"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ${salaryStr} Salary After Taxes in {stateName} (2026)
        </h1>

        {/* Assumptions line */}
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-semibold">Assumptions used on this page:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Single filer, standard W-4 (no Step 2, 3, or 4 adjustments)</li>
            <li>No pre-tax deductions (no 401k, health insurance, or HSA)</li>
            {isVA && <li>Virginia Form VA-4: 1 personal exemption (E1 = 1), 0 age/blind exemptions (E2 = 0)</li>}
            {isPA && <li>Pennsylvania: this calculator assumes 0% local earned income tax; enter your local rate in the calculator.</li>}
            <li>Tax year 2026</li>
          </ul>
          <p className="pt-1">
            Use the{" "}
            <Link
              href={`/${calculatorSlug}`}
              className="text-emerald-700 underline font-medium hover:text-emerald-800"
            >
              {stateName} Paycheck Calculator
            </Link>{" "}
            or the{" "}
            <Link href="/" className="text-emerald-700 underline font-medium hover:text-emerald-800">
              homepage calculator
            </Link>{" "}
            to change filing status, add deductions, or enter a different salary (initial value: ${salaryStr}).
          </p>
        </div>
      </div>

      {/* Summary box */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          ${salaryStr} Take-Home Pay Summary — {stateName}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Annual take-home", value: annual.netPay },
            { label: "Monthly take-home", value: monthly.netPay },
            { label: "Bi-weekly take-home", value: biWeekly.netPay },
            { label: "Weekly take-home", value: weekly.netPay },
            { label: "Hourly take-home", value: hourly.netPay },
            { label: "Total annual taxes", value: annual.taxes.totalTaxes },
          ].map((row) => (
            <div key={row.label} className="bg-white rounded-lg border border-emerald-100 p-3">
              <p className="text-xs text-slate-500 leading-tight">{row.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(row.value)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Effective tax rate:</span>{" "}
          {formatPercent(annualEffectiveRate)} of gross annual salary.
        </p>
      </section>

      {/* Full multi-frequency breakdown table */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 overflow-x-auto">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          ${salaryStr} Paycheck Breakdown — All Pay Frequencies
        </h2>
        <p className="text-xs text-slate-500">
          All figures computed from the calculation engine. State taxes use the methods described below.
        </p>
        <table className="w-full text-xs text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3">Component</th>
              <th className="py-2.5 px-3 text-right">Annual</th>
              <th className="py-2.5 px-3 text-right">Monthly</th>
              <th className="py-2.5 px-3 text-right">Semi-Monthly</th>
              <th className="py-2.5 px-3 text-right">Bi-Weekly</th>
              <th className="py-2.5 px-3 text-right">Weekly</th>
              <th className="py-2.5 px-3 text-right">Hourly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Gross */}
            <tr className="font-semibold text-slate-800 bg-slate-50/60">
              <td className="py-2 px-3">Gross Pay</td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2 px-3 text-right">{formatCurrency(b.grossPay)}</td>
              ))}
            </tr>
            {/* Federal */}
            <tr className="text-slate-700">
              <td className="py-2 px-3">Federal Income Tax</td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2 px-3 text-right text-red-600">−{formatCurrency(b.taxes.federalIncomeTax)}</td>
              ))}
            </tr>
            {/* Social Security */}
            <tr className="text-slate-700">
              <td className="py-2 px-3">Social Security (6.2%)</td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2 px-3 text-right text-red-600">−{formatCurrency(b.taxes.socialSecurity)}</td>
              ))}
            </tr>
            {/* Medicare */}
            <tr className="text-slate-700">
              <td className="py-2 px-3">Medicare (1.45%)</td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2 px-3 text-right text-red-600">−{formatCurrency(b.taxes.medicare)}</td>
              ))}
            </tr>
            {/* State income tax */}
            <tr className="text-slate-700">
              <td className="py-2 px-3">
                {isVA ? "Virginia State Income Tax" : "PA State Income Tax (3.07%)"}
              </td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2 px-3 text-right text-red-600">−{formatCurrency(b.taxes.stateIncomeTax)}</td>
              ))}
            </tr>
            {/* PA UC row — only for Pennsylvania */}
            {isPA && (
              <tr className="text-slate-700">
                <td className="py-2 px-3">PA Employee UC (0.07%)</td>
                {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                  <td key={i} className="py-2 px-3 text-right text-red-600">
                    −{formatCurrency(b.taxes.statePayrollTaxes.find((t) => t.name.includes("Unemployment") || t.name.includes("UC"))?.amount ?? 0)}
                  </td>
                ))}
              </tr>
            )}
            {/* Net pay */}
            <tr className="font-bold text-emerald-700 bg-emerald-50/50">
              <td className="py-2.5 px-3">Net Take-Home Pay</td>
              {[annual, monthly, mpd.semiMonthly, biWeekly, weekly, hourly].map((b, i) => (
                <td key={i} className="py-2.5 px-3 text-right">{formatCurrency(b.netPay)}</td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="text-[11px] text-slate-400">
          {isVA
            ? "Virginia: annual state tax = round(W) to nearest dollar (Guide page 22). SS cap $184,500 (SSA.gov)."
            : "Pennsylvania: PIT = 3.07% flat; UC 3-decimal-truncation rule (PA L&I). SS cap $184,500 (SSA.gov)."}
        </p>
      </section>

      {/* How state tax is computed at this salary */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {isVA && vaSteps && (
          <>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              How Virginia State Income Tax Is Computed at ${salaryStr}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 21.
              Formula: <span className="font-mono font-semibold">T = (G × P) − [$8,750 + (E1 × $930) + (E2 × $800)]</span>,
              where G × P = annualized gross and E1 = 1 personal exemption.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs font-mono text-slate-800">
              <p>Annualized gross (G × P)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(vaSteps.annualGross)}</p>
              <p>Standard deduction (flat)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; − {formatCurrency(vaSteps.stdDeduction)}</p>
              <p>Personal exemption (E1 × $930)&nbsp; − {formatCurrency(vaSteps.exemptionDeduction)}</p>
              <p className="border-t border-slate-200 pt-1 font-semibold">Taxable annual T&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(vaSteps.taxableAnnual)}</p>
              <p className="pt-1 text-slate-500 font-sans">Bracket applied: <span className="font-semibold text-slate-700">{vaSteps.bracketLabel}</span></p>
              <p>Annual tax W (before rounding)&nbsp;&nbsp; = {formatCurrency(vaSteps.annualTaxBeforeRound)}</p>
              <p className="font-semibold">Annual tax W (rounded to $1)&nbsp;&nbsp;&nbsp; = {formatCurrency(vaSteps.annualTaxRounded)}</p>
              <p className="text-slate-500 font-sans text-[11px] pt-1">
                Guide page 22: Round W to the nearest whole dollar, then divide by P (pay periods) to get per-period withholding.
              </p>
            </div>
          </>
        )}

        {isPA && paSteps && (
          <>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              How Pennsylvania State Income Tax Is Computed at ${salaryStr}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Source: PA REV-415 (SU) 01-23, printed page 11. REV-415 (page 11) describes withholding as compensation multiplied by 3.07% and does not mention a standard deduction; this calculator applies none.
              The Employee Unemployment Compensation (UC) rate is 0.07% on all gross wages,
              with a 3-decimal-truncation rounding rule (PA Dept of Labor &amp; Industry).
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs font-mono text-slate-800">
              <p>Annual gross compensation&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(paSteps.annualGross)}</p>
              <p>PA PIT rate (REV-415 p. 11)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; × {(paSteps.pitRate * 100).toFixed(2)}%</p>
              <p className="font-semibold">Annual PA PIT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(paSteps.annualPIT)}</p>
              <p className="pt-2 border-t border-slate-200">PA UC (0.07%): {formatCurrency(paSteps.annualGross)} × 0.0007 = {paSteps.ucRawProduct.toFixed(6)}</p>
              <p>Truncate to 3 decimals&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; → {paSteps.ucTruncated3.toFixed(3)}</p>
              <p className="font-semibold">Annual PA UC (rounded to nearest cent) = {formatCurrency(paSteps.annualUC)}</p>
            </div>
          </>
        )}
      </section>

      {/* How the federal part is computed */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          How the Federal Part Is Computed at ${salaryStr}
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Source: IRS Publication 15-T (2026), Section 1, Worksheet 1A (printed page 10) and
          Annual Percentage Method Tables (printed page 12). Filing status: single, standard W-4.
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs font-mono text-slate-800">
          <p>Annual gross wages (Step 1a)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(fedSteps.annualGross)}</p>
          <p>Line 1g adjustment (single, standard W-4)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; − {formatCurrency(fedSteps.line1gAdjustment)}</p>
          <p className="font-semibold">Adjusted annual wage (line 1i)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(fedSteps.adjustedAnnualWage)}</p>
          <p className="pt-1 text-slate-500 font-sans">
            Percentage Method Table row used:{" "}
            <span className="font-semibold text-slate-700">
              {(fedSteps.bracketRate * 100).toFixed(0)}% bracket (income over {formatCurrency(fedSteps.bracketMin)})
            </span>
          </p>
          <p className="font-semibold">Annual federal income tax withholding&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = {formatCurrency(fedSteps.annualFederalTax)}</p>
          <p className="text-slate-500 font-sans text-[11px] pt-1">
            Social Security: 6.2% × min({formatCurrency(salary)}, {formatCurrency(184500)}) = {formatCurrency(annual.taxes.socialSecurity)}.
            Medicare: 1.45% × {formatCurrency(salary)} = {formatCurrency(annual.taxes.medicare)}.
            Source: SSA.gov OASDI wage base; IRS Topic 560.
          </p>
        </div>
      </section>

      {/* What changes at nearby salaries */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          What Changes at Nearby Salaries
        </h2>
        <p className="text-xs text-slate-500">
          All values computed from the engine with identical assumptions (single, standard W-4, 0 pre-tax deductions).
          Differences shown relative to the ${salaryStr} base salary.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Salary</th>
                <th className="py-2.5 px-3 text-right">Annual Net Pay</th>
                <th className="py-2.5 px-3 text-right">vs. ${salaryStr} (Annual)</th>
                <th className="py-2.5 px-3 text-right">vs. ${salaryStr} (Monthly)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Current salary row */}
              <tr className="bg-emerald-50/60 font-semibold text-emerald-800">
                <td className="py-2 px-3">${salaryStr} (this page)</td>
                <td className="py-2 px-3 text-right">{formatCurrency(annual.netPay)}</td>
                <td className="py-2 px-3 text-right">—</td>
                <td className="py-2 px-3 text-right">—</td>
              </tr>
              {neighborRows.map((row) => (
                <tr key={row.salary} className="hover:bg-slate-50/50 text-slate-700">
                  <td className="py-2 px-3">
                    <Link href={`/${row.slug}`} className="text-emerald-700 underline hover:text-emerald-800">
                      ${row.salary.toLocaleString("en-US")}
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-right">{formatCurrency(row.annualNet)}</td>
                  <td className={`py-2 px-3 text-right font-medium ${row.netDiffVsBase >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {row.netDiffVsBase >= 0 ? "+" : ""}{formatCurrency(row.netDiffVsBase)}
                  </td>
                  <td className={`py-2 px-3 text-right font-medium ${row.monthlyNetDiffVsBase >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {row.monthlyNetDiffVsBase >= 0 ? "+" : ""}{formatCurrency(row.monthlyNetDiffVsBase)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Marginal $5,000 raise */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
          <p className="font-semibold text-slate-800">Marginal impact of a ${(5000).toLocaleString("en-US")} raise (from ${salaryStr} to ${marginal.raisedSalary.toLocaleString("en-US")}):</p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <p className="text-slate-500">Extra gross</p>
              <p className="font-bold text-slate-800">{formatCurrency(marginal.extraGross)}</p>
            </div>
            <div>
              <p className="text-slate-500">Extra taxes</p>
              <p className="font-bold text-red-600">−{formatCurrency(marginal.extraTax)}</p>
            </div>
            <div>
              <p className="text-slate-500">Extra net pay</p>
              <p className="font-bold text-emerald-700">+{formatCurrency(marginal.extraNet)}</p>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] pt-1">Computed with identical assumptions; reflects marginal brackets for both federal and {stateName} taxes.</p>
        </div>
      </section>

      {/* Married filing jointly and 401(k) variants */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Married Filing Jointly &amp; 401(k) Variants at ${salaryStr}
        </h2>

        {/* Married filing jointly */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">
            (a) Married Filing Jointly
            {isVA ? " — Virginia E1 = 2" : " — Pennsylvania (filing status does not change PA PIT rate)"}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isVA
              ? "Assumptions: married filing jointly (MFJ) federal W-4, Virginia VA-4 with E1 = 2 (self + spouse, $930 each). Standard deduction in the Virginia formula remains flat $8,750 (Guide page 21)."
              : "Assumptions: married filing jointly (MFJ) federal W-4. This calculator applies the same state rates regardless of filing status. Federal withholding changes because MFJ has a higher 12% bracket threshold."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Annual net (MFJ)", value: marriedAnnual.netPay },
              { label: "Monthly net (MFJ)", value: marriedMpd.monthly.netPay },
              { label: "Annual state tax (MFJ)", value: marriedAnnual.taxes.stateIncomeTax },
              { label: "Annual federal tax (MFJ)", value: marriedAnnual.taxes.federalIncomeTax },
            ].map((row) => (
              <div key={row.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[11px] text-slate-500">{row.label}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(row.value)}</p>
              </div>
            ))}
          </div>
          {isVA && (
            <p className="text-[11px] text-slate-400">
              Compared with single filing: annual net changes from {formatCurrency(annual.netPay)} to {formatCurrency(marriedAnnual.netPay)} ({formatCurrency(Math.abs(marriedAnnual.netPay - annual.netPay))} {marriedAnnual.netPay >= annual.netPay ? "more" : "less"}).
            </p>
          )}
        </div>

        {/* 5% 401(k) */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-800">
            (b) 5% Traditional 401(k) Contribution
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Assumptions: single filer, 5% of gross salary contributed to a traditional 401(k) per pay period ({formatCurrency(salary * 0.05)} annually). 
            {isVA
              ? " The Virginia guide (page 11) says Virginia generally follows the federal definition of wages subject to withholding but does not list 401(k) explicitly. We therefore assume traditional 401(k) deferrals also reduce Virginia wages. Check your pay stub."
              : " Per PA REV-415 (page 6), employee 401(k) salary-reduction contributions are included in Pennsylvania gross taxable wages and are not exempt from the 3.07% PIT or Employee UC."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "401(k) annual deduction", value: k401Annual.preTaxDeductions.k401 },
              { label: "Annual net (5% 401k)", value: k401Annual.netPay },
              { label: "Monthly net (5% 401k)", value: k401Mpd.monthly.netPay },
              { label: isPA ? "PA PIT (unchanged by 401k)" : "Annual VA tax (5% 401k)", value: isPA ? annual.taxes.stateIncomeTax : k401Annual.taxes.stateIncomeTax },
            ].map((row) => (
              <div key={row.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[11px] text-slate-500">{row.label}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(row.value)}</p>
              </div>
            ))}
          </div>
          {isPA && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-semibold">Pennsylvania 401(k) note:</span> The 401(k) deduction reduces your federal taxable wages (and therefore federal withholding), but Pennsylvania includes the 401(k) deferral in gross compensation subject to the 3.07% PIT. Source: PA REV-415 (SU) 01-23, page 6, &quot;Taxable Benefits.&quot;
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-3 space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal navigation links */}
      <div className="flex flex-wrap gap-3 text-xs">
        {prevPage && (
          <Link
            href={`/${prevPage.slug}`}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors font-medium"
          >
            ← ${prevPage.salary.toLocaleString("en-US")} salary after tax in {stateName}
          </Link>
        )}
        <Link
          href={`/${calculatorSlug}`}
          className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
        >
          {stateName} Paycheck Calculator
        </Link>
        <Link
          href="/"
          className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors font-medium"
        >
          Homepage Calculator
        </Link>
        {nextPage && (
          <Link
            href={`/${nextPage.slug}`}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors font-medium"
          >
            ${nextPage.salary.toLocaleString("en-US")} salary after tax in {stateName} →
          </Link>
        )}
      </div>

      {/* Footer disclosures */}
      <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-semibold text-slate-800">
            Tax Year: 2026 • Last Verified: {isVA ? virginiaData.lastVerified : pennsylvaniaData.lastVerified} • {PAGE_UPDATE_INFO.updatedLabel}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${stateName} $${salaryStr} Salary Page Error Report`)}`}
            className="text-emerald-700 hover:text-emerald-800 font-medium underline"
          >
            Report an error
          </a>
        </div>
        <p>
          <strong>Withholding Method:</strong>{" "}
          {isVA
            ? "Commonwealth of Virginia employer percentage method formula from Income Tax Withholding Guide for Employers (2614086 Rev. 10/26). Federal: IRS Publication 15-T (2026), Worksheet 1A, Percentage Method Tables."
            : "Pennsylvania flat 3.07% PIT per PA REV-415 (SU) 01-23, page 11. Employee UC 0.07% per PA Dept of Labor & Industry. Federal: IRS Publication 15-T (2026), Worksheet 1A, Percentage Method Tables."}
        </p>
        {isVA && (
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            <strong>Standard deduction sunset notice:</strong> The $8,750 standard deduction in the Virginia withholding formula ($17,500 on annual joint returns) is scheduled to sunset after taxable year 2026 and revert to $3,000/$6,000 under current law. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 5 and 21.
          </p>
        )}
        <p>
          Estimates only. Not tax advice. This tool is independent and not endorsed or verified by the{" "}
          {isVA ? "Virginia Department of Taxation" : "Pennsylvania Department of Revenue"} or the IRS.
        </p>
      </div>
    </div>
  );
}

// ─── State-specific FAQs (≤3, sourced only, vary per salary) ─────────────────

function buildVAFaqs(salary: number) {
  const salaryStr = salary.toLocaleString("en-US");
  const vaSteps = computeVAStateSteps(salary);
  const fedSteps = computeFederalSteps(salary);

  return [
    {
      q: `How is Virginia income tax withheld from a $${salaryStr} salary?`,
      a: `Virginia employer withholding annualizes your gross wage, subtracts the $8,750 standard deduction and your VA-4 exemptions ($930 per personal exemption), then applies the applicable bracket. For a $${salaryStr} salary with E1 = 1, the taxable annual amount is ${formatCurrency(vaSteps.taxableAnnual)} (applying the ${vaSteps.bracketLabel}), yielding an annual tax of ${formatCurrency(vaSteps.annualTaxRounded)} after rounding to the nearest dollar (Guide page 22). Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 21–22.`,
    },
    {
      q: `Which federal tax bracket applies to a $${salaryStr} salary?`,
      a: `Under IRS Publication 15-T (2026) Worksheet 1A for a single filer on a standard W-4, the line 1g adjustment reduces the annualized wage by $${fedSteps.line1gAdjustment.toLocaleString("en-US")}, yielding an adjusted annual wage of ${formatCurrency(fedSteps.adjustedAnnualWage)}. The ${(fedSteps.bracketRate * 100).toFixed(0)}% Percentage Method bracket (income over ${formatCurrency(fedSteps.bracketMin)}) applies, producing annual federal withholding of ${formatCurrency(fedSteps.annualFederalTax)}. Source: IRS Publication 15-T (2026), Percentage Method Tables, printed page 12.`,
    },
    {
      q: "Will the Virginia standard deduction change after 2026?",
      a: `Under current Virginia law, the $8,750 standard deduction used in the employer withholding formula (and $17,500 for annual joint returns) is scheduled to sunset after taxable year 2026 and revert to $3,000 for single filers and $6,000 for married couples. Source: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), pages 5 and 21.`,
    },
  ];
}

function buildPAFaqs(salary: number) {
  const salaryStr = salary.toLocaleString("en-US");
  const paSteps = computePAStateSteps(salary);
  const fedSteps = computeFederalSteps(salary);

  return [
    {
      q: `How is Pennsylvania income tax calculated on a $${salaryStr} salary?`,
      a: `REV-415 (page 11) describes withholding as compensation multiplied by 3.07% and does not mention a standard deduction; this calculator applies none. For a $${salaryStr} salary, the annual PA PIT is ${formatCurrency(paSteps.annualPIT)}. The Employee Unemployment Compensation (UC) is 0.07% on all gross wages: ${formatCurrency(salary)} × 0.0007 = ${paSteps.ucRawProduct.toFixed(4)}, truncated to 3 decimal places (${paSteps.ucTruncated3.toFixed(3)}), rounded to ${formatCurrency(paSteps.annualUC)}. Source: PA REV-415 (SU) 01-23, page 11; PA Dept of Labor & Industry Employee Withholding Rates.`,
    },
    {
      q: `Are 401(k) contributions deducted from Pennsylvania taxable wages at a $${salaryStr} salary?`,
      a: `No. Per PA REV-415 (page 6), employee 401(k) salary-reduction contributions are included in PA gross taxable wages. Traditional 401(k) contributions reduce federal withholding but do not reduce Pennsylvania state income tax.`,
    },
    {
      q: `Which federal bracket applies to a $${salaryStr} salary?`,
      a: `For a single filer on a standard W-4, the IRS Pub 15-T (2026) Worksheet 1A line 1g adjustment is $8,600, giving an adjusted annual wage of ${formatCurrency(fedSteps.adjustedAnnualWage)}. The ${(fedSteps.bracketRate * 100).toFixed(0)}% Percentage Method bracket (income over ${formatCurrency(fedSteps.bracketMin)}) applies, producing annual federal withholding of ${formatCurrency(fedSteps.annualFederalTax)}. Source: IRS Publication 15-T (2026), Percentage Method Tables, printed page 12.`,
    },
  ];
}
