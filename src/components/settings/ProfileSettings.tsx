"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const DEFAULT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  role: "Owner",
  avatarUrl: "",
};

type ProfileForm = typeof DEFAULT;

type SessionRow = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

type TotpFactor = {
  id: string;
  friendly_name?: string;
  factor_type: "totp";
  status: "verified" | "unverified";
  created_at?: string;
};

export default function ProfileSettings({ showHeading = true }: { showHeading?: boolean }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>(DEFAULT);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "verify">("phone");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [twoStepOpen, setTwoStepOpen] = useState(false);
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [twoStepSaving, setTwoStepSaving] = useState(false);
  const [totpFactor, setTotpFactor] = useState<TotpFactor | null>(null);
  const [enrollmentFactorId, setEnrollmentFactorId] = useState("");
  const [enrollmentQr, setEnrollmentQr] = useState("");
  const [enrollmentSecret, setEnrollmentSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [supportAccess, setSupportAccess] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);

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
          phone: currentUser?.phone || (typeof metadata.phone === "string" ? metadata.phone : ""),
          company: typeof metadata.company === "string" ? metadata.company : "",
          role: typeof metadata.role === "string" ? metadata.role : "Owner",
          avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : "",
        });
        setNewEmail(currentUser?.email ?? "");
        setNewPhone(currentUser?.phone || (typeof metadata.phone === "string" ? metadata.phone : ""));
      });

      void refreshMfaFactors();

      supabase.auth.getSession().then(({ data }) => {
        const lastActive = data.session?.user.last_sign_in_at
          ? new Date(data.session.user.last_sign_in_at).toLocaleString()
          : "Now";

        setSessions([
          {
            id: "current",
            device: getDeviceName(),
            location: "Current device",
            lastActive,
            current: true,
          },
        ]);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load profile.";
      toast.error(message);
    }
  }, []);

  function handleChange(key: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSaved(false);
    };
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      toast.error("Please upload a PNG, JPEG, or GIF.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Profile images must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setAvatarPreview(dataUrl);
      setForm((f) => ({ ...f, avatarUrl: dataUrl }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    setAvatarPreview("");
    setForm((f) => ({ ...f, avatarUrl: "" }));
    setSaved(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          company: form.company,
          role: form.role,
          avatar_url: form.avatarUrl,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setAvatarPreview("");
      setSaved(true);
      toast.success("Profile updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save profile.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newEmail || newEmail === form.email) {
      setEmailOpen(false);
      return;
    }

    setEmailSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Verification email sent. Confirm the new address to finish changing email.");
      setEmailOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to change email.";
      toast.error(message);
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePhoneOtpRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedPhone = normalizePhone(newPhone);

    if (!isValidPhone(normalizedPhone)) {
      toast.error("Use an international phone number, for example +60123456789.");
      return;
    }

    if (normalizedPhone === form.phone) {
      setPhoneOpen(false);
      return;
    }

    setPhoneSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ phone: normalizedPhone });

      if (error) {
        toast.error(error.message);
        return;
      }

      setPendingPhone(normalizedPhone);
      setPhoneOtp("");
      setPhoneStep("verify");
      toast.success("OTP sent to your new phone number.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send phone OTP.";
      toast.error(message);
    } finally {
      setPhoneSaving(false);
    }
  }

  async function handlePhoneOtpVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!pendingPhone || phoneOtp.trim().length < 4) {
      toast.error("Enter the OTP sent to your phone.");
      return;
    }

    setPhoneSaving(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: pendingPhone,
        token: phoneOtp.trim(),
        type: "phone_change",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const verifiedPhone = data.user?.phone ?? pendingPhone;
      setUser(data.user);
      setForm((current) => ({ ...current, phone: verifiedPhone }));
      setNewPhone(verifiedPhone);
      setPhoneOpen(false);
      setPhoneStep("phone");
      setPendingPhone("");
      setPhoneOtp("");
      toast.success("Phone number verified successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to verify phone OTP.";
      toast.error(message);
    } finally {
      setPhoneSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully.");
      setPasswordOpen(false);
      e.currentTarget.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update password.";
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  }

  async function refreshMfaFactors() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        toast.error(error.message);
        return;
      }

      const verifiedTotp = data.totp.find((factor) => factor.status === "verified") as TotpFactor | undefined;
      setTotpFactor(verifiedTotp ?? null);
      setTwoStepEnabled(Boolean(verifiedTotp));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load MFA factors.";
      toast.error(message);
    }
  }

  async function handleTwoStepOpen() {
    setTwoStepOpen(true);
    setTotpCode("");

    if (twoStepEnabled || enrollmentFactorId) {
      return;
    }

    setTwoStepSaving(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "RentFlow Authenticator",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setEnrollmentFactorId(data.id);
      setEnrollmentQr(data.totp.qr_code);
      setEnrollmentSecret(data.totp.secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start 2-step verification setup.";
      toast.error(message);
    } finally {
      setTwoStepSaving(false);
    }
  }

  async function handleTwoStepVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!enrollmentFactorId || totpCode.trim().length < 6) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setTwoStepSaving(true);

    try {
      const supabase = createClient();
      const challenge = await supabase.auth.mfa.challenge({ factorId: enrollmentFactorId });

      if (challenge.error) {
        toast.error(challenge.error.message);
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId: enrollmentFactorId,
        challengeId: challenge.data.id,
        code: totpCode.trim(),
      });

      if (verify.error) {
        toast.error(verify.error.message);
        return;
      }

      toast.success("2-step verification is now enabled.");
      await refreshMfaFactors();
      setEnrollmentFactorId("");
      setEnrollmentQr("");
      setEnrollmentSecret("");
      setTotpCode("");
      setTwoStepOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to verify authenticator code.";
      toast.error(message);
    } finally {
      setTwoStepSaving(false);
    }
  }

  async function handleTwoStepDisable() {
    if (!totpFactor) {
      return;
    }

    setTwoStepSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("2-step verification has been disabled.");
      setTwoStepEnabled(false);
      setTotpFactor(null);
      setTwoStepOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to disable 2-step verification.";
      toast.error(message);
    } finally {
      setTwoStepSaving(false);
    }
  }

  async function handleSignOutOthers() {
    setSessionSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Other active sessions have been signed out.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign out other devices.";
      toast.error(message);
    } finally {
      setSessionSaving(false);
    }
  }

  async function handleRevokeCurrentSession() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("This session has been revoked.");
      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to revoke session.";
      toast.error(message);
    }
  }

  async function handleDeleteRequest() {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm.");
      return;
    }

    setDeleteSaving(true);

    try {
      const supabase = createClient();
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirm: deleteConfirm }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        toast.error(payload?.message ?? "Unable to delete account.");
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      toast.success("Account deleted.");
      setDeleteOpen(false);
      setDeleteConfirm("");
      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete account.";
      toast.error(message);
    } finally {
      setDeleteSaving(false);
    }
  }

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email || "Account";
  const initials = useMemo(() => {
    if (form.firstName || form.lastName) {
      return `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();
    }

    return displayName.slice(0, 2).toUpperCase();
  }, [displayName, form.firstName, form.lastName]);
  const avatarSource = avatarPreview || form.avatarUrl;

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
              {avatarSource && <AvatarImage src={avatarSource} alt={displayName} />}
              <AvatarFallback className="bg-slate-200 text-lg font-semibold text-slate-700 dark:bg-muted dark:text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-4 w-4" />
                  Change Image
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9"
                  onClick={handleRemoveAvatar}
                  disabled={!avatarSource}
                >
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
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  readOnly
                  disabled
                  placeholder="Not verified"
                  className="h-10 disabled:opacity-70"
                />
                <Button type="button" variant="secondary" className="h-10 shrink-0" onClick={() => {
                  setNewPhone(form.phone);
                  setPhoneStep("phone");
                  setPendingPhone("");
                  setPhoneOtp("");
                  setPhoneOpen(true);
                }}>
                  Change
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company / Business Name</Label>
              <Input
                id="company"
                value={form.company}
                onChange={handleChange("company")}
                placeholder="My Property Sdn. Bhd."
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={form.role}
                readOnly
                disabled
                className="h-10 disabled:opacity-70"
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
          action={<Button type="button" variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>Change email</Button>}
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
          action={<Button type="button" variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>Change password</Button>}
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
          description={`Add an additional layer of security to your account during login. ${twoStepEnabled ? "Authenticator app enabled." : ""}`}
          action={<Button type="button" variant="secondary" size="sm" onClick={handleTwoStepOpen}>{twoStepEnabled ? "Manage" : "Set up"}</Button>}
        />
      </section>

      <section className="space-y-5" aria-labelledby="active-sessions">
        <div className="space-y-3">
          <h2 id="active-sessions" className="text-xl font-semibold text-foreground">
            Active Sessions
          </h2>
          <Separator />
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="grid grid-cols-1 gap-3 rounded-md border border-border p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {session.device} {session.current && <span className="text-muted-foreground">(current)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                  <p className="text-xs text-muted-foreground">Last active: {session.lastActive}</p>
                </div>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleRevokeCurrentSession}>
                Revoke
              </Button>
            </div>
          ))}
        </div>
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
          action={
            <Button type="button" variant="secondary" size="sm" disabled={sessionSaving} onClick={handleSignOutOthers}>
              {sessionSaving ? "Logging out..." : "Log out"}
            </Button>
          }
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
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          }
        />
      </section>

      <ChangeEmailDialog
        open={emailOpen}
        email={newEmail}
        loading={emailSaving}
        onEmailChange={setNewEmail}
        onOpenChange={setEmailOpen}
        onSubmit={handleEmailSave}
      />
      <ChangePhoneDialog
        open={phoneOpen}
        step={phoneStep}
        phone={newPhone}
        pendingPhone={pendingPhone}
        otp={phoneOtp}
        loading={phoneSaving}
        onPhoneChange={setNewPhone}
        onOtpChange={setPhoneOtp}
        onOpenChange={setPhoneOpen}
        onRequestOtp={handlePhoneOtpRequest}
        onVerifyOtp={handlePhoneOtpVerify}
      />
      <ChangePasswordDialog
        open={passwordOpen}
        loading={passwordSaving}
        onOpenChange={setPasswordOpen}
        onSubmit={handlePasswordSave}
      />
      <TwoStepDialog
        open={twoStepOpen}
        enabled={twoStepEnabled}
        factor={totpFactor}
        qr={enrollmentQr}
        secret={enrollmentSecret}
        code={totpCode}
        loading={twoStepSaving}
        onCodeChange={setTotpCode}
        onOpenChange={setTwoStepOpen}
        onVerify={handleTwoStepVerify}
        onDisable={handleTwoStepDisable}
      />
      <DeleteAccountDialog
        open={deleteOpen}
        confirmValue={deleteConfirm}
        loading={deleteSaving}
        onConfirmValueChange={setDeleteConfirm}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteRequest}
      />
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

function ChangeEmailDialog({
  open,
  email,
  loading,
  onEmailChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  email: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              We will send a verification message to the new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">New email</Label>
            <Input
              id="new-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send verification"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePhoneDialog({
  open,
  step,
  phone,
  pendingPhone,
  otp,
  loading,
  onPhoneChange,
  onOtpChange,
  onOpenChange,
  onRequestOtp,
  onVerifyOtp,
}: {
  open: boolean;
  step: "phone" | "verify";
  phone: string;
  pendingPhone: string;
  otp: string;
  loading: boolean;
  onPhoneChange: (phone: string) => void;
  onOtpChange: (otp: string) => void;
  onOpenChange: (open: boolean) => void;
  onRequestOtp: (e: React.FormEvent<HTMLFormElement>) => void;
  onVerifyOtp: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        {step === "phone" ? (
          <form onSubmit={onRequestOtp} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Change phone number</DialogTitle>
              <DialogDescription>
                Enter an international phone number. Supabase will send an SMS OTP to verify it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="new-phone">New phone number</Label>
              <Input
                id="new-phone"
                type="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="+60123456789"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use E.164 format, including the country code.
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Verify phone number</DialogTitle>
              <DialogDescription>
                Enter the OTP sent to {pendingPhone}. Once verified, this becomes your account phone number.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="phone-otp">OTP code</Label>
              <Input
                id="phone-otp"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify phone"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  open,
  loading,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Use at least 8 characters for your new password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" name="password" type="password" minLength={8} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" name="confirmPassword" type="password" minLength={8} required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TwoStepDialog({
  open,
  enabled,
  factor,
  qr,
  secret,
  code,
  loading,
  onCodeChange,
  onOpenChange,
  onVerify,
  onDisable,
}: {
  open: boolean;
  enabled: boolean;
  factor: TotpFactor | null;
  qr: string;
  secret: string;
  code: string;
  loading: boolean;
  onCodeChange: (code: string) => void;
  onOpenChange: (open: boolean) => void;
  onVerify: (e: React.FormEvent<HTMLFormElement>) => void;
  onDisable: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        {enabled ? (
          <div className="space-y-4">
            <DialogHeader>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <DialogTitle>2-step verification is enabled</DialogTitle>
              <DialogDescription>
                Your account requires an authenticator code after password login.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-semibold text-foreground">
                {factor?.friendly_name || "Authenticator app"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Verified TOTP factor
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="destructive" disabled={loading} onClick={onDisable}>
                {loading ? "Disabling..." : "Disable 2-step"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <DialogHeader>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <DialogTitle>Set up authenticator app</DialogTitle>
              <DialogDescription>
                Scan the QR code with an authenticator app, then enter the 6-digit code.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr]">
              <div className="flex h-48 items-center justify-center rounded-md border border-border bg-white p-3">
                {qr ? (
                  // Supabase returns a QR code as an SVG data URL.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="Authenticator QR code" className="h-full w-full object-contain" />
                ) : (
                  <p className="text-sm text-muted-foreground">Preparing QR...</p>
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="totp-secret">Manual setup key</Label>
                  <Input id="totp-secret" value={secret} readOnly className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totp-code">Authenticator code</Label>
                  <Input
                    id="totp-code"
                    value={code}
                    onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading || !qr}>
                {loading ? "Verifying..." : "Enable 2-step"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({
  open,
  confirmValue,
  loading,
  onConfirmValueChange,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  confirmValue: string;
  loading: boolean;
  onConfirmValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently deletes your account and removes your RentFlow data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
          <Input
            id="delete-confirm"
            value={confirmValue}
            onChange={(e) => onConfirmValueChange(e.target.value)}
            placeholder="DELETE"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" disabled={loading || confirmValue !== "DELETE"} onClick={onConfirm}>
            {loading ? "Deleting..." : "Delete Account"}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getDeviceName() {
  if (typeof navigator === "undefined") {
    return "Current browser";
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Firefox")) {
    return "Firefox on this device";
  }

  if (userAgent.includes("Edg")) {
    return "Edge on this device";
  }

  if (userAgent.includes("Chrome")) {
    return "Chrome on this device";
  }

  if (userAgent.includes("Safari")) {
    return "Safari on this device";
  }

  return "Current browser";
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

function isValidPhone(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
