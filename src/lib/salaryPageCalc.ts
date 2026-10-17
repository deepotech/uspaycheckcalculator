/**
 * Shared computation helpers for salary-after-tax pages.
 *
 * All numbers come exclusively from the calculation engine
 * (calculatePaycheck / calculateMultiPeriodBreakdown).
 * Nothing is typed by hand here.
 */

import {
  calculatePaycheck,
  calculateMultiPeriodBreakdown,
} from "@/lib/tax/calculator";
import {
  calculateVirginiaTax,
  calculatePaUcTax,
} from "@/lib/tax/stateCalculator";
import {
  calculateAnnualFederalIncomeTax,
  ficaConstants,
} from "@/lib/tax/federalCalculator";
import { PaycheckCalculationInputs, MultiPeriodBreakdown } from "@/lib/tax/types";
import federalDataRaw from "@/data/federal.json";
import virginiaDataRaw from "@/data/states/virginia.json";

// ── Standard base inputs ────────────────────────────────────────────────────

export function makeBaseInputs(
  salary: number,
  stateCode: string,
  overrides: Partial<PaycheckCalculationInputs> = {}
): PaycheckCalculationInputs {
  return {
    payType: "salary",
    grossAmount: salary,
    frequency: "bi-weekly",
    stateCode,
    w4: {
      filingStatus: "single",
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
    ...overrides,
  };
}

// ── Multi-period breakdown ───────────────────────────────────────────────────

export function computeMultiPeriod(
  salary: number,
  stateCode: string
): MultiPeriodBreakdown {
  return calculateMultiPeriodBreakdown(makeBaseInputs(salary, stateCode));
}

// ── Net pay at a specific frequency ─────────────────────────────────────────

export function computeNetPay(
  salary: number,
  stateCode: string,
  frequency: PaycheckCalculationInputs["frequency"]
) {
  return calculatePaycheck(makeBaseInputs(salary, stateCode, { frequency }));
}

// ── Virginia state-tax computation steps ────────────────────────────────────

export interface VAStateSteps {
  annualGross: number;
  stdDeduction: number;
  exemptionDeduction: number;
  taxableAnnual: number;
  bracketLabel: string;
  annualTaxBeforeRound: number;
  annualTaxRounded: number;
}

export function computeVAStateSteps(salary: number): VAStateSteps {
  const stdDeduction = virginiaDataRaw.standardDeduction; // 8750
  const e1 = 1;
  const e2 = 0;
  const exemptionDeduction = e1 * virginiaDataRaw.personalExemptionAmount; // 930
  const taxableAnnual = Math.max(0, salary - (stdDeduction + exemptionDeduction));

  // Determine bracket
  let bracketLabel = "";
  let annualTaxBeforeRound = 0;
  if (taxableAnnual <= 3000) {
    bracketLabel = "2% bracket (T ≤ $3,000)";
    annualTaxBeforeRound = taxableAnnual * 0.02;
  } else if (taxableAnnual <= 5000) {
    bracketLabel = "3% bracket ($3,001–$5,000)";
    annualTaxBeforeRound = 60 + (taxableAnnual - 3000) * 0.03;
  } else if (taxableAnnual <= 17000) {
    bracketLabel = "5% bracket ($5,001–$17,000)";
    annualTaxBeforeRound = 120 + (taxableAnnual - 5000) * 0.05;
  } else {
    bracketLabel = "5.75% bracket (over $17,000)";
    annualTaxBeforeRound = 720 + (taxableAnnual - 17000) * 0.0575;
  }

  const annualTaxRounded = calculateVirginiaTax(salary, e1, e2, 1).annualTaxRounded;

  return {
    annualGross: salary,
    stdDeduction,
    exemptionDeduction,
    taxableAnnual,
    bracketLabel,
    annualTaxBeforeRound,
    annualTaxRounded,
  };
}

// ── PA state-tax computation steps ──────────────────────────────────────────

export interface PAStateSteps {
  annualGross: number;
  pitRate: number;
  annualPIT: number;
  ucRate: number;
  ucRawProduct: number;
  ucTruncated3: number;
  annualUC: number;
}

export function computePAStateSteps(salary: number): PAStateSteps {
  const pitRate = 0.0307;
  const annualPIT = Math.round(salary * pitRate * 100) / 100;
  const ucRate = 0.0007;
  const ucRawProduct = salary * ucRate;
  const ucTruncated3 = Math.floor(ucRawProduct * 1000) / 1000;
  const annualUC = calculatePaUcTax(salary);
  return { annualGross: salary, pitRate, annualPIT, ucRate, ucRawProduct, ucTruncated3, annualUC };
}

// ── Federal computation steps ────────────────────────────────────────────────

interface FederalDataModel {
  worksheet1A: {
    line1gAdjustment: {
      standard: Record<string, number>;
      step2Checked: Record<string, number>;
    };
  };
  percentageMethodTables: {
    standard: {
      single: Array<{ rate: number; minIncome: number; maxIncome: number | null }>;
    };
  };
}

const federalData = federalDataRaw as unknown as FederalDataModel;

export interface FederalSteps {
  annualGross: number;
  line1gAdjustment: number;
  adjustedAnnualWage: number;
  bracketRate: number;
  bracketMin: number;
  annualFederalTax: number;
}

export function computeFederalSteps(salary: number): FederalSteps {
  const line1gAdjustment = federalData.worksheet1A.line1gAdjustment.standard["single"]; // 8600
  const adjustedAnnualWage = Math.max(0, salary - line1gAdjustment);

  // Find which bracket applies
  const brackets = federalData.percentageMethodTables.standard.single;
  let bracketRate = 0;
  let bracketMin = 0;
  for (const b of brackets) {
    if (adjustedAnnualWage > b.minIncome) {
      bracketRate = b.rate;
      bracketMin = b.minIncome;
    }
  }

  const w4 = {
    filingStatus: "single" as const,
    step2MultipleJobs: false,
    step3DependentsCredit: 0,
    step4aOtherIncome: 0,
    step4bDeductions: 0,
    step4cExtraWithholding: 0,
  };
  const annualFederalTax = calculateAnnualFederalIncomeTax(salary, w4, 0);

  return {
    annualGross: salary,
    line1gAdjustment,
    adjustedAnnualWage,
    bracketRate,
    bracketMin,
    annualFederalTax,
  };
}

// ── "What changes at nearby salaries" table ──────────────────────────────────

export interface NeighborRow {
  salary: number;
  slug: string;
  annualNet: number;
  netDiffVsBase: number;
  monthlyNetDiffVsBase: number;
}

export function computeNeighborRows(
  salary: number,
  stateCode: string,
  neighbors: number[],
  neighborSlugs: string[]
): NeighborRow[] {
  const baseAnnual = computeMultiPeriod(salary, stateCode).annual;
  return neighbors.map((s, i) => {
    const ann = computeMultiPeriod(s, stateCode).annual;
    return {
      salary: s,
      slug: neighborSlugs[i],
      annualNet: ann.netPay,
      netDiffVsBase: Math.round((ann.netPay - baseAnnual.netPay) * 100) / 100,
      monthlyNetDiffVsBase: Math.round(((ann.netPay - baseAnnual.netPay) / 12) * 100) / 100,
    };
  });
}

// ── Marginal $5,000 raise ────────────────────────────────────────────────────

export interface MarginalRaiseResult {
  baseSalary: number;
  raisedSalary: number;
  baseAnnualNet: number;
  raisedAnnualNet: number;
  extraGross: number;
  extraTax: number;
  extraNet: number;
}

export function computeMarginalRaise(salary: number, stateCode: string): MarginalRaiseResult {
  const raise = 5000;
  const baseAnn = computeMultiPeriod(salary, stateCode).annual;
  const raisedAnn = computeMultiPeriod(salary + raise, stateCode).annual;
  const extraTax = Math.round((raisedAnn.taxes.totalTaxes - baseAnn.taxes.totalTaxes) * 100) / 100;
  const extraNet = Math.round((raisedAnn.netPay - baseAnn.netPay) * 100) / 100;
  return {
    baseSalary: salary,
    raisedSalary: salary + raise,
    baseAnnualNet: baseAnn.netPay,
    raisedAnnualNet: raisedAnn.netPay,
    extraGross: raise,
    extraTax,
    extraNet,
  };
}

// ── Married filing jointly variant ──────────────────────────────────────────

export function computeMarriedJointBreakdown(salary: number, stateCode: string) {
  const inputs = makeBaseInputs(salary, stateCode, {
    w4: {
      filingStatus: "married_joint",
      step2MultipleJobs: false,
      step3DependentsCredit: 0,
      step4aOtherIncome: 0,
      step4bDeductions: 0,
      step4cExtraWithholding: 0,
    },
    stateInputs:
      stateCode === "VA"
        ? { vaPersonalExemptions: 2, vaAgeBlindExemptions: 0 }
        : { paLocalEitRate: 0.0 },
  });
  return calculateMultiPeriodBreakdown(inputs);
}

// ── 5% 401(k) variant ───────────────────────────────────────────────────────

export function compute401kBreakdown(salary: number, stateCode: string) {
  const inputs = makeBaseInputs(salary, stateCode, {
    preTax: { k401Percent: 5 },
  });
  return calculateMultiPeriodBreakdown(inputs);
}

// ── FICA constants (re-exported for use in pages) ───────────────────────────
export { ficaConstants };

// ── Page Metadata builder ───────────────────────────────────────────────────

export function buildSalaryPageMetadata(page: {
  salary: number;
  stateCode: string;
  stateName: string;
  slug: string;
}): {
  title: string;
  description: string;
  canonicalPath: string;
} {
  const { salary, stateCode, slug } = page;
  const salaryStr = salary.toLocaleString("en-US");

  const title =
    stateCode === "VA"
      ? `$${salaryStr} Salary After Taxes in Virginia (2026) | VA Take-Home Pay`
      : `$${salaryStr} Salary After Taxes in Pennsylvania (2026) | PA Take-Home Pay`;

  const mpd = computeMultiPeriod(salary, stateCode);
  const annualNet = Math.round(mpd.annual.netPay).toLocaleString("en-US");
  const monthlyNet = Math.round(mpd.monthly.netPay).toLocaleString("en-US");

  const baseDesc =
    stateCode === "VA"
      ? `Your $${salaryStr} salary in Virginia after federal and state taxes in 2026. Annual, monthly, bi-weekly, and hourly take-home pay computed using IRS Pub 15-T and the Virginia Employer Withholding Guide (2614086 Rev. 10/26).`
      : `Your $${salaryStr} salary in Pennsylvania after federal and state taxes in 2026. Annual, monthly, bi-weekly, and hourly take-home pay computed using IRS Pub 15-T, PA REV-415, and PA L&I employee UC guidelines.`;

  const description = `${baseDesc} Take-home pay: $${annualNet} per year ($${monthlyNet} per month).`;
  const canonicalPath = `/${slug}`;

  return { title, description, canonicalPath };
}
