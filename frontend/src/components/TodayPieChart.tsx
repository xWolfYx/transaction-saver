import type { Checkout, PaymentMethod } from "@tally/shared";
import { Label, Pie, PieChart as RechartsPieChart } from "recharts";
import { formatGEL } from "../lib/utils";
import { Card } from "./ui/Card";

interface TodayPieChartProps {
	checkouts: Checkout[];
}

type MethodKey = PaymentMethod | "unknown";

const COLORS: Record<MethodKey, string> = {
	cash: "#22c55e",
	card: "#6366f1",
	transfer: "#f97316",
	unknown: "#94a3b8",
};

const LABELS: Record<MethodKey, string> = {
	cash: "Cash",
	card: "Card",
	transfer: "Transfer",
	unknown: "Other",
};

export function TodayPieChart({ checkouts }: TodayPieChartProps) {
	const counts: Record<
		string,
		{ count: number; total: number }
	> = {};
	for (const c of checkouts) {
		const key = c.method in COLORS ? c.method : "unknown";
		if (!counts[key]) counts[key] = { count: 0, total: 0 };
		counts[key].count++;
		counts[key].total += c.amount;
	}

	const grandTotal = checkouts.reduce((sum, c) => sum + c.amount, 0);

	const data = Object.entries(counts)
		.filter(([, v]) => v.count > 0)
		.map(([method, v]) => ({
			name: LABELS[method as MethodKey] ?? method,
			key: method,
			value: v.total,
			count: v.count,
			fill: COLORS[method as MethodKey] ?? COLORS.unknown,
		}));

	if (data.length === 0) {
		return (
			<Card className="p-6">
				<h2 className="mb-2 font-semibold text-slate-900 text-base">
					By Method
				</h2>
				<div className="text-center">
					<div className="mb-3 text-4xl">🥧</div>
					<h3 className="font-semibold text-slate-900 text-base">
						No transactions today
					</h3>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<h2 className="mb-2 font-semibold text-slate-900 text-base">
				By Method
			</h2>
			<RechartsPieChart
				style={{ width: "100%", height: 220 }}
				responsive
				margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
			>
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={60}
					outerRadius={90}
					paddingAngle={3}
					dataKey="value"
					isAnimationActive
				>
					<Label
						value={formatGEL(grandTotal)}
						position="center"
						fill="#0f172a"
						fontSize={18}
						fontWeight={700}
					/>
				</Pie>
			</RechartsPieChart>

			<div className="flex flex-col gap-1.5 mt-2">
				{data.map((d) => (
					<div
						key={d.key}
						className="flex items-center gap-2 text-sm"
					>
						<span
							className="rounded-sm w-2.5 h-2.5 shrink-0"
							style={{ backgroundColor: d.fill }}
						/>
						<span className="text-slate-600">{d.name}</span>
						<span className="font-medium text-slate-900 ml-auto tabular-nums">
							{formatGEL(d.value)}
						</span>
						<span className="text-slate-400 text-xs tabular-nums">
							({d.count})
						</span>
					</div>
				))}
			</div>
		</Card>
	);
}