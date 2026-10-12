"use client";

import React from "react";
import {
  PayType,
  PayFrequency,
  FederalFilingStatus,
  W4Inputs,
  PreTaxDeductions,
  StateSpecificInputs,
} from "@/lib/tax/types";
import statesMetaData from "@/data/states-meta.json";

interface CalculatorInputsProps {
  grossAmount: number;
  setGrossAmount: (val: number) => void;
  payType: PayType;
  setPayType: (val: PayType) => void;
  hoursPerWeek: number;
  setHoursPerWeek: (val: number) => void;
  frequency: PayFrequency;
  setFrequency: (val: PayFrequency) => void;
  stateCode: string;
  setStateCode: (val: string) => void;
  w4: W4Inputs;
  setW4: React.Dispatch<React.SetStateAction<W4Inputs>>;
  preTax: PreTaxDeductions;
  setPreTax: React.Dispatch<React.SetStateAction<PreTaxDeductions>>;
  stateInputs: StateSpecificInputs;
  setStateInputs: React.Dispatch<React.SetStateAction<StateSpecificInputs>>;
  hideStateSelector?: boolean;
}

export const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  grossAmount,
  setGrossAmount,
  payType,
  setPayType,
  hoursPerWeek,
  setHoursPerWeek,
  frequency,
  setFrequency,
  stateCode,
  setStateCode,
  w4,
  setW4,
  preTax,
  setPreTax,
  stateInputs,
  setStateInputs,
  hideStateSelector = false,
}) => {
  const [showAdvancedW4, setShowAdvancedW4] = React.useState(false);
  const [showPreTax, setShowPreTax] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* 1. Pay Amount and Type */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {payType === "salary" ? "Annual Salary" : "Hourly Pay Rate"}
          </label>
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => {
                setPayType("salary");
                if (grossAmount < 1000) setGrossAmount(65000);
              }}
              className={`px-3 py-1 rounded-md font-medium transition ${
                payType === "salary" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Salary
            </button>
            <button
              type="button"
              onClick={() => {
                setPayType("hourly");
                if (grossAmount > 1000) setGrossAmount(32);
              }}
              className={`px-3 py-1 rounded-md font-medium transition ${
                payType === "hourly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Hourly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-semibold text-sm">
              $
            </span>
            <input
              type="number"
              min="0"
              step={payType === "salary" ? "500" : "0.25"}
              value={grossAmount || ""}
              onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
              placeholder={payType === "salary" ? "65,000" : "32.00"}
            />
          </div>

          {payType === "hourly" && (
            <div>
              <input
                type="number"
                min="1"
                max="168"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 40)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Hours per week (default 40)"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Frequency and Filing Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Pay Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as PayFrequency)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="weekly">Weekly (52 checks/year)</option>
            <option value="bi-weekly">Bi-Weekly (26 checks/year)</option>
            <option value="semi-monthly">Semi-Monthly (24 checks/year)</option>
            <option value="monthly">Monthly (12 checks/year)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Federal Filing Status (W-4)
          </label>
          <select
            value={w4.filingStatus}
            onChange={(e) =>
              setW4((prev) => ({ ...prev, filingStatus: e.target.value as FederalFilingStatus }))
            }
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="single">Single or Married Filing Separately</option>
            <option value="married_joint">Married Filing Jointly</option>
            <option value="head_of_household">Head of Household</option>
          </select>
        </div>
      </div>

      {/* 3. State Selector (if not on dedicated state page) */}
      {!hideStateSelector && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Location / State
          </label>
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="FEDERAL_ONLY">Federal Taxes Only (No State Tax)</option>
            {statesMetaData
              .filter((st) => st.verified && st.isActive)
              .map((st) => (
                <option key={st.stateCode} value={st.stateCode}>
                  {st.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* 4. State-Specific Custom Inputs */}
      {stateCode === "PA" && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Pennsylvania Local Earned Income Tax (EIT Rate)
            </label>
            <span className="text-[11px] text-slate-500">Default: 0.0% (Optional)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                max="20"
                placeholder="e.g. 1 or 3.735"
                value={stateInputs.paLocalEitRate ? stateInputs.paLocalEitRate : ""}
                onChange={(e) =>
                  setStateInputs((prev) => ({ ...prev, paLocalEitRate: parseFloat(e.target.value) || 0 }))
                }
                className="w-32 px-3 py-1.5 pr-6 rounded border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              />
              <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-semibold">%</span>
            </div>
            <span className="text-xs text-slate-500">
              e.g. 1 for 1% resident EIT, or 3.735 for Philadelphia
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Local EIT rates vary by municipality/school district under Act 32. REV-415 directs local earned income tax questions to DCED. Enter your local rate if applicable.
          </p>
        </div>
      )}

      {stateCode === "VA" && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Virginia Form VA-4 Exemptions
            </span>
            <span className="text-[11px] text-slate-500">Std Ded: $8,750 (all filers)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-600">Personal Exemptions (E1)</label>
                <span className="text-[11px] text-slate-400">$930 ea</span>
              </div>
              <input
                type="number"
                min="0"
                max="15"
                value={stateInputs.vaPersonalExemptions ?? (w4.filingStatus === "married_joint" ? 2 : 1)}
                onChange={(e) =>
                  setStateInputs((prev) => ({
                    ...prev,
                    vaPersonalExemptions: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              />
              <span className="text-[10px] text-slate-400">1 (self) or 2 (self + spouse)</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-600">Age 65+ / Blind (E2)</label>
                <span className="text-[11px] text-slate-400">$800 ea</span>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                value={stateInputs.vaAgeBlindExemptions ?? 0}
                onChange={(e) =>
                  setStateInputs((prev) => ({
                    ...prev,
                    vaAgeBlindExemptions: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              />
              <span className="text-[10px] text-slate-400">Default: 0</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pre-Tax Deductions Accordion */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowPreTax(!showPreTax)}
          className="flex items-center justify-between w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <span>{showPreTax ? "− Hide Pre-Tax Deductions" : "+ Add Pre-Tax Deductions (401k, Health)"}</span>
          <span className="text-[11px] font-normal text-slate-400">
            {preTax.k401Percent || preTax.healthInsurance ? "Deductions active" : "Optional"}
          </span>
        </button>

        {showPreTax && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                401(k) Contribution (% of Gross)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={preTax.k401Percent ?? ""}
                  onChange={(e) =>
                    setPreTax((prev) => ({ ...prev, k401Percent: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 pr-7"
                />
                <span className="absolute right-2.5 top-2 text-xs text-slate-400">%</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Health Insurance ($ / pay period)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={preTax.healthInsurance ?? ""}
                  onChange={(e) =>
                    setPreTax((prev) => ({ ...prev, healthInsurance: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="e.g. 150"
                  className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
            {stateCode === "PA" && (
              <div className="sm:col-span-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mt-1">
                <strong>Pennsylvania Note:</strong> Section 125 employee health premium pre-tax treatment is unconfirmed in primary PA DOR documents. By default, health premiums and 401(k) are treated as taxable compensation for PA state income tax.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Form W-4 Advanced Options */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvancedW4(!showAdvancedW4)}
          className="flex items-center justify-between w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <span>{showAdvancedW4 ? "− Hide Form W-4 Options" : "+ Advanced Form W-4 Adjustments"}</span>
          <span className="text-[11px] font-normal text-slate-400">Step 2, 3, 4</span>
        </button>

        {showAdvancedW4 && (
          <div className="space-y-3 mt-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="step2MultipleJobs"
                checked={w4.step2MultipleJobs}
                onChange={(e) =>
                  setW4((prev) => ({ ...prev, step2MultipleJobs: e.target.checked }))
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="step2MultipleJobs" className="text-slate-700 font-medium">
                Step 2(c): Multiple Jobs or Spouse Works (Applies higher withholding schedule)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Step 3: Dependents Credit ($/year)
                </label>
                <input
                  type="number"
                  min="0"
                  value={w4.step3DependentsCredit ?? ""}
                  onChange={(e) =>
                    setW4((prev) => ({ ...prev, step3DependentsCredit: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Step 4(c): Extra Withholding ($/paycheck)
                </label>
                <input
                  type="number"
                  min="0"
                  value={w4.step4cExtraWithholding ?? ""}
                  onChange={(e) =>
                    setW4((prev) => ({ ...prev, step4cExtraWithholding: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
