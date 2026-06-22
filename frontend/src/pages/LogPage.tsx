import { CheckoutForm } from "../components/CheckoutForm";
import { CheckoutHistory } from "../components/CheckoutHistory";
import { Stats } from "../components/Stats";
import { ExportButton } from "../components/ExportButton";
import { PageLayout } from "../components/layout/PageLayout";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { showToast } from "../lib/toast";
import { GEL_DIVISOR, type Checkout } from "../types";

export function LogPage() {
	const [checkouts, setCheckouts] = useLocalStorage<Checkout[]>(
		"checkouts",
		[],
	);

	const handleSubmit = (data: Omit<Checkout, "id">) => {
		const newCheckout: Checkout = {
			id: crypto.randomUUID(),
			...data,
		};
		setCheckouts((prev) => [newCheckout, ...prev]);
		showToast.success(
			`${newCheckout.method} — ₾${(newCheckout.amount / GEL_DIVISOR).toFixed(2)} logged`,
		);
	};

	const handleDelete = (id: string) => {
		setCheckouts((prev) => prev.filter((c) => c.id !== id));
		showToast.info("Checkout deleted");
	};

	const handleEdit = (updated: Checkout) => {
		setCheckouts((prev) =>
			prev.map((c) => (c.id === updated.id ? updated : c)),
		);
		showToast.success("Checkout updated");
	};

	return (
		<PageLayout>
			<div className="space-y-6">
				<CheckoutForm onSubmit={handleSubmit} />
				<Stats checkouts={checkouts} />
				<div className="flex justify-end">
					<ExportButton checkouts={checkouts} />
				</div>
				<CheckoutHistory
					checkouts={checkouts}
					onDelete={handleDelete}
					onEdit={handleEdit}
				/>
			</div>
		</PageLayout>
	);
}
