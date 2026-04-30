"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mfaReady, setMfaReady] = useState(false);

  useEffect(() => {
    async function checkMfa() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (!error && data.nextLevel === "aal2" && data.currentLevel !== data.nextLevel) {
          router.replace(`/verify-mfa?next=${encodeURIComponent(pathname)}`);
          return;
        }
      } finally {
        setMfaReady(true);
      }
    }

    void checkMfa();
  }, [pathname, router]);

  if (!mfaReady) {
    return null;
  }

  return (
    <div className="flex h-full bg-background">
      <Suspense fallback={null}>
        <Sidebar
          visible={sidebarVisible}
          onHide={() => setSidebarVisible(false)}
        />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          sidebarVisible={sidebarVisible}
          onShowSidebar={() => setSidebarVisible(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
