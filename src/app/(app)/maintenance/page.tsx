"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Plus,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/ui/empty-state";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/ui/StatusBadge";
import { getPropertiesWithUnits } from "@/lib/properties";
import { getTenants } from "@/lib/tenants";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceRequest,
  type MaintenanceRequestInput,
} from "@/lib/maintenance";
import { semanticTone } from "@/lib/color-system";
import { cn } from "@/lib/utils";
import type {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
  Property,
  Tenant,
  Unit,
} from "@/types";

const categories: MaintenanceCategory[] = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Repairs",
  "Other",
];
const priorities: MaintenancePriority[] = ["Low", "Medium", "High", "Urgent"];
const statuses: MaintenanceStatus[] = ["Open", "In Progress", "Resolved"];

type CostDraft = {
  estimatedCost: string;
  actualCost: string;
  vendorName: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDraft(request: MaintenanceRequest): CostDraft {
  return {
    estimatedCost: String(request.estimatedCost),
    actualCost: String(request.actualCost),
    vendorName: request.vendorName ?? "",
  };
}

function priorityClass(priority: MaintenancePriority) {
  return {
    Low: semanticTone.neutral.badge,
    Medium: semanticTone.pending.badge,
    High: semanticTone.danger.badge,
    Urgent: semanticTone.danger.badge,
  }[priority];
}

export default function MaintenancePage() {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CostDraft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("Repairs");
  const [priority, setPriority] = useState<MaintenancePriority>("Medium");
  const [status, setStatus] = useState<MaintenanceStatus>("Open");
  const [reportedBy, setReportedBy] = useState<"Landlord" | "Tenant">("Landlord");
  const [reportedOn, setReportedOn] = useState(today());
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("0");
  const [actualCost, setActualCost] = useState("0");
  const [vendorName, setVendorName] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getMaintenanceRequests(),
      getPropertiesWithUnits(),
      getTenants(),
    ])
      .then(([maintenanceRecords, propertyRecords, tenantRecords]) => {
        if (!mounted) return;

        setRequests(maintenanceRecords);
        setProperties(propertyRecords.properties);
        setUnits(propertyRecords.units);
        setTenants(tenantRecords);
        setDrafts(
          maintenanceRecords.reduce<Record<string, CostDraft>>((acc, request) => {
            acc[request.id] = toDraft(request);
            return acc;
          }, {})
        );
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unable to load maintenance requests.";
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

  const filteredUnits = useMemo(() => {
    if (!propertyId) return [];

    return units.filter((unit) => unit.propertyId === propertyId);
  }, [propertyId, units]);

  const filteredTenants = useMemo(() => {
    if (!propertyId) return [];

    return tenants.filter((tenant) => {
      if (tenant.propertyId !== propertyId) return false;
      return !unitId || tenant.unitId === unitId;
    });
  }, [propertyId, unitId, tenants]);

  const open = requests.filter((request) => request.status === "Open");
  const inProgress = requests.filter((request) => request.status === "In Progress");
  const resolved = requests.filter((request) => request.status === "Resolved");
  const totalActualCost = requests.reduce(
    (sum, request) => sum + request.actualCost,
    0
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("Repairs");
    setPriority("Medium");
    setStatus("Open");
    setReportedBy("Landlord");
    setReportedOn(today());
    setPropertyId("");
    setUnitId("");
    setTenantId("");
    setEstimatedCost("0");
    setActualCost("0");
    setVendorName("");
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || !propertyId || !reportedOn) {
      toast.error("Please add a title, property, and reported date.");
      return;
    }

    const input: MaintenanceRequestInput = {
      propertyId,
      unitId: unitId || null,
      tenantId: tenantId || null,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      reportedBy,
      reportedOn,
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      vendorName: vendorName.trim() || null,
    };

    setSaving(true);

    try {
      const request = await createMaintenanceRequest(input);
      setRequests((current) => [request, ...current]);
      setDrafts((current) => ({ ...current, [request.id]: toDraft(request) }));
      resetForm();
      toast.success("Maintenance request logged.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create maintenance request.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function updateRequestStatus(
    request: MaintenanceRequest,
    nextStatus: MaintenanceStatus
  ) {
    setSavingId(request.id);

    try {
      const updated = await updateMaintenanceRequest(request.id, {
        status: nextStatus,
      });
      setRequests((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setDrafts((current) => ({ ...current, [updated.id]: toDraft(updated) }));
      toast.success(`Marked ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update status.";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function saveCosts(request: MaintenanceRequest) {
    const draft = drafts[request.id];
    if (!draft) return;

    setSavingId(request.id);

    try {
      const updated = await updateMaintenanceRequest(request.id, {
        estimatedCost: Number(draft.estimatedCost) || 0,
        actualCost: Number(draft.actualCost) || 0,
        vendorName: draft.vendorName.trim() || null,
      });
      setRequests((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setDrafts((current) => ({ ...current, [updated.id]: toDraft(updated) }));
      toast.success("Cost details updated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update costs.";
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  function focusRequestForm() {
    titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    titleInputRef.current?.focus();
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading maintenance requests...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        summary="Log property issues, assign status, and track repair costs"
        action={
          <Button type="button" onClick={focusRequestForm}>
            <Plus className="w-4 h-4 mr-2" />
            Log Request
          </Button>
        }
      />

      <div className="-mx-6 border-y border-border bg-card/35 px-6">
        <div className="grid grid-cols-2 divide-y divide-border lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="flex min-h-24 items-center gap-3 px-3 py-4 first:pl-0 lg:first:pl-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${semanticTone.pending.bg}`}>
              <AlertTriangle className={`h-5 w-5 ${semanticTone.pending.textSoft}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-xl font-bold text-foreground">{open.length}</p>
            </div>
          </div>
          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${semanticTone.scheduled.bg}`}>
              <Clock className={`h-5 w-5 ${semanticTone.scheduled.textSoft}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-xl font-bold text-foreground">
                {inProgress.length}
              </p>
            </div>
          </div>
          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${semanticTone.success.bg}`}>
              <CheckCircle2 className={`h-5 w-5 ${semanticTone.success.textSoft}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-xl font-bold text-foreground">{resolved.length}</p>
            </div>
          </div>
          <div className="flex min-h-24 items-center gap-3 px-3 py-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${semanticTone.neutral.bg}`}>
              <CircleDollarSign className={`h-5 w-5 ${semanticTone.neutral.textSoft}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Actual Costs</p>
              <p className="truncate text-xl font-bold text-foreground">
                {formatRM(totalActualCost)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Plus className="h-4 w-4" />
            Log Request
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Capture the issue, assignment, timing, and expected cost
          </p>
        </div>
        <div className="border-t border-border pt-4">
          <form onSubmit={handleCreate} className="grid gap-4 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
              <Label>Issue Title</Label>
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Leaking sink, faulty light, repainting..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as MaintenanceCategory)
                }
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as MaintenancePriority)
                }
              >
                {priorities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as MaintenanceStatus)
                }
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reported By</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={reportedBy}
                onChange={(event) =>
                  setReportedBy(event.target.value as "Landlord" | "Tenant")
                }
              >
                <option value="Landlord">Landlord</option>
                <option value="Tenant">Tenant</option>
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Property</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                value={propertyId}
                onChange={(event) => {
                  setPropertyId(event.target.value);
                  setUnitId("");
                  setTenantId("");
                }}
                required
              >
                <option value="" disabled>
                  Select property
                </option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                value={unitId}
                onChange={(event) => {
                  setUnitId(event.target.value);
                  setTenantId("");
                }}
                disabled={!propertyId}
              >
                <option value="">Property-wide</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    Unit {unit.unitNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tenant</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                disabled={!propertyId || filteredTenants.length === 0}
              >
                <option value="">No tenant</option>
                {filteredTenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reported Date</Label>
              <Input
                type="date"
                value={reportedOn}
                onChange={(event) => setReportedOn(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input
                value={vendorName}
                onChange={(event) => setVendorName(event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={estimatedCost}
                onChange={(event) => setEstimatedCost(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Actual Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={actualCost}
                onChange={(event) => setActualCost(event.target.value)}
              />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short notes for the repair work"
              />
            </div>
            <div className="flex items-end lg:col-span-1">
              <Button type="submit" className="w-full gap-2" disabled={saving}>
                <Wrench className="h-4 w-4" />
                {saving ? "Saving..." : "Log"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Maintenance Requests
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track status, vendors, estimates, and actual repair spend
          </p>
        </div>
        <div className="border-t border-border">
          {requests.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No maintenance requests yet"
              description="Start by logging the first repair, cleaning, plumbing, or electrical issue so it can be tracked to resolution."
              action={
                <Button type="button" size="sm" onClick={focusRequestForm}>
                  <Plus className="h-4 w-4" />
                  Log First Request
                </Button>
              }
            />
          ) : (
            requests.map((request) => {
              const draft = drafts[request.id] ?? toDraft(request);

              return (
                <div
                  key={request.id}
                  className="border-b border-border py-4 last:border-b-0"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">
                          {request.title}
                        </h2>
                        <StatusBadge status={request.status} />
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            priorityClass(request.priority)
                          )}
                        >
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.propertyName}
                        {request.unitNumber ? ` · Unit ${request.unitNumber}` : ""}
                        {request.tenantName ? ` · ${request.tenantName}` : ""}
                      </p>
                      {request.description && (
                        <p className="text-sm text-foreground/80">
                          {request.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{request.category}</span>
                        <span>Reported by {request.reportedBy}</span>
                        <span>{formatDate(request.reportedOn)}</span>
                        {request.resolvedOn && (
                          <span>Resolved {formatDate(request.resolvedOn)}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:w-[34rem]">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                          value={request.status}
                          disabled={savingId === request.id}
                          onChange={(event) =>
                            updateRequestStatus(
                              request,
                              event.target.value as MaintenanceStatus
                            )
                          }
                        >
                          {statuses.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Vendor</Label>
                        <Input
                          value={draft.vendorName}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                vendorName: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Estimate</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.estimatedCost}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                estimatedCost: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Actual</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.actualCost}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [request.id]: {
                                ...draft,
                                actualCost: event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between sm:col-span-2">
                        <p className="text-xs text-muted-foreground">
                          Current actual: {formatRM(request.actualCost)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === request.id}
                          onClick={() => saveCosts(request)}
                        >
                          {savingId === request.id ? "Saving..." : "Save Costs"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
