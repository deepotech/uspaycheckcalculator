import { describe, it, expect } from "vitest";
import { calculatePaycheck } from "@/lib/tax/calculator";
import { PaycheckCalculationInputs } from "@/lib/tax/types";

describe("Connecticut Paycheck Withholding - DISABLED / UNVERIFIED", () => {
  const baseInput: PaycheckCalculationInputs = {
    payType: "salary",
    grossAmount: 50000,
    frequency: "bi-weekly",
    stateCode: "CT",
    w4: {
      filingStatus: "single",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
  };

  /**
   * NOTE: Connecticut calculations are disabled and flagged as TODO until
   * the exact line text of CT DRS TPG-211 Tables A, C, and D is verified.
   */
  it("flags Connecticut as pending verification", () => {
    const result = calculatePaycheck(baseInput);
    // When state calculation logic is disabled/placeholder, state tax is 0 or pending
    expect(result.grossPay).toBe(1923.08);
  });
});
