/**
 * Tests for the 20 salary-after-tax pages.
 *
 * Rules:
 *  1. For each of the 20 pages, the displayed annual net pay equals calculateMultiPeriodBreakdown output.
 *  2. Sitemap includes exactly the expected 20 salary-page URLs (plus state and static routes).
 *  3. Unknown slugs are not in the salary pages list (i.e., parseSalarySlug returns null).
 *  4. No two pages share the same title or meta description.
 *  5. Only verified && isActive state pages are generated.
 */

import { describe, it, expect } from "vitest";
import { calculateMultiPeriodBreakdown } from "@/lib/tax/calculator";
import { getAllSalaryPages, parseSalarySlug, SALARY_PAGE_SALARIES, getSalaryPagesForState } from "@/lib/salaryPages";
import {
  computeMultiPeriod,
  computeVAStateSteps,
  computePAStateSteps,
  computeFederalSteps,
  computeMarginalRaise,
  computeMarriedJointBreakdown,
  compute401kBreakdown,
  buildSalaryPageMetadata,
} from "@/lib/salaryPageCalc";
import statesMetaData from "@/data/states-meta.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeInputs(salary: number, stateCode: string) {
  return {
    payType: "salary" as const,
    grossAmount: salary,
    frequency: "bi-weekly" as const,
    stateCode,
    w4: {
      filingStatus: "single" as const,
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    preTax: {},
    stateInputs:
      stateCode === "VA"
        ? { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 }
        : { paLocalEitRate: 0.0 },
    // VA and PA are verified; no bypass needed
  };
}

// ── 1. Registry: exactly 20 salary pages, 10 per state ──────────────────────

describe("Salary page registry (salaryPages.ts)", () => {
  it("generates exactly 20 pages total (10 VA + 10 PA)", () => {
    const all = getAllSalaryPages();
    expect(all).toHaveLength(20);
  });

  it("generates exactly 10 Virginia pages", () => {
    const va = getSalaryPagesForState("VA");
    expect(va).toHaveLength(10);
  });

  it("generates exactly 10 Pennsylvania pages", () => {
    const pa = getSalaryPagesForState("PA");
    expect(pa).toHaveLength(10);
  });

  it("uses exactly the 10 specified salaries", () => {
    const expected = [35000, 45000, 55000, 65000, 75000, 85000, 95000, 110000, 130000, 150000];
    expect(SALARY_PAGE_SALARIES).toEqual(expected);
  });

  it("generates correct Virginia slug pattern", () => {
    const page = parseSalarySlug("virginia-65000-salary-after-tax");
    expect(page).not.toBeNull();
    expect(page!.stateCode).toBe("VA");
    expect(page!.salary).toBe(65000);
  });

  it("generates correct Pennsylvania slug pattern", () => {
    const page = parseSalarySlug("pennsylvania-65000-salary-after-tax");
    expect(page).not.toBeNull();
    expect(page!.stateCode).toBe("PA");
    expect(page!.salary).toBe(65000);
  });

  it("returns null for unknown slugs (no state match)", () => {
    expect(parseSalarySlug("ohio-65000-salary-after-tax")).toBeNull();
    expect(parseSalarySlug("virginia-60000-salary-after-tax")).toBeNull(); // 60k not in list
    expect(parseSalarySlug("")).toBeNull();
    expect(parseSalarySlug("random-slug")).toBeNull();
  });

  it("returns null for unverified states", () => {
    // MN, WI, CT are not verified+active
    expect(parseSalarySlug("minnesota-65000-salary-after-tax")).toBeNull();
    expect(parseSalarySlug("wisconsin-65000-salary-after-tax")).toBeNull();
    expect(parseSalarySlug("connecticut-65000-salary-after-tax")).toBeNull();
  });

  it("all 20 slugs are unique", () => {
    const slugs = getAllSalaryPages().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(20);
  });

  it("calls notFound() for unknown slugs", async () => {
    const { default: SalaryAfterTaxPage } = await import("@/app/[slug]/page");
    await expect(
      SalaryAfterTaxPage({ params: Promise.resolve({ slug: "unknown-slug-example" }) })
    ).rejects.toThrow();
  });
});

// ── 2. Net pay matches engine output for every page ──────────────────────────

describe("Salary pages — net pay matches engine (all 20 pages)", () => {
  const allPages = getAllSalaryPages();

  for (const page of allPages) {
    it(`${page.slug}: displayed net pay matches calculateMultiPeriodBreakdown`, () => {
      // Page uses computeMultiPeriod which calls calculateMultiPeriodBreakdown with standard inputs
      const fromPage = computeMultiPeriod(page.salary, page.stateCode);
      // Direct engine call with identical inputs
      const direct = calculateMultiPeriodBreakdown(makeInputs(page.salary, page.stateCode));

      expect(fromPage.annual.netPay).toBe(direct.annual.netPay);
      expect(fromPage.monthly.netPay).toBe(direct.monthly.netPay);
      expect(fromPage.biWeekly.netPay).toBe(direct.biWeekly.netPay);
    });
  }
});

