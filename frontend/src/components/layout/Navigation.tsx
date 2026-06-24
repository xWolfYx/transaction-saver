import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { Checkout } from "@tally/shared";
import { CheckoutForm } from "../CheckoutForm";
import { showToast } from "../../lib/toast";
import { useCheckoutStore } from "../../store/checkout.store";

const links = [
	{
		to: "/",
		label: "Log",
		end: true,
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="8" y1="6" x2="21" y2="6" />
				<line x1="8" y1="12" x2="21" y2="12" />
				<line x1="8" y1="18" x2="21" y2="18" />
				<line x1="3" y1="6" x2="3.01" y2="6" />
				<line x1="3" y1="12" x2="3.01" y2="12" />
				<line x1="3" y1="18" x2="3.01" y2="18" />
			</svg>
		),
	},
	{
		to: "/dashboard",
		label: "Dashboard",
		end: false,
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
			</svg>
		),
	},
];

export function Navigation() {
	const [collapsed, setCollapsed] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const addCheckout = useCheckoutStore((s) => s.addCheckout);

	const handleSubmit = async (data: Omit<Checkout, "id">) => {
		try {
			await addCheckout(data);
			showToast.success("Checkout logged");
			setModalOpen(false);
		} catch {
			showToast.error("Failed to log checkout");
		}
	};

	return (
		<>
			<aside
				className={`sticky top-0 z-40 flex flex-col bg-white/80 backdrop-blur-md border-slate-200/80 border-r h-screen transition-[width] duration-300 ease-in-out ${
					collapsed ? "w-16" : "w-60"
				}`}
			>
				{/* Logo */}
				<div className="flex items-center h-16 px-3 border-b border-slate-200/80">
					<div className="flex items-center gap-3 min-w-0">
						<div className="flex-shrink-0 flex justify-center items-center bg-brand-600 rounded-lg w-8 h-8 font-bold text-white text-sm">
							₾
						</div>
						<span
							className={`font-semibold text-slate-900 text-lg tracking-tight overflow-hidden whitespace-nowrap transition-all duration-300 ${
								collapsed
									? "max-w-0 opacity-0"
									: "max-w-40 opacity-100"
							}`}
						>
							Tally
						</span>
					</div>
				</div>

				{/* New Checkout Button */}
				<div className="px-3 pt-3">
					<button
						type="button"
						onClick={() => setModalOpen(true)}
						className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-all duration-150"
						title="New Checkout"
					>
						<span className="flex-shrink-0 flex justify-center items-center w-5 h-5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
						</span>
						<span
							className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
								collapsed
									? "max-w-0 opacity-0"
									: "max-w-40 opacity-100"
							}`}
						>
							New Checkout
						</span>
					</button>
				</div>

				{/* Nav Links */}
				<nav className="flex flex-col gap-1 p-3 flex-1">
					{links.map(({ to, label, end, icon }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
									isActive
										? "bg-brand-100 text-brand-700"
										: "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
								}`
							}
						>
							<span className="flex-shrink-0 flex justify-center items-center w-5 h-5">
								{icon}
							</span>
							<span
								className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
									collapsed
										? "max-w-0 opacity-0"
										: "max-w-40 opacity-100"
								}`}
							>
								{label}
							</span>
						</NavLink>
					))}
				</nav>

				{/* Collapse Toggle */}
				<div className="p-3 border-t border-slate-200/80">
					<button
						type="button"
						onClick={() => setCollapsed((prev) => !prev)}
						className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-150"
						title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<span className="flex-shrink-0 flex justify-center items-center w-5 h-5">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className={`transition-transform duration-300 ${
									collapsed ? "" : "rotate-180"
								}`}
							>
								<path d="M15 3L9 12L15 21" />
							</svg>
						</span>
						<span
							className={`overflow-hidden whitespace-nowrap text-xs transition-all duration-300 ${
								collapsed
									? "max-w-0 opacity-0"
									: "max-w-40 opacity-100"
							}`}
						>
							Collapse
						</span>
					</button>
				</div>
			</aside>

			{/* New Checkout Modal */}
			{modalOpen && (
				<div
					className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm"
					onClick={() => setModalOpen(false)}
				>
					<div
						className="w-full mx-4 max-w-md"
						onClick={(e) => e.stopPropagation()}
					>
						<CheckoutForm onSubmit={handleSubmit} />
					</div>
				</div>
			)}
		</>
	);
}