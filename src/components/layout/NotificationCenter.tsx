"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Loader2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  type AppNotification,
  type NotificationType,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const readStorageKey = "rentflow-read-notifications";

const notificationMeta: Record<
  NotificationType,
  { label: string; icon: typeof Bell; className: string }
> = {
  payment_pending: {
    label: "Payment",
    icon: CircleDollarSign,
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  lease_ending: {
    label: "Lease",
    icon: CalendarClock,
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  rent_overdue: {
    label: "Rent",
    icon: AlertCircle,
    className: "bg-red-50 text-red-700 border-red-100",
  },
  maintenance_update: {
    label: "Maintenance",
    icon: Wrench,
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
};

function loadReadIds() {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const value = window.localStorage.getItem(readStorageKey);
    const ids = value ? (JSON.parse(value) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}

function saveReadIds(ids: Set<string>) {
  window.localStorage.setItem(readStorageKey, JSON.stringify([...ids]));
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
  });
}

export default function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    setLoading(true);

    try {
      const records = await getNotifications();
      setNotifications(records);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load notifications.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    getNotifications()
      .then((records) => {
        if (mounted) {
          setNotifications(records);
        }
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unable to load notifications.";
        toast.error(message);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)).length,
    [notifications, readIds]
  );

  function markRead(id: string) {
    setReadIds((current) => {
      const next = new Set(current);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }

  function markAllRead() {
    const next = new Set(notifications.map((item) => item.id));
    setReadIds(next);
    saveReadIds(next);
  }

  function openNotification(notification: AppNotification) {
    markRead(notification.id);
    router.push(notification.href);
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && void loadNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[23rem] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={notifications.length === 0}
              onClick={markAllRead}
            >
              <Check className="h-3.5 w-3.5" />
              Mark read
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[28rem] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">All caught up</p>
              <p className="text-xs text-muted-foreground">
                No payments, leases, rent, or maintenance items need attention.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const meta = notificationMeta[notification.type];
                const Icon = meta.icon;
                const unread = !readIds.has(notification.id);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      unread && "bg-muted/50"
                    )}
                    onClick={() => openNotification(notification)}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        meta.className
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                        {meta.label}
                      </p>
                    </div>
                    {unread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