// ── 3. State-specific computation steps ──────────────────────────────────────

describe("Virginia state-tax computation steps", () => {
  /**
   * $65,000: T = $65,000 − ($8,750 + $930) = $55,320.
   * W = $720 + ($55,320 − $17,000) × 0.0575 = $720 + $38,320 × 0.0575 = $2,923.40 → $2,923.
   */
  it("$65,000: taxableAnnual=$55,320, annualTaxRounded=$2,923, bracket=5.75%", () => {
    const steps = computeVAStateSteps(65000);
    expect(steps.taxableAnnual).toBe(55320);
    expect(steps.annualTaxRounded).toBe(2923);
    expect(steps.bracketLabel).toContain("5.75%");
  });

  /**
   * $35,000: T = $35,000 − $9,680 = $25,320.
   * W = $720 + ($25,320 − $17,000) × 0.0575 = $720 + $478.40 = $1,198.40 → $1,198.
   */
  it("$35,000: taxableAnnual=$25,320, annualTaxRounded=$1,198", () => {
    const steps = computeVAStateSteps(35000);
    expect(steps.taxableAnnual).toBe(25320);
    expect(steps.annualTaxRounded).toBe(1198);
    expect(steps.bracketLabel).toContain("5.75%");
  });

  /**
   * $150,000: T = $150,000 − $9,680 = $140,320.
   * W = $720 + ($140,320 − $17,000) × 0.0575 = $720 + $123,320 × 0.0575
   *   = $720 + $7,090.90 = $7,810.90 → round $7,811.
   */
  it("$150,000: taxableAnnual=$140,320, annualTaxRounded=$7,811", () => {
    const steps = computeVAStateSteps(150000);
    expect(steps.taxableAnnual).toBe(140320);
    expect(steps.annualTaxRounded).toBe(7811);
  });
});

describe("Pennsylvania state-tax computation steps", () => {
  /**
   * $65,000: PIT = $65,000 × 3.07% = $1,995.50.
   * UC: $65,000 × 0.0007 = 45.5000 → trunc = 45.500 → round = $45.50.
   */
  it("$65,000: annualPIT=$1,995.50, annualUC=$45.50", () => {
    const steps = computePAStateSteps(65000);
    expect(steps.annualPIT).toBeCloseTo(1995.50, 2);
    expect(steps.annualUC).toBe(45.50);
  });

  /**
   * $35,000: PIT = $35,000 × 3.07% = $1,074.50.
   * UC: $35,000 × 0.0007 = 24.50 → trunc = 24.500 → round = $24.50.
   */
  it("$35,000: annualPIT=$1,074.50, annualUC=$24.50", () => {
    const steps = computePAStateSteps(35000);
    expect(steps.annualPIT).toBeCloseTo(1074.50, 2);
    expect(steps.annualUC).toBe(24.50);
  });

  /**
   * $150,000: PIT = $150,000 × 3.07% = $4,605.00.
   * UC: $150,000 × 0.0007 = 105.0 → trunc = 105.000 → round = $105.00.
   */
  it("$150,000: annualPIT=$4,605.00, annualUC=$105.00", () => {
    const steps = computePAStateSteps(150000);
    expect(steps.annualPIT).toBeCloseTo(4605.00, 2);
    expect(steps.annualUC).toBe(105.00);
  });
});

// ── 4. Federal steps ──────────────────────────────────────────────────────────

describe("Federal computation steps for salary pages", () => {
  /**
   * $65,000 single: adjusted = $65,000 − $8,600 = $56,400.
   * Bracket: 22% (income > $57,900 → wait, $56,400 < $57,900 → 12% bracket applies).
   * 12% bracket (income > $19,900).
   */
  it("$65,000: adjustedAnnualWage=$56,400, 12% bracket", () => {
    const steps = computeFederalSteps(65000);
    expect(steps.line1gAdjustment).toBe(8600);
    expect(steps.adjustedAnnualWage).toBe(56400);
    expect(steps.bracketRate).toBe(0.12);
  });

  /**
   * $110,000 single: adjusted = $110,000 − $8,600 = $101,400 → 22% bracket (> $57,900).
   */
  it("$110,000: adjustedAnnualWage=$101,400, 22% bracket", () => {
    const steps = computeFederalSteps(110000);
    expect(steps.adjustedAnnualWage).toBe(101400);
    expect(steps.bracketRate).toBe(0.22);
  });

  /**
   * $150,000 single: adjusted = $150,000 − $8,600 = $141,400 → 22% bracket (< $113,200 → wait: > $113,200 → 24%).
   */
  it("$150,000: adjustedAnnualWage=$141,400, 24% bracket", () => {
    const steps = computeFederalSteps(150000);
    expect(steps.adjustedAnnualWage).toBe(141400);
    expect(steps.bracketRate).toBe(0.24);
  });
});

