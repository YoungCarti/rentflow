// ─── Core domain types for RentFlow ──────────────────────────────────────────

export type OccupancyStatus = "Occupied" | "Vacant" | "Maintenance";
export type RentStatus = "Paid" | "Pending" | "Overdue";
export type PaymentMethod = "Bank Transfer" | "Cash" | "Online";
export type PaymentApprovalStatus = "Approved" | "Pending" | "Rejected";
export type SubscriptionPlan = "Basic" | "Pro";

export interface Property {
  id: string;
  name: string;
  location: string;
  unitCount: number;
  occupiedCount: number;
  monthlyIncome: number;
  imageUrl?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  rent: number;
  tenantName: string | null;
  status: OccupancyStatus;
  dueDate: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  paymentLinkId?: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rentStatus: RentStatus;
}

export interface RentRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  paymentLinkId?: string;
  propertyName: string;
  unitNumber: string;
  month: string;
  amount: number;
  dueDate: string;
  status: RentStatus;
  paymentMethod: PaymentMethod | null;
}

export interface Payment {
  id: string;
  rentRecordId?: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  date: string;
  method?: PaymentMethod;
  status: PaymentApprovalStatus;
  proofUrl?: string;
}
