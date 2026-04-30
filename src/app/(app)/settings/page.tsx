"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import ProfileSettings from "@/components/settings/ProfileSettings";

const settingsSections = {
  account: {
    title: "Account",
    summary: "Manage your personal information and account access",
  },
  notifications: {
    title: "Notification",
    summary: "Choose which email updates RentFlow sends you",
  },
  "language-region": {
    title: "Language & Region",
    summary: "Set your language, timezone, and currency display",
  },
} as const;

type SettingsSection = keyof typeof settingsSections;

function getSettingsSection(value: string | null): SettingsSection {
  if (value && Object.prototype.hasOwnProperty.call(settingsSections, value)) {
    return value as SettingsSection;
  }

  return "account";
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeSection = getSettingsSection(searchParams.get("section"));
  const sectionCopy = settingsSections[activeSection];

  // Notifications
  const [notifs, setNotifs] = useState({
    rentDue: true,
    overdueReminder: true,
    paymentReceived: true,
    leaseExpiry: true,
    weeklyReport: false,
    marketingEmails: false,
  });

  // Preferences
  const [language, setLanguage] = useState("en-MY");
  const [timezone, setTimezone] = useState("Asia/Kuala_Lumpur");
  const [currency, setCurrency] = useState("MYR");

  function renderActiveSection() {
    switch (activeSection) {
      case "account":
        return <ProfileSettings />;
      case "notifications":
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-base text-foreground">Email Notifications</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <ToggleRow
                label="Rent due reminders"
                description="Notify me 3 days before rent is due"
                checked={notifs.rentDue}
                onChange={(v) => setNotifs((n) => ({ ...n, rentDue: v }))}
              />
              <Separator />
              <ToggleRow
                label="Overdue rent alerts"
                description="Notify me when a payment becomes overdue"
                checked={notifs.overdueReminder}
                onChange={(v) => setNotifs((n) => ({ ...n, overdueReminder: v }))}
              />
              <Separator />
              <ToggleRow
                label="Payment received"
                description="Notify me when a tenant submits a payment proof"
                checked={notifs.paymentReceived}
                onChange={(v) => setNotifs((n) => ({ ...n, paymentReceived: v }))}
              />
              <Separator />
              <ToggleRow
                label="Lease expiry warnings"
                description="Notify me 30 days before a lease expires"
                checked={notifs.leaseExpiry}
                onChange={(v) => setNotifs((n) => ({ ...n, leaseExpiry: v }))}
              />
              <Separator />
              <ToggleRow
                label="Weekly summary report"
                description="Receive a weekly email with portfolio performance"
                checked={notifs.weeklyReport}
                onChange={(v) => setNotifs((n) => ({ ...n, weeklyReport: v }))}
              />
              <Separator />
              <ToggleRow
                label="Product updates & news"
                description="Receive news about RentFlow features and offers"
                checked={notifs.marketingEmails}
                onChange={(v) => setNotifs((n) => ({ ...n, marketingEmails: v }))}
              />
            </CardContent>
          </Card>
        );
      case "language-region":
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <p className="font-semibold text-base text-foreground">Preferences</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="en-MY">English (Malaysia)</option>
                    <option value="en-US">English (US)</option>
                    <option value="ms-MY">Bahasa Malaysia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Asia/Kuala_Lumpur">Kuala Lumpur (GMT+8)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency display</Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                    <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button size="sm">Save preferences</Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  }

  return (
    <div className={`mx-auto w-full space-y-8 ${activeSection === "account" ? "max-w-5xl" : "max-w-2xl"}`}>
      {activeSection !== "account" && (
        <PageHeader
          title={sectionCopy.title}
          summary={sectionCopy.summary}
        />
      )}

      {renderActiveSection()}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
