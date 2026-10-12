import { describe, it, expect } from "vitest";
import { calculateFederalIncomeTax, calculateFicaTaxes } from "@/lib/tax/federalCalculator";
import { W4Inputs } from "@/lib/tax/types";

describe("Federal Income Tax and FICA - Pub 15-T (2026) Verification", () => {
  const baseSingleW4: W4Inputs = {
    filingStatus: "single",
    step2MultipleJobs: false,
    step3DependentsCredit: 0,
    step4aOtherIncome: 0,
    step4bDeductions: 0,
    step4cExtraWithholding: 0,
  };

  /**
   * Test 1: $50,000 Annual Salary - Bi-Weekly ($1,923.08 gross)
   * STATUS: PARAPHRASE from IRS Pub 15-T (2026) Worksheet 1A (printed page 10) & Annual Table (printed page 12)
   * Line 1c: $50,000.
   * Line 1g: Subtract $8,600 (Single standard box unchecked).
   * Line 1i (Adjusted wage): $50,000 - $8,600 = $41,400.
   * Table Page 12 (Single standard):
   *  0% on $0 to $7,500 = $0
   *  10% on ($19,900 - $7,500 = $12,400) = $1,240
   *  12% on ($41,400 - $19,900 = $21,500) = $2,580
   * Total annual tentative withholding = $1,240 + $2,580 = $3,820.
   * Per bi-weekly period (26 periods): $3,820 / 26 = $146.92.
   */
  it("computes $50k bi-weekly single federal withholding", () => {
    const grossBiweekly = 50000 / 26;
    const fedTax = calculateFederalIncomeTax(grossBiweekly, "bi-weekly", baseSingleW4, 0);
    expect(fedTax).toBeCloseTo(146.92, 1);
  });

  /**
   * Test 2: Low Wage Below Line 1g ($8,000/yr gross - Bi-Weekly $307.69)
   * STATUS: PARAPHRASE from IRS Pub 15-T (2026) Worksheet 1A (printed page 10)
   * Line 1c = $8,000. Line 1g = $8,600.
   * Line 1i = max(0, $8,000 - $8,600) = $0.
   * Table tax on $0 = $0.00 withholding.
   */
  it("withholds $0 when annualized wage is below line 1g amount ($8,600)", () => {
    const grossBiweekly = 8000 / 26;
    const fedTax = calculateFederalIncomeTax(grossBiweekly, "bi-weekly", baseSingleW4, 0);
    expect(fedTax).toBe(0);
  });

  /**
   * Test 3: Form W-4 Step 4(a) Other Income ($6,000/yr) & Step 4(b) Deductions ($2,000/yr)
   * STATUS: PARAPHRASE from IRS Pub 15-T (2026) Worksheet 1A (printed page 10) lines 1d and 1e
   * Annual wage = $50,000.
   * Line 1d = $50,000 + $6,000 = $56,000.
   * Line 1e = $56,000 - $2,000 = $54,000.
   * Line 1g = $8,600.
   * Line 1i (Adjusted wage) = $54,000 - $8,600 = $45,400.
   * Table tax:
   *  10% on $12,400 = $1,240
   *  12% on ($45,400 - $19,900 = $25,500) = $3,060
   * Total annual tentative = $1,240 + $3,060 = $4,300.
   * Bi-weekly (26 periods) = $4,300 / 26 = $165.38.
   */
  it("handles Form W-4 Step 4(a) other income and Step 4(b) deductions", () => {
    const grossBiweekly = 50000 / 26;
    const w4WithAdjustments: W4Inputs = {
      ...baseSingleW4,
      step4aOtherIncome: 6000,
      step4bDeductions: 2000,
    };
    const fedTax = calculateFederalIncomeTax(grossBiweekly, "bi-weekly", w4WithAdjustments, 0);
    expect(fedTax).toBeCloseTo(165.38, 1);
  });

  /**
   * Test 4: $100,000 Annual Salary - Semi-Monthly ($4,166.67 gross)
   * STATUS: PARAPHRASE from IRS Pub 15-T (2026) Worksheet 1A (printed page 10) & Table (printed page 12)
   * Line 1c: $100,000. Line 1g: $8,600.
   * Line 1i (Adjusted wage): $100,000 - $8,600 = $91,400.
   * Table Page 12 (Single standard):
   *  10% on $12,400 ($7,500 to $19,900) = $1,240
   *  12% on $38,000 ($19,900 to $57,900) = $4,560
   *  22% on ($91,400 - $57,900 = $33,500) = $7,370
   * Total annual tentative withholding = $1,240 + $4,560 + $7,370 = $13,170.
   * Per semi-monthly period (24 periods): $13,170 / 24 = $548.75.
   */
  it("computes $100k semi-monthly single federal withholding", () => {
    const grossSemiMonthly = 100000 / 24;
    const fedTax = calculateFederalIncomeTax(grossSemiMonthly, "semi-monthly", baseSingleW4, 0);
    expect(fedTax).toBeCloseTo(548.75, 1);
  });

  /**
   * Test 5: $80,000 Annual Salary - Married Filing Jointly - Bi-Weekly ($3,076.92 gross)
   * STATUS: PARAPHRASE from IRS Pub 15-T (2026) Worksheet 1A (printed page 10, MFJ line 1g is $12,900) & Table (printed page 12)
   * Line 1c: $80,000. Line 1g: $12,900.
   * Line 1i (Adjusted wage): $80,000 - $12,900 = $67,100.
   * Table Page 12 (MFJ standard):
   *  0% on $0 to $19,300 = $0
   *  10% on ($44,100 - $19,300 = $24,800) = $2,480
   *  12% on ($67,100 - $44,100 = $23,000) = $2,760
   * Total annual tentative withholding = $2,480 + $2,760 = $5,240.
   * Per bi-weekly period (26 periods): $5,240 / 26 = $201.54.
   */
  it("computes $80k bi-weekly married filing jointly federal withholding", () => {
    const grossBiweekly = 80000 / 26;
    const mfjW4: W4Inputs = { ...baseSingleW4, filingStatus: "married_joint" };
    const fedTax = calculateFederalIncomeTax(grossBiweekly, "bi-weekly", mfjW4, 0);
    expect(fedTax).toBeCloseTo(201.54, 1);
  });

  /**
   * Test 6: Social Security cap check on $200,000 salary
   * STATUS: VERIFIED (SSA.gov 2026 OASDI wage base = $184,500; rate = 6.2%).
   */
  it("caps Social Security at $184,500 wage base for 2026", () => {
    const grossMonthly = 200000 / 12;
    const fica = calculateFicaTaxes(grossMonthly, "monthly", 0, "single");
    expect(fica.socialSecurity).toBeCloseTo(953.25, 1);
    expect(fica.medicare).toBeCloseTo(241.67, 1);
    expect(fica.additionalMedicare).toBe(0);
  });

  /**
   * Test 7: Additional Medicare surtax on $300,000 salary for single filer
   * STATUS: QUOTED (26 U.S. Code § 3101(b)(2)).
   */
  it("computes additional Medicare surtax on wages over $200k", () => {
    const grossMonthly = 300000 / 12;
    const fica = calculateFicaTaxes(grossMonthly, "monthly", 0, "single");
    expect(fica.additionalMedicare).toBeCloseTo(75.0, 1);
  });
});
