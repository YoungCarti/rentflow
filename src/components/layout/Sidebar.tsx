"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Bell,
  Globe2,
  ClipboardList,
  CalendarDays,
  CreditCard,
  BarChart3,
  Wrench,
  PanelLeftClose,
  UserCircle,
  Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RentFlowLogo from "@/components/brand/RentFlowLogo";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard },
  { label: "Properties",     href: "/properties",   icon: Building2 },
  { label: "Units",          href: "/units",        icon: DoorOpen },
  { label: "Tenants",        href: "/tenants",      icon: Users },
  { label: "Rent Tracking",  href: "/rent",         icon: ClipboardList },
  { label: "Calendar",       href: "/calendar",     icon: CalendarDays },
  { label: "Payments",       href: "/payments",     icon: CreditCard },
  { label: "Maintenance",    href: "/maintenance",  icon: Wrench },
  { label: "Reports",        href: "/reports",      icon: BarChart3 },
];

const settingsGroups = [
  {
    label: "General Settings",
    items: [
      { label: "Account", href: "/settings?section=account", icon: UserCircle, section: "account" },
      { label: "Notification", href: "/settings?section=notifications", icon: Bell, section: "notifications" },
      { label: "Language & Region", href: "/settings?section=language-region", icon: Globe2, section: "language-region" },
      { label: "Accessibility", href: "/settings?section=accessibility", icon: Accessibility, section: "accessibility" },
    ],
  },
];

export default function Sidebar({
  visible,
  onHide,
}: {
  visible: boolean;
  onHide: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSettings = pathname === "/settings";
  const activeSettingsSection = searchParams.get("section") ?? "account";

  // Hover peek state (only relevant when sidebar is hidden)
  const [peeking, setPeeking] = useState(false);

  const isOpen = visible || peeking;

  // When sidebar is visible → normal sticky layout element
  // When sidebar is hidden → fixed floating overlay triggered by hover strip
  if (visible) {
    return (
      <aside
        className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-border bg-card md:flex flex-col"
      >
        <SidebarContent
          isSettings={isSettings}
          activeSettingsSection={activeSettingsSection}
          pathname={pathname}
          onHide={onHide}
        />
      </aside>
    );
  }

  // Hidden mode: invisible hover-trigger strip + floating overlay
  return (
    <>
      {/* Hover trigger strip — always present on left edge when sidebar is hidden */}
      <div
        className="fixed top-0 left-0 z-40 hidden h-full w-3 md:block"
        onMouseEnter={() => setPeeking(true)}
      />

      {/* Floating sidebar overlay */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 hidden h-full w-64 flex-col overflow-hidden border-r border-border bg-card shadow-2xl md:flex",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onMouseLeave={() => setPeeking(false)}
      >
        <SidebarContent
          isSettings={isSettings}
          activeSettingsSection={activeSettingsSection}
          pathname={pathname}
          onHide={onHide}
          onPeekClose={() => setPeeking(false)}
        />
      </aside>

      {/* Subtle backdrop when peeking */}
      <div
        className={cn(
          "fixed inset-0 z-40 hidden bg-black/10 backdrop-blur-[1px] md:block",
          "transition-opacity duration-300 ease-in-out pointer-events-none",
          peeking ? "opacity-100" : "opacity-0"
        )}
      />
    </>
  );
}

// ─── Extracted inner content ────────────────────────────────────────────────

function SidebarContent({
  isSettings,
  activeSettingsSection,
  pathname,
  onHide,
  onPeekClose,
}: {
  isSettings: boolean;
  activeSettingsSection: string;
  pathname: string;
  onHide: () => void;
  onPeekClose?: () => void;
}) {
  return isSettings ? (
    <>
      <div className="flex justify-end px-3 pt-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Hide sidebar"
          title="Hide sidebar"
          onClick={() => { onHide(); onPeekClose?.(); }}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto pb-5 pt-1">
        {settingsGroups.map((group, index) => (
          <div
            key={group.label}
            className={cn(
              "px-3",
              index > 0 && "mt-6 border-t border-border pt-5"
            )}
          >
            <p className="px-1 pb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {settingsGroups[0].items.map(({ label, href, icon: Icon, section }) => {
                const active = activeSettingsSection === section;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  ) : (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-4 h-16 border-b border-border">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8">
            <RentFlowLogo className="h-8 w-8" />
          </div>
          <span className="truncate text-lg font-bold tracking-tight text-foreground">
            RentFlow
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Hide sidebar"
          title="Hide sidebar"
          onClick={() => { onHide(); onPeekClose?.(); }}
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white dark:bg-[#262626] dark:text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          RentFlow v1.0 · MVP
        </p>
      </div>
    </>
  );
}
