import { useState } from "react";
import { DateRangePicker } from "../components/DateRangePicker";
import { Stats } from "../components/Stats";
import { BarChart } from "../components/BarChart";
import { ExportButton } from "../components/ExportButton";
import { PageLayout } from "../components/layout/PageLayout";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getDateRange, filterByDateRange } from "../lib/utils";
import type { Checkout } from "../types";

export function DashboardPage() {
	const [checkouts] = useLocalStorage<Checkout[]>("checkouts", []);
	const [range, setRange] = useState(() => getDateRange("today"));

	const filtered = filterByDateRange(checkouts, range.from, range.to);

	return (
		<PageLayout>
			<div className="space-y-6">
				<DateRangePicker onChange={setRange} />
				<Stats checkouts={filtered} />
				<div className="flex justify-end">
					<ExportButton
						checkouts={filtered}
						filename={`checkouts-${range.from.toString()}-to-${range.to.toString()}.csv`}
					/>
				</div>
				<BarChart checkouts={filtered} range={range} />
			</div>
		</PageLayout>
	);
}
