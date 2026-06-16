import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Log', end: true },
  { to: '/dashboard', label: 'Dashboard', end: false },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
            ₾
          </div>
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            Checkout Logger
          </span>
        </div>
        <nav className="flex items-center rounded-lg bg-slate-100 p-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
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
