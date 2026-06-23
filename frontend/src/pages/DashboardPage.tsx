import { useEffect, useRef, useState } from "react";
import { BarChart } from "../components/BarChart";
import { DateRangePicker } from "../components/DateRangePicker";
import { ExportButton } from "../components/ExportButton";
import { PageLayout } from "../components/layout/PageLayout";
import { Stats } from "../components/Stats";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { filterByDateRange, getDateRange, type DatePreset } from "../lib/utils";
import { useCheckoutStore } from "../store/checkout.store";

export function DashboardPage() {
	const [ready, setReady] = useState(false);
	const checkouts = useCheckoutStore((s) => s.checkouts);
	const error = useCheckoutStore((s) => s.error);
	const fetchCheckouts = useCheckoutStore((s) => s.fetchCheckouts);

	const currentPreset = useRef<DatePreset>("today");
	const [range, setRange] = useState(() => getDateRange("today"));

	useEffect(() => {
		fetchCheckouts().then(() => setReady(true));
	}, [fetchCheckouts]);

	// Recompute "all" range when checkouts finish loading
	useEffect(() => {
		if (ready && currentPreset.current === "all") {
			setRange(getDateRange("all", checkouts));
		}
	}, [ready, checkouts]);

	const handleRangeChange = (
		newRange: { from: Temporal.PlainDate; to: Temporal.PlainDate },
		preset?: DatePreset,
	) => {
		if (preset) {
			// Prevent re-render when same preset is clicked (avoids animation freezes)
			if (preset === currentPreset.current) return;
			currentPreset.current = preset;
			if (preset === "all" && checkouts.length > 0) {
				setRange(getDateRange("all", checkouts));
				return;
			}
		}
		setRange(newRange);
	};

	const filtered = filterByDateRange(checkouts, range.from, range.to);

	if (error && !ready) {
		return (
			<PageLayout>
				<Card className="p-10">
					<div className="text-center">
						<div className="mb-3 text-4xl">⚠️</div>
						<h3 className="mb-1 font-semibold text-red-600 text-base">
							Something went wrong
						</h3>
						<p className="mb-4 text-slate-500 text-sm">{error}</p>
						<Button onClick={() => fetchCheckouts().then(() => setReady(true))}>
							Retry
						</Button>
					</div>
				</Card>
			</PageLayout>
		);
	}

	if (!ready) {
		return (
			<PageLayout>
				<div className="space-y-6">
					<div className="bg-slate-200 rounded-xl h-20 animate-pulse" />

					<div className="gap-4 grid grid-cols-2 lg:grid-cols-4">
						{/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */}
						{[...Array(4)].map((_, i) => (
							<div
								key={`stat-${i}`}
								className="bg-slate-200 rounded-xl h-24 animate-pulse"
							/>
						))}
					</div>

					<div className="flex justify-center items-center bg-slate-200 rounded-xl h-80 animate-pulse">
						<svg
							className="w-full h-full text-slate-300"
							viewBox="0 0 400 200"
							fill="none"
							preserveAspectRatio="none"
							role="img"
							aria-label="Loading chart"
						>
							<rect
								x="30"
								y="140"
								width="30"
								height="60"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="75"
								y="100"
								width="30"
								height="100"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="120"
								y="80"
								width="30"
								height="120"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="165"
								y="110"
								width="30"
								height="90"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="210"
								y="60"
								width="30"
								height="140"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="255"
								y="90"
								width="30"
								height="110"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="300"
								y="130"
								width="30"
								height="70"
								rx="4"
								fill="currentColor"
							/>
							<rect
								x="345"
								y="70"
								width="30"
								height="130"
								rx="4"
								fill="currentColor"
							/>
						</svg>
					</div>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className="space-y-6">
				<DateRangePicker onChange={handleRangeChange} />
				<Stats checkouts={filtered} />
				<div className="flex justify-end">
					<ExportButton
						checkouts={filtered}
						filename={`checkouts-${range.from.toString()}-to-${range.to.toString()}.csv`}
					/>
				</div>
				<BarChart checkouts={filtered} range={range} preset={currentPreset.current} />
			</div>
		</PageLayout>
	);
}