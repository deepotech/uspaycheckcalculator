import { describe, it, expect } from "vitest";
import statesMetaData from "@/data/states-meta.json";
import { PAGE_UPDATE_INFO } from "@/lib/site";
import sitemap from "@/app/sitemap";

describe("Phase 1 Content Upgrade Tests", () => {
  it("exports PAGE_UPDATE_INFO with taxYearLabel and updatedLabel", () => {
    expect(PAGE_UPDATE_INFO.taxYearLabel).toBe("Tax year 2026");
    expect(PAGE_UPDATE_INFO.updatedLabel).toBe("Updated October 2026");
    expect(PAGE_UPDATE_INFO.lastmodDate).toBe("2026-10-23");
  });

  it("sitemap includes /paycheck-calculator-by-state with updated lastmod", () => {
    const sitemapEntries = sitemap();
    const hubEntry = sitemapEntries.find((e) =>
      e.url.endsWith("/paycheck-calculator-by-state")
    );
    expect(hubEntry).toBeDefined();
    expect(hubEntry?.priority).toBe(0.8);
    expect(hubEntry?.lastModified).toEqual(new Date("2026-10-23"));

    // Check that state pages also have updated lastModified
    const vaEntry = sitemapEntries.find((e) =>
      e.url.endsWith("/virginia-paycheck-calculator")
    );
    expect(vaEntry?.lastModified).toEqual(new Date("2026-10-23"));

    const paEntry = sitemapEntries.find((e) =>
      e.url.endsWith("/pennsylvania-paycheck-calculator")
    );
    expect(paEntry?.lastModified).toEqual(new Date("2026-10-23"));
  });

  it("only lists verified and active states in statesMetaData", () => {
    const activeStates = statesMetaData.filter((s) => s.verified && s.isActive);
    expect(activeStates.map((s) => s.stateCode).sort()).toEqual(["PA", "VA"]);
  });
});
