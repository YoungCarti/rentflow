"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  Wrench,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",    icon: LayoutDashboard },
  { label: "Properties",     href: "/properties",   icon: Building2 },
  { label: "Units",          href: "/units",        icon: DoorOpen },
  { label: "Tenants",        href: "/tenants",      icon: Users },
  { label: "Rent Tracking",  href: "/rent",         icon: ClipboardList },
  { label: "Payments",       href: "/payments",     icon: CreditCard },
  { label: "Maintenance",    href: "/maintenance",  icon: Wrench },
  { label: "Reports",        href: "/reports",      icon: BarChart3 },
  { label: "Subscription",   href: "/subscription", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Building2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          RentFlow
        </span>
      </div>

      {/* Nav links */}
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
    </aside>
  );
}
