import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  convertHourlyToSalary,
  convertSalaryToHourly,
  generateHourlyConversionTable,
} from "@/lib/payConversion";
import { calculatePaycheck } from "@/lib/tax/calculator";
import statesMetaData from "@/data/states-meta.json";
import virginiaData from "@/data/states/virginia.json";
import pennsylvaniaData from "@/data/states/pennsylvania.json";
import sitemap from "@/app/sitemap";
import { getAllSalaryPages } from "@/lib/salaryPages";
import { buildSalaryPageMetadata } from "@/lib/salaryPageCalc";
import { PAGE_UPDATE_INFO, NEXT_PUBLIC_SITE_URL } from "@/lib/site";

// Import page metadata for uniqueness verification
import { metadata as homeMetadata } from "@/app/page";
import { metadata as hubMetadata } from "@/app/paycheck-calculator-by-state/page";
import { metadata as vaMetadata } from "@/app/virginia-paycheck-calculator/page";
import { metadata as paMetadata } from "@/app/pennsylvania-paycheck-calculator/page";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as contactMetadata } from "@/app/contact/page";
import { metadata as disclaimerMetadata } from "@/app/disclaimer/page";
import { metadata as privacyMetadata } from "@/app/privacy-policy/page";

import { metadata as hourlyToSalaryMetadata } from "@/app/hourly-to-salary-calculator/page";
import { metadata as salaryToHourlyMetadata } from "@/app/salary-to-hourly-calculator/page";
import { metadata as hourlyPaycheckMetadata } from "@/app/hourly-paycheck-calculator/page";
import { metadata as weeklyPaycheckMetadata } from "@/app/weekly-paycheck-calculator/page";
import { metadata as biWeeklyPaycheckMetadata } from "@/app/bi-weekly-paycheck-calculator/page";
import { metadata as monthlyPaycheckMetadata } from "@/app/monthly-paycheck-calculator/page";
import { metadata as basicsMetadata } from "@/app/paycheck-basics/page";

