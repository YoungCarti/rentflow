"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutDashboard, Menu, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar({
  sidebarVisible,
  onShowSidebar,
}: {
  sidebarVisible: boolean;
  onShowSidebar: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isSettings = pathname === "/settings";
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data }) => {
        if (mounted) {
          setUser(data.user);
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, []);

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata;
    const firstName = typeof metadata?.first_name === "string" ? metadata.first_name : "";
    const lastName = typeof metadata?.last_name === "string" ? metadata.last_name : "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || user?.email?.split("@")[0] || "Account";
  }, [user]);

  const initials = useMemo(() => {
    const words = displayName.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return displayName.slice(0, 2).toUpperCase();
  }, [displayName]);

  async function handleSignOut() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Successfully logged out!");
      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign out.";
      toast.error(message);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Search */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`hidden overflow-hidden transition-[width,opacity,transform] duration-300 ease-in-out md:block ${
            sidebarVisible
              ? "w-0 -translate-x-2 opacity-0"
              : "w-9 translate-x-0 opacity-100"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Show sidebar"
            title="Show sidebar"
            onClick={onShowSidebar}
            tabIndex={sidebarVisible ? -1 : 0}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        {isSettings ? (
          <Button
            type="button"
            variant="secondary"
            className="h-9 gap-2 px-3"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
        ) : (
          <div className="relative w-72 max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search properties, tenants…"
              className="pl-9 h-9 bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <NotificationCenter />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/subscription")}>
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
