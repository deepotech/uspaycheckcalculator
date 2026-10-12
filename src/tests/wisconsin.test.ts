import { describe, it, expect } from "vitest";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { PaycheckCalculationInputs } from "@/lib/tax/types";

describe("Wisconsin Paycheck Withholding - Pub W-166 (January 2026) Verification", () => {
  const baseInput: PaycheckCalculationInputs = {
    payType: "salary",
    grossAmount: 50000,
    frequency: "bi-weekly",
    stateCode: "WI",
    bypassPublishGate: true,
    w4: {
      filingStatus: "single",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
    stateInputs: {
      wiExemptions: 1,
    },
  };

  /**
   * Example 1: Official worked example from Pub W-166 (January 2026), pages 26-27
   * Weekly gross: $350. Single, 1 exemption.
   * Pay periods P: 52.
   * Annual gross: $350 * 52 = $18,200.
   * Deduction: $6,702 - 0.12 * ($18,200 - $17,780) = $6,702 - $50.40 = $6,651.60.
   * Exemption: 1 * $400 = $400.
   * Annual net wage: $18,200 - $6,651.60 - $400 = $11,148.40.
   * Tax: 3.54% on $11,148.40 = $394.65.
   * Weekly withholding: $394.65 / 52 = $7.59.
   * STATUS: VERIFIED (Pub W-166 Jan 2026, pages 26-27, Example 1).
   */
  it("Example 1: calculates $7.59 weekly withholding ($350 weekly single, 1 exemption)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 350 * 52, // $18,200 annual salary
      frequency: "weekly",
      w4: { ...baseInput.w4, filingStatus: "single" },
      stateInputs: { wiExemptions: 1 },
    });
    expect(result.taxes.stateIncomeTax).toBe(7.59);
  });

  /**
   * Example 2: Official worked example from Pub W-166 (January 2026), pages 26-27
   * Weekly gross: $500. Single, 3 exemptions.
   * Pay periods P: 52.
   * Annual gross: $500 * 52 = $26,000.
   * Deduction: $6,702 - 0.12 * ($26,000 - $17,780 = $8,220) = $6,702 - $986.40 = $5,715.60.
   * Exemptions: 3 * $400 = $1,200.
   * Annual net wage: $26,000 - $5,715.60 - $1,200 = $19,084.40.
   * Tax: $451.70 + 4.65% on ($19,084.40 - $12,760 = $6,324.40) = $451.70 + $294.08 = $745.78.
   * Weekly withholding: $745.78 / 52 = $14.34.
   * STATUS: VERIFIED (Pub W-166 Jan 2026, pages 26-27, Example 2).
   */
  it("Example 2: calculates $14.34 weekly withholding ($500 weekly single, 3 exemptions)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 500 * 52, // $26,000 annual salary
      frequency: "weekly",
      w4: { ...baseInput.w4, filingStatus: "single" },
      stateInputs: { wiExemptions: 3 },
    });
    expect(result.taxes.stateIncomeTax).toBe(14.34);
  });

  /**
   * Example 3: Official worked example from Pub W-166 (January 2026), pages 26-27
   * Bi-weekly gross: $1,000. Married, 3 exemptions.
   * Pay periods P: 26.
   * Annual gross: $1,000 * 26 = $26,000.
   * Married deduction: $9,461 - 0.20 * ($26,000 - $25,727 = $273) = $9,461 - $54.60 = $9,406.40.
   * Exemptions: 3 * $400 = $1,200.
   * Annual net wage: $26,000 - $9,406.40 - $1,200 = $15,393.60.
   * Tax: $451.70 + 4.65% on ($15,393.60 - $12,760 = $2,633.60) = $451.70 + $122.46 = $574.16.
   * Bi-weekly withholding: $574.16 / 26 = $22.08.
   * STATUS: VERIFIED (Pub W-166 Jan 2026, pages 26-27, Example 3).
   */
  it("Example 3: calculates $22.08 bi-weekly withholding ($1,000 bi-weekly married, 3 exemptions)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 1000 * 26, // $26,000 annual salary
      frequency: "bi-weekly",
      w4: { ...baseInput.w4, filingStatus: "married_joint" },
      stateInputs: { wiExemptions: 3 },
    });
    expect(result.taxes.stateIncomeTax).toBe(22.08);
  });

  /**
   * Test 4: $60,000 Annual Salary - Bi-Weekly (Single, 1 exemption)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (W-166 Alternate Method)
   * Annual gross: $60,000.
   * Deduction: $6,702 - 0.12 * ($60,000 - $17,780 = $42,220) = $6,702 - $5,066.40 = $1,635.60.
   * Exemption: 1 * $400 = $400.
   * Annual net wage: $60,000 - $1,635.60 - $400 = $57,964.40.
   * Tax: $1,045.04 + 5.30% on ($57,964.40 - $25,520 = $32,444.40) = $1,045.04 + $1,719.55 = $2,764.59.
   * Bi-weekly withholding: $2,764.59 / 26 = $106.33.
   */
  it("DERIVED-FROM-OFFICIAL-FORMULA: calculates $60k bi-weekly single with 1 exemption ($106.33)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 60000,
      frequency: "bi-weekly",
      w4: { ...baseInput.w4, filingStatus: "single" },
      stateInputs: { wiExemptions: 1 },
    });
    expect(result.taxes.stateIncomeTax).toBe(106.33);
  });

  /**
   * Test 5: $80,000 Annual Salary - Bi-Weekly (Single, 1 exemption, gross >= $73,630)
   * STATUS: DERIVED-FROM-OFFICIAL-FORMULA (W-166 Alternate Method)
   * Deduction: $0 (gross >= $73,630).
   * Exemption: 1 * $400 = $400.
   * Annual net wage: $80,000 - $400 = $79,600.
   * Tax: $1,045.04 + 5.30% * ($79,600 - $25,520 = $54,080) = $1,045.04 + $2,866.24 = $3,911.28.
   * Bi-weekly withholding with 1 exemption: $3,911.28 / 26 = $150.43.
   */
  it("DERIVED-FROM-OFFICIAL-FORMULA: calculates $80k salary with $0 deduction in WI ($150.43)", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 80000,
      frequency: "bi-weekly",
    });
    expect(result.taxes.stateIncomeTax).toBe(150.43);
  });
});
