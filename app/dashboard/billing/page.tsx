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
    const { user, refreshUser, loading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const { initiatePayment, isLoading: paymentLoading } = useRazorpay();
    const [purchasingKey, setPurchasingKey] = useState<string | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [profile, setProfile] = useState<ProfileWithPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) return;

        let cancelled = false;
        const load = async () => {
            try {
                setIsLoading(true);
                const [plansData, profileData] = await Promise.all([
                    getAllPlans(true), // force-refresh: bypass 5-min cache
                    getUserProfileWithPlan(),
                ]);
                if (cancelled) return;
                setPlans(plansData);
                setProfile(profileData);

                if (plansData.length > 0) {
                    const activeKey = profileData?.activePlanMapping?.planKey || profileData?.plan || user?.plan || 'free';
                    // Default to current plan if it is active, otherwise first plan
                    setSelectedPlanKey(activeKey && plansData.some(p => p.key === activeKey) ? activeKey : plansData[0]?.key || null);
                }
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
    }, [authLoading, isAuthenticated]);

    const currentPlanKey =
        profile?.activePlanMapping?.planKey || profile?.plan || user?.plan || 'free';
    const currentPlan = plans.find(p => p.key === currentPlanKey);

    const currentPlanTitle =
        profile?.activePlanMapping?.planTitle ||
        profile?.planDetails?.title ||
        currentPlan?.title ||
        (currentPlanKey === 'free' ? 'Free' : currentPlanKey || 'No Plan');
    const currentPlanDescription =
        profile?.planDetails?.description ||
        currentPlan?.description ||
        '';
    const currentPlanPrice =
        currentPlan?.pricePerYear ??
        profile?.planDetails?.pricePerYear ??
        (profile?.activePlanMapping?.priceInPaise
            ? profile.activePlanMapping.priceInPaise / 100
            : 0);

    const ARTIST_ADDON_PRICE_INR = 500;
    const activeAddonCount =
        profile?.effectiveLimits?.extraArtistSlots ??
        profile?.activeAddons?.length ??
        0;
    const addonsTotal = activeAddonCount * ARTIST_ADDON_PRICE_INR;
    const totalRecurringPrice = currentPlanPrice + addonsTotal;

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

    const handleManageSubscription = () => {
        router.push('/dashboard/subscription');
    };

    const handleUpdatePaymentMethod = () => {
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

    const filteredPlans = plans.filter(plan => plan.isActive !== false);

    const selectedPlan = plans.find(p => p.key === selectedPlanKey);

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
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Plan & <span className="animated-gradient">Billing</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your distribution tier, payment methods, and invoice history.
                    </p>
                </div>

                {/* Active Subscription */}
                <Card className="relative bg-gradient-to-r from-primary/10 via-background/40 to-background border-primary/20 overflow-hidden shadow-md transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/40" />
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            {/* Left Side: Plan Info */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-primary/20 text-primary border-0 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                                        Active Tier
                                    </Badge>
                                    {isSubscriptionActiveBackend && (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">
                                            Active
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                    {currentPlanTitle}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {isEnterprisePlanKey(currentPlanKey) ? (
                                            '(Custom Plan)'
                                        ) : (
                                            <>
                                                ({currencySymbol(currentPlan?.currency)}{totalRecurringPrice.toFixed(2)}
                                                {currentPlan ? (derivePeriodLabel(currentPlan) ?? '/yr') : '/yr'})
                                            </>
                                        )}
                                    </span>
                                </h2>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {currentPlanDescription || 'Manage your music distribution'}
                                </p>
                            </div>

                            {/* Middle Side: Key Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-8 flex-shrink-0">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Billing Cycle</p>
                                    <p className="text-sm font-bold capitalize mt-1 text-foreground/90">{currentSubscription.cycle}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Next Billing</p>
                                    <p className="text-sm font-bold mt-1 text-foreground/90">{currentSubscription.nextBilling}</p>
                                </div>
                                {activeAddonCount > 0 && (
                                    <div className="col-span-2 sm:col-span-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Add-ons</p>
                                        <p className="text-sm font-bold mt-1 text-foreground/90">
                                            {activeAddonCount} Slot{activeAddonCount > 1 ? 's' : ''} (+{currencySymbol(currentPlan?.currency)}{addonsTotal.toFixed(0)})
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Actions */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                                <Button
                                    onClick={handleManageSubscription}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold h-10 px-4 transition-all duration-200"
                                >
                                    Manage Subscription
                                </Button>
                                <Button
                                    onClick={handleUpdatePaymentMethod}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg font-semibold h-10 px-4 border-border/50 hover:bg-muted/40 transition-all duration-200"
                                >
                                    Update Payment Method
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Available Plans */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Available Plans</h2>
                        <p className="text-muted-foreground mt-1">
                            Need more power? Upgrade to unlock advanced analytics and split payments for your collaborators.
                        </p>
                    </div>

                    {/* Master-Detail Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left column: List of Plans */}
                        <div
                            data-lenis-prevent="true"
                            className="lg:col-span-5 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[600px] pb-4 lg:pb-0 pr-0 lg:pr-2 custom-scrollbar flex-nowrap scrollbar-thin"
                        >
                            {filteredPlans.map((plan) => {
                                const isCurrent = plan.key === currentPlanKey;
                                const isEnterprise = isEnterprisePlanKey(plan.key);
                                const isSelected = selectedPlanKey === plan.key;
                                return (
                                    <button
                                        key={plan.key}
                                        onClick={() => setSelectedPlanKey(plan.key)}
                                        className={`w-[280px] lg:w-full text-left rounded-2xl p-4 border transition-all duration-300 relative group flex items-start gap-4 flex-shrink-0 lg:flex-shrink ${isSelected
                                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/5'
                                            : 'glass-card border-border/50 hover:border-border hover:bg-card/40'
                                            }`}
                                    >
                                        {/* Accent bar for selected plan */}
                                        {isSelected && (
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-bold text-base text-foreground truncate">{plan.title}</span>
                                                {isCurrent && (
                                                    <Badge className="bg-primary/20 text-primary border-0 text-[9px] font-bold px-1.5 py-0.5">
                                                        Current
                                                    </Badge>
                                                )}
                                                {plan.isPopular && (
                                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[9px] font-bold px-1.5 py-0.5">
                                                        Popular
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-2">{plan.description || 'Music distribution'}</p>

                                            {/* Key Limits Preview */}
                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 font-medium">
                                                <span>{plan.limits?.maxArtists === -1 ? 'Unlimited' : plan.limits?.maxArtists || 1} Artist{plan.limits?.maxArtists !== 1 ? 's' : ''}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{plan.limits?.maxPendingReleases === -1 ? 'Unlimited' : plan.limits?.maxPendingReleases || 1} Pending</span>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            {isEnterprise ? (
                                                <span className="font-extrabold text-sm text-foreground">{plan.priceDisplay || 'Custom'}</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-base text-foreground">
                                                        {currencySymbol(plan.currency)}{plan.pricePerYear.toFixed(0)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {derivePeriodLabel(plan) ?? '/yr'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {filteredPlans.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-border/40 rounded-2xl w-full">
                                    <p className="text-muted-foreground text-sm">No plans found in this category.</p>
                                </div>
                            )}
                        </div>

                        {/* Right column: Selected Plan Detail Card */}
                        <div className="lg:col-span-7 lg:sticky lg:top-24">
                            {selectedPlan ? (() => {
                                const plan = selectedPlan;
                                const isCurrent = plan.key === currentPlanKey;
                                const isEnterprise = isEnterprisePlanKey(plan.key);
                                const isDowngrade = !isCurrent && !isEnterprise && plan.pricePerYear < currentPlanPrice;

                                return (
                                    <motion.div
                                        key={plan.key}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-background to-card shadow-xl">
                                            {/* Visual Top Accent bar */}
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-purple-500" />

                                            <CardContent className="p-6 md:p-8 space-y-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-border/30 pb-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-2xl font-extrabold text-foreground">{plan.title}</h3>
                                                            {plan.isPopular && (
                                                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] font-bold px-2.5 py-0.5">
                                                                    Popular Choice
                                                                </Badge>
                                                            )}
                                                            {isCurrent && (
                                                                <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-bold px-2.5 py-0.5">
                                                                    Current Plan
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right flex-shrink-0">
                                                        {isEnterprise ? (
                                                            <div className="text-3xl font-black text-foreground">{plan.priceDisplay || 'Custom'}</div>
                                                        ) : (
                                                            <>
                                                                <div className="text-3xl font-black text-foreground">
                                                                    {currencySymbol(plan.currency)}{plan.pricePerYear.toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground font-medium mt-1">
                                                                    Charged {derivePeriodLabel(plan) ? derivePeriodLabel(plan)?.replace('/', '') : 'yearly'}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Plan Limits Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Artists Slots</p>
                                                        <p className="text-sm font-bold text-foreground mt-1">
                                                            {plan.limits?.maxArtists === -1 ? 'Unlimited' : plan.limits?.maxArtists || 1}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pending Releases</p>
                                                        <p className="text-sm font-bold text-foreground mt-1">
                                                            {plan.limits?.maxPendingReleases === -1 ? 'Unlimited' : plan.limits?.maxPendingReleases || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Storage Limit</p>
                                                        <p className="text-sm font-bold text-foreground mt-1">
                                                            {plan.limits?.maxStorageGB ? `${plan.limits.maxStorageGB} GB` : 'Unlimited'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Formats</p>
                                                        <p className="text-xs font-bold text-foreground mt-1 truncate capitalize">
                                                            {plan.limits?.allowedFormats?.join(', ') || 'All'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Features Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What's Included</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                                        {(plan.features || []).map((feature, idx) => (
                                                            <div key={idx} className="flex items-start gap-2.5">
                                                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm text-foreground/90 font-medium">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="pt-4 border-t border-border/30">
                                                    {isCurrent ? (
                                                        <Button
                                                            disabled
                                                            className="w-full rounded-xl py-6 font-bold bg-primary/20 text-primary border-primary/20 hover:bg-primary/20"
                                                        >
                                                            Your Current Plan
                                                        </Button>
                                                    ) : isEnterprise ? (
                                                        <Button
                                                            onClick={() => router.push('/contact')}
                                                            className="w-full rounded-xl py-6 font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200"
                                                        >
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            {plan.ctaLabel || 'Contact Us'}
                                                        </Button>
                                                    ) : isDowngrade ? (
                                                        <Button
                                                            onClick={() => toast('To downgrade, please contact support.')}
                                                            variant="outline"
                                                            className="w-full rounded-xl py-6 font-bold border-border/50 text-muted-foreground hover:bg-muted/20"
                                                        >
                                                            Contact Support to Downgrade
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleSelectPlan(plan)}
                                                            disabled={paymentLoading || purchasingKey !== null}
                                                            className={`w-full rounded-xl py-6 font-bold transition-all duration-200 ${plan.key.includes('label') || plan.key.includes('premium') || plan.key.includes('pro')
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                                                }`}
                                                        >
                                                            {purchasingKey === plan.key ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Processing Payment...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                                    Upgrade to {plan.title}
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })() : (
                                <div className="text-center py-24 border border-dashed border-border/40 rounded-2xl bg-card/10">
                                    <p className="text-muted-foreground text-sm">Select a plan from the list to view details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
