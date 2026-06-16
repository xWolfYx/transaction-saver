import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { EditModal } from './EditModal';
import { formatDate } from '../lib/utils';
import type { Checkout } from '../types';

interface CheckoutHistoryProps {
  checkouts: Checkout[];
  onDelete: (id: string) => void;
  onEdit: (checkout: Checkout) => void;
}

export function CheckoutHistory({ checkouts, onDelete, onEdit }: CheckoutHistoryProps) {
  const [editing, setEditing] = useState<Checkout | null>(null);

  if (checkouts.length === 0) {
    return (
      <Card className="p-10">
        <div className="text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No checkouts yet
          </h3>
          <p className="text-sm text-slate-500">
            Start by logging your first checkout above.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold text-slate-900">
            History
            <span className="ml-2 text-sm font-normal text-slate-400">
              {checkouts.length} {checkouts.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {checkouts.map((checkout) => (
                <tr
                  key={checkout.id}
                  className="group transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3.5 text-slate-600 tabular-nums whitespace-nowrap">
                    {formatDate(checkout.timestamp)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge method={checkout.method} />
                  </td>
                  <td className="px-6 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                    ₾ {checkout.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(checkout)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(checkout.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {editing && (
        <EditModal
          checkout={editing}
          onSave={(updated) => {
            onEdit(updated);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
