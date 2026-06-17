import { Card } from "./ui/Card";
import type { Checkout, PaymentMethod } from "../types";
import { groupByDay, eachDayInRange, toISOString } from "../lib/utils";
import type { Temporal } from "temporal-polyfill";

interface BarChartProps {
	checkouts: Checkout[];
	range: { from: Temporal.PlainDate; to: Temporal.PlainDate };
}

const barConfig: Record<PaymentMethod, { color: string; label: string }> = {
	cash: { color: "bg-success-500", label: "Cash" },
	card: { color: "bg-brand-500", label: "Card" },
	transfer: { color: "bg-warn-500", label: "Transfer" },
};

const orderedMethods: PaymentMethod[] = ["cash", "card", "transfer"];

export function BarChart({ checkouts, range }: BarChartProps) {
	const days = eachDayInRange(range.from, range.to);
	const grouped = groupByDay(checkouts);

	const maxCount = Math.max(
		...days.map((day) => {
			const key = toISOString(day);
			return grouped[key]?.length ?? 0;
		}),
		1,
	);

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

	const BAR_MAX_HEIGHT = 176; // px, equivalent to h-44

	return (
		<Card className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="font-semibold text-slate-900 text-base">
					Daily Activity
					<span className="ml-2 font-normal text-slate-400 text-sm">
						{checkouts.length} checkouts
					</span>
				</h2>
				<div className="flex items-center gap-4 font-medium text-xs">
					{orderedMethods.map((method) => (
						<div key={method} className="flex items-center gap-1.5">
							<span
								className={`h-2.5 w-2.5 rounded-sm ${barConfig[method].color}`}
							/>
							<span className="text-slate-500">{barConfig[method].label}</span>
						</div>
					))}
				</div>
			</div>

			<div
				className="flex items-end gap-2"
				style={{ height: `${BAR_MAX_HEIGHT + 24}px` }}
			>
				{days.map((day) => {
					const key = toISOString(day);
					const dayCheckouts = grouped[key] ?? [];
					const hasData = dayCheckouts.length > 0;

					// Build segments: each method gets a colored slice
					const segments = orderedMethods
						.map((method) => {
							const count = dayCheckouts.filter(
								(c) => c.method === method,
							).length;
							if (count === 0) return null;
							const pxHeight = Math.max((count / maxCount) * BAR_MAX_HEIGHT, 6);
							return { method, count, pxHeight };
						})
						.filter(Boolean) as {
						method: PaymentMethod;
						count: number;
						pxHeight: number;
					}[];

					const totalHeight = segments.reduce((sum, s) => sum + s.pxHeight, 0);

					return (
						<div
							key={key}
							className="group relative flex flex-col flex-1 items-center gap-1.5"
						>
							{/* Tooltip */}
							{hasData && (
								<div className="hidden group-hover:block -top-10 left-1/2 z-10 absolute -translate-x-1/2">
									<div className="bg-slate-900 shadow-lg px-2.5 py-1.5 rounded-md text-white text-xs whitespace-nowrap">
										{segments.map((s) => (
											<span key={s.method}>
												{barConfig[s.method].label}: {s.count}
												{s !== segments[segments.length - 1] ? " · " : ""}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Bar area — fixed height, segments stacked from bottom */}
							<div
								className="relative rounded-t-md w-full overflow-hidden"
								style={{ height: `${BAR_MAX_HEIGHT}px` }}
							>
								{hasData ? (
									<div
										className="right-0 bottom-0 left-0 absolute flex flex-col"
										style={{ height: `${totalHeight}px` }}
									>
										{segments.map((s) => (
											<div
												key={s.method}
												className={`${barConfig[s.method].color} w-full transition-all duration-300 first:rounded-t-md`}
												style={{ height: `${s.pxHeight}px` }}
											/>
										))}
									</div>
								) : (
									<div className="right-0 bottom-0 left-0 absolute bg-slate-100 rounded-t-md h-1" />
								)}
							</div>

							{/* Label */}
							<span className="font-medium tabular-nums text-[10px] text-slate-400">
								{day.toLocaleString("en-GB", {
									day: "2-digit",
									month: "2-digit",
								})}
							</span>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