// ── 1. Conversions Arithmetic ────────────────────────────────────────────────
describe("Phase A: Pay Conversion Arithmetic", () => {
  it("converts $25/hr, 40 h, 52 weeks = $52,000 annual gross", () => {
    const result = convertHourlyToSalary(25, 40, 52, 0);
    expect(result.annualGross).toBe(52000);
    expect(result.baseAnnualHours).toBe(2080);
    expect(result.effectiveAnnualHours).toBe(2080);
  });

  it("converts $52,000 annual salary, 40 h, 52 weeks = $25.00/hr", () => {
    const result = convertSalaryToHourly(52000, 40, 52, 0);
    expect(result.hourlyRate).toBe(25.00);
    expect(result.effectiveAnnualHours).toBe(2080);
  });

  it("calculates bi-weekly gross as annual / 26", () => {
    const hourly = convertHourlyToSalary(25, 40, 52, 0);
    expect(hourly.biWeeklyGross).toBe(52000 / 26);
    expect(hourly.biWeeklyGross).toBe(2000);

    const salary = convertSalaryToHourly(52000, 40, 52, 0);
    expect(salary.biWeeklyGross).toBe(52000 / 26);
    expect(salary.biWeeklyGross).toBe(2000);
  });

  it("calculates monthly gross as annual / 12", () => {
    const hourly = convertHourlyToSalary(25, 40, 52, 0);
    expect(hourly.monthlyGross).toBeCloseTo(52000 / 12, 4);

    const salary = convertSalaryToHourly(52000, 40, 52, 0);
    expect(salary.monthlyGross).toBeCloseTo(52000 / 12, 4);
  });

  it("calculates weekly gross as annual / 52 and daily gross as weekly / 5", () => {
    const result = convertHourlyToSalary(25, 40, 52, 0);
    expect(result.weeklyGross).toBe(1000);
    expect(result.dailyGross).toBe(200);
    expect(result.semiMonthlyGross).toBe(52000 / 24);
  });

  it("accurately deducts unpaid days off", () => {
    // 10 unpaid days = 80 unpaid hours for 40 hr / 5 day week
    const hourlyWithUnpaid = convertHourlyToSalary(25, 40, 52, 10);
    expect(hourlyWithUnpaid.unpaidHours).toBe(80);
    expect(hourlyWithUnpaid.effectiveAnnualHours).toBe(2000);
    expect(hourlyWithUnpaid.annualGross).toBe(50000);

    // $52,000 salary with 2,000 hours yields $26/hr
    const salaryWithUnpaid = convertSalaryToHourly(52000, 40, 52, 10);
    expect(salaryWithUnpaid.hourlyRate).toBe(26.00);
  });

  it("generates conversion table for $15 to $50 in $5 steps with take-home values matching engine exactly", () => {
    const table = generateHourlyConversionTable();
    expect(table).toHaveLength(8);
    expect(table.map((r) => r.hourlyRate)).toEqual([15, 20, 25, 30, 35, 40, 45, 50]);

    const expected = [
      { rate: 15, va: 26269, pa: 26270 },
      { rate: 20, va: 34028, pa: 34299 },
      { rate: 25, va: 41786, pa: 42329 },
      { rate: 30, va: 49544, pa: 50359 },
      { rate: 35, va: 56673, pa: 57759 },
      { rate: 40, va: 63391, pa: 64749 },
      { rate: 45, va: 70110, pa: 71739 },
      { rate: 50, va: 76828, pa: 78728 },
    ];

    for (let i = 0; i < table.length; i++) {
      expect(table[i].annualGross).toBe(table[i].hourlyRate * 2080);
      expect(table[i].biWeeklyGross).toBe(table[i].annualGross / 26);
      expect(table[i].monthlyGross).toBe(table[i].annualGross / 12);
      expect(Math.round(table[i].vaTakeHomeAnnual!)).toBe(expected[i].va);
      expect(Math.round(table[i].paTakeHomeAnnual!)).toBe(expected[i].pa);
    }
  });

  it("verifies bi-weekly worked example numbers match calculatePaycheck engine exactly", () => {
    const vaBiWeekly = calculatePaycheck({
      payType: "salary",
      grossAmount: 65000,
      frequency: "bi-weekly",
      stateCode: "VA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 },
    });
    expect(vaBiWeekly.grossPay).toBe(2500);
    expect(vaBiWeekly.taxes.federalIncomeTax).toBe(216.15);
    expect(vaBiWeekly.taxes.socialSecurity).toBe(155.00);
    expect(vaBiWeekly.taxes.medicare).toBe(36.25);
    expect(vaBiWeekly.taxes.stateIncomeTax).toBe(112.42);
    expect(vaBiWeekly.netPay).toBe(1980.18);

    const paBiWeekly = calculatePaycheck({
      payType: "salary",
      grossAmount: 65000,
      frequency: "bi-weekly",
      stateCode: "PA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { paLocalEitRate: 0.0 },
    });
    expect(paBiWeekly.grossPay).toBe(2500);
    expect(paBiWeekly.taxes.federalIncomeTax).toBe(216.15);
    expect(paBiWeekly.taxes.socialSecurity).toBe(155.00);
    expect(paBiWeekly.taxes.medicare).toBe(36.25);
    expect(paBiWeekly.taxes.stateIncomeTax).toBe(76.75);
    const paUc = paBiWeekly.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0);
    expect(paUc).toBe(1.75);
    expect(paBiWeekly.taxes.stateIncomeTax + paUc).toBe(78.50);
    expect(paBiWeekly.netPay).toBe(2014.10);
  });

  it("verifies weekly worked example numbers match calculatePaycheck engine exactly", () => {
    const vaWeekly = calculatePaycheck({
      payType: "salary",
      grossAmount: 52000,
      frequency: "weekly",
      stateCode: "VA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 },
    });
    expect(vaWeekly.grossPay).toBe(1000);
    expect(vaWeekly.taxes.socialSecurity).toBe(62.00);
    expect(vaWeekly.taxes.medicare).toBe(14.50);
    expect(vaWeekly.taxes.federalIncomeTax).toBe(78.08);
    expect(vaWeekly.taxes.stateIncomeTax).toBe(41.85);
    expect(vaWeekly.netPay).toBe(803.57);

    const paWeekly = calculatePaycheck({
      payType: "salary",
      grossAmount: 52000,
      frequency: "weekly",
      stateCode: "PA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { paLocalEitRate: 0.0 },
    });
    expect(paWeekly.grossPay).toBe(1000);
    expect(paWeekly.taxes.socialSecurity).toBe(62.00);
    expect(paWeekly.taxes.medicare).toBe(14.50);
    expect(paWeekly.taxes.stateIncomeTax).toBe(30.70);
    const paUc = paWeekly.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0);
    expect(paUc).toBe(0.70);
    expect(paWeekly.netPay).toBe(814.02);
  });

  it("verifies monthly worked example numbers match calculatePaycheck engine exactly", () => {
    const vaMonthly = calculatePaycheck({
      payType: "salary",
      grossAmount: 60000,
      frequency: "monthly",
      stateCode: "VA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 },
    });
    expect(vaMonthly.grossPay).toBe(5000);
    expect(vaMonthly.taxes.socialSecurity).toBe(310.00);
    expect(vaMonthly.taxes.medicare).toBe(72.50);
    expect(vaMonthly.taxes.federalIncomeTax).toBe(418.33);
    expect(vaMonthly.taxes.stateIncomeTax).toBe(219.67);
    expect(vaMonthly.netPay).toBe(3979.50);

    const paMonthly = calculatePaycheck({
      payType: "salary",
      grossAmount: 60000,
      frequency: "monthly",
      stateCode: "PA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { paLocalEitRate: 0.0 },
    });
    expect(paMonthly.grossPay).toBe(5000);
    expect(paMonthly.taxes.socialSecurity).toBe(310.00);
    expect(paMonthly.taxes.medicare).toBe(72.50);
    expect(paMonthly.taxes.stateIncomeTax).toBe(153.50);
    const paUc = paMonthly.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0);
    expect(paUc).toBe(3.50);
    expect(paMonthly.netPay).toBe(4042.17);
  });

  it("verifies hourly worked example numbers match calculatePaycheck engine exactly", () => {
    const vaHourly = calculatePaycheck({
      payType: "hourly",
      grossAmount: 25,
      hoursPerWeek: 40,
      frequency: "bi-weekly",
      stateCode: "VA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { vaPersonalExemptions: 1, vaAgeBlindExemptions: 0 },
    });
    expect(vaHourly.grossPay).toBe(2000);
    expect(vaHourly.taxes.socialSecurity).toBe(124.00);
    expect(vaHourly.taxes.medicare).toBe(29.00);
    expect(vaHourly.taxes.federalIncomeTax).toBe(156.15);
    expect(vaHourly.taxes.stateIncomeTax).toBe(83.69);
    expect(vaHourly.netPay).toBe(1607.16);

    const paHourly = calculatePaycheck({
      payType: "hourly",
      grossAmount: 25,
      hoursPerWeek: 40,
      frequency: "bi-weekly",
      stateCode: "PA",
      w4: { filingStatus: "single", step2MultipleJobs: false, step3DependentsCredit: 0, step4aOtherIncome: 0, step4bDeductions: 0, step4cExtraWithholding: 0 },
      preTax: {},
      stateInputs: { paLocalEitRate: 0.0 },
    });
    expect(paHourly.grossPay).toBe(2000);
    expect(paHourly.taxes.socialSecurity).toBe(124.00);
    expect(paHourly.taxes.medicare).toBe(29.00);
    expect(paHourly.taxes.federalIncomeTax).toBe(156.15);
    expect(paHourly.taxes.stateIncomeTax).toBe(61.40);
    const paUc = paHourly.taxes.statePayrollTaxes.reduce((s, i) => s + i.amount, 0);
    expect(paUc).toBe(1.40);
    expect(paHourly.taxes.stateIncomeTax + paUc).toBe(62.80);
    expect(paHourly.netPay).toBe(1628.05);
  });
});

