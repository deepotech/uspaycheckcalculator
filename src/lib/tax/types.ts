export type PayFrequency = "weekly" | "bi-weekly" | "semi-monthly" | "monthly";
export type PayType = "salary" | "hourly";
export type FederalFilingStatus = "single" | "married_joint" | "head_of_household" | "married_separate";

export interface PreTaxDeductions {
  k401Amount?: number;          // Per period or annual depending on user mode (handled by calculator)
  k401Percent?: number;         // Percentage of gross pay
  healthInsurance?: number;     // Section 125 health insurance per period
  hsa?: number;                 // Health savings account per period
  otherPreTax?: number;         // Other pre-tax deduction per period
}

export interface W4Inputs {
  filingStatus: FederalFilingStatus;
  step2MultipleJobs: boolean;     // Step 2(c) checkbox
  step3DependentsCredit: number;  // Step 3 total credit ($)
  step4aOtherIncome: number;      // Step 4(a) Other income ($/year)
  step4bDeductions: number;       // Step 4(b) Other deductions ($/year)
  step4cExtraWithholding: number; // Step 4(c) Extra withholding ($/pay period)
}

export interface StateSpecificInputs {
  // Virginia VA-4
  vaPersonalExemptions?: number;  // Default 1
  vaAgeBlindExemptions?: number;  // Default 0
  
  // Pennsylvania
  paLocalEitRate?: number;        // Default 0.01 (1.0% local earned income tax)

  // Minnesota W-4MN
  mnAllowances?: number;          // Default 1 ($5,300 each for 2026)
  
  // Wisconsin WT-4
  wiExemptions?: number;          // Default 1 ($400 each)
  
  // Connecticut CT-W4
  ctWithholdingCode?: "A" | "B" | "C" | "D" | "F"; // Default 'A'
}

export interface PaycheckCalculationInputs {
  payType: PayType;
  grossAmount: number;            // Annual salary or hourly rate
  hoursPerWeek?: number;          // Default 40 for hourly
  frequency: PayFrequency;
  stateCode: string;              // "VA" | "MN" | "WI" | "CT" | "PA" | "FEDERAL_ONLY"
  w4: W4Inputs;
  preTax: PreTaxDeductions;
  stateInputs?: StateSpecificInputs;
  bypassPublishGate?: boolean;    // Allows test suites to verify pure formulas directly
}

export interface PaycheckBreakdown {
  grossPay: number;
  preTaxDeductions: {
    k401: number;
    healthInsurance: number;
    hsa: number;
    other: number;
    total: number;
  };
  taxableWages: {
    federal: number;
    fica: number;
    state: number;
  };
  taxes: {
    federalIncomeTax: number;
    socialSecurity: number;
    medicare: number;
    additionalMedicare: number;
    stateIncomeTax: number;
    statePayrollTaxes: {
      name: string;
      amount: number;
    }[];
    localTax: number;
    totalTaxes: number;
  };
  postTaxDeductions: number;
  netPay: number;
  effectiveTaxRate: number; // e.g. 0.224 for 22.4%
}

export interface MultiPeriodBreakdown {
  annual: PaycheckBreakdown;
  monthly: PaycheckBreakdown;
  semiMonthly: PaycheckBreakdown;
  biWeekly: PaycheckBreakdown;
  weekly: PaycheckBreakdown;
  hourly: PaycheckBreakdown;
}

export interface TaxBracket {
  rate: number;
  minIncome: number;
  maxIncome: number | null;
}

export interface FederalTaxData {
  taxYear: number;
  lastVerified: string;
  source: string;
  socialSecurity: {
    rate: number;           // 0.062
    wageBase: number;       // 184500 for 2026
    source: string;
  };
  medicare: {
    rate: number;           // 0.0145
    additionalRate: number; // 0.009
    additionalThresholds: {
      single: number;       // 200000
      married_joint: number;// 250000
      married_separate: number; // 125000
      head_of_household: number; // 200000
    };
    source: string;
  };
  standardDeductions: {
    single: number;
    married_joint: number;
    head_of_household: number;
    married_separate: number;
  };
  // IRS Pub 15-T Percentage Method brackets for 2026 Form W-4
  percentageMethodTables: {
    standard: {
      single: TaxBracket[];
      married_joint: TaxBracket[];
      head_of_household: TaxBracket[];
    };
    step2Checked: {
      single: TaxBracket[];
      married_joint: TaxBracket[];
      head_of_household: TaxBracket[];
    };
  };
}

export interface StateTaxData {
  stateCode: string;
  stateName: string;
  taxYear: number;
  lastVerified: string;
  source: string;
  officialFormName: string; // e.g. "VA-4", "CT-W4"
  preTaxRules: {
    reducesFederal: {
      retirement401k: boolean;
      healthInsurance: boolean;
      hsa: boolean;
    };
    reducesState: {
      retirement401k: boolean; // false for PA
      healthInsurance: boolean;
      hsa: boolean;
    };
  };
  hasLocalTax: boolean;
  localTaxNote?: string;
  defaultLocalRate?: number;
  statePayrollTaxes: {
    name: string;
    rate: number;
    maxWage: number | null;
    appliesToAllGross: boolean;
    source: string;
  }[];
  notes: string[];
  unverifiedOrTodo?: string[];
}
