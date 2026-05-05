"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { semanticTone } from "@/lib/color-system";

type DashboardHeaderProps = {
  userName: string;
  monthLabel: string;
  overdueRent: number;
};

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

export default function DashboardHeader({
  userName,
  monthLabel,
  overdueRent,
}: DashboardHeaderProps) {
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowGreeting(false);
    }, 5 * 60 * 1000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <PageHeader
      title={showGreeting ? `Hi, ${userName}` : "Dashboard"}
      summary={
        showGreeting
          ? "What are you working on?"
          : `Portfolio operations overview · ${monthLabel}`
      }
      action={
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Collection focus</span>
          <span
            className={`font-semibold ${overdueRent > 0 ? semanticTone.danger.textSoft : semanticTone.success.textSoft
              }`}
          >
            {overdueRent > 0 ? formatRM(overdueRent) : "Clear"}
          </span>
        </div>
      }
    />
  );
}
