import type { Metadata } from "next";
import Link from "next/link";
import RentFlowLogo from "@/components/brand/RentFlowLogo";

export const metadata: Metadata = {
  title: "Terms of Use | RentFlow",
  description: "Terms for using RentFlow during beta development.",
};

const sections = [
  {
    title: "Using RentFlow",
    body: [
      "RentFlow is provided to help landlords and property managers organize rental workflows, including properties, units, tenants, rent records, payment proof reviews, maintenance requests, receipts, reports, and reminders.",
      "You are responsible for the accuracy of the information you enter and for ensuring you have permission to manage tenant, property, and payment-related records.",
    ],
  },
  {
    title: "Beta Development",
    body: [
      "RentFlow is currently in beta development. Features may change, break, be removed, or be redesigned as the product improves.",
      "Beta access does not guarantee uninterrupted availability, permanent pricing, permanent feature behavior, or final production readiness.",
    ],
  },
  {
    title: "Accounts and Security",
    body: [
      "You are responsible for keeping your account credentials secure.",
      "You should use accurate account information and enable available security features where appropriate.",
      "You must not attempt to access accounts, workspaces, or data that you are not authorized to use.",
    ],
  },
  {
    title: "Tenant and Property Data",
    body: [
      "You are responsible for any tenant, property, lease, rent, payment proof, or maintenance data that you add to RentFlow.",
      "You should only upload or store information that you have a lawful and legitimate reason to manage.",
    ],
  },
  {
    title: "Payments and Receipts",
    body: [
      "RentFlow currently includes MVP/demo payment workflows and payment proof tracking. Unless a real payment provider is added later, RentFlow does not process real card, bank, or wallet charges.",
      "Payment status, proof review, and receipt features are workflow tools. You are responsible for verifying actual payment activity outside RentFlow where needed.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "Do not use RentFlow to store unlawful, harmful, misleading, abusive, or unauthorized content.",
      "Do not interfere with the security, availability, or integrity of RentFlow or its underlying services.",
      "Do not misuse public payment links, receipt pages, or tenant-facing workflows.",
    ],
  },
  {
    title: "No Professional Advice",
    body: [
      "RentFlow is a software tool. It does not provide legal, accounting, tax, real estate, or financial advice.",
      "You should consult qualified professionals for decisions that require professional advice.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "These terms may be updated as RentFlow evolves through beta development.",
      "Continued use of RentFlow after changes means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-10 text-white sm:px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "5px 5px",
        }}
      />

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-white"
        >
          <RentFlowLogo className="h-8 w-8" />
          RentFlow
        </Link>

        <section className="mt-12 rounded-[24px] border border-white/10 bg-[#151515] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.26)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Use
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/[0.58]">
            Last updated: May 2026. These terms describe the expected use of
            RentFlow during beta development.
          </p>
        </section>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[20px] border border-white/10 bg-[#101010] p-6"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/[0.58]">
                {section.body.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-6 text-sm leading-6 text-white/[0.45]">
          This page is a starter terms document for the beta product and is not
          legal advice. Review with qualified counsel before public launch.
        </p>
      </div>
    </main>
  );
}
