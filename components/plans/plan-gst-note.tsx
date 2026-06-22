'use client';

import {
  Plan,
  getGstPercent,
  isGstIncluded,
  formatGstLabel,
  getPlanTotalWithGst,
  currencySymbol,
} from '@/lib/api/plans';

interface PlanGstNoteProps {
  plan: Pick<Plan, 'pricePerYear' | 'gstPercent' | 'gstIncluded' | 'currency'>;
  /** Show "Total ₹X incl. GST" below the label */
  showTotal?: boolean;
  className?: string;
}

export function PlanGstNote({ plan, showTotal = false, className = '' }: PlanGstNoteProps) {
  const gstPercent = getGstPercent(plan);
  if (gstPercent <= 0 || plan.pricePerYear <= 0) {
    return null;
  }

  const gstIncluded = isGstIncluded(plan);
  const symbol = currencySymbol(plan.currency);
  const total = getPlanTotalWithGst(plan);
  const label = formatGstLabel(gstPercent, gstIncluded);

  return (
    <div className={`text-xs text-muted-foreground ${className}`.trim()}>
      <p>{gstIncluded ? label : `${label} applicable`}</p>
      {showTotal && (
        <p className="font-medium text-foreground/80 mt-0.5">
          Total {symbol}{total.toFixed(2)} incl. GST
        </p>
      )}
    </div>
  );
}
