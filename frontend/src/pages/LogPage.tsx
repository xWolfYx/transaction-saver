import type { Checkout } from "@tally/shared";
import { useEffect, useState } from "react";
import { BarChart } from "../components/BarChart";
import { CheckoutHistory } from "../components/CheckoutHistory";
import { TodayPieChart } from "../components/TodayPieChart";
import { PageLayout } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { showToast } from "../lib/toast";
import { showUndoToast } from "../lib/undo-toast";
import { filterByDateRange, today } from "../lib/utils";
import { useCheckoutStore } from "../store/checkout.store";

export function LogPage() {
	const [ready, setReady] = useState(false);
	const checkouts = useCheckoutStore((s) => s.checkouts);
	const error = useCheckoutStore((s) => s.error);
	const fetchCheckouts = useCheckoutStore((s) => s.fetchCheckouts);
	const addCheckout = useCheckoutStore((s) => s.addCheckout);
	const updateCheckout = useCheckoutStore((s) => s.updateCheckout);
	const deleteCheckout = useCheckoutStore((s) => s.deleteCheckout);

	useEffect(() => {
		fetchCheckouts().then(() => setReady(true));
	}, [fetchCheckouts]);

	const handleDelete = async (id: string) => {
		const deletedCheckout = checkouts.find((c) => c.id === id);
		if (!deletedCheckout) return;
		try {
			await deleteCheckout(id);
			showUndoToast("Checkout deleted", async () => {
				try {
					const { id: _id, ...data } = deletedCheckout;
					await addCheckout(data);
					showToast.success("Checkout restored");
				} catch {
					showToast.error("Failed to restore checkout");
				}
			});
		} catch {
			showToast.error("Failed to delete checkout");
		}
	};

	const handleEdit = async (updated: Checkout) => {
		const oldCheckout = checkouts.find((c) => c.id === updated.id);
		if (!oldCheckout) return;
		try {
			const { id, ...rest } = updated;
			await updateCheckout(id, rest);
			showUndoToast("Checkout updated", async () => {
				try {
					const { id: oldId, ...oldRest } = oldCheckout;
					await updateCheckout(oldId, oldRest);
					showToast.success("Edit undone");
				} catch {
					showToast.error("Failed to undo edit");
				}
			});
		} catch {
			showToast.error("Failed to update checkout");
		}
	};

	const todayRange = today();
	const todayTransactions = filterByDateRange(
		checkouts,
		todayRange,
		todayRange.add({ days: 1 }),
	);

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
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="w-full lg:w-2/3">
							<Card className="p-6">
								<div className="bg-slate-200 rounded-xl h-[360px] animate-pulse" />
							</Card>
						</div>
						<div className="w-full lg:w-1/3">
							<Card className="p-6">
								<div className="bg-slate-200 rounded-xl h-[360px] animate-pulse" />
							</Card>
						</div>
					</div>

					<Card className="p-0 overflow-hidden">
						<div className="px-6 pt-5 pb-3">
							<div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
						</div>
						<div className="overflow-x-auto">
							<div className="divide-y divide-slate-50">
								{/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
								[...Array(5)].map((_, i) => (
									<div
										key={`row-${i}`}
										className="flex items-center gap-4 px-6 py-3.5"
									>
										<div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
										<div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
										<div className="h-4 w-20 bg-slate-200 rounded animate-pulse ml-auto" />
										<div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className="space-y-6">
				<div className="flex flex-col lg:flex-row gap-6">
					<div className="w-full lg:w-2/3">
						<BarChart
							checkouts={todayTransactions}
							range={{ from: todayRange, to: todayRange.add({ days: 1 }) }}
							preset="today"
						/>
					</div>
					<div className="w-full lg:w-1/3">
						<TodayPieChart checkouts={todayTransactions} />
					</div>
				</div>

				<CheckoutHistory
					checkouts={todayTransactions}
					onDelete={handleDelete}
					onEdit={handleEdit}
				/>
			</div>
		</PageLayout>
	);
}