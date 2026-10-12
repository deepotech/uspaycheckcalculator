import {
  PaycheckCalculationInputs,
  PaycheckBreakdown,
  MultiPeriodBreakdown,
  PayFrequency,
} from "./types";
import {
  calculateFederalIncomeTax,
  calculateAnnualFederalIncomeTax,
  calculateFicaTaxes,
  ficaConstants,
  getPayPeriodsPerYear,
} from "./federalCalculator";
import { calculateStateTaxes, calculateAnnualStateTaxes } from "./stateCalculator";
import statesMetaData from "@/data/states-meta.json";

/**
 * Calculates complete paycheck breakdown for a given period wage and inputs.
 */
export function calculatePaycheck(inputs: PaycheckCalculationInputs): PaycheckBreakdown {
  const periods = getPayPeriodsPerYear(inputs.frequency);

  // Compute Period Gross Pay
  let grossPeriod = 0;
  if (inputs.payType === "hourly") {
    const hours = inputs.hoursPerWeek || 40;
    const weeklyGross = inputs.grossAmount * hours;
    const annualGross = weeklyGross * 52;
    grossPeriod = annualGross / periods;
  } else {
    // Annual Salary
    grossPeriod = inputs.grossAmount / periods;
  }

  // Pre-tax deductions breakdown per pay period
  let k401Period = 0;
  if (inputs.preTax.k401Percent && inputs.preTax.k401Percent > 0) {
    k401Period = grossPeriod * (inputs.preTax.k401Percent / 100);
  } else if (inputs.preTax.k401Amount && inputs.preTax.k401Amount > 0) {
    k401Period = inputs.preTax.k401Amount;
  }

  const healthPeriod = inputs.preTax.healthInsurance || 0;
  const hsaPeriod = inputs.preTax.hsa || 0;
  const otherPreTaxPeriod = inputs.preTax.otherPreTax || 0;
  const totalPreTax = k401Period + healthPeriod + hsaPeriod + otherPreTaxPeriod;

  // Taxable wages:
  // Federal & FICA:
  // - 401(k) reduces federal income tax, but NOT FICA
  // - Section 125 Health and HSA reduce both Federal and FICA
  const federalPreTaxDeduction = totalPreTax;
  const ficaPreTaxDeduction = healthPeriod + hsaPeriod;

  const federalTaxablePeriod = Math.max(0, grossPeriod - federalPreTaxDeduction);
  const ficaTaxablePeriod = Math.max(0, grossPeriod - ficaPreTaxDeduction);

  // State pre-tax rules (PA is stricter than federal):
  // - REV-415 page 6 (PARAPHRASE): employee 401(k) deferrals are taxable for PA.
  // - Section 125 health premiums and HSA: no explicit PA sourcing found; conservatively
  //   treated as taxable by default until a source document is supplied.
  let statePreTaxDeduction = totalPreTax;
  if (inputs.stateCode === "PA") {
    statePreTaxDeduction = otherPreTaxPeriod; // 401k, health, HSA all taxable for PA
  }
  const stateTaxablePeriod = Math.max(0, grossPeriod - statePreTaxDeduction);

  // 1. Federal Income Tax Withholding
  const federalIncomeTax = calculateFederalIncomeTax(
    grossPeriod,
    inputs.frequency,
    inputs.w4,
    federalPreTaxDeduction
  );

  // 2. FICA Taxes (Social Security & Medicare)
  const fica = calculateFicaTaxes(
    grossPeriod,
    inputs.frequency,
    ficaPreTaxDeduction,
    inputs.w4.filingStatus
  );

  // 3. State & Local Taxes (Enforce Publish Gate)
  // bypassPublishGate is only honoured in the "test" environment to prevent
  // accidentally serving unverified state data in production.
  const isBypassAllowed =
    inputs.bypassPublishGate === true && process.env.NODE_ENV === "test";
  const isStateVerified =
    isBypassAllowed ||
    statesMetaData.some((s) => s.stateCode === inputs.stateCode && s.verified);
  const stateResult = isStateVerified
    ? calculateStateTaxes(
        inputs.stateCode,
        grossPeriod,
        stateTaxablePeriod,
        inputs.frequency,
        inputs.w4.filingStatus,
        inputs.stateInputs
      )
    : {
        stateIncomeTax: 0,
        statePayrollTaxes: [],
        localTax: 0,
      };

  const statePayrollTotal = stateResult.statePayrollTaxes.reduce((sum, item) => sum + item.amount, 0);
  const totalTaxes = Math.round((
    federalIncomeTax +
    fica.socialSecurity +
    fica.medicare +
    fica.additionalMedicare +
    stateResult.stateIncomeTax +
    statePayrollTotal +
    stateResult.localTax
  ) * 100) / 100;

  const netPay = Math.round(Math.max(0, grossPeriod - totalPreTax - totalTaxes) * 100) / 100;
  const effectiveTaxRate = grossPeriod > 0 ? Math.round((totalTaxes / grossPeriod) * 10000) / 10000 : 0;

  return {
    grossPay: Math.round(grossPeriod * 100) / 100,
    preTaxDeductions: {
      k401: Math.round(k401Period * 100) / 100,
      healthInsurance: Math.round(healthPeriod * 100) / 100,
      hsa: Math.round(hsaPeriod * 100) / 100,
      other: Math.round(otherPreTaxPeriod * 100) / 100,
      total: Math.round(totalPreTax * 100) / 100,
    },
    taxableWages: {
      federal: Math.round(federalTaxablePeriod * 100) / 100,
      fica: Math.round(ficaTaxablePeriod * 100) / 100,
      state: Math.round(stateTaxablePeriod * 100) / 100,
    },
    taxes: {
      federalIncomeTax,
      socialSecurity: fica.socialSecurity,
      medicare: fica.medicare,
      additionalMedicare: fica.additionalMedicare,
      stateIncomeTax: stateResult.stateIncomeTax,
      statePayrollTaxes: stateResult.statePayrollTaxes,
      localTax: stateResult.localTax,
      totalTaxes,
    },
    postTaxDeductions: 0,
    netPay,
    effectiveTaxRate,
  };
}