// ── 5. Sitemap contains exactly the expected 20 salary URLs ──────────────────

describe("Sitemap salary page coverage", () => {
  it("sitemap includes exactly 20 salary-page URLs for VA and PA", async () => {
    // Dynamically import to get live output
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    // Just verify all 20 slugs are present
    const allPages = getAllSalaryPages();
    for (const page of allPages) {
      const found = entries.some((e) => e.url.endsWith(`/${page.slug}`));
      expect(found, `URL for ${page.slug} should be in sitemap`).toBe(true);
    }
    // Count salary page entries
    const salaryEntries = entries.filter((e) =>
      e.url.includes("-salary-after-tax")
    );
    expect(salaryEntries).toHaveLength(20);
  });

  it("sitemap does not include salary pages for unverified states", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    const hasUnverified = entries.some(
      (e) =>
        e.url.includes("minnesota-") ||
        e.url.includes("wisconsin-") ||
        e.url.includes("connecticut-")
    );
    expect(hasUnverified).toBe(false);
  });
});

// ── 6. Unique titles and descriptions ────────────────────────────────────────

describe("Salary page titles and meta descriptions are unique", () => {
  it("generates unique titles for all 20 pages", () => {
    const all = getAllSalaryPages();
    const titles = all.map((page) => buildSalaryPageMetadata(page).title);
    expect(new Set(titles).size).toBe(20);
  });

  it("generates unique meta descriptions for all 20 pages with appended take-home pay", () => {
    const all = getAllSalaryPages();
    const descs = all.map((page) => buildSalaryPageMetadata(page).description);
    expect(new Set(descs).size).toBe(20);
    // Every description must append the computed net pay
    for (const desc of descs) {
      expect(desc).toMatch(/Take-home pay: \$\d[\d,]* per year \(\$\d[\d,]* per month\)\.$/);
    }
  });
});

// ── 7. Married filing jointly and 401(k) variants ────────────────────────────

describe("Salary page — MFJ and 401(k) variants", () => {
  /**
   * VA $65k MFJ: E1=2, E2=0.
   * T = $65,000 − ($8,750 + 2×$930) = $65,000 − $10,610 = $54,390.
   * W = $720 + ($54,390 − $17,000) × 0.0575 = $720 + $2,149.925 = $2,869.93 → round $2,870.
   */
  it("VA $65k MFJ: annual state tax = $2,870 (E1=2)", () => {
    const mpd = computeMarriedJointBreakdown(65000, "VA");
    expect(mpd.annual.taxes.stateIncomeTax).toBe(2870);
  });

  /**
   * PA $65k MFJ: PIT still 3.07% flat (REV-415 page 11). Federal changes.
   * Annual PIT same: $65,000 × 3.07% = $1,995.50.
   */
  it("PA $65k MFJ: annual state PIT still $1,995.50 (PA has no filing-status effect on PIT)", () => {
    const mpd = computeMarriedJointBreakdown(65000, "PA");
    expect(mpd.annual.taxes.stateIncomeTax).toBeCloseTo(1995.50, 2);
  });

  /**
   * VA $65k 5% 401(k): 401k reduces VA wages; state taxable = $65,000 × 0.95 = $61,750.
   * T = $61,750 − $9,680 = $52,070.
   * W = $720 + ($52,070 − $17,000) × 0.0575 = $720 + $2,016.525 = $2,736.53 → $2,737.
   */
  it("VA $65k 5% 401k: annual state tax = $2,737, 401k deduction is $3,250", () => {
    const mpd = compute401kBreakdown(65000, "VA");
    expect(mpd.annual.preTaxDeductions.k401).toBe(3250.00);
    expect(mpd.annual.taxes.stateIncomeTax).toBe(2737);
  });

  /**
   * PA $65k 5% 401(k): 401(k) does NOT reduce PA wages (REV-415 page 6).
   * State taxable wage still $65,000. PIT = $1,995.50.
   */
  it("PA $65k 5% 401k: PA PIT unchanged at $1,995.50 (401k not excluded), 401k is $3,250", () => {
    const mpd = compute401kBreakdown(65000, "PA");
    expect(mpd.annual.preTaxDeductions.k401).toBe(3250.00);
    expect(mpd.annual.taxes.stateIncomeTax).toBeCloseTo(1995.50, 2);
    // But federal taxable wages are reduced
    expect(mpd.annual.taxableWages.state).toBe(65000);
    expect(mpd.annual.taxableWages.federal).toBeLessThan(65000);
  });
});

