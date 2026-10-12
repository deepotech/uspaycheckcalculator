import { describe, it, expect } from "vitest";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { PaycheckCalculationInputs } from "@/lib/tax/types";

describe("Minnesota Paycheck Withholding - 2026 (UNVERIFIED — no official MN DOR document supplied)", () => {
  const baseInput: PaycheckCalculationInputs = {
    payType: "salary",
    grossAmount: 60000,
    frequency: "bi-weekly",
    stateCode: "MN",
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
      mnAllowances: 1, // 1 allowance — $5,300 amount UNVERIFIED
    },
  };

  /**
   * Test 1: $60,000 Annual Salary - Bi-Weekly (Single, 1 MN allowance)
   * STATUS: UNVERIFIED — brackets ($33,310 / $109,430 / $203,150), rates (5.35% / 6.80% / 7.85% / 9.85%),
   *   and allowance amount ($5,300) have NOT been confirmed against an official MN DOR document supplied by the user.
   * Calculation (DERIVED FROM UNVERIFIED DATA):
   *   Gross bi-weekly: $60,000 / 26 = $2,307.69.
   *   Taxable Annual = $60,000 - $5,300 = $54,700.
   *   5.35% on first $33,310 = $1,782.09
   *   6.80% on ($54,700 - $33,310 = $21,390) = $1,454.52
   *   Total annual MN tax = $3,236.61.
   *   Bi-weekly MN tax = $3,236.61 / 26 = $124.49.
   *   MN Paid Leave: 0.44% on $2,307.69 = $10.15 (rate also UNVERIFIED).
   */
  it("UNVERIFIED: calculates $60k bi-weekly single paycheck in Minnesota", () => {
    const result = calculatePaycheck(baseInput);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(124.49, 1);
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(10.15, 1);
  });

  /**
   * Test 2: $100,000 Annual Salary - Semi-Monthly (Single, 1 MN allowance)
   * STATUS: UNVERIFIED — brackets, rates, and allowance amount have NOT been confirmed against
   *   an official MN DOR document supplied by the user.
   * Calculation (DERIVED FROM UNVERIFIED DATA):
   *   Annualized: $100,000. Less $5,300 = $94,700 taxable.
   *   5.35% on $33,310 = $1,782.09
   *   6.80% on ($94,700 - $33,310 = $61,390) = $4,174.52
   *   Total annual MN tax = $5,956.61.
   *   Semi-monthly (24 periods) = $5,956.61 / 24 = $248.19.
   *   MN Paid Leave: ($100,000 * 0.0044) / 24 = $18.33.
   */
  it("UNVERIFIED: calculates $100k semi-monthly single paycheck in Minnesota", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 100000,
      frequency: "semi-monthly",
    });
    expect(result.taxes.stateIncomeTax).toBeCloseTo(248.19, 1);
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(18.33, 1);
  });

  /**
   * Test 3: $150,000 Annual Salary - Monthly (Single, 1 MN allowance)
   * STATUS: UNVERIFIED — brackets, rates, and allowance amount have NOT been confirmed against
   *   an official MN DOR document supplied by the user.
   * Calculation (DERIVED FROM UNVERIFIED DATA):
   *   Annualized: $150,000. Less $5,300 = $144,700 taxable.
   *   5.35% on $33,310 = $1,782.09
   *   6.80% on ($109,430 - $33,310 = $76,120) = $5,176.16
   *   7.85% on ($144,700 - $109,430 = $35,270) = $2,768.70
   *   Total annual MN tax = $9,726.95.
   *   Monthly (12 periods) = $9,726.95 / 12 = $810.58.
   *   MN Paid Leave: ($150,000 * 0.0044) / 12 = $55.00.
   */
  it("UNVERIFIED: calculates $150k monthly single paycheck reaching 7.85% bracket in MN", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 150000,
      frequency: "monthly",
    });
    expect(result.taxes.stateIncomeTax).toBeCloseTo(810.58, 1);
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(55.0, 1);
  });

  /**
   * Test 4: $220,000 High Salary - MN Paid Leave Cap Test ($184,500 wage cap)
   * STATUS: UNVERIFIED — the 0.44% Paid Leave rate and the $184,500 cap have NOT been confirmed
   *   against an official MN DOR or MN DEED document supplied by the user.
   * Calculation (DERIVED FROM UNVERIFIED DATA):
   *   Max annual MN Paid Leave employee share = $184,500 * 0.0044 = $811.80.
   *   Monthly Paid Leave = $811.80 / 12 = $67.65.
   */
  it("UNVERIFIED: caps Minnesota Paid Leave at $184,500 wage base for 2026", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 220000,
      frequency: "monthly",
    });
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(67.65, 1);
  });

  /**
   * Test 5: $80,000 Married Filing Jointly - Bi-Weekly (2 allowances = $10,600)
   * STATUS: UNVERIFIED — MFJ brackets ($48,700 / $193,490 / $337,940), rates, and allowance amount
   *   have NOT been confirmed against an official MN DOR document supplied by the user.
   * Calculation (DERIVED FROM UNVERIFIED DATA):
   *   Taxable Annual: $80,000 - $10,600 = $69,400.
   *   5.35% on first $48,700 = $2,605.45
   *   6.80% on ($69,400 - $48,700 = $20,700) = $1,407.60
   *   Total annual MN tax = $4,013.05.
   *   Bi-weekly (26 periods) = $4,013.05 / 26 = $154.35.
   */
  it("UNVERIFIED: calculates $80k bi-weekly married filing jointly paycheck in MN", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 80000,
      w4: { ...baseInput.w4, filingStatus: "married_joint" },
      stateInputs: { mnAllowances: 2 },
    });
    expect(result.taxes.stateIncomeTax).toBeCloseTo(154.35, 1);
  });
});
