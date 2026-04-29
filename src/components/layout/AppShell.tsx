"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="flex h-full bg-background">
      {sidebarVisible && (
        <Sidebar onHide={() => setSidebarVisible(false)} />
      )}
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
