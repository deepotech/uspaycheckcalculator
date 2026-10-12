import React from "react";
import type { Metadata } from "next";
import { SITE_OWNER_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | US Paycheck Calculator",
  description:
    "Get in touch with the maintainer of US Paycheck Calculator for feedback, corrections, or inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | US Paycheck Calculator",
    description:
      "Get in touch with the maintainer of US Paycheck Calculator for feedback, corrections, or inquiries.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      <div>
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
          Support &amp; Feedback
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
          Questions, suggestions, or found an issue in a tax calculation? Reach out directly via email.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
            Email Support
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Click the link below to send an email to {SITE_OWNER_NAME}. We welcome feedback regarding formula accuracy, citations, and usability improvements.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Email Address
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-base font-bold text-emerald-700 hover:text-emerald-800 underline break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Please note: We cannot provide individualized tax preparation assistance, tax advice, or custom filing calculations. For questions about your specific tax return, please consult a licensed tax professional or your payroll department.
        </p>
      </section>
    </div>
  );
}
