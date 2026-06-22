interface StatCardProps {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	accent?: string;
}

export function StatCard({
	label,
	value,
	icon,
	accent = "text-slate-900",
}: StatCardProps) {
	return (
		<div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 border border-slate-200/80 rounded-xl">
			<div className="flex items-center gap-2 mb-2">
				{icon && <span className="text-slate-400">{icon}</span>}
				<span className="font-medium text-slate-400 text-xs uppercase tracking-wider">
					{label}
				</span>
			</div>
			<div className={`text-2xl font-bold tracking-tight ${accent}`}>
				{value}
			</div>
		</div>
	);
}
