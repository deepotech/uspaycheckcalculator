"use client";

import React from "react";
import { formatCurrency, formatPercent } from "@/lib/tax/formatters";

interface ChartSegment {
  label: string;
  amount: number;
  color: string;
}

interface BreakdownChartProps {
  grossPay: number;
  netPay: number;
  federalTax: number;
  ficaTax: number;
  stateTax: number;
  localTax: number;
  preTaxDeductions: number;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  grossPay,
  netPay,
  federalTax,
  ficaTax,
  stateTax,
  localTax,
  preTaxDeductions,
}) => {
  if (grossPay <= 0) return null;

  const segments: ChartSegment[] = [
    { label: "Take-Home Pay", amount: netPay, color: "#10b981" }, // emerald-500
    { label: "Federal Income Tax", amount: federalTax, color: "#3b82f6" }, // blue-500
    { label: "FICA (SS & Medicare)", amount: ficaTax, color: "#8b5cf6" }, // purple-500
    { label: "State Income Tax", amount: stateTax, color: "#f59e0b" }, // amber-500
    { label: "Local / Other Tax", amount: localTax, color: "#ef4444" }, // red-500
    { label: "Pre-Tax Deductions", amount: preTaxDeductions, color: "#64748b" }, // slate-500
  ].filter((s) => s.amount > 0);

  const total = segments.reduce((acc, s) => acc + s.amount, 0);

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 tracking-tight">
        Where Does Your Money Go?
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            {segments.map((seg, i) => {
              const percent = total > 0 ? seg.amount / total : 0;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += percent;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase">Net Take-Home</span>
            <span className="text-base font-bold text-slate-900">
              {formatPercent(grossPay > 0 ? netPay / grossPay : 0)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg, i) => {
            const pct = grossPay > 0 ? seg.amount / grossPay : 0;
            return (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-700 font-medium">{seg.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">{formatCurrency(seg.amount)}</span>
                  <span className="text-slate-400 ml-1.5 text-[11px]">({formatPercent(pct)})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
