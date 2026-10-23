export const SITE_OWNER_NAME = "Dounia El Marradi";
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "dounia.elmarradi@gmail.com";
export const NEXT_PUBLIC_SITE_URL = (() => {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    (process.env.NODE_ENV === "production"
      ? "https://uspaycheckcalculator.com"
      : "http://localhost:3000");

  return url.replace(/\/+$/, "");
})();
export const SITE_URL = NEXT_PUBLIC_SITE_URL;

export const PAGE_UPDATE_INFO = {
  taxYearLabel: "Tax year 2026",
  updatedLabel: "Updated October 2026",
  lastmodDate: "2026-10-23",
} as const;

