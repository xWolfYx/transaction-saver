import {
	type Checkout,
	GEL_DIVISOR,
	PAYMENT_METHOD,
	type PaymentMethod,
} from "@tally/shared";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

interface CheckoutFormProps {
	onSubmit: (checkout: Omit<Checkout, "id">) => void;
}

const methods = Object.keys(PAYMENT_METHOD) as PaymentMethod[];

const methodIcons: Record<PaymentMethod, string> = {
	cash: "💵",
	card: "💳",
	transfer: "🏦",
};

function nowLocalDatetime(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
	const [selected, setSelected] = useState<PaymentMethod>("cash");
	const [amount, setAmount] = useState("");
	const [datetime, setDatetime] = useState(nowLocalDatetime);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const parsedAmount = parseFloat(amount);
		if (!parsedAmount || parsedAmount <= 0) return;

		onSubmit({
			method: selected,
			amount: Math.round(parsedAmount * GEL_DIVISOR),
			timestamp: new Date(datetime).toISOString(),
		});

		setAmount("");
		setDatetime(nowLocalDatetime());
	};

	return (
		<Card className="p-6">
			<h2 className="mb-5 font-semibold text-slate-900 text-base">
				New Checkout
			</h2>
			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<div className="block mb-3 font-medium text-slate-700 text-sm">
						Payment Method
					</div>
					<div className="gap-3 grid grid-cols-3">
						{methods.map((method) => {
							const active = selected === method;
							return (
								<label
									key={method}
									className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all ${
										active
											? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
											: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									<input
										type="radio"
										name="method"
										value={method}
										checked={active}
										onChange={() => setSelected(method)}
										className="sr-only"
									/>
									<span className="text-lg">{methodIcons[method]}</span>
									{PAYMENT_METHOD[method]}
								</label>
							);
						})}
					</div>
				</div>

				<Input
					id="amount"
					label="Amount (₾)"
					type="number"
					min="0.01"
					step="0.01"
					placeholder="0.00"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					required
				/>

				<Input
					id="datetime"
					label="Date & Time"
					type="datetime-local"
					value={datetime}
					onChange={(e) => setDatetime(e.target.value)}
					required
				/>

				<div className="pt-1">
					<Button type="submit" size="lg" className="w-full">
						Log Checkout
					</Button>
				</div>
			</form>
		</Card>
	);
}
