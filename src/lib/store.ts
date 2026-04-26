import { create } from "zustand";
import { persist } from "zustand/middleware";
import { properties as initialProperties, units as initialUnits, tenants as initialTenants } from "./data";
import type { Property, Unit, Tenant, OccupancyStatus } from "@/types";

interface StoreState {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];

  // Property Actions
  addProperty: (property: Property, propertyUnits: Unit[]) => void;
  updateProperty: (property: Property, propertyUnits: Unit[]) => void;
  deleteProperty: (propertyId: string) => void;

  // Tenant Actions
  addTenant: (tenant: Tenant) => void;
  updateTenant: (tenant: Tenant) => void;
  deleteTenant: (tenantId: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      properties: initialProperties,
      units: initialUnits,
      tenants: initialTenants,

      // --- Property Actions ---
      addProperty: (property, propertyUnits) =>
        set((state) => ({
          properties: [...state.properties, property],
          units: [...state.units, ...propertyUnits],
        })),

      updateProperty: (property, propertyUnits) =>
        set((state) => {
          // Remove old units for this property and replace with new ones
          const otherUnits = state.units.filter((u) => u.propertyId !== property.id);
          return {
            properties: state.properties.map((p) => (p.id === property.id ? property : p)),
            units: [...otherUnits, ...propertyUnits],
          };
        }),

      deleteProperty: (propertyId) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== propertyId),
          units: state.units.filter((u) => u.propertyId !== propertyId),
        })),

      // --- Tenant Actions ---
      addTenant: (tenant) =>
        set((state) => ({
          tenants: [...state.tenants, tenant],
          units: state.units.map((u) => {
            if (u.id === tenant.unitId) {
              return { ...u, status: "Occupied", tenantName: tenant.name };
            }
            return u;
          }),
        })),

      updateTenant: (tenant) =>
        set((state) => {
          const oldTenant = state.tenants.find((t) => t.id === tenant.id);
          if (!oldTenant) return state;

          let newUnits = [...state.units];

          // If unit changed, free the old unit and occupy the new unit
          if (oldTenant.unitId !== tenant.unitId) {
            newUnits = newUnits.map((u) => {
              if (u.id === oldTenant.unitId) {
                return { ...u, status: "Vacant", tenantName: null };
              }
              if (u.id === tenant.unitId) {
                return { ...u, status: "Occupied", tenantName: tenant.name };
              }
              return u;
            });
          } else {
            // Just update tenant name on the same unit
            newUnits = newUnits.map((u) => {
              if (u.id === tenant.unitId) {
                return { ...u, tenantName: tenant.name };
              }
              return u;
            });
          }

          return {
            tenants: state.tenants.map((t) => (t.id === tenant.id ? tenant : t)),
            units: newUnits,
          };
        }),

      deleteTenant: (tenantId) =>
        set((state) => {
          const tenant = state.tenants.find((t) => t.id === tenantId);
          if (!tenant) return state;

          return {
            tenants: state.tenants.filter((t) => t.id !== tenantId),
            units: state.units.map((u) => {
              if (u.id === tenant.unitId) {
                return { ...u, status: "Vacant", tenantName: null };
              }
              return u;
            }),
          };
        }),
    }),
    {
      name: "rentflow-storage", // localStorage key
    }
  )
);
