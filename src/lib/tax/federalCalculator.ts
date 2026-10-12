import federalDataRaw from "@/data/federal.json";
import { FederalFilingStatus, PayFrequency, W4Inputs } from "./types";

interface Bracket {
  rate: number;
  minIncome: number;
  maxIncome: number | null;
}

interface FederalDataModel {
  taxYear: number;
  lastVerified: string;
  source: string;
  socialSecurity: {
    rate: number;
    wageBase: number;
    source: string;
  };
  medicare: {
    rate: number;
    additionalRate: number;
    additionalThresholds: Record<string, number>;
    source: string;
  };
  worksheet1A: {
    line1gAdjustment: {
      standard: Record<string, number>;
      step2Checked: Record<string, number>;
    };
  };
  percentageMethodTables: {
    standard: {
      single: Bracket[];
      married_joint: Bracket[];
      head_of_household: Bracket[];
    };
    step2Checked: {
      single: Bracket[];
      married_joint: Bracket[];
      head_of_household: Bracket[];
    };
  };
}

const federalData = federalDataRaw as unknown as FederalDataModel;

/**
 * Re-exported FICA constants derived from federal.json (single source of truth).
 * Import these instead of hardcoding rates or the OASDI wage base anywhere else.
 */
export const ficaConstants = {
  ssRate: federalData.socialSecurity.rate,                         // 0.062
  ssWageBase: federalData.socialSecurity.wageBase,                 // 184500 for 2026
  medicareRate: federalData.medicare.rate,                         // 0.0145
  medicareAdditionalRate: federalData.medicare.additionalRate,     // 0.009
  medicareAdditionalThresholds: federalData.medicare.additionalThresholds,
} as const;

export function getPayPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "weekly":
      return 52;
    case "bi-weekly":
      return 26;
    case "semi-monthly":
      return 24;
    case "monthly":
      return 12;
  }
}

/**
 * Calculates Federal Income Tax Withholding according to IRS Publication 15-T (2026),
 * Section 1, Worksheet 1A on printed page 10 and Annual Percentage Method Tables on printed page 12.
 *
 * STATUS: PARAPHRASE citing IRS Pub 15-T (2026) printed pages 10 & 12.
 */
export function calculateFederalIncomeTax(
  grossWagePerPeriod: number,
  frequency: PayFrequency,
  w4: W4Inputs,
  preTaxFederalDeductionPerPeriod: number
): number {
  const periods = getPayPeriodsPerYear(frequency);
  const subjectWagePerPeriod = Math.max(0, grossWagePerPeriod - preTaxFederalDeductionPerPeriod);

  // Worksheet 1A Line 1a & 1c: Annual gross wages
  const line1cAnnualWage = subjectWagePerPeriod * periods;

  // Worksheet 1A Line 1d: Form W-4 Step 4(a) Other income
  const line1d = line1cAnnualWage + (w4.step4aOtherIncome || 0);

  // Worksheet 1A Line 1e: Form W-4 Step 4(b) Deductions
  const line1e = Math.max(0, line1d - (w4.step4bDeductions || 0));

  // Worksheet 1A Line 1g: Subtract adjustment amount based on filing status and Step 2 checkbox
  // $8,600 for Single/MFS, $12,900 for MFJ when box is NOT checked; -0- when checked.
  const line1gLookup = w4.step2MultipleJobs
    ? federalData.worksheet1A.line1gAdjustment.step2Checked
    : federalData.worksheet1A.line1gAdjustment.standard;

  const filingKey = w4.filingStatus === "married_separate" ? "single" : w4.filingStatus;
  const line1gAdjustment = line1gLookup[filingKey] ?? 8600;

  // Worksheet 1A Line 1i: Adjusted Annual Wage Amount
  const line1iAdjustedWage = Math.max(0, line1e - line1gAdjustment);

  // Step 2: Tentative Withholding from Annual Percentage Method Tables (Page 12)
  const tables = w4.step2MultipleJobs
    ? federalData.percentageMethodTables.step2Checked
    : federalData.percentageMethodTables.standard;

  let bracketList: Bracket[] = tables.single;
  if (w4.filingStatus === "married_joint") {
    bracketList = tables.married_joint;
  } else if (w4.filingStatus === "head_of_household") {
    bracketList = tables.head_of_household;
  }

  let annualTentative = 0;
  for (let i = 0; i < bracketList.length; i++) {
    const bracket = bracketList[i];
    if (line1iAdjustedWage > bracket.minIncome) {
      const taxableInBracket = bracket.maxIncome === null
        ? line1iAdjustedWage - bracket.minIncome
        : Math.min(line1iAdjustedWage, bracket.maxIncome) - bracket.minIncome;

      annualTentative += taxableInBracket * bracket.rate;
    }
  }

  // Worksheet 1A Step 3: Divide annual tentative by pay periods
  let periodTentative = annualTentative / periods;

  // Subtract Form W-4 Step 3 (Dependents credit) per pay period
  const step3CreditPerPeriod = (w4.step3DependentsCredit || 0) / periods;
  periodTentative = Math.max(0, periodTentative - step3CreditPerPeriod);

  // Add Form W-4 Step 4(c) Extra withholding per period
  const finalWithholding = periodTentative + (w4.step4cExtraWithholding || 0);

  return Math.round(finalWithholding * 100) / 100;
}

