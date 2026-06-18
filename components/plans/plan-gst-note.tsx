'use client';

import {
  Plan,
  getGstPercent,
  formatGstLabel,
  calculateTotalWithGst,
  currencySymbol,
} from '@/lib/api/plans';

interface PlanGstNoteProps {
  plan: Pick<Plan, 'pricePerYear' | 'gstPercent' | 'currency'>;
  /** Show "Total ₹X incl. GST" below the label */
  showTotal?: boolean;
  className?: string;
}

export function PlanGstNote({ plan, showTotal = false, className = '' }: PlanGstNoteProps) {
  const gstPercent = getGstPercent(plan);
  if (gstPercent <= 0 || plan.pricePerYear <= 0) {
    return null;
  }

  const symbol = currencySymbol(plan.currency);
  const total = calculateTotalWithGst(plan.pricePerYear, gstPercent);

  return (
    <div className={`text-xs text-muted-foreground ${className}`.trim()}>
      <p>{formatGstLabel(gstPercent)} applicable</p>
      {showTotal && (
        <p className="font-medium text-foreground/80 mt-0.5">
          Total {symbol}{total.toFixed(2)} incl. GST
        </p>
      )}
    </div>
  );
}