/**
 * Calculates Multi-Period Breakdowns for Annual, Monthly, Semi-Monthly, Bi-Weekly, Weekly, Hourly.
 *
 * Annual column rule: every figure is computed directly from annual-level inputs with a single
 * rounding pass — never by scaling per-period rounded values. This eliminates cent-level errors
 * (e.g. SS = 6.2% × $65,000 = $4,030.00 exactly, not $4,029.96 from monthly × 12).
 * State taxes use state-specific annual rounding rules (VA: round W to nearest dollar per guide
 * page 22; PA: 3.07% × annual wages, UC 3-decimal-truncation on annual gross).
 */
export function calculateMultiPeriodBreakdown(inputs: PaycheckCalculationInputs): MultiPeriodBreakdown {
  const frequencies: PayFrequency[] = ["weekly", "bi-weekly", "semi-monthly", "monthly"];
  const results: Record<string, PaycheckBreakdown> = {};

  for (const freq of frequencies) {
    results[freq] = calculatePaycheck({
      ...inputs,
      frequency: freq,
    });
  }

  // ── Annual Gross ──────────────────────────────────────────────────────────
  const annualGross = inputs.payType === "hourly"
    ? inputs.grossAmount * (inputs.hoursPerWeek || 40) * 52
    : inputs.grossAmount;

  // ── Annual Pre-Tax Deductions ─────────────────────────────────────────────
  // These are linear with gross, so monthly × 12 is exact (no rounding drift).
  const annualPreTaxK401    = Math.round(results["monthly"].preTaxDeductions.k401 * 12 * 100) / 100;
  const annualPreTaxHealth  = Math.round(results["monthly"].preTaxDeductions.healthInsurance * 12 * 100) / 100;
  const annualPreTaxHsa     = Math.round(results["monthly"].preTaxDeductions.hsa * 12 * 100) / 100;
  const annualPreTaxOther   = Math.round(results["monthly"].preTaxDeductions.other * 12 * 100) / 100;
  const annualPreTaxTotal   = Math.round(
    (annualPreTaxK401 + annualPreTaxHealth + annualPreTaxHsa + annualPreTaxOther) * 100
  ) / 100;

  // ── Annual Federal Income Tax ─────────────────────────────────────────────
  // Uses bracket math at the annual level with no per-period divide/multiply.
  const annualFedPreTax = annualPreTaxK401 + annualPreTaxHealth + annualPreTaxHsa + annualPreTaxOther;
  const annualFederal = calculateAnnualFederalIncomeTax(annualGross, inputs.w4, annualFedPreTax);

  // ── Annual FICA ───────────────────────────────────────────────────────────
  // Rates and wage base read from federal.json via ficaConstants — never hardcoded here.
  const annualFicaPreTax = annualPreTaxHealth + annualPreTaxHsa;   // 401k does NOT reduce FICA
  const annualFicaWage   = Math.max(0, annualGross - annualFicaPreTax);
  const annualSS  = Math.round(Math.min(annualFicaWage, ficaConstants.ssWageBase) * ficaConstants.ssRate * 100) / 100;
  const annualMed = Math.round(annualFicaWage * ficaConstants.medicareRate * 100) / 100;
  // Additional Medicare: uncommon below $200k; scaling monthly is safe for typical salaries.
  const annualAMed = Math.round(results["monthly"].taxes.additionalMedicare * 12 * 100) / 100;

  // ── Annual State Taxes ────────────────────────────────────────────────────
  // VA uses round-W-to-dollar rule (guide page 22); PA uses annual-wage × 3.07% + UC truncation.
  // annualStateWage mirrors the per-period statePreTaxDeduction logic exactly.
  const annualStatePreTax = inputs.stateCode === "PA"
    ? annualPreTaxOther   // PA: 401k, health, HSA all taxable (health/HSA unverified — conservative default)
    : annualPreTaxTotal;  // VA and others: all pre-tax items reduce state wages (conformance principle)
  const annualStateWage = Math.max(0, annualGross - annualStatePreTax);

  const annualStateResult = calculateAnnualStateTaxes(
    inputs.stateCode,
    annualGross,
    annualStateWage,
    inputs.w4.filingStatus,
    inputs.stateInputs
  );

  const annualTotalTaxes = Math.round(
    (annualFederal + annualSS + annualMed + annualAMed
      + annualStateResult.stateIncomeTax
      + annualStateResult.statePayrollTaxes.reduce((s, t) => s + t.amount, 0)
      + annualStateResult.localTax) * 100
  ) / 100;
  const annualNetPay = Math.round(Math.max(0, annualGross - annualPreTaxTotal - annualTotalTaxes) * 100) / 100;

  const annualBreakdown: PaycheckBreakdown = {
    grossPay: Math.round(annualGross * 100) / 100,
    preTaxDeductions: {
      k401: annualPreTaxK401,
      healthInsurance: annualPreTaxHealth,
      hsa: annualPreTaxHsa,
      other: annualPreTaxOther,
      total: annualPreTaxTotal,
    },
    taxableWages: {
      federal: Math.round(results["monthly"].taxableWages.federal * 12 * 100) / 100,
      fica:    Math.round(results["monthly"].taxableWages.fica    * 12 * 100) / 100,
      state:   Math.round(results["monthly"].taxableWages.state   * 12 * 100) / 100,
    },
    taxes: {
      federalIncomeTax:    annualFederal,
      socialSecurity:      annualSS,
      medicare:            annualMed,
      additionalMedicare:  annualAMed,
      stateIncomeTax:      annualStateResult.stateIncomeTax,
      statePayrollTaxes:   annualStateResult.statePayrollTaxes,
      localTax:            annualStateResult.localTax,
      totalTaxes:          annualTotalTaxes,
    },
    postTaxDeductions: 0,
    netPay:           annualNetPay,
    effectiveTaxRate: results["monthly"].effectiveTaxRate,
  };

  // ── Hourly ────────────────────────────────────────────────────────────────
  const hours = inputs.hoursPerWeek || 40;
  const weekly = results["weekly"];
  const hourlyBreakdown: PaycheckBreakdown = {
    grossPay: Math.round((weekly.grossPay / hours) * 100) / 100,
    preTaxDeductions: {
      k401:           Math.round((weekly.preTaxDeductions.k401 / hours) * 100) / 100,
      healthInsurance:Math.round((weekly.preTaxDeductions.healthInsurance / hours) * 100) / 100,
      hsa:            Math.round((weekly.preTaxDeductions.hsa / hours) * 100) / 100,
      other:          Math.round((weekly.preTaxDeductions.other / hours) * 100) / 100,
      total:          Math.round((weekly.preTaxDeductions.total / hours) * 100) / 100,
    },
    taxableWages: {
      federal: Math.round((weekly.taxableWages.federal / hours) * 100) / 100,
      fica:    Math.round((weekly.taxableWages.fica    / hours) * 100) / 100,
      state:   Math.round((weekly.taxableWages.state   / hours) * 100) / 100,
    },
    taxes: {
      federalIncomeTax:   Math.round((weekly.taxes.federalIncomeTax   / hours) * 100) / 100,
      socialSecurity:     Math.round((weekly.taxes.socialSecurity      / hours) * 100) / 100,
      medicare:           Math.round((weekly.taxes.medicare            / hours) * 100) / 100,
      additionalMedicare: Math.round((weekly.taxes.additionalMedicare  / hours) * 100) / 100,
      stateIncomeTax:     Math.round((weekly.taxes.stateIncomeTax      / hours) * 100) / 100,
      statePayrollTaxes:  weekly.taxes.statePayrollTaxes.map(t => ({
        name: t.name,
        amount: Math.round((t.amount / hours) * 100) / 100,
      })),
      localTax:      Math.round((weekly.taxes.localTax      / hours) * 100) / 100,
      totalTaxes:    Math.round((weekly.taxes.totalTaxes    / hours) * 100) / 100,
    },
    postTaxDeductions: 0,
    netPay:           Math.round((weekly.netPay / hours) * 100) / 100,
    effectiveTaxRate: weekly.effectiveTaxRate,
  };

  return {
    annual:     annualBreakdown,
    monthly:    results["monthly"],
    semiMonthly:results["semi-monthly"],
    biWeekly:   results["bi-weekly"],
    weekly:     results["weekly"],
    hourly:     hourlyBreakdown,
  };
}
