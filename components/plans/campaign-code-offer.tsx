'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, PartyPopper, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/get-error-message';
import {
  campaignsApi,
  type ValidateCampaignResult,
} from '@/lib/api/campaigns';
import { currencySymbol, type Plan, getPlanTotalWithGst } from '@/lib/api/plans';

export type AppliedCampaign = ValidateCampaignResult & { code: string };

/** True only for users who have never subscribed / paid (campaign codes are for them). */
export function isFirstTimeCampaignUser(user?: {
  lastPaymentId?: string | null;
  razorpaySubscriptionId?: string | null;
  isSubscriptionActive?: boolean;
} | null): boolean {
  if (!user) return false;
  return (
    !user.lastPaymentId &&
    !user.razorpaySubscriptionId &&
    user.isSubscriptionActive !== true
  );
}

interface CampaignCodeOfferProps {
  plan: Plan;
  applied: AppliedCampaign | null;
  onApplied: (result: AppliedCampaign | null) => void;
  className?: string;
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#22c55e', '#a855f7', '#f59e0b', '#38bdf8', '#f43f5e', '#eab308'];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 8) * 0.04;
        const color = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 h-2 w-2 rounded-sm"
            style={{ backgroundColor: color, marginLeft: `${left - 50}%` }}
            initial={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            animate={{
              opacity: 0,
              y: -80 - (i % 5) * 18,
              x: ((i % 2 === 0 ? 1 : -1) * (20 + (i % 7) * 12)),
              rotate: 180 + i * 20,
              scale: 0.4,
            }}
            transition={{ duration: 0.9, delay, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export function formatMoney(amount: number, currency?: string) {
  const symbol = currencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CampaignCodeOffer({
  plan,
  applied,
  onApplied,
  className = '',
}: CampaignCodeOfferProps) {
  const [code, setCode] = useState(applied?.code ?? '');
  const [isApplying, setIsApplying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!applied) {
      setCode('');
      setShowCelebration(false);
    }
  }, [plan._id, applied]);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error('Enter a campaign code');
      return;
    }
    if (!plan._id) {
      toast.error('Plan is not ready for campaign codes');
      return;
    }

    try {
      setIsApplying(true);
      const amount = getPlanTotalWithGst(plan);
      const result = await campaignsApi.validate({
        code: trimmed,
        amount,
        planId: plan._id,
      });

      onApplied({ ...result, code: trimmed });
      setCode(trimmed);
      setShowCelebration(true);
      toast.success('Campaign applied!');
      window.setTimeout(() => setShowCelebration(false), 1200);
    } catch (error) {
      onApplied(null);
      toast.error(getErrorMessage(error, 'Invalid campaign code'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleClear = () => {
    setCode('');
    onApplied(null);
    setShowCelebration(false);
  };

  return (
    <div className={`relative space-y-3 ${className}`.trim()}>
      <AnimatePresence>{showCelebration && <ConfettiBurst />}</AnimatePresence>

      <div className="space-y-2">
        <Label htmlFor="campaign-code" className="flex items-center gap-2 text-sm">
          <Tag className="h-3.5 w-3.5" />
          Have a campaign code?
        </Label>
        <div className="flex gap-2">
          <Input
            id="campaign-code"
            value={code}
            disabled={isApplying || Boolean(applied)}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleApply();
              }
            }}
            placeholder="Enter code"
            className="font-mono uppercase"
          />
          {applied ? (
            <Button type="button" variant="outline" onClick={handleClear} className="shrink-0 gap-1">
              <X className="h-4 w-4" />
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleApply()}
              disabled={isApplying || !code.trim()}
              className="shrink-0 gap-1"
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1 text-emerald-500">
                {showCelebration ? (
                  <PartyPopper className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Code <span className="font-mono">{applied.code}</span> applied
                  {applied.campaign?.name ? ` · ${applied.campaign.name}` : ''}
                </p>
                <div className="flex items-end justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    You save {formatMoney(applied.discountAmount, plan.currency)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground line-through decoration-2">
                      {formatMoney(applied.originalAmount, plan.currency)}
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(applied.payableAmount, plan.currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
