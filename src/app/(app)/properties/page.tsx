"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, DoorOpen, TrendingUp, ArrowRight, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deletePropertyRecord, getPropertiesWithUnits } from "@/lib/properties";
import { semanticTone } from "@/lib/color-system";
import type { Property, Unit } from "@/types";

type EnrichedProperty = Property & {
  propUnits: Unit[];
  occupied: number;
  vacant: number;
  maintenance: number;
  rate: number;
};

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function OccupancyBar({ rate }: { rate: number }) {
  const color =
    rate >= 80
      ? semanticTone.success.bgStrong
      : rate >= 50
        ? semanticTone.pending.bgStrong
        : semanticTone.danger.bgStrong;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Occupancy</span>
        <span className="font-medium text-foreground">{rate}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyToDelete, setPropertyToDelete] = useState<EnrichedProperty | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getPropertiesWithUnits()
      .then((result) => {
        if (!mounted) return;
        setProperties(result.properties);
        setUnits(result.units);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unable to load properties.";
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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading properties...</div>;
  }

  // Attach live unit counts from the units array (keeps it in sync)
  const enriched: EnrichedProperty[] = properties.map((p) => {
    const propUnits = units.filter((u) => u.propertyId === p.id);
    const occupied = propUnits.filter((u) => u.status === "Occupied").length;
    const vacant = propUnits.filter((u) => u.status === "Vacant").length;
    const maintenance = propUnits.filter((u) => u.status === "Maintenance").length;
    const rate = propUnits.length === 0 ? 0 : Math.round((occupied / propUnits.length) * 100);
    // dynamic monthly income based on actual units
    const monthlyIncome = propUnits.reduce((sum, u) => sum + u.rent, 0);
    
    return { ...p, propUnits, occupied, vacant, maintenance, rate, unitCount: propUnits.length, monthlyIncome };
  });

  const totalRevenue = enriched.reduce((s, p) => s + p.monthlyIncome, 0);
  const totalUnits = enriched.reduce((s, p) => s + p.unitCount, 0);

  const requestDelete = (p: EnrichedProperty) => {
    if (p.occupied > 0) {
      toast.error("This property has active tenants. Please remove or reassign tenants before deleting this property.");
      return;
    }

    setPropertyToDelete(p);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) {
      return;
    }

    try {
      setDeletingId(propertyToDelete.id);
      await deletePropertyRecord(propertyToDelete.id);
      setProperties((current) => current.filter((property) => property.id !== propertyToDelete.id));
      setUnits((current) => current.filter((unit) => unit.propertyId !== propertyToDelete.id));
      setPropertyToDelete(null);
      toast.success("Property deleted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete property.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        summary={`${properties.length} properties · ${totalUnits} units · ${formatRM(totalRevenue)} / mo`}
        action={
          <Button onClick={() => router.push("/properties/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        }
      />

      {/* Property cards */}
      {enriched.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
          <h3 className="text-lg font-medium text-foreground">No properties found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Get started by creating your first property.</p>
          <Button onClick={() => router.push("/properties/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {enriched.map((p) => (
            <Card key={p.id} className="shadow-sm flex flex-col relative group">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/80 hover:bg-card shadow-sm backdrop-blur-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/properties/${p.id}`)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => requestDelete(p)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card header */}
              <CardHeader className="pb-3 pr-12">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-base text-foreground leading-tight">
                      {p.name}
                    </h2>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {p.location}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4 flex-1">
                {/* Occupancy progress bar */}
                <OccupancyBar rate={p.rate} />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/60 p-2">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">{p.unitCount}</p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>
                  <div className={`rounded-lg p-2 ${semanticTone.success.bg}`}>
                    <p className={`text-xs ${semanticTone.success.textSoft}`}>Occupied</p>
                    <p className={`text-lg font-bold ${semanticTone.success.text}`}>{p.occupied}</p>
                    <p className={`text-xs ${semanticTone.success.textSoft}`}>units</p>
                  </div>
                  <div className={`rounded-lg p-2 ${semanticTone.neutral.bg}`}>
                    <p className={`text-xs ${semanticTone.neutral.textSoft}`}>Vacant</p>
                    <p className={`text-lg font-bold ${semanticTone.neutral.text}`}>{p.vacant}</p>
                    <p className={`text-xs ${semanticTone.neutral.textSoft}`}>units</p>
                  </div>
                </div>

                {/* Monthly income */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Expected Income
                  </div>
                  <span className={`text-sm font-bold ${semanticTone.success.textSoft}`}>
                    {formatRM(p.monthlyIncome)}
                  </span>
                </div>

                {/* Maintenance note */}
                {p.maintenance > 0 && (
                  <p className={`rounded-md border px-3 py-2 text-xs ${semanticTone.maintenance.soft}`}>
                    {p.maintenance} unit{p.maintenance > 1 ? "s" : ""} under maintenance
                  </p>
                )}

                {/* View units link */}
                <div className="mt-auto pt-1 flex items-center justify-between">
                   <span
                    className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                      p.rate >= 80
                        ? semanticTone.success.badge
                        : p.rate >= 50
                        ? semanticTone.pending.badge
                        : semanticTone.danger.badge
                    }`}
                  >
                    {p.rate}% Occupied
                  </span>
                  <Button asChild variant="ghost" className="gap-2 text-primary hover:text-primary hover:bg-primary/5" size="sm">
                    <Link href={`/units?property=${p.id}`}>
                      <DoorOpen className="w-4 h-4" />
                      View Units
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary table */}
      {enriched.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Property</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">Units</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">Occupancy</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-right">Expected Income</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`${i < enriched.length - 1 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors`}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.location}</td>
                    <td className="px-5 py-3 text-center">{p.unitCount}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          p.rate >= 80 ? "text-green-600" : p.rate >= 50 ? "text-amber-600" : "text-red-600"
                        }`}
                      >
                        {p.rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600">
                      {formatRM(p.monthlyIncome)}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-muted/40 border-t border-border font-semibold">
                  <td className="px-5 py-3 text-foreground">Total</td>
                  <td className="px-5 py-3" />
                  <td className="px-5 py-3 text-center">{totalUnits}</td>
                  <td className="px-5 py-3" />
                  <td className="px-5 py-3 text-right text-emerald-600">
                    {formatRM(totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmationDialog
        open={Boolean(propertyToDelete)}
        title="Delete property?"
        description={
          propertyToDelete
            ? `This will permanently delete ${propertyToDelete.name} and its vacant units. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete property"
        loading={deletingId === propertyToDelete?.id}
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
