import React from "react";
import Link from "next/link";
import { generateHourlyConversionTable } from "@/lib/payConversion";
import { formatCurrency, formatCompactCurrency } from "@/lib/tax/formatters";
import { getSalaryPagesForState } from "@/lib/salaryPages";

export const HourlySalaryComparisonTable: React.FC = () => {
  const tableData = generateHourlyConversionTable();
  const vaSalaryPages = getSalaryPagesForState("VA");
  const paSalaryPages = getSalaryPagesForState("PA");

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Hourly to Annual Salary &amp; Take-Home Pay Table ($15 to $50/hr)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Based on 2,080 working hours per year (40 hours per week × 52 weeks). Take-home pay estimates use tax year 2026 federal tables (IRS Publication 15-T, Single filer, standard Form W-4) and state tax formulas for Virginia and Pennsylvania.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
            <tr>
              <th className="py-2.5 px-3">Hourly Rate</th>
              <th className="py-2.5 px-3">Gross Annual</th>
              <th className="py-2.5 px-3">Gross Bi-Weekly</th>
              <th className="py-2.5 px-3">Gross Monthly</th>
              <th className="py-2.5 px-3">VA Net Take-Home (Annual / Bi-Wk)</th>
              <th className="py-2.5 px-3">PA Net Take-Home (Annual / Bi-Wk)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {tableData.map((row) => (
              <tr key={row.hourlyRate} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-900">
                  {formatCurrency(row.hourlyRate)} / hr
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-800">
                  {formatCompactCurrency(row.annualGross)}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {formatCurrency(row.biWeeklyGross)}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {formatCurrency(row.monthlyGross)}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">
                    {formatCompactCurrency(Math.round(row.vaTakeHomeAnnual || 0))}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatCurrency(row.vaTakeHomeBiWeekly || 0)} bi-weekly
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">
                    {formatCompactCurrency(Math.round(row.paTakeHomeAnnual || 0))}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatCurrency(row.paTakeHomeBiWeekly || 0)} bi-weekly
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* State Calculator Links */}
      <div className="pt-4 border-t border-slate-200 space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-slate-900 mb-1">State Paycheck Calculators</h3>
          <p className="text-slate-500 mb-2">
            Estimate paycheck deductions including custom pre-tax benefits, local taxes, and state withholding certificates:
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/virginia-paycheck-calculator"
              className="px-3 py-1.5 rounded-md border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition"
            >
              Virginia Paycheck Calculator (Form VA-4) &rarr;
            </Link>
            <Link
              href="/pennsylvania-paycheck-calculator"
              className="px-3 py-1.5 rounded-md border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition"
            >
              Pennsylvania Paycheck Calculator (REV-415 &amp; UC) &rarr;
            </Link>
            <Link
              href="/paycheck-calculator-by-state"
              className="px-3 py-1.5 rounded-md border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition"
            >
              Browse All State Calculators &rarr;
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 mb-1">Salary After Tax Breakdowns</h3>
          <p className="text-slate-500 mb-2">
            Detailed take-home pay analysis for common annual salaries:
          </p>
          <div className="flex flex-wrap gap-2">
            {vaSalaryPages.slice(0, 5).map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="px-2.5 py-1 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                VA ${page.salary.toLocaleString("en-US")} after tax
              </Link>
            ))}
            {paSalaryPages.slice(0, 5).map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className="px-2.5 py-1 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition"
              >
                PA ${page.salary.toLocaleString("en-US")} after tax
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
