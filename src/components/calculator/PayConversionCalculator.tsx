"use client";

import React, { useState, useMemo } from "react";
import {
  convertHourlyToSalary,
  convertSalaryToHourly,
  ConversionBreakdown,
} from "@/lib/payConversion";
import { formatCurrency } from "@/lib/tax/formatters";

interface PayConversionCalculatorProps {
  initialMode: "hourly-to-salary" | "salary-to-hourly";
}

export const PayConversionCalculator: React.FC<PayConversionCalculatorProps> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<"hourly-to-salary" | "salary-to-hourly">(initialMode);
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [annualSalary, setAnnualSalary] = useState<number>(52000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [unpaidDaysOff, setUnpaidDaysOff] = useState<number>(0);

  const breakdown: ConversionBreakdown = useMemo(() => {
    if (mode === "hourly-to-salary") {
      return convertHourlyToSalary(hourlyRate, hoursPerWeek, weeksPerYear, unpaidDaysOff);
    } else {
      return convertSalaryToHourly(annualSalary, hoursPerWeek, weeksPerYear, unpaidDaysOff);
    }
  }, [mode, hourlyRate, annualSalary, hoursPerWeek, weeksPerYear, unpaidDaysOff]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "hourly-to-salary"
              ? "Hourly to Salary Conversion Calculator"
              : "Salary to Hourly Conversion Calculator"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Convert compensation between hourly and annualized gross pay periods.
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => setMode("hourly-to-salary")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              mode === "hourly-to-salary"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Hourly to Salary
          </button>
          <button
            type="button"
            onClick={() => setMode("salary-to-hourly")}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              mode === "salary-to-hourly"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Salary to Hourly
          </button>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mode === "hourly-to-salary" ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hourly Pay Rate ($/hr)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.25"
                value={hourlyRate || ""}
                onChange={(e) => setHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:outline-emerald-600 focus:border-emerald-600"
                placeholder="25.00"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Annual Salary ($/year)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold text-xs">
                $
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={annualSalary || ""}
                onChange={(e) => setAnnualSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:outline-emerald-600 focus:border-emerald-600"
                placeholder="52,000"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Hours Worked Per Week
          </label>
          <input
            type="number"
            min="1"
            max="168"
            step="1"
            value={hoursPerWeek || ""}
            onChange={(e) => setHoursPerWeek(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:outline-emerald-600 focus:border-emerald-600"
            placeholder="40"
          />
          <span className="text-[10px] text-slate-400">Default: 40 hrs/wk</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Weeks Worked Per Year
          </label>
          <input
            type="number"
            min="1"
            max="52"
            step="1"
            value={weeksPerYear || ""}
            onChange={(e) => setWeeksPerYear(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:outline-emerald-600 focus:border-emerald-600"
            placeholder="52"
          />
          <span className="text-[10px] text-slate-400">Default: 52 wks/yr</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Unpaid Days Off (Annual)
          </label>
          <input
            type="number"
            min="0"
            max="365"
            step="1"
            value={unpaidDaysOff}
            onChange={(e) => setUnpaidDaysOff(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-900 focus:outline-emerald-600 focus:border-emerald-600"
            placeholder="0"
          />
          <span className="text-[10px] text-slate-400">Optional: 0 days</span>
        </div>
      </div>

      {/* Primary Conversion Outputs */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {mode === "hourly-to-salary" ? "Calculated Annual Gross Pay" : "Calculated Equivalent Hourly Wage"}
            </span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {mode === "hourly-to-salary"
                ? formatCurrency(breakdown.annualGross)
                : `${formatCurrency(breakdown.hourlyRate)} / hr`}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Based on {breakdown.effectiveAnnualHours.toLocaleString("en-US")} total paid hours per year
          </div>
        </div>

        {/* Period Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Annual</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.annualGross)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Monthly (1/12)</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.monthlyGross)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Semi-Monthly (1/24)</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.semiMonthlyGross)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Bi-Weekly (1/26)</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.biWeeklyGross)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Weekly (1/52)</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.weeklyGross)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Daily (1/260)</span>
            <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">
              {formatCurrency(breakdown.dailyGross)}
            </p>
          </div>
        </div>
      </div>

      {/* Formula & Step-by-Step Arithmetic Details */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs text-slate-700">
        <h3 className="font-bold text-emerald-950 text-sm">
          Calculation Formula &amp; Step-by-Step Arithmetic
        </h3>

        <div className="space-y-1.5 font-mono text-[11px] text-slate-800 bg-white p-3 rounded-lg border border-emerald-100">
          <p>
            <strong>1. Base Annual Hours:</strong> {hoursPerWeek} hours/week × {weeksPerYear} weeks/year ={" "}
            {breakdown.baseAnnualHours.toLocaleString("en-US")} total base hours
          </p>
          {unpaidDaysOff > 0 && (
            <p>
              <strong>2. Unpaid Time Off:</strong> {unpaidDaysOff} unpaid days × ({hoursPerWeek} / 5 = {breakdown.hoursPerDay} hrs/day) ={" "}
              {breakdown.unpaidHours.toLocaleString("en-US")} unpaid hours deducted
            </p>
          )}
          <p>
            <strong>{unpaidDaysOff > 0 ? "3." : "2."} Net Working Hours:</strong>{" "}
            {breakdown.baseAnnualHours.toLocaleString("en-US")} base hours
            {unpaidDaysOff > 0 ? ` - ${breakdown.unpaidHours} unpaid hours` : ""}{" "}
            = <strong>{breakdown.effectiveAnnualHours.toLocaleString("en-US")} net annual working hours</strong>
          </p>

          {mode === "hourly-to-salary" ? (
            <p>
              <strong>{unpaidDaysOff > 0 ? "4." : "3."} Annual Gross Calculation:</strong>{" "}
              {formatCurrency(breakdown.hourlyRate)}/hr × {breakdown.effectiveAnnualHours.toLocaleString("en-US")} hours ={" "}
              <strong className="text-emerald-800">{formatCurrency(breakdown.annualGross)}</strong>
            </p>
          ) : (
            <p>
              <strong>{unpaidDaysOff > 0 ? "4." : "3."} Hourly Wage Calculation:</strong>{" "}
              {formatCurrency(breakdown.annualGross)} ÷ {breakdown.effectiveAnnualHours.toLocaleString("en-US")} hours ={" "}
              <strong className="text-emerald-800">{formatCurrency(breakdown.hourlyRate)} / hr</strong>
            </p>
          )}

          <p>
            <strong>{unpaidDaysOff > 0 ? "5." : "4."} Period Conversions:</strong>
            <br />
            &bull; Monthly = {formatCurrency(breakdown.annualGross)} ÷ 12 = {formatCurrency(breakdown.monthlyGross)}
            <br />
            &bull; Semi-Monthly = {formatCurrency(breakdown.annualGross)} ÷ 24 = {formatCurrency(breakdown.semiMonthlyGross)}
            <br />
            &bull; Bi-Weekly = {formatCurrency(breakdown.annualGross)} ÷ 26 = {formatCurrency(breakdown.biWeeklyGross)}
            <br />
            &bull; Weekly = {formatCurrency(breakdown.annualGross)} ÷ 52 = {formatCurrency(breakdown.weeklyGross)}
            <br />
            &bull; Daily = {formatCurrency(breakdown.weeklyGross)} ÷ 5 = {formatCurrency(breakdown.dailyGross)}
          </p>
        </div>

        <p className="text-[11px] text-slate-500">
          Note: In standard full-time employment (40 hours per week for 52 weeks), there are exactly 2,080 working hours per calendar year (40 × 52 = 2,080).
        </p>
      </div>
    </div>
  );
};
