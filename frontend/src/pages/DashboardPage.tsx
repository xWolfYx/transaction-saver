import { type Checkout, PAYMENT_METHOD, type PaymentMethod } from "@tally/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart } from "../components/BarChart";
import { CheckoutHistory } from "../components/CheckoutHistory";
import { DateRangePicker } from "../components/DateRangePicker";
import { ExportButton } from "../components/ExportButton";
import { PageLayout } from "../components/layout/PageLayout";
import { Stats } from "../components/Stats";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { showToast } from "../lib/toast";
import { showUndoToast } from "../lib/undo-toast";
import { filterByDateRange, getDateRange, type DatePreset } from "../lib/utils";
import { useCheckoutStore } from "../store/checkout.store";

type SortDir = "none" | "amount-asc" | "amount-desc";

const PAGE_SIZES = [10, 25, 50] as const;

const methodOptions: { value: PaymentMethod | ""; label: string }[] = [
	{ value: "", label: "All Methods" },
	...Object.entries(PAYMENT_METHOD).map(([key, label]) => ({
		value: key as PaymentMethod,
		label,
	})),
];

export function DashboardPage() {
	const [ready, setReady] = useState(false);
	const checkouts = useCheckoutStore((s) => s.checkouts);
	const error = useCheckoutStore((s) => s.error);
	const fetchCheckouts = useCheckoutStore((s) => s.fetchCheckouts);
	const addCheckout = useCheckoutStore((s) => s.addCheckout);
	const updateCheckout = useCheckoutStore((s) => s.updateCheckout);
	const deleteCheckout = useCheckoutStore((s) => s.deleteCheckout);

	const currentPreset = useRef<DatePreset>("today");
	const [range, setRange] = useState(() => getDateRange("today"));

	// Table state
	const [methodFilter, setMethodFilter] = useState<PaymentMethod | "">("");
	const [sortDir, setSortDir] = useState<SortDir>("none");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(10);

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

	const filteredByDate = filterByDateRange(checkouts, range.from, range.to);

	const processed = useMemo(() => {
		// Filter by method
		let result = filteredByDate;
		if (methodFilter) {
			result = result.filter((c) => c.method === methodFilter);
		}

		// Sort by amount
		if (sortDir === "amount-asc") {
			result = [...result].sort((a, b) => a.amount - b.amount);
		} else if (sortDir === "amount-desc") {
			result = [...result].sort((a, b) => b.amount - a.amount);
		}

		return result;
	}, [filteredByDate, methodFilter, sortDir]);

	const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const paginated = processed.slice(
		(safePage - 1) * pageSize,
		safePage * pageSize,
	);

	const handleDelete = async (id: string) => {
		const deletedCheckout = checkouts.find((c) => c.id === id);
		if (!deletedCheckout) return;
		try {
			await deleteCheckout(id);
			showUndoToast("Transaction deleted", async () => {
				try {
					const { id: _id, ...data } = deletedCheckout;
					await addCheckout(data);
					showToast.success("Transaction restored");
				} catch {
					showToast.error("Failed to restore transaction");
				}
			});
		} catch {
			showToast.error("Failed to delete transaction");
		}
	};

	const handleEdit = async (updated: Checkout) => {
		const oldCheckout = checkouts.find((c) => c.id === updated.id);
		if (!oldCheckout) return;
		try {
			const { id, ...rest } = updated;
			await updateCheckout(id, rest);
			showUndoToast("Transaction updated", async () => {
				try {
					const { id: oldId, ...oldRest } = oldCheckout;
					await updateCheckout(oldId, oldRest);
					showToast.success("Edit undone");
				} catch {
					showToast.error("Failed to undo edit");
				}
			});
		} catch {
			showToast.error("Failed to update transaction");
		}
	};

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
				<div className="space-y-4">
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
			<div className="space-y-4">
				<Stats checkouts={filteredByDate} />

				<div className="bg-white border border-slate-200/80 rounded-xl">
					<div className="flex sm:flex-row flex-col sm:items-center gap-3 px-4 pt-4 pb-2 border-b border-slate-100">
						<div className="flex-1">
							<DateRangePicker onChange={handleRangeChange} />
						</div>
						<div className="shrink-0">
							<ExportButton
								checkouts={filteredByDate}
								filename={`checkouts-${range.from.toString()}-to-${range.to.toString()}.csv`}
							/>
						</div>
					</div>
					<BarChart checkouts={filteredByDate} range={range} preset={currentPreset.current} />
				</div>

				{/* Filters & Table */}
				<div className="flex sm:flex-row flex-col sm:items-center gap-3">
					<select
						value={methodFilter}
						onChange={(e) => {
							setMethodFilter(e.target.value as PaymentMethod | "");
							setPage(1);
						}}
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
					>
						{methodOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>

					<button
						type="button"
						onClick={() => {
							setSortDir((prev) => {
								if (prev === "none") return "amount-desc";
								if (prev === "amount-desc") return "amount-asc";
								return "none";
							});
							setPage(1);
						}}
						className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm shadow-sm transition-all ${
							sortDir === "none"
								? "border-slate-200 text-slate-500 bg-white hover:bg-slate-50"
								: "border-brand-300 text-brand-700 bg-brand-50"
						}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={`transition-transform ${
								sortDir === "amount-asc" ? "rotate-180" : ""
							}`}
						>
							<path d="M6 9l6-6 6 6M6 15l6 6 6-6" />
						</svg>
						{sortDir === "none"
							? "Sort by Amount"
							: sortDir === "amount-desc"
								? "Highest first"
								: "Lowest first"}
					</button>

					<div className="sm:ml-auto flex items-center gap-2 text-sm text-slate-500">
						<span>Show</span>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
								setPage(1);
							}}
							className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
						>
							{PAGE_SIZES.map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
						<span>per page</span>
					</div>
				</div>

				<CheckoutHistory
					checkouts={paginated}
					onDelete={handleDelete}
					onEdit={handleEdit}
				/>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							disabled={safePage <= 1}
							onClick={() => setPage(safePage - 1)}
						>
							Previous
						</Button>
						<span className="px-3 text-sm text-slate-500 tabular-nums">
							Page {safePage} of {totalPages}
						</span>
						<Button
							variant="ghost"
							size="sm"
							disabled={safePage >= totalPages}
							onClick={() => setPage(safePage + 1)}
						>
							Next
						</Button>
					</div>
				)}
			</div>
		</PageLayout>
	);
}