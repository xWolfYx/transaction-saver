import type { Checkout } from "@tally/shared";
import { useEffect, useState } from "react";
import { CheckoutForm } from "../components/CheckoutForm";
import { CheckoutHistory } from "../components/CheckoutHistory";
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

	const handleSubmit = async (data: Omit<Checkout, "id">) => {
		try {
			await addCheckout(data);
			showToast.success("Checkout logged");
		} catch {
			showToast.error("Failed to log checkout");
		}
	};

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
					<Card className="p-6">
						<div className="mb-5 h-5 w-32 bg-slate-200 rounded animate-pulse" />
						<div className="space-y-4">
							<div className="flex gap-3">
								{/* biome-ignore lint/suspicious/noArrayIndexKey: static skeleton */
								[...Array(3)].map((_, i) => (
									<div
										key={`form-pill-${i}`}
										className="h-12 flex-1 bg-slate-200 rounded-xl animate-pulse"
									/>
								))}
							</div>
							<div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
						</div>
					</Card>

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
				<CheckoutForm onSubmit={handleSubmit} />
				<CheckoutHistory
					checkouts={todayTransactions}
					onDelete={handleDelete}
					onEdit={handleEdit}
				/>
			</div>
		</PageLayout>
	);
}