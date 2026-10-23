import type { MetadataRoute } from "next";
import statesMetaData from "@/data/states-meta.json";
import { getAllSalaryPages } from "@/lib/salaryPages";
import { NEXT_PUBLIC_SITE_URL, PAGE_UPDATE_INFO } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date(PAGE_UPDATE_INFO.lastmodDate);

  // Core static routes: homepage, state hub, and legal pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/paycheck-calculator-by-state`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Strictly include only state pages that are both verified AND active
  const verifiedActiveStateRoutes: MetadataRoute.Sitemap = statesMetaData
    .filter((state) => state.verified && state.isActive)
    .map((state) => ({
      url: `${baseUrl}/${state.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Salary after-tax pages — only for verified && isActive states (enforced inside getAllSalaryPages)
  const salaryPageRoutes: MetadataRoute.Sitemap = getAllSalaryPages().map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...verifiedActiveStateRoutes, ...salaryPageRoutes];
}