// ── 8. Marginal $5,000 raise ──────────────────────────────────────────────────

describe("Salary page — marginal $5,000 raise", () => {
  it("VA $65k: extraNet + extraTax = $5,000 (accounting for rounding)", () => {
    const result = computeMarginalRaise(65000, "VA");
    expect(result.extraGross).toBe(5000);
    // Extra net + extra tax should approximately equal extra gross
    expect(Math.abs(result.extraNet + result.extraTax - 5000)).toBeLessThan(2);
  });

  it("PA $65k: extraNet + extraTax ≈ $5,000", () => {
    const result = computeMarginalRaise(65000, "PA");
    expect(result.extraGross).toBe(5000);
    expect(Math.abs(result.extraNet + result.extraTax - 5000)).toBeLessThan(2);
  });
});

// ── 9. State gating — no unverified state pages generated ─────────────────────

describe("Publish gate: only verified+active states", () => {
  it("getAllSalaryPages only returns VA and PA pages", () => {
    const all = getAllSalaryPages();
    const stateCodes = new Set(all.map((p) => p.stateCode));
    expect(stateCodes.has("VA")).toBe(true);
    expect(stateCodes.has("PA")).toBe(true);
    expect(stateCodes.has("MN")).toBe(false);
    expect(stateCodes.has("WI")).toBe(false);
    expect(stateCodes.has("CT")).toBe(false);
  });

  it("unverified states in statesMetaData are not in salary pages", () => {
    const unverified = statesMetaData.filter((s) => !s.verified || !s.isActive);
    const all = getAllSalaryPages();
    for (const state of unverified) {
      const found = all.some((p) => p.stateCode === state.stateCode);
      expect(found, `${state.stateCode} should not have salary pages`).toBe(false);
    }
  });
});

// ── 10. Spot-check engine values for specific pages ──────────────────────────

describe("Spot-check: engine output for key pages", () => {
  /**
   * VA $65k annual column (matches existing virginia.test.ts test 7):
   * state=$2,923, federal=$5,620, SS=$4,030, Med=$942.50, net=$51,484.50
   */
  it("VA $65,000: annual breakdown matches verified values from virginia.test.ts", () => {
    const mpd = computeMultiPeriod(65000, "VA");
    expect(mpd.annual.taxes.stateIncomeTax).toBe(2923);
    expect(mpd.annual.taxes.federalIncomeTax).toBe(5620.00);
    expect(mpd.annual.taxes.socialSecurity).toBe(4030.00);
    expect(mpd.annual.taxes.medicare).toBe(942.50);
    expect(mpd.annual.netPay).toBe(51484.50);
  });

  /**
   * PA $65k annual column (matches existing pennsylvania.test.ts test 8):
   * PIT=$1,995.50, UC=$45.50, federal=$5,620, SS=$4,030, Med=$942.50, net=$52,366.50
   */
  it("PA $65,000: annual breakdown matches verified values from pennsylvania.test.ts", () => {
    const mpd = computeMultiPeriod(65000, "PA");
    expect(mpd.annual.taxes.stateIncomeTax).toBeCloseTo(1995.50, 2);
    expect(mpd.annual.taxes.statePayrollTaxes[0].amount).toBe(45.50);
    expect(mpd.annual.taxes.federalIncomeTax).toBe(5620.00);
    expect(mpd.annual.taxes.socialSecurity).toBe(4030.00);
    expect(mpd.annual.taxes.medicare).toBe(942.50);
    expect(mpd.annual.netPay).toBe(52366.50);
  });

  /**
   * VA $150k: SS capped at $184,500 wage base. $150,000 < $184,500 so no cap.
   * SS = $150,000 × 6.2% = $9,300.
   * Medicare = $150,000 × 1.45% = $2,175.
   */
  it("VA $150,000: SS=$9,300, Medicare=$2,175 (under SS cap)", () => {
    const mpd = computeMultiPeriod(150000, "VA");
    expect(mpd.annual.taxes.socialSecurity).toBe(9300.00);
    expect(mpd.annual.taxes.medicare).toBe(2175.00);
  });

  /**
   * PA $35k: PIT = $35,000 × 3.07% = $1,074.50.
   */
  it("PA $35,000: annual PIT=$1,074.50", () => {
    const mpd = computeMultiPeriod(35000, "PA");
    expect(mpd.annual.taxes.stateIncomeTax).toBeCloseTo(1074.50, 2);
  });
});
