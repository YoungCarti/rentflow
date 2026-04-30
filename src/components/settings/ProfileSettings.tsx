"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const DEFAULT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  role: "Owner",
};

export default function ProfileSettings({ showHeading = true }: { showHeading?: boolean }) {
  const [form, setForm] = useState(DEFAULT);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [twoStepEnabled, setTwoStepEnabled] = useState(true);
  const [supportAccess, setSupportAccess] = useState(true);

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          return;
        }

        const currentUser = data.user;
        const metadata = currentUser?.user_metadata ?? {};
        const emailPrefix = currentUser?.email?.split("@")[0] ?? "";

        setUser(currentUser);
        setForm({
          firstName:
            typeof metadata.first_name === "string" ? metadata.first_name : emailPrefix,
          lastName: typeof metadata.last_name === "string" ? metadata.last_name : "",
          email: currentUser?.email ?? "",
          phone: typeof metadata.phone === "string" ? metadata.phone : "",
          company: typeof metadata.company === "string" ? metadata.company : "",
          role: typeof metadata.role === "string" ? metadata.role : "Owner",
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load profile.";
      toast.error(message);
    }
  }, []);

  function handleChange(key: keyof typeof DEFAULT) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSaved(false);
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email: form.email,
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          company: form.company,
          role: form.role,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setSaved(true);
      toast.success("Profile updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email || "Account";
  const initials = useMemo(() => {
    if (form.firstName || form.lastName) {
      return `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();
    }

    return displayName.slice(0, 2).toUpperCase();
  }, [displayName, form.firstName, form.lastName]);

  return (
    <section id="account" className="scroll-mt-24 space-y-7" aria-labelledby="account-settings">
      {showHeading && (
        <div className="space-y-3">
          <h2 id="account-settings" className="text-xl font-semibold text-foreground">
            My Profile
          </h2>
          <Separator />
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-7">
        <div className="space-y-6">
          {!showHeading && <Separator />}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-slate-200 text-lg font-semibold text-slate-700 dark:bg-muted dark:text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button type="button" size="sm" className="h-9 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                  <Plus className="h-4 w-4" />
                  Change Image
                </Button>
                <Button type="button" variant="secondary" size="sm" className="h-9">
                  Remove Image
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We support PNGs, JPEGs and GIFs under 2MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={handleChange("firstName")}
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={handleChange("lastName")}
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <p className="text-sm font-medium text-green-600">
                Changes saved successfully.
              </p>
            )}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </form>

      <section className="space-y-5" aria-labelledby="account-security">
        <div className="space-y-3">
          <h2 id="account-security" className="text-xl font-semibold text-foreground">
            Account Security
          </h2>
          <Separator />
        </div>

        <SettingActionRow
          label="Email"
          action={<Button type="button" variant="secondary" size="sm">Change email</Button>}
        >
          <Input
            value={form.email}
            disabled
            readOnly
            className="h-10 max-w-md disabled:opacity-60"
          />
        </SettingActionRow>

        <SettingActionRow
          label="Password"
          action={<Button type="button" variant="secondary" size="sm">Change password</Button>}
        >
          <Input
            value="***********"
            disabled
            readOnly
            type="password"
            className="h-10 max-w-md disabled:opacity-60"
          />
        </SettingActionRow>

        <SettingActionRow
          label="2-Step Verifications"
          description="Add an additional layer of security to your account during login."
          action={
            <SwitchToggle
              checked={twoStepEnabled}
              onChange={setTwoStepEnabled}
              label="Toggle 2-step verification"
            />
          }
        />
      </section>

      <section className="space-y-5" aria-labelledby="support-access">
        <div className="space-y-3">
          <h2 id="support-access" className="text-xl font-semibold text-foreground">
            Support Access
          </h2>
          <Separator />
        </div>

        <SettingActionRow
          label="Support access"
          description="You have granted us to access to your account for support purposes until Aug 31, 2023, 9:40 PM."
          action={
            <SwitchToggle
              checked={supportAccess}
              onChange={setSupportAccess}
              label="Toggle support access"
            />
          }
        />

        <SettingActionRow
          label="Log out of all devices"
          description="Log out of all other active sessions on other devices besides this one."
          action={<Button type="button" variant="secondary" size="sm">Log out</Button>}
        />

        <SettingActionRow
          label="Delete my account"
          description="Permanently delete the account and remove access from all workspaces."
          destructive
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-foreground"
              disabled
            >
              Delete Account
            </Button>
          }
        />
      </section>
    </section>
  );
}

function SettingActionRow({
  label,
  description,
  action,
  destructive = false,
  children,
}: {
  label: string;
  description?: string;
  action: React.ReactNode;
  destructive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-2">
        <div>
          <p className={`text-sm font-semibold ${destructive ? "text-red-600" : "text-foreground"}`}>
            {label}
          </p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
      <div className="flex justify-start sm:justify-end">{action}</div>
    </div>
  );
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
