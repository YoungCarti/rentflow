"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccessibilityPreferences } from "@/components/AccessibilityPreferences";
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
  accessibility: {
    title: "Accessibility",
    summary: "Tune RentFlow for readability, motion comfort, and keyboard navigation",
  },
} as const;

type SettingsSection = keyof typeof settingsSections;

function getSettingsSection(value: string | null): SettingsSection {
  if (value && Object.prototype.hasOwnProperty.call(settingsSections, value)) {
    return value as SettingsSection;
  }

  return "account";
}

function SwitchToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-black dark:bg-white" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-black ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingsRow({
  label,
  description,
  action,
  children,
}: {
  label: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {description && (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
      {action && <div className="flex justify-start sm:justify-end">{action}</div>}
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2" aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-settings`}>
      <div className="space-y-3">
        <h2
          id={`${title.toLowerCase().replaceAll(" ", "-")}-settings`}
          className="text-xl font-semibold text-foreground"
        >
          {title}
        </h2>
        <Separator />
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function SelectControl({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
    >
      {children}
    </select>
  );
}

function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Value;
  options: { label: string; value: Value }[];
  onChange: (value: Value) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex w-full rounded-md border border-border bg-muted/35 p-1 sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`h-8 flex-1 rounded-sm px-3 text-sm font-medium transition-colors sm:flex-none ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeSection = getSettingsSection(searchParams.get("section"));
  const sectionCopy = settingsSections[activeSection];
  const { preferences, updatePreference, resetPreferences } = useAccessibilityPreferences();

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
          <div className="space-y-7">
            <SettingsSection title="Email Notifications">
              <SettingsRow
                label="Rent due reminders"
                description="Notify me 3 days before rent is due"
                action={
                  <SwitchToggle
                    checked={notifs.rentDue}
                    onChange={(v) => setNotifs((n) => ({ ...n, rentDue: v }))}
                    label="Toggle rent due reminders"
                  />
                }
              />
              <SettingsRow
                label="Overdue rent alerts"
                description="Notify me when a payment becomes overdue"
                action={
                  <SwitchToggle
                    checked={notifs.overdueReminder}
                    onChange={(v) => setNotifs((n) => ({ ...n, overdueReminder: v }))}
                    label="Toggle overdue rent alerts"
                  />
                }
              />
              <SettingsRow
                label="Payment received"
                description="Notify me when a tenant submits a payment proof"
                action={
                  <SwitchToggle
                    checked={notifs.paymentReceived}
                    onChange={(v) => setNotifs((n) => ({ ...n, paymentReceived: v }))}
                    label="Toggle payment received notifications"
                  />
                }
              />
              <SettingsRow
                label="Lease expiry warnings"
                description="Notify me 30 days before a lease expires"
                action={
                  <SwitchToggle
                    checked={notifs.leaseExpiry}
                    onChange={(v) => setNotifs((n) => ({ ...n, leaseExpiry: v }))}
                    label="Toggle lease expiry warnings"
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Reports and Updates">
              <SettingsRow
                label="Weekly summary report"
                description="Receive a weekly email with portfolio performance"
                action={
                  <SwitchToggle
                    checked={notifs.weeklyReport}
                    onChange={(v) => setNotifs((n) => ({ ...n, weeklyReport: v }))}
                    label="Toggle weekly summary report"
                  />
                }
              />
              <SettingsRow
                label="Product updates & news"
                description="Receive news about RentFlow features and offers"
                action={
                  <SwitchToggle
                    checked={notifs.marketingEmails}
                    onChange={(v) => setNotifs((n) => ({ ...n, marketingEmails: v }))}
                    label="Toggle product updates and news"
                  />
                }
              />
            </SettingsSection>
          </div>
        );
      case "language-region":
        return (
          <div className="space-y-7">
            <SettingsSection title="Language & Region">
              <SettingsRow
                label="Language"
                description="Choose the language used across your workspace."
              >
                <div className="space-y-1.5">
                  <Label htmlFor="language" className="sr-only">Language</Label>
                  <SelectControl
                    id="language"
                    value={language}
                    onChange={setLanguage}
                  >
                    <option value="en-MY">English (Malaysia)</option>
                    <option value="en-US">English (US)</option>
                    <option value="ms-MY">Bahasa Malaysia</option>
                  </SelectControl>
                </div>
              </SettingsRow>

              <SettingsRow
                label="Timezone"
                description="Dates and reminder times are shown in this timezone."
              >
                <div className="space-y-1.5">
                  <Label htmlFor="timezone" className="sr-only">Timezone</Label>
                  <SelectControl
                    id="timezone"
                    value={timezone}
                    onChange={setTimezone}
                  >
                    <option value="Asia/Kuala_Lumpur">Kuala Lumpur (GMT+8)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                    <option value="UTC">UTC</option>
                  </SelectControl>
                </div>
              </SettingsRow>

              <SettingsRow
                label="Currency display"
                description="Format rent amounts, reports, and receipts with this currency."
              >
                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="sr-only">Currency display</Label>
                  <SelectControl
                    id="currency"
                    value={currency}
                    onChange={setCurrency}
                  >
                    <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                    <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                  </SelectControl>
                </div>
              </SettingsRow>
            </SettingsSection>

            <div className="flex justify-end">
              <Button size="sm">Save preferences</Button>
            </div>
          </div>
        );
      case "accessibility":
        return (
          <div className="space-y-7">
            <SettingsSection title="Display">
              <SettingsRow
                label="Text size"
                description="Increase app text across dashboards, forms, tables, and receipts."
              >
                <SegmentedControl
                  label="Text size"
                  value={preferences.textSize}
                  onChange={(value) => updatePreference("textSize", value)}
                  options={[
                    { label: "Default", value: "default" },
                    { label: "Large", value: "large" },
                    { label: "Larger", value: "larger" },
                  ]}
                />
              </SettingsRow>

              <SettingsRow
                label="Interface density"
                description="Use a tighter layout for record-heavy views like rent, payments, and tenants."
              >
                <SegmentedControl
                  label="Interface density"
                  value={preferences.density}
                  onChange={(value) => updatePreference("density", value)}
                  options={[
                    { label: "Comfortable", value: "comfortable" },
                    { label: "Compact", value: "compact" },
                  ]}
                />
              </SettingsRow>

              <SettingsRow
                label="High contrast"
                description="Strengthen text, borders, inputs, and page contrast."
                action={
                  <SwitchToggle
                    checked={preferences.highContrast}
                    onChange={(value) => updatePreference("highContrast", value)}
                    label="Toggle high contrast"
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Motion and Navigation">
              <SettingsRow
                label="Reduce motion"
                description="Minimize animations and transitions throughout the app."
                action={
                  <SwitchToggle
                    checked={preferences.reduceMotion}
                    onChange={(value) => updatePreference("reduceMotion", value)}
                    label="Toggle reduced motion"
                  />
                }
              />

              <SettingsRow
                label="Enhanced focus indicators"
                description="Make keyboard focus outlines easier to see while tabbing through controls."
                action={
                  <SwitchToggle
                    checked={preferences.enhancedFocus}
                    onChange={(value) => updatePreference("enhancedFocus", value)}
                    label="Toggle enhanced focus indicators"
                  />
                }
              />

              <SettingsRow
                label="Underline links"
                description="Show underlines on links so clickable text does not rely on color alone."
                action={
                  <SwitchToggle
                    checked={preferences.underlineLinks}
                    onChange={(value) => updatePreference("underlineLinks", value)}
                    label="Toggle underlined links"
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Data Visibility">
              <SettingsRow
                label="Color-blind friendly statuses"
                description="Add a non-color visual marker to status badges like Paid, Pending, and Overdue."
                action={
                  <SwitchToggle
                    checked={preferences.colorBlindStatuses}
                    onChange={(value) => updatePreference("colorBlindStatuses", value)}
                    label="Toggle color-blind friendly statuses"
                  />
                }
              />
            </SettingsSection>

            <div className="flex justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={resetPreferences}>
                Reset accessibility
              </Button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className={`mx-auto w-full space-y-8 ${activeSection === "account" ? "max-w-5xl" : "max-w-3xl"}`}>
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
