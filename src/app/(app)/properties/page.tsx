"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, DoorOpen, TrendingUp, ArrowRight, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Property } from "@/types";

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

function OccupancyBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-amber-400" : "bg-red-500";
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
  const { properties, units, deleteProperty } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <div className="p-8 text-center text-muted-foreground">Loading properties...</div>;
  }

  // Attach live unit counts from the units array (keeps it in sync)
  const enriched = properties.map((p) => {
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

  const handleDelete = (p: typeof enriched[0]) => {
    if (p.occupied > 0) {
      toast.error("This property has active tenants. Please remove or reassign tenants before deleting this property.");
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${p.name}?`)) {
      deleteProperty(p.id);
      toast.success("Property deleted successfully.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {properties.length} properties · {totalUnits} units · {formatRM(totalRevenue)} / mo
          </p>
        </div>
        <Button onClick={() => router.push("/properties/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

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
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p)}>
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
                  <div className="rounded-lg bg-green-50 p-2">
                    <p className="text-xs text-green-600">Occupied</p>
                    <p className="text-lg font-bold text-green-700">{p.occupied}</p>
                    <p className="text-xs text-green-600">units</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-500">Vacant</p>
                    <p className="text-lg font-bold text-slate-600">{p.vacant}</p>
                    <p className="text-xs text-slate-500">units</p>
                  </div>
                </div>

                {/* Monthly income */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Expected Income
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatRM(p.monthlyIncome)}
                  </span>
                </div>

                {/* Maintenance note */}
                {p.maintenance > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-md px-3 py-2">
                    {p.maintenance} unit{p.maintenance > 1 ? "s" : ""} under maintenance
                  </p>
                )}

                {/* View units link */}
                <div className="mt-auto pt-1 flex items-center justify-between">
                   <span
                    className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                      p.rate >= 80
                        ? "bg-green-100 text-green-700"
                        : p.rate >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
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
    </div>
  );
}
