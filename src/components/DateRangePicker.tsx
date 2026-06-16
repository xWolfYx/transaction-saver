import { useState } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { getDateRange, toISOString, today } from '../lib/utils';

type Preset = 'today' | 'week' | 'month';

interface DateRangePickerProps {
  onChange: (range: { from: Temporal.PlainDate; to: Temporal.PlainDate }) => void;
}

const presets: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>('today');
  const [fromDate, setFromDate] = useState(toISOString(today()));
  const [toDate, setToDate] = useState(toISOString(today().add({ days: 1 })));

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    const range = getDateRange(preset);
    setFromDate(toISOString(range.from));
    setToDate(toISOString(range.to));
    onChange(range);
  };

  const handleCustomChange = (field: 'from' | 'to', value: string) => {
    setActivePreset(null as unknown as Preset);
    if (field === 'from') {
      setFromDate(value);
    } else {
      setToDate(value);
    }

    try {
      const from = field === 'from' ? Temporal.PlainDate.from(value) : Temporal.PlainDate.from(fromDate);
      const to = field === 'to' ? Temporal.PlainDate.from(value) : Temporal.PlainDate.from(toDate);
      if (Temporal.PlainDate.compare(from, to) < 0) {
        onChange({ from, to });
      }
    } catch {
      // invalid date, ignore
    }
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">
            Time Period
          </label>
          <div className="flex gap-2">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePreset(key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activePreset === key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Input
            id="date-from"
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => handleCustomChange('from', e.target.value)}
            className="w-40"
          />
          <Input
            id="date-to"
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => handleCustomChange('to', e.target.value)}
            className="w-40"
          />
        </div>
      </div>
    </Card>
  );
}
