/**
 * Central registry for salary after-tax pages.
 *
 * Only states that are verified AND isActive in states-meta.json are eligible.
 * Any change here is the single source of truth for:
 *  - generateStaticParams in app/[slug]/page.tsx
 *  - sitemap.ts
 *  - the "Salary examples" sections on state calculator pages
 *  - tests
 */

import statesMetaData from "@/data/states-meta.json";

/** Salaries for which we publish pages (10 per state). */
export const SALARY_PAGE_SALARIES: number[] = [
  35000, 45000, 55000, 65000, 75000, 85000, 95000, 110000, 130000, 150000,
];

export interface SalaryPageMeta {
  stateCode: string;
  stateName: string;
  /** Calculator slug e.g. "virginia-paycheck-calculator" */
  calculatorSlug: string;
  salary: number;
  /** URL slug e.g. "virginia-65000-salary-after-tax" */
  slug: string;
}

/** All verified+active states that have salary pages. */
function getEligibleStates() {
  return statesMetaData.filter((s) => s.verified && s.isActive);
}

/** Returns all 20 SalaryPageMeta objects. */
export function getAllSalaryPages(): SalaryPageMeta[] {
  const states = getEligibleStates();
  const pages: SalaryPageMeta[] = [];
  for (const state of states) {
    for (const salary of SALARY_PAGE_SALARIES) {
      const salaryStr = String(salary);
      const stateSlugPrefix = state.name.toLowerCase().replace(/\s+/g, "-");
      pages.push({
        stateCode: state.stateCode,
        stateName: state.name,
        calculatorSlug: state.slug,
        salary,
        slug: `${stateSlugPrefix}-${salaryStr}-salary-after-tax`,
      });
    }
  }
  return pages;
}

/** Returns all salary pages for a specific verified+active state. */
export function getSalaryPagesForState(stateCode: string): SalaryPageMeta[] {
  return getAllSalaryPages().filter((p) => p.stateCode === stateCode);
}

/**
 * Given a URL slug, returns the matching SalaryPageMeta or null.
 * Only returns a match if the state is verified && isActive.
 */
export function parseSalarySlug(slug: string): SalaryPageMeta | null {
  const all = getAllSalaryPages();
  return all.find((p) => p.slug === slug) ?? null;
}

/**
 * Given a salary and the full list for a state, returns the neighbors
 * (the two below and two above in the ordered SALARY_PAGE_SALARIES list).
 */
export function getSalaryNeighbors(
  salary: number,
  stateCode: string
): {
  below: SalaryPageMeta[];
  above: SalaryPageMeta[];
  allForState: SalaryPageMeta[];
} {
  const allForState = getSalaryPagesForState(stateCode);
  const idx = SALARY_PAGE_SALARIES.indexOf(salary);
  const below = SALARY_PAGE_SALARIES.slice(Math.max(0, idx - 2), idx)
    .map((s) => allForState.find((p) => p.salary === s)!)
    .filter(Boolean);
  const above = SALARY_PAGE_SALARIES.slice(idx + 1, idx + 3)
    .map((s) => allForState.find((p) => p.salary === s)!)
    .filter(Boolean);
  return { below, above, allForState };
}
