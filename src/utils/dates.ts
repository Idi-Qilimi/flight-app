import type { ISODate, LocalDateTime } from '../types/models';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Today's date in the device's local timezone. */
export function todayISO(now: Date = new Date()): ISODate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function parseISODate(date: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

export function toISODate(year: number, month: number, day: number): ISODate {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Timezone-independent day arithmetic. */
export function addDays(date: ISODate, days: number): ISODate {
  const { year, month, day } = parseISODate(date);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().slice(0, 10);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { year, month, day } = parseISODate(value);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/** "12 Oct" */
export function formatShortDate(date: ISODate): string {
  const { month, day } = parseISODate(date);
  return `${day} ${MONTHS[month - 1]}`;
}

/** "Mon, 12 Oct 2026" */
export function formatLongDate(date: ISODate): string {
  const { year, month, day } = parseISODate(date);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month - 1]} ${year}`;
}

/** "Mon · 2026" */
export function formatWeekdayYear(date: ISODate): string {
  const { year, month, day } = parseISODate(date);
  return `${WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]} · ${year}`;
}

export function monthName(month: number): string {
  return MONTHS[month - 1];
}

/** "06:35" */
export function formatTime(dateTime: LocalDateTime): string {
  return dateTime.slice(11, 16);
}

/** Whole days between the dates of two local date-times (used for "+1" badges). */
export function dayOffset(from: LocalDateTime, to: LocalDateTime): number {
  const a = parseISODate(from.slice(0, 10));
  const b = parseISODate(to.slice(0, 10));
  return Math.round(
    (Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000,
  );
}

/** "2h 05m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
}

/** Adds minutes to a timezone-less local date-time. */
export function addMinutes(dateTime: LocalDateTime, minutes: number): LocalDateTime {
  const { year, month, day } = parseISODate(dateTime.slice(0, 10));
  const h = Number(dateTime.slice(11, 13));
  const m = Number(dateTime.slice(14, 16));
  return new Date(Date.UTC(year, month - 1, day, h, m + minutes)).toISOString().slice(0, 16);
}
