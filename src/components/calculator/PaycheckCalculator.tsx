"use client";

import React, { useState, useMemo } from "react";
import {
  PayType,
  PayFrequency,
  W4Inputs,
  PreTaxDeductions,
  StateSpecificInputs,
  PaycheckCalculationInputs,
} from "@/lib/tax/types";
import { calculatePaycheck, calculateMultiPeriodBreakdown } from "@/lib/tax/calculator";
import { CONTACT_EMAIL } from "@/lib/site";
import { CalculatorInputs } from "./CalculatorInputs";
import { CalculatorResults } from "./CalculatorResults";
import { BreakdownChart } from "./BreakdownChart";
import { BreakdownTable } from "./BreakdownTable";

interface PaycheckCalculatorProps {
  initialStateCode?: string;
  hideStateSelector?: boolean;
  initialPayType?: PayType;
  initialFrequency?: PayFrequency;
  initialGrossAmount?: number;
}

export const PaycheckCalculator: React.FC<PaycheckCalculatorProps> = ({
  initialStateCode = "VA",
  hideStateSelector = false,
  initialPayType = "salary",
  initialFrequency = "bi-weekly",
  initialGrossAmount,
}) => {
  const [payType, setPayType] = useState<PayType>(initialPayType);
  const [grossAmount, setGrossAmount] = useState<number>(
    initialGrossAmount !== undefined
      ? initialGrossAmount
      : initialPayType === "hourly"
      ? 30
      : 65000
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [frequency, setFrequency] = useState<PayFrequency>(initialFrequency);
  const [stateCode, setStateCode] = useState<string>(initialStateCode);

  const [w4, setW4] = useState<W4Inputs>({
    filingStatus: "single",
    step2MultipleJobs: false,
    step3DependentsCredit: 0,
    step4aOtherIncome: 0,
    step4bDeductions: 0,
    step4cExtraWithholding: 0,
  });

  const [preTax, setPreTax] = useState<PreTaxDeductions>({
    k401Percent: 0,
    healthInsurance: 0,
    hsa: 0,
  });

  const [stateInputs, setStateInputs] = useState<StateSpecificInputs>({
    vaPersonalExemptions: 1,
    paLocalEitRate: 0.0,
  });

  const calculationInputs: PaycheckCalculationInputs = useMemo(
    () => ({
      payType,
      grossAmount,
      hoursPerWeek,
      frequency,
      stateCode,
      w4,
      preTax,
      stateInputs,
    }),
    [payType, grossAmount, hoursPerWeek, frequency, stateCode, w4, preTax, stateInputs]
  );

  const currentBreakdown = useMemo(() => calculatePaycheck(calculationInputs), [calculationInputs]);
  const multiPeriodBreakdown = useMemo(
    () => calculateMultiPeriodBreakdown(calculationInputs),
    [calculationInputs]
  );

  return (
    <div className="w-full space-y-6">
      {/* Required Disclosure & Method Badges */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
        <div>
          <span className="font-bold text-amber-950">Tax Year 2026</span> •{" "}
          <span className="font-medium">IRS Pub 15-T Employer Withholding Percentage Method</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Paycheck%20Calculator%20Error%20Report`}
            className="text-[11px] font-medium text-amber-900 underline hover:text-amber-950 transition"
          >
            Report an error
          </a>
          <div className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
            Estimates only. Not tax advice.
          </div>
        </div>
      </div>

      {/* Main 2-column hero calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <CalculatorInputs
            grossAmount={grossAmount}
            setGrossAmount={setGrossAmount}
            payType={payType}
            setPayType={setPayType}
            hoursPerWeek={hoursPerWeek}
            setHoursPerWeek={setHoursPerWeek}
            frequency={frequency}
            setFrequency={setFrequency}
            stateCode={stateCode}
            setStateCode={setStateCode}
            w4={w4}
            setW4={setW4}
            preTax={preTax}
            setPreTax={setPreTax}
            stateInputs={stateInputs}
            setStateInputs={setStateInputs}
            hideStateSelector={hideStateSelector}
          />
        </div>

        <div className="lg:col-span-5">
          <CalculatorResults
            breakdown={currentBreakdown}
            frequency={frequency}
            setFrequency={setFrequency}
            stateCode={stateCode}
          />
        </div>
      </div>

      {/* Zero-dependency SVG Chart */}
      <BreakdownChart
        grossPay={currentBreakdown.grossPay}
        netPay={currentBreakdown.netPay}
        federalTax={currentBreakdown.taxes.federalIncomeTax}
        ficaTax={
          currentBreakdown.taxes.socialSecurity +
          currentBreakdown.taxes.medicare +
          currentBreakdown.taxes.additionalMedicare
        }
        stateTax={currentBreakdown.taxes.stateIncomeTax}
        localTax={
          currentBreakdown.taxes.localTax +
          currentBreakdown.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0)
        }
        preTaxDeductions={currentBreakdown.preTaxDeductions.total}
      />

      {/* Comprehensive Multi-Period Breakdown Table */}
      <BreakdownTable breakdown={multiPeriodBreakdown} />
    </div>
  );
};
