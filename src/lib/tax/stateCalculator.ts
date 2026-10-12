import virginiaData from "@/data/states/virginia.json";
import pennsylvaniaData from "@/data/states/pennsylvania.json";
import minnesotaData from "@/data/states/minnesota.json";
import wisconsinData from "@/data/states/wisconsin.json";
import connecticutData from "@/data/states/connecticut.json";

import { PayFrequency, FederalFilingStatus, StateSpecificInputs } from "./types";
import { getPayPeriodsPerYear } from "./federalCalculator";

export interface StateCalculationResult {
  stateIncomeTax: number;
  statePayrollTaxes: { name: string; amount: number }[];
  localTax: number;
}

/**
 * Virginia Withholding Method:
 * PARAPHRASE: Virginia Tax, Income Tax Withholding Guide for Employers (2614086 Rev. 10/26), page 21.
 * Formula:
 *  T = G * P - [$8,750 + (E1 * $930) + (E2 * $800)]; floor T at 0.
 *  (The standard deduction is a flat $8,750 for all filing statuses; married filers claim E1=2 for self and spouse).
 * Annual Tax W:
 *  T <= $3,000: 2% of T
 *  $3,000 - $5,000: $60 + 3% of excess over $3,000
 *  $5,000 - $17,000: $120 + 5% of excess over $5,000
 *  over $17,000: $720 + 5.75% of excess over $17,000
 * Rounding Rule (Guide page 22 worked example):
 *  Round W to nearest whole dollar, then divide by P: Withholding = round(W) / P.
 */
export function calculateVirginiaTax(
  annualizedWage: number,
  e1: number,
  e2: number,
  periods: number
): { taxableAnnual: number; annualTaxRounded: number; periodTax: number } {
  const stdDeduction = virginiaData.standardDeduction; // flat $8,750
  const exemptionDeduction = (e1 * virginiaData.personalExemptionAmount) + (e2 * virginiaData.ageBlindExemptionAmount);
  const taxableAnnual = Math.max(0, annualizedWage - (stdDeduction + exemptionDeduction));

  let annualTax = 0;
  if (taxableAnnual <= 3000) {
    annualTax = taxableAnnual * 0.02;
  } else if (taxableAnnual <= 5000) {
    annualTax = 60 + (taxableAnnual - 3000) * 0.03;
  } else if (taxableAnnual <= 17000) {
    annualTax = 120 + (taxableAnnual - 5000) * 0.05;
  } else {
    annualTax = 720 + (taxableAnnual - 17000) * 0.0575;
  }

  // Guide page 22: Round W to the nearest whole dollar
  const annualTaxRounded = Math.round(annualTax);
  // Divide by P to get period tax
  const periodTax = Math.round((annualTaxRounded / periods) * 100) / 100;

  return { taxableAnnual, annualTaxRounded, periodTax };
}

function calculateVirginiaWithholding(
  periodWageSubjectToState: number,
  frequency: PayFrequency,
  filingStatus: FederalFilingStatus,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  const periods = getPayPeriodsPerYear(frequency);
  const annualizedWage = periodWageSubjectToState * periods;

  // Single default: 1 exemption (claim myself). Married default: 2 (claim self + spouse).
  // If user provides specific stateInputs, use those.
  const defaultE1 = filingStatus === "married_joint" ? 2 : virginiaData.defaultPersonalExemptions;
  const e1 = stateInputs?.vaPersonalExemptions !== undefined ? stateInputs.vaPersonalExemptions : defaultE1;
  const e2 = stateInputs?.vaAgeBlindExemptions ?? virginiaData.defaultAgeBlindExemptions;

  const { periodTax } = calculateVirginiaTax(annualizedWage, e1, e2, periods);

  return {
    stateIncomeTax: periodTax,
    statePayrollTaxes: [],
    localTax: 0,
  };
}

