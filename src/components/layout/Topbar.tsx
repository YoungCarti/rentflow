"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
  const router = useRouter();
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
      <div className="relative w-72 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search properties, tenants…"
          className="pl-9 h-9 bg-muted/40 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4 h-4" />
          {/* red dot badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </Button>

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
            <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
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
