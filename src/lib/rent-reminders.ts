import type { RentRecord } from "@/types";

export type RentReminderTiming = "Before Due" | "Due Today" | "Overdue";

export type RentReminder = {
  record: RentRecord;
  timing: RentReminderTiming;
  daysFromDue: number;
};

const reminderWindowDays = 5;

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysFromDueDate(dueDate: string, referenceDate = new Date()) {
  const due = dateOnly(new Date(`${dueDate}T00:00:00`));
  const today = dateOnly(referenceDate);

  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getReminderTiming(
  record: RentRecord,
  referenceDate = new Date()
): RentReminderTiming | null {
  if (record.status === "Paid") {
    return null;
  }

  const days = daysFromDueDate(record.dueDate, referenceDate);

  if (days > 0 && days <= reminderWindowDays) {
    return "Before Due";
  }

  if (days === 0) {
    return "Due Today";
  }

  if (days < 0 || record.status === "Overdue") {
    return "Overdue";
  }

  return null;
}

function recordDateValue(record: RentRecord) {
  if (record.monthStart) {
    return new Date(`${record.monthStart}T00:00:00`).getTime();
  }

  return new Date(`01 ${record.month}`).getTime();
}

export function isSupersededByLaterPaidRecord(
  record: RentRecord,
  records: RentRecord[]
) {
  if (record.status === "Paid") {
    return false;
  }

  return records.some(
    (candidate) =>
      candidate.tenantId === record.tenantId &&
      candidate.status === "Paid" &&
      recordDateValue(candidate) > recordDateValue(record)
  );
}

export function getActiveRentRecords(records: RentRecord[]) {
  return records.filter((record) => !isSupersededByLaterPaidRecord(record, records));
}

export function getHistoricalRentRecords(records: RentRecord[]) {
  return records.filter((record) => isSupersededByLaterPaidRecord(record, records));
}

export function getRentReminders(records: RentRecord[], referenceDate = new Date()) {
  return getActiveRentRecords(records)
    .map((record): RentReminder | null => {
      const timing = getReminderTiming(record, referenceDate);

      if (!timing) {
        return null;
      }

      return {
        record,
        timing,
        daysFromDue: daysFromDueDate(record.dueDate, referenceDate),
      };
    })
    .filter((reminder): reminder is RentReminder => Boolean(reminder))
    .sort((a, b) => a.daysFromDue - b.daysFromDue);
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function formatRM(amount: number) {
  return `RM ${amount.toLocaleString()}`;
}

export function formatReminderDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function monthLabel(month: string) {
  return month.split(" ")[0] ?? month;
}

export function buildPaymentUrl(origin: string, paymentLinkId: string) {
  return `${origin}/pay/${paymentLinkId}`;
}

export function buildReminderMessage(input: {
  tenantName: string;
  month: string;
  amount: number;
  dueDate: string;
  paymentLinkId: string;
  timing: RentReminderTiming;
  origin: string;
}) {
  const name = firstName(input.tenantName);
  const amount = formatRM(input.amount);
  const date = formatReminderDate(input.dueDate);
  const link = buildPaymentUrl(input.origin, input.paymentLinkId);
  const month = monthLabel(input.month);

  if (input.timing === "Before Due") {
    return `Hi ${name}, friendly reminder that your ${month} rent of ${amount} is due on ${date}. You can pay here: ${link}`;
  }

  if (input.timing === "Due Today") {
    return `Hi ${name}, your ${month} rent of ${amount} is due today. Please complete payment here: ${link}`;
  }

  return `Hi ${name}, your ${month} rent of ${amount} was due on ${date} and is now overdue. Please complete payment as soon as possible: ${link}`;
}

export function buildReminderSubject(input: {
  month: string;
  timing: RentReminderTiming;
}) {
  const month = monthLabel(input.month);

  if (input.timing === "Before Due") {
    return `${month} rent reminder`;
  }

  if (input.timing === "Due Today") {
    return `${month} rent due today`;
  }

  return `${month} rent overdue`;
}

export function whatsappPhone(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (digits.startsWith("0")) {
    return `60${digits.slice(1)}`;
  }

  return digits;
}
