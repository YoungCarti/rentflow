import type {
  Property,
  Unit,
  Tenant,
  RentRecord,
  Payment,
} from "@/types";

// ─── Properties ──────────────────────────────────────────────────────────────

export const properties: Property[] = [
  {
    id: "prop-1",
    name: "Greenview Apartments",
    location: "Kuala Lumpur, WP",
    unitCount: 8,
    occupiedCount: 7,
    monthlyIncome: 14500,
  },
  {
    id: "prop-2",
    name: "Sunway Residences",
    location: "Petaling Jaya, Selangor",
    unitCount: 7,
    occupiedCount: 5,
    monthlyIncome: 11200,
  },
  {
    id: "prop-3",
    name: "Marina Heights",
    location: "Johor Bahru, Johor",
    unitCount: 5,
    occupiedCount: 4,
    monthlyIncome: 7600,
  },
];

// ─── Units ────────────────────────────────────────────────────────────────────

export const units: Unit[] = [
  // Greenview Apartments – 8 units (7 occupied, 1 vacant)
  { id: "u-101", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "101", rent: 1800, tenantName: "Ahmad Farid", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-102", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "102", rent: 1800, tenantName: "Nurul Hana", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-103", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "103", rent: 2000, tenantName: "Raj Kumar", status: "Occupied", dueDate: "2026-05-03" },
  { id: "u-104", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "104", rent: 2000, tenantName: "Lim Wei Ling", status: "Occupied", dueDate: "2026-05-03" },
  { id: "u-105", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "105", rent: 1900, tenantName: "Siti Aisyah", status: "Occupied", dueDate: "2026-05-05" },
  { id: "u-106", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "106", rent: 1900, tenantName: "David Tan", status: "Occupied", dueDate: "2026-05-05" },
  { id: "u-107", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "107", rent: 1100, tenantName: "Priya Nair", status: "Occupied", dueDate: "2026-05-10" },
  { id: "u-108", propertyId: "prop-1", propertyName: "Greenview Apartments", unitNumber: "108", rent: 1200, tenantName: null, status: "Vacant", dueDate: null },

  // Sunway Residences – 7 units (5 occupied, 1 maintenance, 1 vacant)
  { id: "u-201", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "201", rent: 2200, tenantName: "Kevin Loh", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-202", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "202", rent: 2200, tenantName: "Nadia Rashid", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-203", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "203", rent: 2400, tenantName: "Hafiz Azmi", status: "Occupied", dueDate: "2026-05-07" },
  { id: "u-204", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "204", rent: 2100, tenantName: "Sarah Wong", status: "Occupied", dueDate: "2026-05-10" },
  { id: "u-205", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "205", rent: 2300, tenantName: "Omar Zain", status: "Occupied", dueDate: "2026-05-15" },
  { id: "u-206", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "206", rent: 2000, tenantName: null, status: "Maintenance", dueDate: null },
  { id: "u-207", propertyId: "prop-2", propertyName: "Sunway Residences", unitNumber: "207", rent: 2000, tenantName: null, status: "Vacant", dueDate: null },

  // Marina Heights – 5 units (4 occupied, 1 vacant)
  { id: "u-301", propertyId: "prop-3", propertyName: "Marina Heights", unitNumber: "301", rent: 1900, tenantName: "Chong Li Yen", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-302", propertyId: "prop-3", propertyName: "Marina Heights", unitNumber: "302", rent: 2000, tenantName: "Muhamad Azlan", status: "Occupied", dueDate: "2026-05-01" },
  { id: "u-303", propertyId: "prop-3", propertyName: "Marina Heights", unitNumber: "303", rent: 1800, tenantName: "Tan Mei Shan", status: "Occupied", dueDate: "2026-05-05" },
  { id: "u-304", propertyId: "prop-3", propertyName: "Marina Heights", unitNumber: "304", rent: 1900, tenantName: "Amirul Hakimi", status: "Occupied", dueDate: "2026-05-07" },
  { id: "u-305", propertyId: "prop-3", propertyName: "Marina Heights", unitNumber: "305", rent: 1800, tenantName: null, status: "Vacant", dueDate: null },
];

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const tenants: Tenant[] = [
  { id: "t-01", name: "Ahmad Farid", email: "ahmad.farid@email.com", phone: "+60 12-345 6781", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-101", unitNumber: "101", leaseStart: "2025-01-01", leaseEnd: "2026-12-31", rentStatus: "Paid" },
  { id: "t-02", name: "Nurul Hana", email: "nurul.hana@email.com", phone: "+60 11-234 5678", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-102", unitNumber: "102", leaseStart: "2025-03-01", leaseEnd: "2026-02-28", rentStatus: "Overdue" },
  { id: "t-03", name: "Raj Kumar", email: "raj.kumar@email.com", phone: "+60 16-789 0123", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-103", unitNumber: "103", leaseStart: "2024-07-01", leaseEnd: "2026-06-30", rentStatus: "Paid" },
  { id: "t-04", name: "Lim Wei Ling", email: "wei.ling@email.com", phone: "+60 17-456 7890", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-104", unitNumber: "104", leaseStart: "2025-06-01", leaseEnd: "2026-05-31", rentStatus: "Pending" },
  { id: "t-05", name: "Siti Aisyah", email: "siti.aisyah@email.com", phone: "+60 13-567 8901", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-105", unitNumber: "105", leaseStart: "2024-09-01", leaseEnd: "2026-08-31", rentStatus: "Paid" },
  { id: "t-06", name: "David Tan", email: "david.tan@email.com", phone: "+60 18-678 9012", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-106", unitNumber: "106", leaseStart: "2025-01-01", leaseEnd: "2026-12-31", rentStatus: "Paid" },
  { id: "t-07", name: "Priya Nair", email: "priya.nair@email.com", phone: "+60 19-789 0124", propertyId: "prop-1", propertyName: "Greenview Apartments", unitId: "u-107", unitNumber: "107", leaseStart: "2025-08-01", leaseEnd: "2026-07-31", rentStatus: "Overdue" },
  { id: "t-08", name: "Kevin Loh", email: "kevin.loh@email.com", phone: "+60 12-890 1235", propertyId: "prop-2", propertyName: "Sunway Residences", unitId: "u-201", unitNumber: "201", leaseStart: "2025-02-01", leaseEnd: "2027-01-31", rentStatus: "Paid" },
  { id: "t-09", name: "Nadia Rashid", email: "nadia.rashid@email.com", phone: "+60 11-901 2346", propertyId: "prop-2", propertyName: "Sunway Residences", unitId: "u-202", unitNumber: "202", leaseStart: "2024-11-01", leaseEnd: "2026-10-31", rentStatus: "Pending" },
  { id: "t-10", name: "Hafiz Azmi", email: "hafiz.azmi@email.com", phone: "+60 16-012 3457", propertyId: "prop-2", propertyName: "Sunway Residences", unitId: "u-203", unitNumber: "203", leaseStart: "2025-04-01", leaseEnd: "2026-03-31", rentStatus: "Paid" },
  { id: "t-11", name: "Sarah Wong", email: "sarah.wong@email.com", phone: "+60 17-123 4568", propertyId: "prop-2", propertyName: "Sunway Residences", unitId: "u-204", unitNumber: "204", leaseStart: "2025-07-01", leaseEnd: "2026-06-30", rentStatus: "Paid" },
  { id: "t-12", name: "Omar Zain", email: "omar.zain@email.com", phone: "+60 13-234 5679", propertyId: "prop-2", propertyName: "Sunway Residences", unitId: "u-205", unitNumber: "205", leaseStart: "2025-05-01", leaseEnd: "2026-04-30", rentStatus: "Overdue" },
  { id: "t-13", name: "Chong Li Yen", email: "li.yen@email.com", phone: "+60 18-345 6780", propertyId: "prop-3", propertyName: "Marina Heights", unitId: "u-301", unitNumber: "301", leaseStart: "2025-01-01", leaseEnd: "2026-12-31", rentStatus: "Paid" },
  { id: "t-14", name: "Muhamad Azlan", email: "m.azlan@email.com", phone: "+60 19-456 7891", propertyId: "prop-3", propertyName: "Marina Heights", unitId: "u-302", unitNumber: "302", leaseStart: "2024-10-01", leaseEnd: "2026-09-30", rentStatus: "Pending" },
  { id: "t-15", name: "Tan Mei Shan", email: "mei.shan@email.com", phone: "+60 12-567 8902", propertyId: "prop-3", propertyName: "Marina Heights", unitId: "u-303", unitNumber: "303", leaseStart: "2025-03-01", leaseEnd: "2026-02-28", rentStatus: "Paid" },
  { id: "t-16", name: "Amirul Hakimi", email: "amirul.hakimi@email.com", phone: "+60 11-678 9013", propertyId: "prop-3", propertyName: "Marina Heights", unitId: "u-304", unitNumber: "304", leaseStart: "2025-09-01", leaseEnd: "2026-08-31", rentStatus: "Paid" },
];

// ─── Rent Records (last 3 months) ─────────────────────────────────────────────

export const rentRecords: RentRecord[] = [
  // April 2026
  { id: "rr-001", tenantId: "t-01", tenantName: "Ahmad Farid",    propertyName: "Greenview Apartments", unitNumber: "101", month: "April 2026",   amount: 1800, dueDate: "2026-04-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-002", tenantId: "t-02", tenantName: "Nurul Hana",     propertyName: "Greenview Apartments", unitNumber: "102", month: "April 2026",   amount: 1800, dueDate: "2026-04-01", status: "Overdue", paymentMethod: null },
  { id: "rr-003", tenantId: "t-03", tenantName: "Raj Kumar",      propertyName: "Greenview Apartments", unitNumber: "103", month: "April 2026",   amount: 2000, dueDate: "2026-04-03", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-004", tenantId: "t-04", tenantName: "Lim Wei Ling",   propertyName: "Greenview Apartments", unitNumber: "104", month: "April 2026",   amount: 2000, dueDate: "2026-04-03", status: "Pending", paymentMethod: null },
  { id: "rr-005", tenantId: "t-05", tenantName: "Siti Aisyah",    propertyName: "Greenview Apartments", unitNumber: "105", month: "April 2026",   amount: 1900, dueDate: "2026-04-05", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-006", tenantId: "t-06", tenantName: "David Tan",      propertyName: "Greenview Apartments", unitNumber: "106", month: "April 2026",   amount: 1900, dueDate: "2026-04-05", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-007", tenantId: "t-07", tenantName: "Priya Nair",     propertyName: "Greenview Apartments", unitNumber: "107", month: "April 2026",   amount: 1100, dueDate: "2026-04-10", status: "Overdue", paymentMethod: null },
  { id: "rr-008", tenantId: "t-08", tenantName: "Kevin Loh",      propertyName: "Sunway Residences",    unitNumber: "201", month: "April 2026",   amount: 2200, dueDate: "2026-04-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-009", tenantId: "t-09", tenantName: "Nadia Rashid",   propertyName: "Sunway Residences",    unitNumber: "202", month: "April 2026",   amount: 2200, dueDate: "2026-04-01", status: "Pending", paymentMethod: null },
  { id: "rr-010", tenantId: "t-10", tenantName: "Hafiz Azmi",     propertyName: "Sunway Residences",    unitNumber: "203", month: "April 2026",   amount: 2400, dueDate: "2026-04-07", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-011", tenantId: "t-11", tenantName: "Sarah Wong",     propertyName: "Sunway Residences",    unitNumber: "204", month: "April 2026",   amount: 2100, dueDate: "2026-04-10", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-012", tenantId: "t-12", tenantName: "Omar Zain",      propertyName: "Sunway Residences",    unitNumber: "205", month: "April 2026",   amount: 2300, dueDate: "2026-04-15", status: "Overdue", paymentMethod: null },
  { id: "rr-013", tenantId: "t-13", tenantName: "Chong Li Yen",   propertyName: "Marina Heights",       unitNumber: "301", month: "April 2026",   amount: 1900, dueDate: "2026-04-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-014", tenantId: "t-14", tenantName: "Muhamad Azlan",  propertyName: "Marina Heights",       unitNumber: "302", month: "April 2026",   amount: 2000, dueDate: "2026-04-01", status: "Pending", paymentMethod: null },
  { id: "rr-015", tenantId: "t-15", tenantName: "Tan Mei Shan",   propertyName: "Marina Heights",       unitNumber: "303", month: "April 2026",   amount: 1800, dueDate: "2026-04-05", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-016", tenantId: "t-16", tenantName: "Amirul Hakimi",  propertyName: "Marina Heights",       unitNumber: "304", month: "April 2026",   amount: 1900, dueDate: "2026-04-07", status: "Paid",    paymentMethod: "Bank Transfer" },

  // March 2026
  { id: "rr-017", tenantId: "t-01", tenantName: "Ahmad Farid",    propertyName: "Greenview Apartments", unitNumber: "101", month: "March 2026",   amount: 1800, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-018", tenantId: "t-02", tenantName: "Nurul Hana",     propertyName: "Greenview Apartments", unitNumber: "102", month: "March 2026",   amount: 1800, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-019", tenantId: "t-03", tenantName: "Raj Kumar",      propertyName: "Greenview Apartments", unitNumber: "103", month: "March 2026",   amount: 2000, dueDate: "2026-03-03", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-020", tenantId: "t-04", tenantName: "Lim Wei Ling",   propertyName: "Greenview Apartments", unitNumber: "104", month: "March 2026",   amount: 2000, dueDate: "2026-03-03", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-021", tenantId: "t-05", tenantName: "Siti Aisyah",    propertyName: "Greenview Apartments", unitNumber: "105", month: "March 2026",   amount: 1900, dueDate: "2026-03-05", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-022", tenantId: "t-06", tenantName: "David Tan",      propertyName: "Greenview Apartments", unitNumber: "106", month: "March 2026",   amount: 1900, dueDate: "2026-03-05", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-023", tenantId: "t-07", tenantName: "Priya Nair",     propertyName: "Greenview Apartments", unitNumber: "107", month: "March 2026",   amount: 1100, dueDate: "2026-03-10", status: "Overdue", paymentMethod: null },
  { id: "rr-024", tenantId: "t-08", tenantName: "Kevin Loh",      propertyName: "Sunway Residences",    unitNumber: "201", month: "March 2026",   amount: 2200, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-025", tenantId: "t-09", tenantName: "Nadia Rashid",   propertyName: "Sunway Residences",    unitNumber: "202", month: "March 2026",   amount: 2200, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-026", tenantId: "t-10", tenantName: "Hafiz Azmi",     propertyName: "Sunway Residences",    unitNumber: "203", month: "March 2026",   amount: 2400, dueDate: "2026-03-07", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-027", tenantId: "t-11", tenantName: "Sarah Wong",     propertyName: "Sunway Residences",    unitNumber: "204", month: "March 2026",   amount: 2100, dueDate: "2026-03-10", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-028", tenantId: "t-12", tenantName: "Omar Zain",      propertyName: "Sunway Residences",    unitNumber: "205", month: "March 2026",   amount: 2300, dueDate: "2026-03-15", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-029", tenantId: "t-13", tenantName: "Chong Li Yen",   propertyName: "Marina Heights",       unitNumber: "301", month: "March 2026",   amount: 1900, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-030", tenantId: "t-14", tenantName: "Muhamad Azlan",  propertyName: "Marina Heights",       unitNumber: "302", month: "March 2026",   amount: 2000, dueDate: "2026-03-01", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-031", tenantId: "t-15", tenantName: "Tan Mei Shan",   propertyName: "Marina Heights",       unitNumber: "303", month: "March 2026",   amount: 1800, dueDate: "2026-03-05", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-032", tenantId: "t-16", tenantName: "Amirul Hakimi",  propertyName: "Marina Heights",       unitNumber: "304", month: "March 2026",   amount: 1900, dueDate: "2026-03-07", status: "Paid",    paymentMethod: "Bank Transfer" },

  // February 2026
  { id: "rr-033", tenantId: "t-01", tenantName: "Ahmad Farid",    propertyName: "Greenview Apartments", unitNumber: "101", month: "February 2026", amount: 1800, dueDate: "2026-02-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-034", tenantId: "t-02", tenantName: "Nurul Hana",     propertyName: "Greenview Apartments", unitNumber: "102", month: "February 2026", amount: 1800, dueDate: "2026-02-01", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-035", tenantId: "t-03", tenantName: "Raj Kumar",      propertyName: "Greenview Apartments", unitNumber: "103", month: "February 2026", amount: 2000, dueDate: "2026-02-03", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-036", tenantId: "t-04", tenantName: "Lim Wei Ling",   propertyName: "Greenview Apartments", unitNumber: "104", month: "February 2026", amount: 2000, dueDate: "2026-02-03", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-037", tenantId: "t-05", tenantName: "Siti Aisyah",    propertyName: "Greenview Apartments", unitNumber: "105", month: "February 2026", amount: 1900, dueDate: "2026-02-05", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-038", tenantId: "t-06", tenantName: "David Tan",      propertyName: "Greenview Apartments", unitNumber: "106", month: "February 2026", amount: 1900, dueDate: "2026-02-05", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-039", tenantId: "t-08", tenantName: "Kevin Loh",      propertyName: "Sunway Residences",    unitNumber: "201", month: "February 2026", amount: 2200, dueDate: "2026-02-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-040", tenantId: "t-09", tenantName: "Nadia Rashid",   propertyName: "Sunway Residences",    unitNumber: "202", month: "February 2026", amount: 2200, dueDate: "2026-02-01", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-041", tenantId: "t-10", tenantName: "Hafiz Azmi",     propertyName: "Sunway Residences",    unitNumber: "203", month: "February 2026", amount: 2400, dueDate: "2026-02-07", status: "Paid",    paymentMethod: "Cash" },
  { id: "rr-042", tenantId: "t-11", tenantName: "Sarah Wong",     propertyName: "Sunway Residences",    unitNumber: "204", month: "February 2026", amount: 2100, dueDate: "2026-02-10", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-043", tenantId: "t-13", tenantName: "Chong Li Yen",   propertyName: "Marina Heights",       unitNumber: "301", month: "February 2026", amount: 1900, dueDate: "2026-02-01", status: "Paid",    paymentMethod: "Bank Transfer" },
  { id: "rr-044", tenantId: "t-15", tenantName: "Tan Mei Shan",   propertyName: "Marina Heights",       unitNumber: "303", month: "February 2026", amount: 1800, dueDate: "2026-02-05", status: "Paid",    paymentMethod: "Online" },
  { id: "rr-045", tenantId: "t-16", tenantName: "Amirul Hakimi",  propertyName: "Marina Heights",       unitNumber: "304", month: "February 2026", amount: 1900, dueDate: "2026-02-07", status: "Paid",    paymentMethod: "Bank Transfer" },
];

// ─── Payments (for Payments approval page) ───────────────────────────────────

export const payments: Payment[] = [
  { id: "pay-001", tenantId: "t-01", tenantName: "Ahmad Farid",   propertyName: "Greenview Apartments", unitNumber: "101", amount: 1800, date: "2026-04-01", status: "Approved" },
  { id: "pay-002", tenantId: "t-03", tenantName: "Raj Kumar",     propertyName: "Greenview Apartments", unitNumber: "103", amount: 2000, date: "2026-04-02", status: "Approved" },
  { id: "pay-003", tenantId: "t-04", tenantName: "Lim Wei Ling",  propertyName: "Greenview Apartments", unitNumber: "104", amount: 2000, date: "2026-04-20", status: "Pending" },
  { id: "pay-004", tenantId: "t-05", tenantName: "Siti Aisyah",   propertyName: "Greenview Apartments", unitNumber: "105", amount: 1900, date: "2026-04-04", status: "Approved" },
  { id: "pay-005", tenantId: "t-06", tenantName: "David Tan",     propertyName: "Greenview Apartments", unitNumber: "106", amount: 1900, date: "2026-04-05", status: "Approved" },
  { id: "pay-006", tenantId: "t-08", tenantName: "Kevin Loh",     propertyName: "Sunway Residences",    unitNumber: "201", amount: 2200, date: "2026-04-01", status: "Approved" },
  { id: "pay-007", tenantId: "t-09", tenantName: "Nadia Rashid",  propertyName: "Sunway Residences",    unitNumber: "202", amount: 2200, date: "2026-04-22", status: "Pending" },
  { id: "pay-008", tenantId: "t-10", tenantName: "Hafiz Azmi",    propertyName: "Sunway Residences",    unitNumber: "203", amount: 2400, date: "2026-04-06", status: "Approved" },
  { id: "pay-009", tenantId: "t-11", tenantName: "Sarah Wong",    propertyName: "Sunway Residences",    unitNumber: "204", amount: 2100, date: "2026-04-09", status: "Approved" },
  { id: "pay-010", tenantId: "t-14", tenantName: "Muhamad Azlan", propertyName: "Marina Heights",       unitNumber: "302", amount: 2000, date: "2026-04-23", status: "Pending" },
  { id: "pay-011", tenantId: "t-13", tenantName: "Chong Li Yen",  propertyName: "Marina Heights",       unitNumber: "301", amount: 1900, date: "2026-04-01", status: "Approved" },
  { id: "pay-012", tenantId: "t-15", tenantName: "Tan Mei Shan",  propertyName: "Marina Heights",       unitNumber: "303", amount: 1800, date: "2026-04-03", status: "Approved" },
  { id: "pay-013", tenantId: "t-16", tenantName: "Amirul Hakimi", propertyName: "Marina Heights",       unitNumber: "304", amount: 1900, date: "2026-04-05", status: "Approved" },
  { id: "pay-014", tenantId: "t-07", tenantName: "Priya Nair",    propertyName: "Greenview Apartments", unitNumber: "107", amount: 1100, date: "2026-03-10", status: "Rejected" },
];

// ─── Derived / computed helpers ───────────────────────────────────────────────

export const monthlyRevenueChart = [
  { month: "Nov", revenue: 27400 },
  { month: "Dec", revenue: 29100 },
  { month: "Jan", revenue: 30200 },
  { month: "Feb", revenue: 30500 },
  { month: "Mar", revenue: 33300 },
  { month: "Apr", revenue: 33300 },
];

export const occupancyChart = [
  { month: "Nov", rate: 80 },
  { month: "Dec", rate: 85 },
  { month: "Jan", rate: 85 },
  { month: "Feb", rate: 90 },
  { month: "Mar", rate: 90 },
  { month: "Apr", rate: 80 },
];

export function getTotalProperties() {
  return properties.length;
}

export function getTotalUnits() {
  return units.length;
}

export function getOccupiedUnits() {
  return units.filter((u) => u.status === "Occupied").length;
}

export function getVacantUnits() {
  return units.filter((u) => u.status === "Vacant").length;
}

export function getMonthlyRevenue() {
  return properties.reduce((sum, p) => sum + p.monthlyIncome, 0);
}

export function getOverdueAmount() {
  return rentRecords
    .filter((r) => r.status === "Overdue")
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getRecentPayments(limit = 6) {
  return payments
    .filter((p) => p.status === "Approved")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getUpcomingLeaseExpiries(limit = 5) {
  const today = new Date("2026-04-26");
  return tenants
    .filter((t) => {
      const end = new Date(t.leaseEnd);
      const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 120;
    })
    .sort((a, b) => new Date(a.leaseEnd).getTime() - new Date(b.leaseEnd).getTime())
    .slice(0, limit);
}
