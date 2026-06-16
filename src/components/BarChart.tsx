import { Card } from './ui/Card';
import type { Checkout, PaymentMethod } from '../types';
import { groupByDay, eachDayInRange, toISOString } from '../lib/utils';

interface BarChartProps {
  checkouts: Checkout[];
  range: { from: Temporal.PlainDate; to: Temporal.PlainDate };
}

const barConfig: Record<PaymentMethod, { color: string; label: string }> = {
  cash: { color: 'bg-success-500', label: 'Cash' },
  card: { color: 'bg-brand-500', label: 'Card' },
  transfer: { color: 'bg-warn-500', label: 'Transfer' },
};

const orderedMethods: PaymentMethod[] = ['cash', 'card', 'transfer'];

export function BarChart({ checkouts, range }: BarChartProps) {
  const days = eachDayInRange(range.from, range.to);
  const grouped = groupByDay(checkouts);

  const maxCount = Math.max(
    ...days.map((day) => {
      const key = toISOString(day);
      return grouped[key]?.length ?? 0;
    }),
    1,
  );

  if (checkouts.length === 0) {
    return (
      <Card className="p-10">
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No data for this period
          </h3>
          <p className="text-sm text-slate-500">
            Try selecting a different date range or log some checkouts.
          </p>
        </div>
      </Card>
    );
  }

  const BAR_MAX_HEIGHT = 176; // px, equivalent to h-44

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Daily Activity
          <span className="ml-2 text-sm font-normal text-slate-400">
            {checkouts.length} checkouts
          </span>
        </h2>
        <div className="flex items-center gap-4 text-xs font-medium">
          {orderedMethods.map((method) => (
            <div key={method} className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-sm ${barConfig[method].color}`}
              />
              <span className="text-slate-500">{barConfig[method].label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2" style={{ height: `${BAR_MAX_HEIGHT + 24}px` }}>
        {days.map((day) => {
          const key = toISOString(day);
          const dayCheckouts = grouped[key] ?? [];
          const hasData = dayCheckouts.length > 0;

          // Build segments: each method gets a colored slice
          const segments = orderedMethods
            .map((method) => {
              const count = dayCheckouts.filter((c) => c.method === method).length;
              if (count === 0) return null;
              const pxHeight = Math.max((count / maxCount) * BAR_MAX_HEIGHT, 6);
              return { method, count, pxHeight };
            })
            .filter(Boolean) as { method: PaymentMethod; count: number; pxHeight: number }[];

          const totalHeight = segments.reduce((sum, s) => sum + s.pxHeight, 0);

          return (
            <div
              key={key}
              className="flex-1 flex flex-col items-center gap-1.5 group relative"
            >
              {/* Tooltip */}
              {hasData && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-slate-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    {segments.map((s) => (
                      <span key={s.method}>
                        {barConfig[s.method].label}: {s.count}
                        {s !== segments[segments.length - 1] ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bar area — fixed height, segments stacked from bottom */}
              <div
                className="w-full relative rounded-t-md overflow-hidden"
                style={{ height: `${BAR_MAX_HEIGHT}px` }}
              >
                {hasData ? (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex flex-col"
                    style={{ height: `${totalHeight}px` }}
                  >
                    {segments.map((s) => (
                      <div
                        key={s.method}
                        className={`${barConfig[s.method].color} w-full transition-all duration-300 first:rounded-t-md`}
                        style={{ height: `${s.pxHeight}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md bg-slate-100" />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                {day.toLocaleString('en-GB', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
