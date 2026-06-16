interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
}

export function StatCard({ label, value, icon, accent = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</div>
    </div>
  );
}
