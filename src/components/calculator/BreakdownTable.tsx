"use client";

import React from "react";
import { MultiPeriodBreakdown } from "@/lib/tax/types";
import { formatCurrency } from "@/lib/tax/formatters";

interface BreakdownTableProps {
  breakdown: MultiPeriodBreakdown;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ breakdown }) => {
  const periods = [
    { label: "Annual", data: breakdown.annual },
    { label: "Monthly", data: breakdown.monthly },
    { label: "Semi-Monthly", data: breakdown.semiMonthly },
    { label: "Bi-Weekly", data: breakdown.biWeekly },
    { label: "Weekly", data: breakdown.weekly },
    { label: "Hourly", data: breakdown.hourly },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mt-6">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Comprehensive Pay Period Breakdown
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Side-by-side comparison across all standard payroll frequencies.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 font-semibold text-slate-700">Category</th>
              {periods.map((p) => (
                <th key={p.label} className="py-2.5 px-3 text-right">
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="bg-slate-50/30 font-medium">
              <td className="py-2 px-4 text-slate-900">Gross Pay</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-slate-900 font-semibold">
                  {formatCurrency(p.data.grossPay)}
                </td>
              ))}
            </tr>

            {/* Pre-Tax Deductions */}
            {breakdown.annual.preTaxDeductions.total > 0 && (
              <tr>
                <td className="py-2 px-4 text-slate-500">Pre-Tax Deductions</td>
                {periods.map((p) => (
                  <td key={p.label} className="py-2 px-3 text-right text-slate-500">
                    -{formatCurrency(p.data.preTaxDeductions.total)}
                  </td>
                ))}
              </tr>
            )}

            {/* Taxes */}
            <tr>
              <td className="py-2 px-4 pl-6 text-slate-600">Federal Income Tax</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-slate-600">
                  -{formatCurrency(p.data.taxes.federalIncomeTax)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-4 pl-6 text-slate-600">Social Security (6.2%)</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-slate-600">
                  -{formatCurrency(p.data.taxes.socialSecurity)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-4 pl-6 text-slate-600">Medicare (1.45% + add&apos;l)</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-slate-600">
                  -{formatCurrency(p.data.taxes.medicare + p.data.taxes.additionalMedicare)}
                </td>
              ))}
            </tr>

            {/* State Income Tax */}
            <tr>
              <td className="py-2 px-4 pl-6 text-slate-600">State Income Tax</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-slate-600">
                  -{formatCurrency(p.data.taxes.stateIncomeTax)}
                </td>
              ))}
            </tr>

            {/* State Payroll / Local */}
            {(breakdown.annual.taxes.statePayrollTaxes.length > 0 || breakdown.annual.taxes.localTax > 0) && (
              <tr>
                <td className="py-2 px-4 pl-6 text-slate-600">State Payroll / Local Tax</td>
                {periods.map((p) => {
                  const statePayrollSum = p.data.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0);
                  const totalLocal = statePayrollSum + p.data.taxes.localTax;
                  return (
                    <td key={p.label} className="py-2 px-3 text-right text-slate-600">
                      -{formatCurrency(totalLocal)}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Total Taxes */}
            <tr className="bg-red-50/20 text-red-950 font-medium">
              <td className="py-2 px-4">Total Taxes</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2 px-3 text-right text-red-600 font-semibold">
                  -{formatCurrency(p.data.taxes.totalTaxes)}
                </td>
              ))}
            </tr>

            {/* Net Pay */}
            <tr className="bg-emerald-50/40 font-bold text-slate-900 border-t border-emerald-200">
              <td className="py-2.5 px-4 text-emerald-900 text-sm">Net Take-Home Pay</td>
              {periods.map((p) => (
                <td key={p.label} className="py-2.5 px-3 text-right text-emerald-700 text-sm">
                  {formatCurrency(p.data.netPay)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="px-6 py-3 text-[11px] text-slate-400 border-t border-slate-100">
        Per-period amounts are rounded to the nearest cent independently, so summing period
        columns may differ slightly from the Annual column, which is computed directly from
        annual figures using a single rounding pass.
      </p>
    </div>
  );
};
