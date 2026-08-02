'use client';

import { cn } from '@/lib/utils';
import type { Plan } from '@/lib/api/plans';

function formatPlanPrice(plan: Plan): string {
  if (plan.priceDisplay?.trim()) return plan.priceDisplay.trim();
  return `₹${Number(plan.pricePerYear || 0).toLocaleString('en-IN')}`;
}

interface ApplicablePlansSelectProps {
  plans: Plan[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ApplicablePlansSelect({
  plans,
  selectedIds,
  onChange,
  disabled = false,
  className,
}: ApplicablePlansSelectProps) {
  const selectedSet = new Set(selectedIds);

  const toggle = (planId: string) => {
    if (disabled) return;
    if (selectedSet.has(planId)) {
      onChange(selectedIds.filter((id) => id !== planId));
      return;
    }
    onChange([...selectedIds, planId]);
  };

  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground rounded-md border border-border/60 px-3 py-4">
        No subscription plans available.
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="rounded-md border border-border/60 divide-y divide-border/60 max-h-56 overflow-y-auto">
        {plans.map((plan) => {
          const checked = selectedSet.has(plan._id);
          return (
            <label
              key={plan._id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/40',
                disabled && 'cursor-not-allowed opacity-60',
                checked && 'bg-primary/5',
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(plan._id)}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{plan.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {plan.key} · {formatPlanPrice(plan)}
                  {plan.period ? ` / ${plan.period}` : ''}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedIds.length === 0
          ? 'Select at least one plan this code can be used on.'
          : `${selectedIds.length} plan${selectedIds.length === 1 ? '' : 's'} selected.`}
      </p>
    </div>
  );
}
