export const SITE_OWNER_NAME = "Dounia El Marradi";
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "dounia.elmarradi@gmail.com";
export const NEXT_PUBLIC_SITE_URL = (() => {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("NEXT_PUBLIC_SITE_URL is required in production builds.");
    }
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
})();
export const SITE_URL = NEXT_PUBLIC_SITE_URL;

