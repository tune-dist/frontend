'use client';

import { CreditCard, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/class-names';

interface BillingTypeToggleProps {
    isAutoPay: boolean;
    onChange: (isAutoPay: boolean) => void;
    className?: string;
    compact?: boolean;
}

export function BillingTypeToggle({
    isAutoPay,
    onChange,
    className,
    compact = false,
}: BillingTypeToggleProps) {
    if (compact) {
        return (
            <div className={cn('space-y-2', className)}>
                <p className="text-xs font-medium text-muted-foreground text-center">Select billing type</p>
                <div className="flex bg-background border rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => onChange(true)}
                        className={cn(
                            'flex-1 text-xs py-2 px-2 rounded-md transition-all',
                            isAutoPay
                                ? 'bg-primary text-primary-foreground shadow'
                                : 'text-muted-foreground hover:bg-muted/50',
                        )}
                    >
                        Subscription
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange(false)}
                        className={cn(
                            'flex-1 text-xs py-2 px-2 rounded-md transition-all',
                            !isAutoPay
                                ? 'bg-primary text-primary-foreground shadow'
                                : 'text-muted-foreground hover:bg-muted/50',
                        )}
                    >
                        One-time Pass
                    </button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                    {isAutoPay
                        ? 'Auto-renews yearly. Cancel anytime.'
                        : '1 year access. All payment methods. No auto-renew.'}
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <p className="text-sm font-semibold text-foreground">Billing type</p>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={cn(
                        'rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all',
                        isAutoPay
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-transparent hover:bg-muted/50',
                    )}
                >
                    <RefreshCw
                        className={cn(
                            'h-4 w-4 mb-1.5',
                            isAutoPay ? 'text-primary' : 'text-muted-foreground',
                        )}
                    />
                    <span
                        className={cn(
                            'font-semibold text-xs',
                            isAutoPay ? 'text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        Subscription
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
                        Auto-renew yearly
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={cn(
                        'rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all',
                        !isAutoPay
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-transparent hover:bg-muted/50',
                    )}
                >
                    <CreditCard
                        className={cn(
                            'h-4 w-4 mb-1.5',
                            !isAutoPay ? 'text-primary' : 'text-muted-foreground',
                        )}
                    />
                    <span
                        className={cn(
                            'font-semibold text-xs',
                            !isAutoPay ? 'text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        One-time Pass
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
                        1 year, all payment options
                    </span>
                </button>
            </div>
        </div>
    );
}
