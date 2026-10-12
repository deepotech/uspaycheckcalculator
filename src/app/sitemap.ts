import type { MetadataRoute } from "next";
import statesMetaData from "@/data/states-meta.json";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date("2026-10-12");

  // Core static routes: homepage and legal pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
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

  return [...staticRoutes, ...verifiedActiveStateRoutes];
}
