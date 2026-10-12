import React from "react";

interface AdPlaceholderProps {
  slotId: string;
  format?: "horizontal-banner" | "rectangle" | "vertical-skyscraper";
  className?: string;
}

/**
 * AdPlaceholder – renders nothing unless an ad provider is configured.
 * Set NEXT_PUBLIC_ADS_ENABLED=true in your environment to reveal ad slots.
 * The component is kept in the tree so slots can be wired up without code changes.
 */
export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  slotId,
  format = "horizontal-banner",
  className = "",
}) => {
  // Only render when explicitly enabled (e.g. after an ad network is integrated)
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== "true") {
    return null;
  }

  return (
    <div
      data-ad-slot={slotId}
      className={`border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 text-xs my-4 ${className}`}
      aria-hidden="true"
    >
      <span className="font-semibold tracking-wider uppercase text-[10px] text-slate-400 mb-1">
        Advertisement
      </span>
      <span className="text-[11px] text-slate-400">Reserved Space ({format})</span>
    </div>
  );
};
