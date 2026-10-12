import { describe, it, expect } from "vitest";
import { calculatePaycheck, calculateMultiPeriodBreakdown } from "@/lib/tax/calculator";
import { calculateVirginiaTax } from "@/lib/tax/stateCalculator";
import { PaycheckCalculationInputs } from "@/lib/tax/types";

describe("Virginia Paycheck Withholding - Guide 2614086 (Rev. 10/26)", () => {
  const baseInput: PaycheckCalculationInputs = {
    payType: "salary",
    grossAmount: 50000,
    frequency: "bi-weekly",
    stateCode: "VA",
    w4: {
      filingStatus: "single",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
    bypassPublishGate: true,
    stateInputs: {
      vaPersonalExemptions: 1, // 1 personal exemption ($930)
      vaAgeBlindExemptions: 0,
    },
  };

  /**
   * Test 1: Official Worked Example from Guide Page 22
   * STATUS: VERIFIED (Virginia Tax, Income Tax Withholding Guide for Employers 2614086 Rev. 10/26, page 22)
   * Gross G = $2,649 semi-monthly (P = 24).
   * E1 = 5 personal exemptions ($930 * 5 = $4,650).
   * Standard deduction: flat $8,750.
   * G * P = $2,649 * 24 = $63,576.
   * Total deductions = $8,750 + $4,650 = $13,400.
   * Taxable Annual T = $63,576 - $13,400 = $50,176.
   * Tax calculation W:
   *  First $17,000 tax = $720
   *  Excess over $17,000 = $50,176 - $17,000 = $33,176 * 0.0575 = $1,907.62
   *  W = $720 + $1,907.62 = $2,627.62 -> rounded to nearest dollar = $2,628.
   * Withholding per period = $2,628 / 24 = $109.50.
   */
  it("verifies official worked example from Virginia guide page 22 (G=$2,649, P=24, E1=5)", () => {
    const calc = calculateVirginiaTax(63576, 5, 0, 24);
    expect(calc.taxableAnnual).toBe(50176);
    expect(calc.annualTaxRounded).toBe(2628);
    expect(calc.periodTax).toBe(109.50);
  });

  /**
   * Test 2: $50,000 Annual Salary - Bi-Weekly (Single, 1 VA exemption)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   * P = 26, G*P = $50,000.
   * Total deductions: $8,750 + (1 * $930) = $9,680.
   * T = $50,000 - $9,680 = $40,320.
   * Tax W: $720 + (40,320 - 17,000) * 0.0575 = $720 + 23,320 * 0.0575 = $2,060.90 -> round: $2,061.
   * Bi-weekly withholding = $2,061 / 26 = $79.27.
   */
  it("calculates $50k bi-weekly single paycheck in Virginia", () => {
    const result = calculatePaycheck({ ...baseInput, grossAmount: 50000 });
    expect(result.taxes.stateIncomeTax).toBe(79.27);
    expect(result.taxes.federalIncomeTax).toBeCloseTo(146.92, 1);
    expect(result.taxes.socialSecurity).toBeCloseTo(119.23, 1);
    expect(result.taxes.medicare).toBeCloseTo(27.88, 1);
    // Net take home = 1923.08 - 146.92 - 119.23 - 27.88 - 79.27 = 1549.78
    expect(result.netPay).toBeCloseTo(1549.78, 1);
  });

  /**
   * Test 3: $75,000 Annual Salary - Semi-Monthly (Single, 1 VA exemption)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   * P = 24, G*P = $75,000. Total deductions = $9,680.
   * T = $75,000 - $9,680 = $65,320.
   * Tax W: $720 + ($65,320 - $17,000) * 0.0575 = $720 + $48,320 * 0.0575 = $3,498.40 -> round: $3,498.
   * Semi-monthly withholding = $3,498 / 24 = $145.75.
   */
  it("calculates $75k semi-monthly single paycheck in Virginia", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 75000,
      frequency: "semi-monthly",
    });
    expect(result.taxes.stateIncomeTax).toBe(145.75);
  });

  /**
   * Test 4: $120,000 Annual Salary - Married Filing Jointly - Bi-Weekly (E1 = 2, E2 = 0)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   * Standard deduction in formula is flat $8,750 for all filing statuses (guide page 21).
   * Married filer claims E1 = 2 (self + spouse) = 2 * $930 = $1,860.
   * Total deductions = $8,750 + $1,860 = $10,610.
   * T = $120,000 - $10,610 = $109,390.
   * Tax W: $720 + (109,390 - 17,000) * 0.0575 = $720 + 92,390 * 0.0575 = $6,032.425 -> round: $6,032.
   * Bi-weekly withholding = $6,032 / 26 = $232.00. (Exact unrounded W/26 is $232.02).
   */
  it("calculates $120k bi-weekly married filing jointly paycheck in Virginia (E1=2)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 120000,
      frequency: "bi-weekly",
      w4: { ...baseInput.w4, filingStatus: "married_joint" },
      stateInputs: { vaPersonalExemptions: 2, vaAgeBlindExemptions: 0 },
    });
    expect(result.taxes.stateIncomeTax).toBe(232.00);
  });

  /**
   * Test 5: $100,000 Annual Salary - Monthly (Single, 1 VA exemption)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   * P = 12, G*P = $100,000. Total deductions = $9,680.
   * T = $100,000 - $9,680 = $90,320.
   * Tax W: $720 + ($90,320 - $17,000) * 0.0575 = $720 + $73,320 * 0.0575 = $4,935.90 -> round: $4,936.
   * Monthly withholding = $4,936 / 12 = $411.33.
   */
  it("calculates $100k monthly single paycheck in Virginia", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 100000,
      frequency: "monthly",
    });
    expect(result.taxes.stateIncomeTax).toBe(411.33);
  });

  /**
   * Test 6: $25/hour Weekly Hourly Paycheck (40 hrs/wk = $52,000/yr, 1 exemption)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   * P = 52, G*P = $52,000. Total deductions = $9,680.
   * T = $52,000 - $9,680 = $42,320.
   * Tax W: $720 + ($42,320 - $17,000) * 0.0575 = $720 + $25,320 * 0.0575 = $2,175.90 -> round: $2,176.
   * Weekly withholding = $2,176 / 52 = $41.85.
   */
  it("calculates $25/hr weekly hourly paycheck in Virginia", () => {
    const result = calculatePaycheck({
      ...baseInput,
      payType: "hourly",
      grossAmount: 25,
      hoursPerWeek: 40,
      frequency: "weekly",
    });
    expect(result.taxes.stateIncomeTax).toBe(41.85);
  });
  /**
   * Test 7: Annual column — $65,000 single, 1 VA exemption, no pre-tax deductions
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (Guide 2614086 pages 21-22)
   *
   * Annual state-taxable T = $65,000 - [$8,750 + (1 × $930)] = $55,320.
   * Annual tax W = $720 + ($55,320 − $17,000) × 0.0575
   *             = $720 + $38,320 × 0.0575 = $2,923.40 → round = $2,923.
   * Annual federal (bracket method, no per-period rounding):
   *   Adjusted = $65,000 − $8,600 = $56,400.
   *   10% on $12,400 = $1,240; 12% on $36,500 = $4,380. Total = $5,620.00.
   * Annual SS  = $65,000 × 6.2% = $4,030.00 (ficaConstants.ssWageBase = 184500).
   * Annual Med = $65,000 × 1.45% = $942.50.
   * Annual total taxes = $5,620 + $4,030 + $942.50 + $2,923 = $13,515.50.
   * Annual net = $65,000 − $13,515.50 = $51,484.50.
   */
  it("annual column — $65k single VA: state=$2,923, federal=$5,620, SS=$4,030, Med=$942.50", () => {
    const result = calculateMultiPeriodBreakdown({
      payType: "salary",
      grossAmount: 65000,
      frequency: "bi-weekly",
      stateCode: "VA",
      w4: {
        filingStatus: "single",
        step2MultipleJobs: false,
        step3DependentsCredit: 0,
        step4aOtherIncome: 0,
        step4bDeductions: 0,
        step4cExtraWithholding: 0,
      },
      preTax: {},
      bypassPublishGate: true,
      stateInputs: { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 },
    });
    expect(result.annual.grossPay).toBe(65000);
    expect(result.annual.taxes.stateIncomeTax).toBe(2923);         // round(W) per guide page 22
    expect(result.annual.taxes.federalIncomeTax).toBe(5620.00);    // bracket method, no drift
    expect(result.annual.taxes.socialSecurity).toBe(4030.00);      // 6.2% × $65k from ficaConstants
    expect(result.annual.taxes.medicare).toBe(942.50);             // 1.45% × $65k from ficaConstants
    expect(result.annual.taxes.totalTaxes).toBe(13515.50);
    expect(result.annual.netPay).toBe(51484.50);
  });

  /**
   * Test 8: Verifies Virginia bracket cumulative bases in virginia.json
   * 2% bracket: cumulative base = 0
   * 3% bracket: cumulative base = 60
   * 5% bracket: cumulative base = 120
   * 5.75% bracket: cumulative base = 720
   */
  it("verifies virginia.json brackets have cumulative bases 0, 60, 120, 720", async () => {
    const vaData = (await import("@/data/states/virginia.json")).default;
    expect(vaData.brackets).toHaveLength(4);
    expect(vaData.brackets[0].cumulativeBase).toBe(0);
    expect(vaData.brackets[1].cumulativeBase).toBe(60);
    expect(vaData.brackets[2].cumulativeBase).toBe(120);
    expect(vaData.brackets[3].cumulativeBase).toBe(720);
  });

  /**
   * Test 9: Gating — when bypassPublishGate is false and state is not verified in states-meta.json,
   * state income tax should be 0 in calculatePaycheck (and UI displays unavailable message).
   */
  it("gates state withholding when state is not verified and bypass is not set", () => {
    const result = calculatePaycheck({
      ...baseInput,
      stateCode: "MN",
      bypassPublishGate: false,
    });
    expect(result.taxes.stateIncomeTax).toBe(0);
  });
});

