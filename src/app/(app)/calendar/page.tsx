import CalendarView from "@/components/calendar/CalendarView";
import { getCalendarEvents } from "@/lib/calendar";

function parseMonth(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const selectedMonth = parseMonth(month);
  const events = await getCalendarEvents(selectedMonth);

  return (
    <CalendarView
      events={events}
      selectedMonth={monthKey(selectedMonth)}
    />
  );
}
