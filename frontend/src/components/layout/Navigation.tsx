import { NavLink } from "react-router-dom";

const links = [
	{ to: "/", label: "Log", end: true },
	{ to: "/dashboard", label: "Dashboard", end: false },
];

export function Navigation() {
	return (
		<header className="top-0 z-40 sticky bg-white/80 backdrop-blur-md border-slate-200/80 border-b">
			<div className="flex justify-between items-center mx-auto px-4 sm:px-6 max-w-6xl h-16">
				<div className="flex items-center gap-2.5">
					<div className="flex justify-center items-center bg-brand-600 rounded-lg w-8 h-8 font-bold text-white text-sm">
						₾
					</div>
					<span className="font-semibold text-slate-900 text-lg tracking-tight">
						Tally
					</span>
				</div>
				<nav className="flex items-center bg-slate-100 p-1 rounded-lg">
					{links.map(({ to, label, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className={({ isActive }) =>
								`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
									isActive
										? "bg-white text-slate-900 shadow-sm"
										: "text-slate-500 hover:text-slate-700"
								}`
							}
						>
							{label}
						</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
}
