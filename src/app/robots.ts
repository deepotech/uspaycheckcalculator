import type { MetadataRoute } from "next";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
