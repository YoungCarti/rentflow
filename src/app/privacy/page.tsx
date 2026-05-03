import type { Metadata } from "next";
import Link from "next/link";
import RentFlowLogo from "@/components/brand/RentFlowLogo";

export const metadata: Metadata = {
  title: "Privacy Policy | RentFlow",
  description: "How RentFlow handles privacy and product data during beta.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "Account information such as your name, email address, phone number, authentication status, and profile settings.",
      "Property management data such as properties, units, tenants, lease details, rent records, maintenance requests, payment proofs, receipts, reports, reminders, and calendar events.",
      "Technical information such as device, browser, session, security, and usage data needed to keep RentFlow reliable and secure.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "To provide and improve RentFlow's property management workflows.",
      "To authenticate users, protect accounts, and support security features such as MFA.",
      "To help landlords manage tenants, rent records, payment proof reviews, receipts, reports, and maintenance workflows.",
      "To diagnose product issues, improve beta features, and understand which workflows need refinement.",
    ],
  },
  {
    title: "Payment Information",
    body: [
      "RentFlow currently includes MVP/demo payment workflows and payment proof tracking. Unless a real payment provider is added later, RentFlow does not process real card, bank, or wallet charges.",
      "Payment proof files and related records may be stored so landlords can review and manage rent payment status.",
    ],
  },
  {
    title: "Data Storage and Service Providers",
    body: [
      "RentFlow uses Supabase for authentication, database, and storage infrastructure.",
      "We may use trusted service providers to host, secure, monitor, and improve the product.",
      "We do not sell tenant or landlord data.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can update your profile and account settings inside RentFlow.",
      "You can request account deletion or data removal where supported by the product.",
      "You should only upload tenant or property information that you are authorized to manage.",
    ],
  },
  {
    title: "Beta Product Notice",
    body: [
      "RentFlow is in beta development. Features, data flows, storage behavior, and product settings may change as the product is refined.",
      "This policy should be reviewed before public launch or production use.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/[0.58]">
            Last updated: May 2026. This privacy policy explains how RentFlow
            handles information during beta development.
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
          This page is a starter policy for the beta product and is not legal
          advice. Review with qualified counsel before public launch.
        </p>
      </div>
    </main>
  );
}
