import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { GEL_DIVISOR, PAYMENT_METHOD, type PaymentMethod, type Checkout } from "../types";

interface EditModalProps {
	checkout: Checkout;
	onSave: (checkout: Checkout) => void;
	onClose: () => void;
}

const methods = Object.keys(PAYMENT_METHOD) as PaymentMethod[];

const methodIcons: Record<PaymentMethod, string> = {
	cash: "💵",
	card: "💳",
	transfer: "🏦",
};

function toLocalDatetime(isoString: string): string {
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EditModal({ checkout, onSave, onClose }: EditModalProps) {
	const [method, setMethod] = useState<PaymentMethod>(checkout.method);
	const [amount, setAmount] = useState((checkout.amount / GEL_DIVISOR).toFixed(2));
	const [datetime, setDatetime] = useState(toLocalDatetime(checkout.timestamp));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const parsedAmount = parseFloat(amount);
		if (!parsedAmount || parsedAmount <= 0) return;

		onSave({
			...checkout,
			method,
			amount: Math.round(parsedAmount * GEL_DIVISOR),
			timestamp: new Date(datetime).toISOString(),
		});
	};

	return (
		<div
			className="z-50 fixed inset-0 flex justify-center items-center bg-slate-900/40 backdrop-blur-sm p-4"
			onClick={onClose}
		>
			<div
				className="bg-white shadow-2xl rounded-2xl w-full max-w-md"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="px-6 pt-6 pb-2">
					<h2 className="font-semibold text-slate-900 text-lg">
						Edit Checkout
					</h2>
					<p className="mt-0.5 text-slate-500 text-sm">
						Update the details below and save.
					</p>
				</div>
				<form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
					<div>
						<div className="block mb-3 font-medium text-slate-700 text-sm">
							Payment Method
						</div>
						<div className="gap-3 grid grid-cols-3">
							{methods.map((m) => {
								const active = method === m;
								return (
									<label
										key={m}
										className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
											active
												? "border-brand-500 bg-brand-50 text-brand-700"
												: "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
										}`}
									>
										<input
											type="radio"
											name="method"
											value={m}
											checked={active}
											onChange={() => setMethod(m)}
											className="sr-only"
										/>
										<span className="text-lg">{methodIcons[m]}</span>
										{PAYMENT_METHOD[m]}
									</label>
								);
							})}
						</div>
					</div>

					<Input
						id="edit-amount"
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
						id="edit-datetime"
						label="Date & Time"
						type="datetime-local"
						value={datetime}
						onChange={(e) => setDatetime(e.target.value)}
						required
					/>

					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="secondary"
							className="flex-1"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button type="submit" className="flex-1">
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
