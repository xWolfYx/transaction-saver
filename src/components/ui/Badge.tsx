import type { PaymentMethod } from '../../types';

const styles: Record<PaymentMethod, { bg: string; text: string; dot: string; label: string }> = {
  cash: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    dot: 'bg-success-600',
    label: 'Cash',
  },
  card: {
    bg: 'bg-brand-100',
    text: 'text-brand-700',
    dot: 'bg-brand-600',
    label: 'Card',
  },
  transfer: {
    bg: 'bg-warn-100',
    text: 'text-warn-700',
    dot: 'bg-warn-600',
    label: 'Transfer',
  },
};

interface BadgeProps {
  method: PaymentMethod;
}

export function Badge({ method }: BadgeProps) {
  const s = styles[method];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