/**
 * Calculates the exact annual federal income tax directly from annual wages,
 * without any per-period divide/multiply rounding.
 * Used to populate the Annual column in the breakdown table.
 */
export function calculateAnnualFederalIncomeTax(
  annualGross: number,
  w4: W4Inputs,
  annualPreTaxFederalDeduction: number
): number {
  const annualSubjectWage = Math.max(0, annualGross - annualPreTaxFederalDeduction);
  const line1d = annualSubjectWage + (w4.step4aOtherIncome || 0);
  const line1e = Math.max(0, line1d - (w4.step4bDeductions || 0));

  const line1gLookup = w4.step2MultipleJobs
    ? federalData.worksheet1A.line1gAdjustment.step2Checked
    : federalData.worksheet1A.line1gAdjustment.standard;
  const filingKey = w4.filingStatus === "married_separate" ? "single" : w4.filingStatus;
  const line1gAdjustment = line1gLookup[filingKey] ?? 8600;
  const line1iAdjustedWage = Math.max(0, line1e - line1gAdjustment);

  const tables = w4.step2MultipleJobs
    ? federalData.percentageMethodTables.step2Checked
    : federalData.percentageMethodTables.standard;
  let bracketList: Bracket[] = tables.single;
  if (w4.filingStatus === "married_joint") bracketList = tables.married_joint;
  else if (w4.filingStatus === "head_of_household") bracketList = tables.head_of_household;

  let annualTentative = 0;
  for (const bracket of bracketList) {
    if (line1iAdjustedWage > bracket.minIncome) {
      const taxableInBracket = bracket.maxIncome === null
        ? line1iAdjustedWage - bracket.minIncome
        : Math.min(line1iAdjustedWage, bracket.maxIncome) - bracket.minIncome;
      annualTentative += taxableInBracket * bracket.rate;
    }
  }

  // Subtract annual step 3 credit, add annual extra withholding
  const annualTax = Math.max(0, annualTentative - (w4.step3DependentsCredit || 0))
    + (w4.step4cExtraWithholding || 0) * 12;

  return Math.round(annualTax * 100) / 100;
}

/**
 * Calculates FICA taxes (Social Security & Medicare)
 * Social Security rate 6.2% up to $184,500 OASDI cap (QUOTED: SSA.gov).
 * Medicare rate 1.45% + 0.9% additional over $200k (QUOTED: 26 U.S.C. § 3101).
 */
export function calculateFicaTaxes(
  grossWagePerPeriod: number,
  frequency: PayFrequency,
  preTaxFicaDeductionsPerPeriod: number,
  filingStatus: FederalFilingStatus = "single"
) {
  const periods = getPayPeriodsPerYear(frequency);
  const subjectWagePeriod = Math.max(0, grossWagePerPeriod - preTaxFicaDeductionsPerPeriod);
  const annualizedWage = subjectWagePeriod * periods;

  // Social Security: 6.2% up to 2026 wage base ($184,500)
  const ssaCap = federalData.socialSecurity.wageBase;
  const taxableSsaAnnual = Math.min(annualizedWage, ssaCap);
  const annualSocialSecurity = taxableSsaAnnual * federalData.socialSecurity.rate;
  const periodSocialSecurity = annualSocialSecurity / periods;

  // Regular Medicare: 1.45% on all wages
  const annualRegularMedicare = annualizedWage * federalData.medicare.rate;
  const periodRegularMedicare = annualRegularMedicare / periods;

  // Additional Medicare: 0.9% on wages above threshold
  const additionalThreshold = federalData.medicare.additionalThresholds[filingStatus] || 200000;
  let annualAdditionalMedicare = 0;
  if (annualizedWage > additionalThreshold) {
    annualAdditionalMedicare = (annualizedWage - additionalThreshold) * federalData.medicare.additionalRate;
  }
  const periodAdditionalMedicare = annualAdditionalMedicare / periods;

  return {
    socialSecurity: Math.round(periodSocialSecurity * 100) / 100,
    medicare: Math.round(periodRegularMedicare * 100) / 100,
    additionalMedicare: Math.round(periodAdditionalMedicare * 100) / 100,
    totalFica: Math.round((periodSocialSecurity + periodRegularMedicare + periodAdditionalMedicare) * 100) / 100,
  };
}
