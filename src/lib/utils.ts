import { Temporal } from "temporal-polyfill";
import { GEL_DIVISOR, type Checkout } from "../types";

// --- Formatting ---

/** Convert tetri to GEL string: 150 → "₾ 1.50" */
export function formatGEL(amount: number): string {
	return `₾ ${(amount / GEL_DIVISOR).toFixed(2)}`;
}

export function formatDate(isoString: string): string {
	const instant = Temporal.Instant.from(isoString);
	const zoned = instant.toZonedDateTimeISO(Temporal.Now.timeZoneId());
	return zoned.toLocaleString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// --- Date-only helpers (using Temporal.PlainDate) ---

export function toPlainDate(date: Date): Temporal.PlainDate {
	return Temporal.PlainDate.from({
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
	});
}

export function today(): Temporal.PlainDate {
	return Temporal.Now.plainDateISO();
}

export function toISOString(date: Temporal.PlainDate): string {
	return date.toString(); // YYYY-MM-DD
}

export function parsePlainDate(dateString: string): Temporal.PlainDate {
	return Temporal.PlainDate.from(dateString);
}

// --- Date range helpers ---

export function getDateRange(preset: "today" | "week" | "month"): {
	from: Temporal.PlainDate;
	to: Temporal.PlainDate;
} {
	const t = today();

	switch (preset) {
		case "today":
			return { from: t, to: t.add({ days: 1 }) };

		case "week": {
			// Monday = 1 ... Sunday = 7
			const dayOfWeek = t.dayOfWeek;
			const mondayOffset = dayOfWeek === 7 ? -6 : 1 - dayOfWeek;
			const monday = t.add({ days: mondayOffset });
			return { from: monday, to: monday.add({ days: 7 }) };
		}

		case "month": {
			const firstOfMonth = t.with({ day: 1 });
			const firstOfNextMonth = firstOfMonth.add({ months: 1 });
			return { from: firstOfMonth, to: firstOfNextMonth };
		}
	}
}

// --- Filtering & grouping ---

/** Extract YYYY-MM-DD from any ISO 8601 string so PlainDate.from() can parse it. */
export function dateKey(isoString: string): string {
	return isoString.slice(0, 10);
}

export function filterByDateRange(
	checkouts: Checkout[],
	from: Temporal.PlainDate,
	to: Temporal.PlainDate,
): Checkout[] {
	return checkouts.filter((c) => {
		const checkoutDate = Temporal.PlainDate.from(dateKey(c.timestamp));
		return (
			Temporal.PlainDate.compare(checkoutDate, from) >= 0 &&
			Temporal.PlainDate.compare(checkoutDate, to) < 0
		);
	});
}

export function groupByDay(checkouts: Checkout[]): Record<string, Checkout[]> {
	const groups: Record<string, Checkout[]> = {};
	for (const checkout of checkouts) {
		const day = dateKey(checkout.timestamp);
		if (!groups[day]) groups[day] = [];
		groups[day].push(checkout);
	}
	return groups;
}

/** Generate an array of PlainDate for each day in the range [from, to) */
export function eachDayInRange(
	from: Temporal.PlainDate,
	to: Temporal.PlainDate,
): Temporal.PlainDate[] {
	const days: Temporal.PlainDate[] = [];
	let current = from;
	while (Temporal.PlainDate.compare(current, to) < 0) {
		days.push(current);
		current = current.add({ days: 1 });
	}
	return days;
}

// --- CSV ---

export function generateCSV(checkouts: Checkout[]): string {
	const header = "ID,Method,Amount (GEL),Timestamp\n";
	const rows = checkouts
		.map(
			(c) =>
				`${c.id},${c.method},${(c.amount / GEL_DIVISOR).toFixed(2)},${c.timestamp}`,
		)
		.join("\n");
	return header + rows;
}

export function downloadCSV(checkouts: Checkout[], filename: string): void {
	const csv = generateCSV(checkouts);
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
