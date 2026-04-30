"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, User } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
    <section id="account" className="scroll-mt-24 space-y-5" aria-labelledby="account-settings">
      {showHeading && (
        <div>
          <h2 id="account-settings" className="text-lg font-semibold text-foreground">
            Account
          </h2>
          <p className="text-sm text-muted-foreground">Manage your personal information</p>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-5 flex items-center gap-5">
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </div>
            <button
              className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border shadow-sm hover:bg-muted transition-colors"
              title="Change Avatar"
              type="button"
            >
              <Camera className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
              <Badge className="bg-primary/10 text-primary border-0 text-xs hover:bg-primary/10">
                {form.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{form.email || "No email loaded"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <p className="font-semibold text-base text-foreground">Personal Information</p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="+60 12-345 6789"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company">Company / Business name</Label>
              <Input
                id="company"
                value={form.company}
                onChange={handleChange("company")}
                placeholder="My Property Sdn. Bhd."
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              {saved && (
                <p className="text-sm text-green-600 font-medium">
                  Changes saved successfully.
                </p>
              )}
              <Button type="submit" className="ml-auto" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100">
        <CardHeader className="pb-2">
          <p className="font-semibold text-base text-red-600">Danger Zone</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently remove your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 shrink-0"
              disabled
            >
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
