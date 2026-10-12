"use client";

import React from "react";
import { PaycheckBreakdown, PayFrequency } from "@/lib/tax/types";
import { formatCurrency, formatPercent } from "@/lib/tax/formatters";
import statesMetaData from "@/data/states-meta.json";

interface CalculatorResultsProps {
  breakdown: PaycheckBreakdown;
  frequency: PayFrequency;
  setFrequency: (val: PayFrequency) => void;
  stateCode: string;
}

export const CalculatorResults: React.FC<CalculatorResultsProps> = ({
  breakdown,
  frequency,
  setFrequency,
  stateCode,
}) => {
  const frequencyLabels: Record<PayFrequency, string> = {
    weekly: "Weekly",
    "bi-weekly": "Bi-Weekly",
    "semi-monthly": "Semi-Monthly",
    monthly: "Monthly",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estimated Take-Home Pay
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tax Year 2026
          </span>
        </div>

        {/* Large readable hero net pay */}
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(breakdown.netPay)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            per {frequencyLabels[frequency].toLowerCase()} paycheck
          </p>
        </div>

        {/* Quick frequency switcher tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 mb-6">
          {(["weekly", "bi-weekly", "semi-monthly", "monthly"] as PayFrequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 py-1.5 rounded-md text-center transition ${
                frequency === f ? "bg-white text-slate-900 shadow-xs font-semibold" : "hover:text-slate-900"
              }`}
            >
              {frequencyLabels[f]}
            </button>
          ))}
        </div>

        {/* Breakdown Summary Rows */}
        <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
          <div className="flex justify-between text-slate-600">
            <span>Gross Pay</span>
            <span className="font-semibold text-slate-900">{formatCurrency(breakdown.grossPay)}</span>
          </div>

          {breakdown.preTaxDeductions.total > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Pre-Tax Deductions</span>
              <span className="font-semibold text-slate-700">
                -{formatCurrency(breakdown.preTaxDeductions.total)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Federal Income Tax</span>
            <span className="font-semibold text-slate-900">
              -{formatCurrency(breakdown.taxes.federalIncomeTax)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Social Security (6.2%)</span>
            <span className="font-semibold text-slate-900">
              -{formatCurrency(breakdown.taxes.socialSecurity)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Medicare (1.45% + add&apos;l)</span>
            <span className="font-semibold text-slate-900">
              -{formatCurrency(breakdown.taxes.medicare + breakdown.taxes.additionalMedicare)}
            </span>
          </div>

          {(() => {
            const isFederalOnly = stateCode === "FEDERAL_ONLY";
            const stateMeta = statesMetaData.find((s) => s.stateCode === stateCode);
            const isStateAvailable = isFederalOnly || (stateMeta && stateMeta.verified && stateMeta.isActive);

            return (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>
                    State Income Tax ({isFederalOnly ? "None" : stateCode})
                  </span>
                  <span className="font-semibold text-slate-900">
                    {breakdown.taxes.stateIncomeTax > 0
                      ? `-${formatCurrency(breakdown.taxes.stateIncomeTax)}`
                      : isFederalOnly
                      ? "$0.00"
                      : "State tax not available for this state"}
                  </span>
                </div>
                {!isFederalOnly && !isStateAvailable && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 rounded px-2.5 py-1.5 border border-amber-200">
                    State tax not available for this state: calculation has not been published or verified.
                  </div>
                )}
              </>
            );
          })()}

          {breakdown.taxes.statePayrollTaxes.map((tax, i) => (
            <div key={i} className="flex justify-between text-slate-600">
              <span>{tax.name}</span>
              <span className="font-semibold text-slate-900">-{formatCurrency(tax.amount)}</span>
            </div>
          ))}

          {breakdown.taxes.localTax > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Local Earned Income Tax</span>
              <span className="font-semibold text-slate-900">
                -{formatCurrency(breakdown.taxes.localTax)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold text-slate-900">
            <span>Total Taxes Withheld</span>
            <span className="text-red-600">-{formatCurrency(breakdown.taxes.totalTaxes)}</span>
          </div>
        </div>
      </div>

      {/* Effective Tax Rate Footer Badge */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Effective Tax Rate:</span>
        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
          {formatPercent(breakdown.effectiveTaxRate)}
        </span>
      </div>
    </div>
  );
};