/**
 * Pennsylvania Withholding Method:
 * PARAPHRASE: PA REV-415 (SU) 01-23, "Calculation of Withholding", printed page 11 (Flat 3.07% PIT, no standard deduction).
 * 401(k) salary-reduction contributions are included in PA gross wages: REV-415, printed page 6 ("Taxable Benefits").
 * Section 125 employee health premium pre-tax treatment: UNVERIFIED (ASSUMPTION; REV-415 covers employer payments for medical/dental/vision welfare plans, but does not explicitly address employee salary-reduction premiums).
 * Local EIT: REV-415 states Act 32 / local EIT questions go to DCED; default 0% unless user specifies otherwise.
 * PA Employee UC: 0.07% on total gross wages (PA Dept of Labor & Industry "Employee Withholding" page).
 * Rounding rule: compute to 3 decimals, drop excess, round to nearest cent (0.005-0.009 rounds up, 0.000-0.004 rounds down).
 */
export function calculatePaUcTax(grossWage: number): number {
  // Step 1: Compute product
  const raw = grossWage * 0.0007;
  // Step 2: Truncate to 3 decimal places (drop excess)
  const truncated3 = Math.floor(raw * 1000) / 1000;
  // Step 3: Round to nearest cent (round half up)
  return Math.round(truncated3 * 100) / 100;
}

function calculatePennsylvaniaWithholding(
  grossWagePeriod: number,
  periodWageSubjectToState: number,
  frequency: PayFrequency,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  // Flat PIT: 3.07% (PARAPHRASE: REV-415 page 11)
  const stateIncomeTax = Math.round(periodWageSubjectToState * pennsylvaniaData.flatTaxRate * 100) / 100;

  // Local EIT: default 0% unless specified (PA REV-415 delegates local EIT to DCED)
  // paLocalEitRate is provided as a percentage (e.g. 1 for 1% or 3.735 for 3.735%)
  const localRatePercent = stateInputs?.paLocalEitRate ?? pennsylvaniaData.defaultLocalRate;
  const localTax = Math.round(periodWageSubjectToState * (localRatePercent / 100) * 100) / 100;

  // Employee UC: 0.07% on all gross with PA Dept of Labor rounding rule
  const ucAmount = calculatePaUcTax(grossWagePeriod);

  return {
    stateIncomeTax,
    statePayrollTaxes: [
      { name: "PA Unemployment Compensation (Employee)", amount: ucAmount },
    ],
    localTax,
  };
}

/**
 * Minnesota Withholding Method (Form W-4MN & Computer Formula):
 * Annualized Wage minus (Allowances * $5,300).
 * Brackets: 5.35%, 6.80%, 7.85%, 9.85%.
 * MN Paid Leave (Employee share): 0.44% up to OASDI wage base ($184,500).
 */
function calculateMinnesotaWithholding(
  periodWageSubjectToState: number,
  frequency: PayFrequency,
  filingStatus: FederalFilingStatus,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  const periods = getPayPeriodsPerYear(frequency);
  const annualizedWage = periodWageSubjectToState * periods;

  const allowances = stateInputs?.mnAllowances ?? minnesotaData.defaultAllowances;
  const allowanceDeduction = allowances * minnesotaData.allowanceAmount;
  const taxableAnnual = Math.max(0, annualizedWage - allowanceDeduction);

  let bracketList = minnesotaData.brackets.single;
  if (filingStatus === "married_joint") {
    bracketList = minnesotaData.brackets.married_joint;
  } else if (filingStatus === "head_of_household") {
    bracketList = minnesotaData.brackets.head_of_household;
  }

  let annualTax = 0;
  for (const b of bracketList) {
    if (taxableAnnual > b.minIncome) {
      const chunk = b.maxIncome === null
        ? taxableAnnual - b.minIncome
        : Math.min(taxableAnnual, b.maxIncome) - b.minIncome;
      annualTax += chunk * b.rate;
    }
  }

  const periodTax = Math.round((annualTax / periods) * 100) / 100;

  // MN Paid Leave (0.44% up to $184,500)
  const taxablePaidLeaveAnnual = Math.min(annualizedWage, 184500);
  const periodPaidLeave = Math.round(((taxablePaidLeaveAnnual * 0.0044) / periods) * 100) / 100;

  return {
    stateIncomeTax: periodTax,
    statePayrollTaxes: [
      { name: "MN Paid Leave (Employee Share)", amount: periodPaidLeave },
    ],
    localTax: 0,
  };
}

