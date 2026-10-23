import React from "react";
import Link from "next/link";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/site";

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: `${NEXT_PUBLIC_SITE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-slate-400 select-none">&gt;</span>}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-emerald-700 transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-slate-800" : ""}>
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
