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
import type { Checkout, PaymentMethod } from "@tally/shared";
import { Card } from "./ui/Card";

interface BarChartProps {
	checkouts: Checkout[];
	range: { from: Temporal.PlainDate; to: Temporal.PlainDate };
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

function buildChartData(
	days: Temporal.PlainDate[],
	grouped: Record<string, Checkout[]>,
	dayCount: number,
): ChartDataPoint[] {
	if (dayCount <= 31) {
		return days.map((day) => {
			const key = toISOString(day);
			const checkouts = grouped[key] ?? [];
			return {
				id: key,
				label: day.toLocaleString("en-GB", {
					day: "2-digit",
					month: "2-digit",
				}),
				cash: sumByMethod(checkouts, "cash"),
				card: sumByMethod(checkouts, "card"),
				transfer: sumByMethod(checkouts, "transfer"),
			};
		});
	}

	// Weekly bucketing
	const weeks = new Map<string, Checkout[]>();
	for (const day of days) {
		const w = weekKey(day);
		if (!weeks.has(w)) weeks.set(w, []);
	}
	for (const [dayKey, dayCheckouts] of Object.entries(grouped)) {
		if (dayCheckouts.length === 0) continue;
		const cd = Temporal.PlainDate.from(dayKey);
		const w = weekKey(cd);
		weeks.get(w)?.push(...dayCheckouts);
	}

	return [...weeks.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, checkouts]) => {
			const [, weekNum] = key.split("-W");
			return {
				id: key,
				label: `W${weekNum}`,
				cash: sumByMethod(checkouts, "cash"),
				card: sumByMethod(checkouts, "card"),
				transfer: sumByMethod(checkouts, "transfer"),
			};
		});
}

function sumByMethod(checkouts: Checkout[], method: PaymentMethod): number {
	return checkouts
		.filter((c) => c.method === method)
		.reduce((sum, c) => sum + c.amount, 0);
}

function weekKey(day: Temporal.PlainDate): string {
	const firstJan = Temporal.PlainDate.from({
		year: day.year,
		month: 1,
		day: 1,
	});
	const daysSince = Number(day.since(firstJan).total({ unit: "days" }));
	const weekNum = Math.ceil((daysSince + firstJan.dayOfWeek + 1) / 7);
	return `${day.year}-W${String(Math.floor(weekNum)).padStart(2, "0")}`;
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

export function BarChart({ checkouts, range }: BarChartProps) {
	const days = eachDayInRange(range.from, range.to);
	const dayCount = days.length;
	const grouped = groupByDay(checkouts);

	const chartData = buildChartData(days, grouped, dayCount);

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
					{dayCount > 31 ? "Weekly Activity" : "Daily Activity"}
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
					niceTicks="snap125"
					interval={Math.max(1, Math.floor(chartData.length / 20))}
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
