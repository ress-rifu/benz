/**
 * Business timezone helpers.
 *
 * All "today / this week / this month" boundaries are anchored to Asia/Dhaka
 * (UTC+6) regardless of the server's local timezone. This matters because Vercel
 * runs serverless functions in UTC, so naive `new Date(year, month, 1)` math
 * silently rolls "today" back by 6 hours and lumps the start of the day/month
 * into the previous period.
 *
 * Returned strings are UTC ISO timestamps suitable for Supabase
 * `gte`/`lt` filters against `timestamptz` columns.
 */

const BUSINESS_TZ = "Asia/Dhaka";

/** Get the parts of a Date as observed in the business timezone. */
function getPartsInTZ(date: Date): {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number;
    minute: number;
    second: number;
    weekday: number; // 0 = Sunday, 6 = Saturday
} {
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: BUSINESS_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        weekday: "short",
        hourCycle: "h23",
    });

    const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
        if (p.type !== "literal") acc[p.type] = p.value;
        return acc;
    }, {});

    const weekdayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second),
        weekday: weekdayMap[parts.weekday] ?? 0,
    };
}

/**
 * Build the UTC instant that corresponds to a given local wall-clock time
 * in the business timezone. Handles DST transparently via Intl.
 */
function utcInstantForBusinessLocal(
    year: number,
    month: number, // 1-12
    day: number,
    hour = 0,
    minute = 0,
    second = 0
): Date {
    // Start with a UTC guess at the same wall-clock numbers.
    const guess = Date.UTC(year, month - 1, day, hour, minute, second);
    // See what wall clock that UTC instant maps to in the business TZ,
    // then subtract the difference to land exactly on the desired local time.
    const seenInTz = getPartsInTZ(new Date(guess));
    const seenAsUtc = Date.UTC(
        seenInTz.year,
        seenInTz.month - 1,
        seenInTz.day,
        seenInTz.hour,
        seenInTz.minute,
        seenInTz.second
    );
    const offset = seenAsUtc - guess;
    return new Date(guess - offset);
}

export interface DateRangeISO {
    from: string;
    to: string; // exclusive upper bound
}

/** Today: [00:00 today, 00:00 tomorrow) in business TZ, returned as UTC ISO. */
export function getTodayRange(now: Date = new Date()): DateRangeISO {
    const p = getPartsInTZ(now);
    const from = utcInstantForBusinessLocal(p.year, p.month, p.day);
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Week (Monday-anchored): [00:00 Monday, 00:00 next Monday) in business TZ.
 */
export function getWeekRange(now: Date = new Date()): DateRangeISO {
    const p = getPartsInTZ(now);
    // Convert weekday so Monday = 0, Sunday = 6
    const offsetFromMonday = (p.weekday + 6) % 7;
    const monday = utcInstantForBusinessLocal(p.year, p.month, p.day);
    monday.setUTCDate(monday.getUTCDate() - offsetFromMonday);
    const nextMonday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { from: monday.toISOString(), to: nextMonday.toISOString() };
}

/**
 * "Last 7 days" rolling window ending at the start of tomorrow (business TZ).
 * Useful for "weekly revenue" and the 7-day chart on the dashboard.
 */
export function getLast7DaysRange(now: Date = new Date()): DateRangeISO {
    const today = getTodayRange(now);
    const from = new Date(new Date(today.from).getTime() - 6 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: today.to };
}

/** This month: [00:00 day 1 of current month, 00:00 day 1 of next month). */
export function getMonthRange(now: Date = new Date()): DateRangeISO {
    const p = getPartsInTZ(now);
    const from = utcInstantForBusinessLocal(p.year, p.month, 1);
    const nextMonthYear = p.month === 12 ? p.year + 1 : p.year;
    const nextMonth = p.month === 12 ? 1 : p.month + 1;
    const to = utcInstantForBusinessLocal(nextMonthYear, nextMonth, 1);
    return { from: from.toISOString(), to: to.toISOString() };
}

/** Previous month: [00:00 day 1 prev month, 00:00 day 1 current month). */
export function getPreviousMonthRange(now: Date = new Date()): DateRangeISO {
    const p = getPartsInTZ(now);
    const prevMonthYear = p.month === 1 ? p.year - 1 : p.year;
    const prevMonth = p.month === 1 ? 12 : p.month - 1;
    const from = utcInstantForBusinessLocal(prevMonthYear, prevMonth, 1);
    const to = utcInstantForBusinessLocal(p.year, p.month, 1);
    return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Wide-open "all time" range. Used as a sentinel filter when the user picks
 * "All" so the same query shape works.
 */
export function getAllTimeRange(): DateRangeISO {
    return {
        from: new Date("2000-01-01T00:00:00.000Z").toISOString(),
        to: new Date("2099-12-31T23:59:59.999Z").toISOString(),
    };
}

/** Short weekday key (e.g. "Mon") computed in the business timezone. */
export function getBusinessWeekdayKey(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        timeZone: BUSINESS_TZ,
        weekday: "short",
    }).format(d);
}

/** Sequence of the last N short weekday keys ending today, in business TZ. */
export function getLastNWeekdayKeys(n: number, now: Date = new Date()): string[] {
    const todayStartUtc = new Date(getTodayRange(now).from);
    const out: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(todayStartUtc.getTime() - i * 24 * 60 * 60 * 1000);
        out.push(getBusinessWeekdayKey(d));
    }
    return out;
}
