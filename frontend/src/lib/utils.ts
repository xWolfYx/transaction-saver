import { type Checkout, GEL_DIVISOR } from "@tally/shared";
import { Temporal } from "temporal-polyfill";

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

export type DatePreset = "today" | "week" | "month" | "year" | "all";

export function getDateRange(
	preset: DatePreset,
	checkouts?: Checkout[],
): {
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

		case "year": {
			const firstOfYear = t.with({ month: 1, day: 1 });
			const firstOfNextYear = firstOfYear.add({ years: 1 });
			return { from: firstOfYear, to: firstOfNextYear };
		}

		case "all": {
			if (checkouts && checkouts.length > 0) {
				const dates = checkouts.map((c) =>
					Temporal.PlainDate.from(dateKey(c.timestamp)),
				);
				const min = dates.reduce((a, b) =>
					Temporal.PlainDate.compare(a, b) < 0 ? a : b,
				);
				const max = dates.reduce((a, b) =>
					Temporal.PlainDate.compare(a, b) > 0 ? a : b,
				);
				return { from: min, to: max.add({ days: 1 }) };
			}
			return { from: t, to: t.add({ days: 1 }) };
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