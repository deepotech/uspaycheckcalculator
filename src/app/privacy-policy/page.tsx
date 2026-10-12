import React from "react";
import type { Metadata } from "next";
import { SITE_OWNER_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | US Paycheck Calculator",
  description:
    "Privacy Policy for US Paycheck Calculator: client-side processing, no server storage of financial inputs, and data handling practices.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | US Paycheck Calculator",
    description:
      "Privacy Policy for US Paycheck Calculator: client-side processing, no server storage of financial inputs, and data handling practices.",
    url: "/privacy-policy",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <div>
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          Data &amp; Privacy
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Last updated: October 12, 2026. This policy explains how information is handled when you use US Paycheck Calculator.
        </p>
      </div>

      {/* Client-Side Processing */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Calculator Processing Runs in Your Browser
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            When you enter your salary, wage rate, pay frequency, Form W-4 choices, pre-tax deductions, or state selections into our paycheck calculator, all calculations are executed entirely within your web browser using client-side JavaScript.
          </p>
          <p>
            <strong>Your financial numbers and payroll inputs are not transmitted to any web server, database, or backend system.</strong> We do not store, log, sell, or collect your wage or deduction entries. If you refresh your browser or close the tab, your entered figures are discarded from memory.
          </p>
        </div>
      </section>

      {/* Analytics & Advertising Policy */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Web Analytics &amp; Advertising
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Currently, no tracking or behavioral analytics scripts or third-party advertising networks are active on this website. If we add analytics or advertising in the future, this policy will be updated before they are enabled.
        </p>
      </section>

      {/* External Links */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          External Links
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          This site may contain links to external government publications and third-party websites. We are not responsible for the privacy practices, content, or policies of external sites.
        </p>
      </section>

      {/* Contact & Questions */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Contact &amp; Inquiries
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          If you have questions about this privacy policy or how information is handled, you may contact {SITE_OWNER_NAME} directly via email at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-emerald-700 hover:text-emerald-800 underline font-semibold"
          >
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>
    </div>
  );
}
