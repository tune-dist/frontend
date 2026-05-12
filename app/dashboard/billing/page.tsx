'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    Calendar,
    CheckCircle2,
    Download,
    Zap,
    TrendingUp,
    Loader2,
    Mail,
} from 'lucide-react';

const ENTERPRISE_PLAN_KEY = 'enterprise';
const isEnterprisePlanKey = (key?: string | null) => key === ENTERPRISE_PLAN_KEY;
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPlans, Plan, currencySymbol, derivePeriodLabel } from '@/lib/api/plans';
import { getUserProfileWithPlan, ProfileWithPlan } from '@/lib/api/users';
import { useRazorpay } from '@/hooks/useRazorpay';
import toast from 'react-hot-toast';

export default function BillingPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay();
    const [purchasingKey, setPurchasingKey] = useState<string | null>(null);
    // const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [profile, setProfile] = useState<ProfileWithPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setIsLoading(true);
                const [plansData, profileData] = await Promise.all([
                    getAllPlans(true), // force-refresh: bypass 5-min cache so newly-created/edited plans show up
                    getUserProfileWithPlan(),
                ]);
                if (cancelled) return;
                setPlans(plansData);
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to load billing data:', error);
                toast.error('Failed to load plans');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Active plan mapping is the source of truth; fall back to user.plan only when
    // no active mapping exists (e.g. legacy or free-tier accounts).
    const currentPlanKey =
        profile?.activePlanMapping?.planKey || profile?.plan || user?.plan || 'free';
    const currentPlan = plans.find(p => p.key === currentPlanKey);
    // Resolve title/description/price with a robust fallback chain so the header
    // doesn't say "No Plan" just because:
    //   - the plan was admin-deactivated (GET /plans only returns active plans), or
    //   - the local plans-list cache is stale and missing a newly-created plan, or
    //   - getAllPlans failed and we have an empty array.
    // Use the mapping (saved at purchase time) and profile.planDetails (server-
    // enriched) first, then the plans-list lookup, then sensible defaults.
    const currentPlanTitle =
        profile?.activePlanMapping?.planTitle ||
        profile?.planDetails?.title ||
        currentPlan?.title ||
        (currentPlanKey === 'free' ? 'Free' : currentPlanKey || 'No Plan');
    const currentPlanDescription =
        profile?.planDetails?.description ||
        currentPlan?.description ||
        '';
    const currentPlanFeatures =
        profile?.planDetails?.features || currentPlan?.features || [];
    const currentPlanPrice =
        currentPlan?.pricePerYear ??
        profile?.planDetails?.pricePerYear ??
        (profile?.activePlanMapping?.priceInPaise
            ? profile.activePlanMapping.priceInPaise / 100
            : 0);

    // ₹500 per active artist add-on, charged alongside the main plan each cycle.
    const ARTIST_ADDON_PRICE_INR = 500;
    const activeAddonCount =
        profile?.effectiveLimits?.extraArtistSlots ??
        profile?.activeAddons?.length ??
        0;
    const addonsTotal = activeAddonCount * ARTIST_ADDON_PRICE_INR;
    const totalRecurringPrice = currentPlanPrice + addonsTotal;

    // Real subscription state derived from the profile (no more mock data).
    const activeMapping = profile?.activePlanMapping;
    const planEndDate = activeMapping?.endDate ?? (profile as any)?.planEndDate ?? null;
    const subscriptionStatus =
        activeMapping?.status ?? (profile as any)?.subscriptionStatus ?? 'inactive';
    const isFreePlan = currentPlanKey === 'free';
    const hasRazorpaySubscription = !!(profile as any)?.razorpaySubscriptionId;
    const isSubscriptionActiveBackend =
        !isFreePlan &&
        ((profile as any)?.isSubscriptionActive ?? subscriptionStatus === 'active');

    const formatBillingDate = (d: string | null | undefined) => {
        if (!d) return 'N/A';
        try {
            return new Date(d).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };
    const currentSubscription = {
        status: subscriptionStatus,
        cycle: currentPlan?.billingPeriod
            ? (currentPlan.interval && currentPlan.interval > 1
                ? `Every ${currentPlan.interval} ${currentPlan.billingPeriod}`
                : currentPlan.billingPeriod)
            : 'Yearly',
        nextBilling: formatBillingDate(planEndDate),
    };

    const billingHistory = [
        {
            id: '1',
            date: 'Sept 24, 2025',
            description: `${currentPlan?.title || 'Plan'} (Yearly)`,
            amount: currentPlanPrice,
            status: 'paid',
            invoiceUrl: '#'
        },
        {
            id: '2',
            date: 'Aug 24, 2025',
            description: `${currentPlan?.title || 'Plan'} (Monthly)`,
            amount: currentPlanPrice,
            status: 'paid',
            invoiceUrl: '#'
        },
        {
            id: '3',
            date: 'July 24, 2025',
            description: `${currentPlan?.title || 'Plan'} (Monthly)`,
            amount: currentPlanPrice,
            status: 'paid',
            invoiceUrl: '#'
        }
    ];

    const getPrice = (plan: Plan) => {
        return plan.pricePerYear;
    };

    const getSavings = () => {
        if (!currentPlan) return 0;
        const monthlyTotal = (currentPlan.pricePerYear / 12) * 12;
        const yearlyPrice = currentPlan.pricePerYear;
        return ((monthlyTotal - yearlyPrice) / monthlyTotal * 100).toFixed(0);
    };

    const handleManageSubscription = () => {
        router.push('/dashboard/subscription');
    };

    const handleUpdatePaymentMethod = () => {
        // No dedicated UI yet; surface a clear message so the button isn't silently dead.
        toast('Payment method management is handled by Razorpay during your next checkout.');
    };

    const handleSelectPlan = async (plan: Plan) => {
        if (plan.key === currentPlanKey) return;
        if (plan.pricePerYear === 0) {
            toast('To downgrade to the free plan, contact support.');
            return;
        }
        setPurchasingKey(plan.key);
        try {
            // If the user already has an active Razorpay subscription, route
            // through /payments/upgrade-plan so the old sub is cancelled and
            // addons are re-attached/dropped automatically on verify. Otherwise
            // (free / expired user) fall through to the standard create-order
            // path inside initiatePayment.
            const result = await initiatePayment(
                plan.key,
                { name: user?.fullName, email: user?.email },
                { isUpgrade: hasRazorpaySubscription && isSubscriptionActiveBackend },
            );
            if (result?.success) {
                const [, nextProfile] = await Promise.all([
                    refreshUser(),
                    getUserProfileWithPlan(),
                ]);
                setProfile(nextProfile);
                router.refresh();
            }
        } catch (err) {
            console.error('Plan change failed:', err);
        } finally {
            setPurchasingKey(null);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">Plan & Billing</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your distribution tier, payment methods, and invoice history.
                    </p>
                </div>

                {/* Active Subscription */}
                <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60" />
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <Badge className="bg-primary/20 text-primary border-0 mb-3 uppercase text-[10px] font-bold">
                                    Active Subscription
                                </Badge>
                                <h2 className="text-3xl font-bold mb-2">{currentPlanTitle}</h2>
                                <p className="text-muted-foreground">
                                    {currentPlanDescription || 'Manage your music distribution'}
                                </p>
                            </div>
                            <div className="text-right">
                                {isEnterprisePlanKey(currentPlanKey) ? (
                                    <div className="text-4xl font-black">
                                        {currentPlan?.priceDisplay || 'Custom'}
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-4xl font-black">
                                            {currencySymbol(currentPlan?.currency)}{totalRecurringPrice.toFixed(2)}
                                            <span className="text-lg text-muted-foreground font-normal">
                                                {currentPlan ? (derivePeriodLabel(currentPlan) ?? '/yr') : '/yr'}
                                            </span>
                                        </div>
                                        {activeAddonCount > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Plan {currencySymbol(currentPlan?.currency)}{currentPlanPrice.toFixed(2)} + {activeAddonCount} add-on
                                                {activeAddonCount > 1 ? 's' : ''} {currencySymbol(currentPlan?.currency)}{addonsTotal.toFixed(2)}
                                            </p>
                                        )}
                                        {currentPlan?.key !== 'free' && (
                                            <p className="text-xs text-muted-foreground mt-1">Next billing: {currentSubscription.nextBilling}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                                    <p className="font-bold capitalize">{currentSubscription.status}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cycle</p>
                                    <p className="font-bold capitalize">{currentSubscription.cycle}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Next billing</p>
                                    <p className="font-bold">{currentSubscription.nextBilling}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleManageSubscription}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold h-12"
                            >
                                Manage Subscription
                            </Button>
                            <Button
                                onClick={handleUpdatePaymentMethod}
                                variant="outline"
                                className="flex-1 rounded-xl font-bold h-12 border-border/50"
                            >
                                Update Payment Method
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Plans */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Available Plans</h2>
                            <p className="text-muted-foreground mt-1">
                                Need more power? Upgrade to unlock advanced analytics and split payments for your collaborators.
                            </p>
                        </div>

                        {/* Toggle removed as per requirement */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = plan.key === currentPlanKey;
                            const isEnterprise = isEnterprisePlanKey(plan.key);
                            const isDowngrade =
                                !isCurrent && !isEnterprise && plan.pricePerYear < currentPlanPrice;
                            const planPrice = plan.pricePerYear / 12;
                            return (
                                <motion.div
                                    key={plan.key}
                                    whileHover={{ scale: 1.02 }}
                                    className={`relative rounded-3xl p-8 border-2 transition-all ${isCurrent
                                        ? 'border-primary/50 bg-primary/5 shadow-xl shadow-primary/10'
                                        : 'border-border/50 bg-card/50 hover:border-border'
                                        }`}
                                >
                                    {isCurrent && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-0 uppercase text-[10px] font-bold px-4">
                                            Current Plan
                                        </Badge>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        {isEnterprise ? (
                                            <div className="text-4xl font-black">
                                                {plan.priceDisplay || 'Custom'}
                                            </div>
                                        ) : (
                                            <div className="text-4xl font-black">
                                                {currencySymbol(plan.currency)}{getPrice(plan).toFixed(2)}
                                                <span className="text-lg text-muted-foreground font-normal">
                                                    {derivePeriodLabel(plan) ?? '/yr'}
                                                </span>
                                            </div>
                                        )}

                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {(plan.features || []).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {isCurrent ? (
                                        <Button
                                            disabled
                                            className="w-full rounded-xl py-6 font-bold bg-primary/20 text-primary hover:bg-primary/20"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : isEnterprise ? (
                                        <Button
                                            onClick={() => router.push('/contact')}
                                            className="w-full rounded-xl py-6 font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            {plan.ctaLabel || 'Contact Us'}
                                        </Button>
                                    ) : isDowngrade ? null : (
                                        <Button
                                            onClick={() => handleSelectPlan(plan)}
                                            disabled={paymentLoading || purchasingKey !== null}
                                            className={`w-full rounded-xl py-6 font-bold ${plan.key.includes('label') || plan.key.includes('premium')
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                                : 'bg-primary hover:bg-primary/90'
                                                }`}
                                        >
                                            {purchasingKey === plan.key ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    Upgrade
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* <Button variant="outline" className="w-full border-dashed border-2 rounded-2xl py-8 hover:bg-primary/5 hover:border-primary/50">
                        <Zap className="h-5 w-5 mr-2" />
                        View Label Features
                    </Button> */}
                </div>

                {/* Billing History */}
                {/* <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Billing History</h2>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-card/50 border-b border-border/50">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                        <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                                        <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                        <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billingHistory.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                                            <td className="p-4 font-medium">{transaction.date}</td>
                                            <td className="p-4 text-muted-foreground">{transaction.description}</td>
                                            <td className="p-4 font-bold">{currencySymbol(currentPlan?.currency)}{transaction.amount}</td>
                                            <td className="p-4">
                                                <Badge className="bg-primary/20 text-primary border-0 uppercase text-[10px] font-bold">
                                                    {transaction.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="text-center">
                        <Button variant="link" className="text-primary">
                            View all transactions
                        </Button>
                    </div>
                </div> */}
            </div>
        </DashboardLayout>
    );
}
