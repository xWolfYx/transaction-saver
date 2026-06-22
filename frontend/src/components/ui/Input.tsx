import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	hint?: string;
}

export function Input({
	label,
	id,
	hint,
	className = "",
	...props
}: InputProps) {
	return (
		<div className="space-y-1.5">
			{label && (
				<label
					htmlFor={id}
					className="block font-medium text-slate-700 text-sm"
				>
					{label}
				</label>
			)}
			<input
				id={id}
				className={`block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className}`}
				{...props}
			/>
			{hint && <p className="text-slate-400 text-xs">{hint}</p>}
		</div>
	);
}
