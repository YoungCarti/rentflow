"use client";

import { useState } from "react";
import { Bell, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

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

export default function SettingsPage() {
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

  // Password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handlePasswordSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwSaved(false);
    setPwError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmNewPassword = String(formData.get("confirmNewPassword") ?? "");

    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });

      if (error) {
        setPwError(error.message);
        toast.error(error.message);
        return;
      }

      setPwSaved(true);
      toast.success("Password updated successfully.");
      setTimeout(() => setPwSaved(false), 3000);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update password.";
      setPwError(message);
      toast.error(message);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Settings"
        summary="Manage your notifications and preferences"
      />

      {/* Notifications */}
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

      {/* Preferences */}
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
                <option value="MYR">MYR – Malaysian Ringgit (RM)</option>
                <option value="SGD">SGD – Singapore Dollar (S$)</option>
                <option value="USD">USD – US Dollar ($)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm">Save preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="font-semibold text-base text-foreground">Change Password</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                name="confirmNewPassword"
                type="password"
                placeholder="Re-enter new password"
                minLength={8}
                required
              />
            </div>

            <Separator />

            {pwError && (
              <p className="text-sm text-red-600 font-medium">{pwError}</p>
            )}

            <div className="flex items-center justify-between">
              {pwSaved && (
                <p className="text-sm text-green-600 font-medium">Password updated successfully.</p>
              )}
              <Button type="submit" size="sm" className="ml-auto" disabled={pwSaving}>
                {pwSaving ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