/**
 * Wisconsin Withholding Method (Pub W-166):
 * Sliding-scale standard deduction based on income.
 * WT-4 exemptions: $400 each.
 * Brackets: 3.50%, 4.40%, 5.30%, 7.65%.
 */
/**
 * Wisconsin Withholding Method:
 * Implemented exactly per Wisconsin Department of Revenue Publication W-166 (January 2026),
 * pages 25-27, "Alternate Method of Withholding Wisconsin Income Tax":
 * 1. Annual gross = wage x pay periods.
 * 2. Deduction amount:
 *    - Single: $6,702 if annual gross < $17,780; $0 if >= $73,630; otherwise $6,702 - 0.12 * (annual gross - $17,780).
 *    - Married: $9,461 if < $25,727; $0 if >= $73,032; otherwise $9,461 - 0.20 * (annual gross - $25,727).
 * 3. Subtract $400 per exemption claimed.
 * 4. Annual net wage tax:
 *    - 3.54% up to $12,760
 *    - $451.70 + 4.65% of excess over $12,760 up to $25,520
 *    - $1,045.04 + 5.30% of excess over $25,520 up to $280,950
 *    - $14,582.83 + 7.65% of excess over $280,950
 * 5. Divide by pay periods.
 */
function calculateWisconsinWithholding(
  periodWageSubjectToState: number,
  frequency: PayFrequency,
  filingStatus: FederalFilingStatus,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  const periods = getPayPeriodsPerYear(frequency);
  const annualGross = periodWageSubjectToState * periods;

  // Step 2: Deduction amount
  let deduction = 0;
  if (filingStatus === "married_joint") {
    if (annualGross < 25727) {
      deduction = 9461;
    } else if (annualGross >= 73032) {
      deduction = 0;
    } else {
      deduction = 9461 - 0.20 * (annualGross - 25727);
    }
  } else {
    // Single / Head of Household / Married Separate
    if (annualGross < 17780) {
      deduction = 6702;
    } else if (annualGross >= 73630) {
      deduction = 0;
    } else {
      deduction = 6702 - 0.12 * (annualGross - 17780);
    }
  }

  // Step 3: Subtract $400 per exemption claimed
  const exemptions = stateInputs?.wiExemptions ?? 1;
  const exemptionTotal = exemptions * 400;

  const annualNetWage = Math.max(0, annualGross - deduction - exemptionTotal);

  // Step 4: Annual net wage tax
  let annualTax = 0;
  if (annualNetWage <= 12760) {
    annualTax = annualNetWage * 0.0354;
  } else if (annualNetWage <= 25520) {
    annualTax = 451.70 + (annualNetWage - 12760) * 0.0465;
  } else if (annualNetWage <= 280950) {
    annualTax = 1045.04 + (annualNetWage - 25520) * 0.0530;
  } else {
    annualTax = 14582.83 + (annualNetWage - 280950) * 0.0765;
  }

  // Step 5: Divide by pay periods
  const periodTax = Math.round((annualTax / periods) * 100) / 100;

  return {
    stateIncomeTax: periodTax,
    statePayrollTaxes: [],
    localTax: 0,
  };
}

/**
 * Connecticut Withholding is currently DISABLED until official TPG-211
 * Table A, Table C, and Table D texts are verified line-by-line.
 */
function calculateConnecticutWithholding(): StateCalculationResult {
  return {
    stateIncomeTax: 0,
    statePayrollTaxes: [],
    localTax: 0,
  };
}