// ── 2. Unique Titles & Descriptions Across ALL Pages ─────────────────────────
describe("Phase A: Unique Titles and Meta Descriptions Across All Pages", () => {
  interface PageMetadata {
    path: string;
    title: string;
    description: string;
  }

  const staticPages: PageMetadata[] = [
    { path: "/", title: String(homeMetadata.title), description: String(homeMetadata.description) },
    { path: "/paycheck-calculator-by-state", title: String(hubMetadata.title), description: String(hubMetadata.description) },
    { path: "/virginia-paycheck-calculator", title: String(vaMetadata.title), description: String(vaMetadata.description) },
    { path: "/pennsylvania-paycheck-calculator", title: String(paMetadata.title), description: String(paMetadata.description) },
    { path: "/about", title: String(aboutMetadata.title), description: String(aboutMetadata.description) },
    { path: "/contact", title: String(contactMetadata.title), description: String(contactMetadata.description) },
    { path: "/disclaimer", title: String(disclaimerMetadata.title), description: String(disclaimerMetadata.description) },
    { path: "/privacy-policy", title: String(privacyMetadata.title), description: String(privacyMetadata.description) },

    // 7 New Pages
    { path: "/hourly-to-salary-calculator", title: String(hourlyToSalaryMetadata.title), description: String(hourlyToSalaryMetadata.description) },
    { path: "/salary-to-hourly-calculator", title: String(salaryToHourlyMetadata.title), description: String(salaryToHourlyMetadata.description) },
    { path: "/hourly-paycheck-calculator", title: String(hourlyPaycheckMetadata.title), description: String(hourlyPaycheckMetadata.description) },
    { path: "/weekly-paycheck-calculator", title: String(weeklyPaycheckMetadata.title), description: String(weeklyPaycheckMetadata.description) },
    { path: "/bi-weekly-paycheck-calculator", title: String(biWeeklyPaycheckMetadata.title), description: String(biWeeklyPaycheckMetadata.description) },
    { path: "/monthly-paycheck-calculator", title: String(monthlyPaycheckMetadata.title), description: String(monthlyPaycheckMetadata.description) },
    { path: "/paycheck-basics", title: String(basicsMetadata.title), description: String(basicsMetadata.description) },
  ];

  const salaryPages: PageMetadata[] = getAllSalaryPages().map((page) => {
    const meta = buildSalaryPageMetadata(page);
    return {
      path: `/${page.slug}`,
      title: meta.title,
      description: meta.description,
    };
  });

  const allPages = [...staticPages, ...salaryPages];

  it("verifies every page has non-empty title and description", () => {
    for (const page of allPages) {
      expect(page.title.length, `Title missing on ${page.path}`).toBeGreaterThan(10);
      expect(page.description.length, `Description missing on ${page.path}`).toBeGreaterThan(20);
    }
  });

  it("verifies all titles are unique across the entire site", () => {
    const titles = allPages.map((p) => p.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(allPages.length);
  });

  it("verifies all meta descriptions are unique across the entire site", () => {
    const descriptions = allPages.map((p) => p.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(allPages.length);
  });
});

// ── 3. Sitemap Entries ───────────────────────────────────────────────────────
describe("Phase A: Sitemap Entries", () => {
  it("includes all 7 new pages in sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    const requiredPaths = [
      "/hourly-to-salary-calculator",
      "/salary-to-hourly-calculator",
      "/hourly-paycheck-calculator",
      "/weekly-paycheck-calculator",
      "/bi-weekly-paycheck-calculator",
      "/monthly-paycheck-calculator",
      "/paycheck-basics",
    ];

    for (const path of requiredPaths) {
      const fullUrl = `${NEXT_PUBLIC_SITE_URL}${path}`;
      expect(urls, `Missing ${fullUrl} in sitemap`).toContain(fullUrl);

      const entry = entries.find((e) => e.url === fullUrl);
      expect(entry?.lastModified).toEqual(new Date(PAGE_UPDATE_INFO.lastmodDate));
    }
  });
});

