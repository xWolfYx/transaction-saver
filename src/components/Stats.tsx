import { StatCard } from "./ui/StatCard";
import type { Checkout } from "../types";

interface StatsProps {
	checkouts: Checkout[];
}

export function Stats({ checkouts }: StatsProps) {
	const totalAmount = checkouts.reduce((sum, c) => sum + c.amount, 0);
	const cashAmount = checkouts
		.filter((c) => c.method === "cash")
		.reduce((sum, c) => sum + c.amount, 0);
	const cardAmount = checkouts
		.filter((c) => c.method === "card")
		.reduce((sum, c) => sum + c.amount, 0);
	const transferAmount = checkouts
		.filter((c) => c.method === "transfer")
		.reduce((sum, c) => sum + c.amount, 0);

	return (
		<div className="gap-4 grid grid-cols-2 lg:grid-cols-4">
			<StatCard
				label="Total"
				value={`₾ ${totalAmount.toFixed(2)}`}
				accent="text-slate-900"
				icon={<span className="text-lg">💰</span>}
			/>
			<StatCard
				label="Cash"
				value={`₾ ${cashAmount.toFixed(2)}`}
				accent="text-success-600"
				icon={<span className="text-lg">💵</span>}
			/>
			<StatCard
				label="Card"
				value={`₾ ${cardAmount.toFixed(2)}`}
				accent="text-brand-600"
				icon={<span className="text-lg">💳</span>}
			/>
			<StatCard
				label="Transfer"
				value={`₾ ${transferAmount.toFixed(2)}`}
				accent="text-warn-600"
				icon={<span className="text-lg">🏦</span>}
			/>
		</div>
	);
}
