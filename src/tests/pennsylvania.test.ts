import { describe, it, expect } from "vitest";
import { calculatePaycheck, calculateMultiPeriodBreakdown } from "@/lib/tax/calculator";
import { calculatePaUcTax } from "@/lib/tax/stateCalculator";
import { PaycheckCalculationInputs } from "@/lib/tax/types";

describe("Pennsylvania Paycheck Withholding - Verification & Citations", () => {
  const baseInput: PaycheckCalculationInputs = {
    payType: "salary",
    grossAmount: 60000,
    frequency: "bi-weekly",
    stateCode: "PA",
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
      paLocalEitRate: 0.0, // Default 0.0% local EIT
    },
  };

  /**
   * Test 1: $60,000 Annual Salary - Bi-Weekly (No pre-tax deductions, 0% EIT default)
   * STATUS: PARAPHRASE from PA REV-415 (SU) 01-23, printed page 11 (Flat 3.07% PIT, no standard deduction)
   * and PA Dept of Labor & Industry "Employee Withholding" page (0.07% UC on all gross wages).
   * Gross bi-weekly: $60,000 / 26 = $2,307.69.
   * PA State PIT: $2,307.69 * 0.0307 = $70.85.
   * Local EIT (default 0%): $0.00.
   * PA UC (Employee): $2,307.69 * 0.0007 = 1.615383 -> truncate to 3 decimals: 1.615 -> round to nearest cent: $1.62.
   */
  it("calculates $60k bi-weekly salary in Pennsylvania with default 0% EIT", () => {
    const result = calculatePaycheck(baseInput);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(70.85, 1);
    expect(result.taxes.localTax).toBe(0);
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(1.62, 1);
  });

  /**
   * Test 2: $60,000 Annual Salary with 5% 401(k) deduction ($3,000/yr)
   * STATUS: PARAPHRASE from PA REV-415 (SU) 01-23, printed page 6 ("Taxable Benefits"):
   * 401(k) salary-reduction contributions are included in PA gross taxable wages.
   * Gross bi-weekly: $2,307.69. 401(k) = $115.38.
   * Federal taxable wages: $2,307.69 - $115.38 = $2,192.31.
   * PA taxable wages: $2,307.69 (full gross, retirement401k does NOT reduce PA wages).
   * PA State PIT: $2,307.69 * 0.0307 = $70.85.
   */
  it("verifies PA does NOT deduct 401(k) from state taxable wages per REV-415 page 6", () => {
    const result = calculatePaycheck({
      ...baseInput,
      preTax: { k401Percent: 5 },
    });
    expect(result.taxableWages.federal).toBeCloseTo(2192.31, 1);
    expect(result.taxableWages.state).toBeCloseTo(2307.69, 1);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(70.85, 1);
  });

  /**
   * Test 3: $100,000 Annual Salary - Philadelphia Local Tax (3.735% resident rate)
   * STATUS: PARAPHRASE (phila.gov wage tax page rate table: residents 3.735% effective July 1, 2026;
   * PA REV-415 notes Act 32 / local taxes administered via DCED/local ordinances).
   * Gross bi-weekly: $100,000 / 26 = $3,846.15.
   * PA State PIT: $3,846.15 * 0.0307 = $118.08.
   * Local Tax (3.735%): $3,846.15 * 0.03735 = $143.65.
   * PA UC: $3,846.15 * 0.0007 = 2.6923 -> truncate: 2.692 -> round: $2.69.
   */
  it("calculates $100k bi-weekly with Philadelphia 3.735% local tax", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 100000,
      stateInputs: { paLocalEitRate: 3.735 },
    });
    expect(result.taxes.stateIncomeTax).toBeCloseTo(118.08, 1);
    expect(result.taxes.localTax).toBeCloseTo(143.65, 1);
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(2.69, 1);
  });

  /**
   * Test 4: $200,000 High Salary - PA UC Employee No-Cap Verification
   * STATUS: VERIFIED from PA Dept of Labor & Industry "Employee Withholding" page:
   * Employee UC rate 0.07% has NO wage base cap (unlike employer $10,000 base).
   * Monthly gross: $200,000 / 12 = $16,666.67.
   * Monthly UC: $16,666.67 * 0.0007 = 11.6666 -> truncate: 11.666 -> round: $11.67.
   * Monthly PA PIT: $16,666.67 * 0.0307 = $511.67.
   */
  it("verifies PA UC employee deduction applies to all gross wages without cap", () => {
    const result = calculatePaycheck({
      ...baseInput,
      grossAmount: 200000,
      frequency: "monthly",
    });
    expect(result.taxes.statePayrollTaxes[0].amount).toBeCloseTo(11.67, 1);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(511.67, 1);
  });

  /**
   * Test 5: Section 125 Health Insurance deduction in PA ($200/period)
   * STATUS: UNVERIFIED.
   * REV-415 does not explicitly confirm employee Section 125 salary reductions reduce PA gross wages.
   * Pending primary sourcing, the engine treats health insurance as taxable for PA by default.
   * Gross bi-weekly: $2,307.69. Health pre-tax = $200 (reduces federal, but NOT PA state).
   * Federal taxable wages: $2,307.69 - $200 = $2,107.69.
   * PA taxable wages: $2,307.69 (full gross).
   * PA State PIT: $2,307.69 * 0.0307 = $70.85.
   */
  it("treats Section 125 health insurance as taxable for PA by default pending official sourcing", () => {
    const result = calculatePaycheck({
      ...baseInput,
      preTax: { healthInsurance: 200 },
    });
    expect(result.taxableWages.federal).toBeCloseTo(2107.69, 1);
    expect(result.taxableWages.state).toBeCloseTo(2307.69, 1);
    expect(result.taxes.stateIncomeTax).toBeCloseTo(70.85, 1);
  });

  /**
   * Test 6 & 7: PA UC Rounding Rule Exact Verification
   * STATUS: VERIFIED from PA Dept of Labor & Industry "Employee Withholding" rule:
   * Compute to 3 decimals, drop excess, round to nearest cent:
   * - 1.235 to 1.239 -> 1.24
   * - 1.230 to 1.234 -> 1.23
   */
  it("implements PA Dept of L&I UC 3-decimal truncation and rounding rule", () => {
    // Case A: 1.235 -> raw product yields 1.235x -> truncated 1.235 -> rounds up to 1.24
    // 1765.00 * 0.0007 = 1.2355 -> truncate 3 = 1.235 -> round = 1.24
    expect(calculatePaUcTax(1765.0)).toBe(1.24);

    // Case B: 1.234 -> raw product yields 1.234x -> truncated 1.234 -> rounds down to 1.23
    // 1763.00 * 0.0007 = 1.2341 -> truncate 3 = 1.234 -> round = 1.23
    expect(calculatePaUcTax(1763.0)).toBe(1.23);

    // Case C: 1.239 -> raw product yields 1.239x -> truncated 1.239 -> rounds up to 1.24
    // 1770.00 * 0.0007 = 1.2390 -> truncate 3 = 1.239 -> round = 1.24
    expect(calculatePaUcTax(1770.0)).toBe(1.24);

    // Case D: 1.230 -> raw product yields 1.230x -> truncated 1.230 -> rounds down to 1.23
    // 1757.15 * 0.0007 = 1.230005 -> truncate 3 = 1.230 -> round = 1.23
    expect(calculatePaUcTax(1757.15)).toBe(1.23);
  });
  /**
   * Test 8: Annual column — $65,000 single, 0% EIT, no pre-tax deductions
   * STATUS: PARAPHRASE from PA REV-415 (SU) 01-23 page 11; PA Dept of Labor & Industry UC rule.
   *
   * Annual state-taxable wage = $65,000 (no pre-tax deductions reduce PA wages).
   * PA PIT annual: $65,000 × 3.07% = $1,995.50.
   * PA UC annual:  $65,000 × 0.0007 = 45.5000 → truncate 3 decimals = 45.500 → round = $45.50.
   * Annual federal = $5,620.00 (bracket method, no per-period rounding).
   * Annual SS      = $65,000 × 6.2%  = $4,030.00 (ficaConstants).
   * Annual Med     = $65,000 × 1.45% = $942.50  (ficaConstants).
   * Annual total taxes = $5,620 + $4,030 + $942.50 + $1,995.50 + $45.50 = $12,633.50.
   * Annual net         = $65,000 − $12,633.50 = $52,366.50.
   */
  it("annual column — $65k single PA: PIT=$1,995.50, UC=$45.50, SS=$4,030, Med=$942.50", () => {
    const result = calculateMultiPeriodBreakdown({
      payType: "salary",
      grossAmount: 65000,
      frequency: "bi-weekly",
      stateCode: "PA",
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
      stateInputs: { paLocalEitRate: 0.0 },
    });
    expect(result.annual.grossPay).toBe(65000);
    expect(result.annual.taxes.stateIncomeTax).toBe(1995.50);          // 3.07% × $65k, REV-415 p.11
    expect(result.annual.taxes.statePayrollTaxes[0].amount).toBe(45.50); // UC 3-decimal rule on annual
    expect(result.annual.taxes.federalIncomeTax).toBe(5620.00);
    expect(result.annual.taxes.socialSecurity).toBe(4030.00);
    expect(result.annual.taxes.medicare).toBe(942.50);
    expect(result.annual.taxes.totalTaxes).toBe(12633.50);
    expect(result.annual.netPay).toBe(52366.50);
  });
});