// ── 4. State Gating: No Unverified States Selectable ─────────────────────────
describe("Phase A: State Selectability", () => {
  it("only allows verified and active states (VA and PA)", () => {
    const selectableStates = statesMetaData.filter((st) => st.verified && st.isActive);
    const codes = selectableStates.map((s) => s.stateCode).sort();
    expect(codes).toEqual(["PA", "VA"]);

    // Explicitly verify unverified states are excluded
    const unverifiedCodes = ["MN", "WI", "CT"];
    for (const code of unverifiedCodes) {
      const state = statesMetaData.find((s) => s.stateCode === code);
      expect(state?.verified && state?.isActive).toBeFalsy();
    }
  });
});

// ── 5. JSON-LD Equals Visible FAQ ───────────────────────────────────────────
describe("Phase A: FAQPage JSON-LD Equals Visible FAQs", () => {
  it("Virginia page has no duplicate generic FAQs and links to /paycheck-basics", () => {
    const vaSource = fs.readFileSync(
      path.join(process.cwd(), "src/app/virginia-paycheck-calculator/page.tsx"),
      "utf-8"
    );

    // Verify 3 generic FAQs are removed
    expect(vaSource).not.toContain("What is the difference between gross pay and net pay?");
    expect(vaSource).not.toContain("What is pay frequency?");
    expect(vaSource).not.toContain("What is the difference between bi-weekly and semi-monthly pay?");

    // Verify link to paycheck-basics is present
    expect(vaSource).toContain("/paycheck-basics");

    // Verify FAQ schema is constructed directly from the faqs array
    expect(vaSource).toMatch(/"?mainEntity"?: faqs\.map/);
    expect(vaSource).toContain('faqs.map((faq, idx)');
  });

  it("Pennsylvania page has no duplicate generic FAQs and links to /paycheck-basics", () => {
    const paSource = fs.readFileSync(
      path.join(process.cwd(), "src/app/pennsylvania-paycheck-calculator/page.tsx"),
      "utf-8"
    );

    // Verify 3 generic FAQs are removed
    expect(paSource).not.toContain("What is the difference between gross pay and net pay?");
    expect(paSource).not.toContain("What is pay frequency?");
    expect(paSource).not.toContain("What is the difference between bi-weekly and semi-monthly pay?");

    // Verify link to paycheck-basics is present
    expect(paSource).toContain("/paycheck-basics");

    // Verify FAQ schema is constructed directly from the faqs array
    expect(paSource).toMatch(/"?mainEntity"?: faqs\.map/);
    expect(paSource).toContain('faqs.map((faq, idx)');
  });

  it("Each new page contains 4 to 5 FAQs and matching FAQPage JSON-LD", () => {
    const pageFiles = [
      "src/app/hourly-to-salary-calculator/page.tsx",
      "src/app/salary-to-hourly-calculator/page.tsx",
      "src/app/hourly-paycheck-calculator/page.tsx",
      "src/app/weekly-paycheck-calculator/page.tsx",
      "src/app/bi-weekly-paycheck-calculator/page.tsx",
      "src/app/monthly-paycheck-calculator/page.tsx",
      "src/app/paycheck-basics/page.tsx",
    ];

    for (const file of pageFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf-8");

      // Verify FAQ schema exists and matches faqs array
      expect(source, `${file} missing FAQPage schema`).toContain('"@type": "FAQPage"');
      expect(source, `${file} missing mainEntity mapping`).toContain("mainEntity: faqs.map");
      expect(source, `${file} missing visible faq mapping`).toContain("faqs.map((faq");

      // Count FAQs in array (number of q: occurrences in faqs definition)
      const faqsMatch = source.match(/const faqs = \[([\s\S]*?)\];/);
      expect(faqsMatch, `${file} missing faqs array`).toBeDefined();
      const questionCount = (faqsMatch![1].match(/q:\s*"/g) || []).length;
      expect(
        questionCount,
        `${file} should have 4 or 5 FAQs, found ${questionCount}`
      ).toBeGreaterThanOrEqual(4);
      expect(
        questionCount,
        `${file} should have 4 or 5 FAQs, found ${questionCount}`
      ).toBeLessThanOrEqual(5);
    }
  });
});

// ── 6. Consistent Last Verified and Updated ─────────────────────────────────
describe("Phase A: Last Verified and Updated Consistency", () => {
  it("uses consistent October 2026 value across state data and PAGE_UPDATE_INFO", () => {
    expect(PAGE_UPDATE_INFO.updatedLabel).toBe("Updated October 2026");
    expect(virginiaData.lastVerified).toBe("October 2026");
    expect(pennsylvaniaData.lastVerified).toBe("October 2026");
  });
});
