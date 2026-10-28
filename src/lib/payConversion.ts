import { calculateMultiPeriodBreakdown } from "./tax/calculator";

export interface ConversionInputs {
  hourlyRate?: number;
  annualSalary?: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  unpaidDaysOff: number;
}

export interface ConversionBreakdown {
  hourlyRate: number;
  annualGross: number;
  monthlyGross: number;
  semiMonthlyGross: number;
  biWeeklyGross: number;
  weeklyGross: number;
  dailyGross: number;
  baseAnnualHours: number;
  unpaidHours: number;
  effectiveAnnualHours: number;
  hoursPerDay: number;
}

export interface ComputedRateRow {
  hourlyRate: number;
  annualGross: number;
  biWeeklyGross: number;
  monthlyGross: number;
  vaTakeHomeAnnual?: number;
  vaTakeHomeBiWeekly?: number;
  paTakeHomeAnnual?: number;
  paTakeHomeBiWeekly?: number;
}

/**
 * Standard work week hours per day (based on a 5-day work week).
 */
export function getHoursPerDay(hoursPerWeek: number): number {
  return hoursPerWeek / 5;
}

/**
 * Calculate annual working hours before unpaid time off.
 * Standard full-time: 40 hours * 52 weeks = 2,080 hours.
 */
export function calculateBaseAnnualHours(hoursPerWeek: number, weeksPerYear: number): number {
  return hoursPerWeek * weeksPerYear;
}

/**
 * Convert an hourly rate to gross pay across periods.
 */
export function convertHourlyToSalary(
  hourlyRate: number,
  hoursPerWeek: number = 40,
  weeksPerYear: number = 52,
  unpaidDaysOff: number = 0
): ConversionBreakdown {
  const baseAnnualHours = calculateBaseAnnualHours(hoursPerWeek, weeksPerYear);
  const hoursPerDay = getHoursPerDay(hoursPerWeek);
  const unpaidHours = unpaidDaysOff * hoursPerDay;
  const effectiveAnnualHours = Math.max(0, baseAnnualHours - unpaidHours);

  const annualGross = hourlyRate * effectiveAnnualHours;
  const monthlyGross = annualGross / 12;
  const semiMonthlyGross = annualGross / 24;
  const biWeeklyGross = annualGross / 26;
  const weeklyGross = annualGross / 52;
  const dailyGross = weeklyGross / 5;

  return {
    hourlyRate,
    annualGross,
    monthlyGross,
    semiMonthlyGross,
    biWeeklyGross,
    weeklyGross,
    dailyGross,
    baseAnnualHours,
    unpaidHours,
    effectiveAnnualHours,
    hoursPerDay,
  };
}

/**
 * Convert an annual salary to an hourly wage rate and period breakdown.
 */
export function convertSalaryToHourly(
  annualSalary: number,
  hoursPerWeek: number = 40,
  weeksPerYear: number = 52,
  unpaidDaysOff: number = 0
): ConversionBreakdown {
  const baseAnnualHours = calculateBaseAnnualHours(hoursPerWeek, weeksPerYear);
  const hoursPerDay = getHoursPerDay(hoursPerWeek);
  const unpaidHours = unpaidDaysOff * hoursPerDay;
  const effectiveAnnualHours = Math.max(0, baseAnnualHours - unpaidHours);

  const hourlyRate = effectiveAnnualHours > 0 ? annualSalary / effectiveAnnualHours : 0;
  const monthlyGross = annualSalary / 12;
  const semiMonthlyGross = annualSalary / 24;
  const biWeeklyGross = annualSalary / 26;
  const weeklyGross = annualSalary / 52;
  const dailyGross = weeklyGross / 5;

  return {
    hourlyRate,
    annualGross: annualSalary,
    monthlyGross,
    semiMonthlyGross,
    biWeeklyGross,
    weeklyGross,
    dailyGross,
    baseAnnualHours,
    unpaidHours,
    effectiveAnnualHours,
    hoursPerDay,
  };
}

/**
 * Generates the computed comparison table for hourly rates $15 to $50 in $5 steps.
 * Includes take-home pay examples for Virginia and Pennsylvania (Single, standard W-4)
 * using the site's official calculation engine.
 */
export function generateHourlyConversionTable(): ComputedRateRow[] {
  const rates = [15, 20, 25, 30, 35, 40, 45, 50];
  const standardHours = 40 * 52; // 2,080 hours

  return rates.map((rate) => {
    const annualGross = rate * standardHours;
    const biWeeklyGross = annualGross / 26;
    const monthlyGross = annualGross / 12;

    // Calculate take-home pay for Virginia (Single, 1 VA exemption)
    const vaBreakdown = calculateMultiPeriodBreakdown({
      payType: "salary",
      grossAmount: annualGross,
      frequency: "bi-weekly",
      stateCode: "VA",
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
        vaPersonalExemptions: 1,
        vaAgeBlindExemptions: 0,
      },
    });

    // Calculate take-home pay for Pennsylvania (Single, 0% local EIT)
    const paBreakdown = calculateMultiPeriodBreakdown({
      payType: "salary",
      grossAmount: annualGross,
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
      stateInputs: {
        paLocalEitRate: 0.0,
      },
    });

    return {
      hourlyRate: rate,
      annualGross,
      biWeeklyGross,
      monthlyGross,
      vaTakeHomeAnnual: vaBreakdown.annual.netPay,
      vaTakeHomeBiWeekly: vaBreakdown.biWeekly.netPay,
      paTakeHomeAnnual: paBreakdown.annual.netPay,
      paTakeHomeBiWeekly: paBreakdown.biWeekly.netPay,
    };
  });
}