/**
 * Master State Withholding Engine Dispatcher
 */
export function calculateStateTaxes(
  stateCode: string,
  grossWagePeriod: number,
  periodWageSubjectToState: number,
  frequency: PayFrequency,
  filingStatus: FederalFilingStatus,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  switch (stateCode) {
    case "VA":
      return calculateVirginiaWithholding(periodWageSubjectToState, frequency, filingStatus, stateInputs);
    case "PA":
      return calculatePennsylvaniaWithholding(grossWagePeriod, periodWageSubjectToState, frequency, stateInputs);
    case "MN":
      return calculateMinnesotaWithholding(periodWageSubjectToState, frequency, filingStatus, stateInputs);
    case "WI":
      return calculateWisconsinWithholding(periodWageSubjectToState, frequency, filingStatus, stateInputs);
    case "CT":
      // CT is disabled until exact TPG-211 tables are verified from official DRS document
      return {
        stateIncomeTax: 0,
        statePayrollTaxes: [
          { name: "CT Paid Leave (CT PL)", amount: Math.round(((Math.min(periodWageSubjectToState * getPayPeriodsPerYear(frequency), 184500) * 0.005) / getPayPeriodsPerYear(frequency)) * 100) / 100 },
        ],
        localTax: 0,
      };
    default:
      return {
        stateIncomeTax: 0,
        statePayrollTaxes: [],
        localTax: 0,
      };
  }
}

/**
 * Computes state taxes directly from ANNUAL wage figures with state-specific rounding rules.
 * Used by calculateMultiPeriodBreakdown to populate the Annual column without per-period drift.
 *
 * VA: Guide 2614086 Rev. 10/26, page 22 — round annual W to nearest whole dollar.
 * PA: REV-415 page 11 (3.07% flat PIT); UC 3-decimal-truncation on annual gross.
 */
export function calculateAnnualStateTaxes(
  stateCode: string,
  annualGross: number,
  annualStateWage: number,
  filingStatus: FederalFilingStatus,
  stateInputs?: StateSpecificInputs
): StateCalculationResult {
  switch (stateCode) {
    case "VA": {
      const defaultE1 = filingStatus === "married_joint" ? 2 : virginiaData.defaultPersonalExemptions;
      const e1 = stateInputs?.vaPersonalExemptions !== undefined ? stateInputs.vaPersonalExemptions : defaultE1;
      const e2 = stateInputs?.vaAgeBlindExemptions ?? virginiaData.defaultAgeBlindExemptions;
      // periods=1 → periodTax = annualTaxRounded ÷ 1 = annualTaxRounded (the dollar-rounded annual W)
      const { annualTaxRounded } = calculateVirginiaTax(annualStateWage, e1, e2, 1);
      return { stateIncomeTax: annualTaxRounded, statePayrollTaxes: [], localTax: 0 };
    }
    case "PA": {
      // PARAPHRASE: REV-415 page 11 — 3.07% flat rate on annual state-taxable wages
      const stateIncomeTax = Math.round(annualStateWage * pennsylvaniaData.flatTaxRate * 100) / 100;
      // Local EIT on annual state-taxable wages (paLocalEitRate as percentage)
      const localRatePercent = stateInputs?.paLocalEitRate ?? pennsylvaniaData.defaultLocalRate;
      const localTax = Math.round(annualStateWage * (localRatePercent / 100) * 100) / 100;
      // UC: 3-decimal-truncation rule applied to annual gross (PA Dept of Labor & Industry)
      const ucAmount = calculatePaUcTax(annualGross);
      return {
        stateIncomeTax,
        statePayrollTaxes: [{ name: "PA Unemployment Compensation (Employee)", amount: ucAmount }],
        localTax,
      };
    }
    default:
      // Unverified states are hidden behind the publish gate; annual column shows 0.
      return { stateIncomeTax: 0, statePayrollTaxes: [], localTax: 0 };
  }
}

