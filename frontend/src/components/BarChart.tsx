import { Temporal } from "temporal-polyfill";
import {
	Bar,
	BarChart as RechartsBarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	eachDayInRange,
	formatGEL,
	groupByDay,
	toISOString,
} from "../lib/utils";
import type { DatePreset } from "../lib/utils";
import type { Checkout, PaymentMethod } from "@tally/shared";
import { Card } from "./ui/Card";

interface BarChartProps {
	checkouts: Checkout[];
	range: { from: Temporal.PlainDate; to: Temporal.PlainDate };
	preset: DatePreset;
}

const barConfig: Record<PaymentMethod, { fill: string; label: string }> = {
	cash: { fill: "#22c55e", label: "Cash" },
	card: { fill: "#6366f1", label: "Card" },
	transfer: { fill: "#f97316", label: "Transfer" },
};

const orderedMethods: PaymentMethod[] = ["cash", "card", "transfer"];

type ChartDataPoint = {
	label: string;
	id: string;
	cash: number;
	card: number;
	transfer: number;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function sumByMethod(
	checkouts: Checkout[],
	method: PaymentMethod,
): number {
	return checkouts
		.filter((c) => c.method === method)
		.reduce((sum, c) => sum + c.amount, 0);
}

function buildHourlyData(checkouts: Checkout[]): ChartDataPoint[] {
	if (checkouts.length === 0) return [];

	let minTs = Infinity;
	let maxTs = -Infinity;
	for (const c of checkouts) {
		const ts = new Date(c.timestamp).getTime();
		if (ts < minTs) minTs = ts;
		if (ts > maxTs) maxTs = ts;
	}

	const minDate = new Date(minTs);
	const maxDate = new Date(maxTs);

	const start = Math.max(0, minDate.getHours() - 1);
	const end = Math.min(23, maxDate.getHours() + 1);
	const count = end - start + 1;

	const buckets = new Map<number, Checkout[]>();
	for (let h = start; h <= end; h++) buckets.set(h, []);
	for (const c of checkouts) {
		const hour = new Date(c.timestamp).getHours();
		if (buckets.has(hour)) buckets.get(hour)?.push(c);
	}

	return Array.from({ length: count }, (_, i) => {
		const h = start + i;
		return {
			id: String(h).padStart(2, "0"),
			label: `${String(h).padStart(2, "0")}:00`,
			cash: sumByMethod(buckets.get(h) ?? [], "cash"),
			card: sumByMethod(buckets.get(h) ?? [], "card"),
			transfer: sumByMethod(buckets.get(h) ?? [], "transfer"),
		};
	});
}

function buildWeekdayData(
	days: Temporal.PlainDate[],
	grouped: Record<string, Checkout[]>,
): ChartDataPoint[] {
	return days.map((day) => {
		const key = toISOString(day);
		const dayCheckouts = grouped[key] ?? [];
		return {
			id: key,
			label: DAY_NAMES[day.dayOfWeek % 7],
			cash: sumByMethod(dayCheckouts, "cash"),
			card: sumByMethod(dayCheckouts, "card"),
			transfer: sumByMethod(dayCheckouts, "transfer"),
		};
	});
}

function buildMonthdayData(
	days: Temporal.PlainDate[],
	grouped: Record<string, Checkout[]>,
): ChartDataPoint[] {
	return days.map((day) => {
		const key = toISOString(day);
		const dayCheckouts = grouped[key] ?? [];
		return {
			id: key,
			label: String(day.day),
			cash: sumByMethod(dayCheckouts, "cash"),
			card: sumByMethod(dayCheckouts, "card"),
			transfer: sumByMethod(dayCheckouts, "transfer"),
		};
	});
}

function monthKey(day: Temporal.PlainDate): string {
	return `${day.year}-${String(day.month).padStart(2, "0")}`;
}

function buildMonthlyData(
	days: Temporal.PlainDate[],
	grouped: Record<string, Checkout[]>,
	singleYear: boolean,
): ChartDataPoint[] {
	const bucketKeys: string[] = [];
	const seen = new Set<string>();
	for (const day of days) {
		const mk = monthKey(day);
		if (!seen.has(mk)) {
			seen.add(mk);
			bucketKeys.push(mk);
		}
	}

	const buckets = new Map<string, Checkout[]>();
	for (const bk of bucketKeys) buckets.set(bk, []);
	for (const [dayKey, dayCheckouts] of Object.entries(grouped)) {
		if (dayCheckouts.length === 0) continue;
		const cd = Temporal.PlainDate.from(dayKey);
		const mk = monthKey(cd);
		buckets.get(mk)?.push(...dayCheckouts);
	}

	return bucketKeys.map((bk) => {
		const [, mm] = bk.split("-");
		const monthIdx = Number(mm) - 1;
		const label = singleYear
			? MONTH_NAMES[monthIdx]
			: `${MONTH_NAMES[monthIdx]} '${bk.slice(2, 4)}`;
		return {
			id: bk,
			label,
			cash: sumByMethod(buckets.get(bk) ?? [], "cash"),
			card: sumByMethod(buckets.get(bk) ?? [], "card"),
			transfer: sumByMethod(buckets.get(bk) ?? [], "transfer"),
		};
	});
}

function yearKey(day: Temporal.PlainDate): string {
	return String(day.year);
}

function buildYearlyData(
	days: Temporal.PlainDate[],
	grouped: Record<string, Checkout[]>,
): ChartDataPoint[] {
	const bucketKeys: string[] = [];
	const seen = new Set<string>();
	for (const day of days) {
		const yk = yearKey(day);
		if (!seen.has(yk)) {
			seen.add(yk);
			bucketKeys.push(yk);
		}
	}

	const buckets = new Map<string, Checkout[]>();
	for (const bk of bucketKeys) buckets.set(bk, []);
	for (const [dayKey, dayCheckouts] of Object.entries(grouped)) {
		if (dayCheckouts.length === 0) continue;
		const cd = Temporal.PlainDate.from(dayKey);
		const yk = yearKey(cd);
		buckets.get(yk)?.push(...dayCheckouts);
	}

	return bucketKeys.map((bk) => ({
		id: bk,
		label: bk,
		cash: sumByMethod(buckets.get(bk) ?? [], "cash"),
		card: sumByMethod(buckets.get(bk) ?? [], "card"),
		transfer: sumByMethod(buckets.get(bk) ?? [], "transfer"),
	}));
}

function AmountTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: { value: number; dataKey: string }[];
	label?: string;
}) {
	if (!active || !payload || payload.length === 0) return null;

	const total = payload.reduce((sum, p) => sum + p.value, 0);

	return (
		<div className="bg-slate-900 shadow-lg px-3 py-2 rounded-lg text-white text-xs whitespace-nowrap">
			<div className="mb-1 font-medium text-slate-400">{label}</div>
			{payload.map((entry) => {
				const key = entry.dataKey as PaymentMethod;
				const cfg = barConfig[key];
				return (
					<div key={key} className="flex items-center gap-2">
						<span
							className="rounded-sm size-2 shrink-0"
							style={{ backgroundColor: cfg.fill }}
						/>
						<span>{cfg.label}:</span>
						<span className="font-semibold tabular-nums">
							{formatGEL(entry.value)}
						</span>
					</div>
				);
			})}
			<div className="flex items-center gap-2 mt-1.5 pt-1.5 border-slate-700 border-t font-semibold">
				<span>Total:</span>
				<span className="tabular-nums">{formatGEL(total)}</span>
			</div>
		</div>
	);
}

function LegendContent() {
	return (
		<div className="flex justify-center items-center gap-4 mt-4 font-medium text-xs">
			{orderedMethods.map((method) => (
				<div key={method} className="flex items-center gap-1.5">
					<span
						className="rounded-sm w-2.5 h-2.5"
						style={{ backgroundColor: barConfig[method].fill }}
					/>
					<span className="text-slate-500">{barConfig[method].label}</span>
				</div>
			))}
		</div>
	);
}

const titleLabels: Record<DatePreset, string> = {
	today: "Hourly",
	week: "Daily",
	month: "Daily",
	year: "Monthly",
	all: "Yearly",
};

export function BarChart({ checkouts, range, preset }: BarChartProps) {
	const days = eachDayInRange(range.from, range.to);
	const dayCount = days.length;
	const grouped = groupByDay(checkouts);

	let chartData: ChartDataPoint[];
	let chartTitle: string;

	switch (preset) {
		case "today":
			chartData = buildHourlyData(checkouts);
			chartTitle = "Hourly";
			break;
		case "week":
			chartData = buildWeekdayData(days, grouped);
			chartTitle = "Daily";
			break;
		case "month":
			chartData = buildMonthdayData(days, grouped);
			chartTitle = "Daily";
			break;
		case "year":
			chartData = buildMonthlyData(days, grouped, true);
			chartTitle = "Monthly";
			break;
		case "all": {
			if (dayCount < 730) {
				chartData = buildMonthlyData(days, grouped, dayCount > 365);
				chartTitle = "Monthly";
			} else {
				chartData = buildYearlyData(days, grouped);
				chartTitle = "Yearly";
			}
			break;
		}
	}

	if (checkouts.length === 0) {
		return (
			<Card className="p-10">
				<div className="text-center">
					<div className="mb-3 text-4xl">📊</div>
					<h3 className="mb-1 font-semibold text-slate-900 text-base">
						No data for this period
					</h3>
					<p className="text-slate-500 text-sm">
						Try selecting a different date range or log some checkouts.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="font-semibold text-slate-900 text-base">
					{chartTitle} Activity
					<span className="ml-2 font-normal text-slate-400 text-sm">
						{checkouts.length} checkouts
					</span>
				</h2>
			</div>

			<RechartsBarChart
				style={{ width: "100%", height: 360, fontSize: 11 }}
				responsive
				data={chartData}
				margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					stroke="#e2e8f0"
					vertical={false}
				/>
				<XAxis
					dataKey="label"
					tick={{ fill: "#94a3b8", fontSize: 10 }}
					tickLine={false}
					axisLine={{ stroke: "#e2e8f0" }}
					minTickGap={20}
					interval="preserveStartEnd"
				/>
				<YAxis
					tickFormatter={(value: number) => `₾ ${(value / 100).toFixed(0)}`}
					tick={{ fill: "#94a3b8", fontSize: 11 }}
					tickLine={false}
					axisLine={false}
					width="auto"
					niceTicks="snap125"
				/>
				<Tooltip content={<AmountTooltip />} cursor={{ fill: "#f1f5f9" }} />
				<Bar
					dataKey="cash"
					stackId="a"
					fill={barConfig.cash.fill}
					radius={[2, 2, 0, 0]}
					maxBarSize={40}
				/>
				<Bar
					dataKey="card"
					stackId="a"
					fill={barConfig.card.fill}
					radius={[2, 2, 0, 0]}
					maxBarSize={40}
				/>
				<Bar
					dataKey="transfer"
					stackId="a"
					fill={barConfig.transfer.fill}
					radius={[2, 2, 0, 0]}
					maxBarSize={40}
				/>
				<Legend content={<LegendContent />} />
			</RechartsBarChart>
		</Card>
	);
}