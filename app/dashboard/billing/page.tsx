'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPlans, Plan } from '@/lib/api/plans';
import toast from 'react-hot-toast';

export default function BillingPage() {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const data = await getAllPlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast.error('Failed to load plans');
        } finally {
            setIsLoading(false);
        }
    };

    // Get current plan details
    const currentPlan = plans.find(p => p.key === user?.plan);
    const currentPlanPrice = currentPlan ? currentPlan.pricePerYear / 12 : 0;

    // Mock subscription data - will be replaced with API
    const currentSubscription = {
        status: 'active',
        cycle: 'monthly',
        paymentMethod: '****4242',
        nextBilling: 'Oct 24, 2025',
    };

    const billingHistory = [
        {
            id: '1',
            date: 'Sept 24, 2025',
            description: `${currentPlan?.title || 'Plan'} (Monthly)`,
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
        return billingCycle === 'monthly' ? plan.pricePerYear / 12 : plan.pricePerYear / 12;
    };

    const getSavings = () => {
        if (!currentPlan) return 0;
        const monthlyTotal = (currentPlan.pricePerYear / 12) * 12;
        const yearlyPrice = currentPlan.pricePerYear;
        return ((monthlyTotal - yearlyPrice) / monthlyTotal * 100).toFixed(0);
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
                <Card className="bg-gradient-to-br from-green-500/10 via-background to-background border-green-500/20 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                    <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <Badge className="bg-green-500/20 text-green-500 border-0 mb-3 uppercase text-[10px] font-bold">
                                    Active Subscription
                                </Badge>
                                <h2 className="text-3xl font-bold mb-2">{currentPlan?.title || 'No Plan'}</h2>
                                <p className="text-muted-foreground">
                                    {currentPlan?.description || 'Manage your music distribution'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black">
                                    ₹{currentPlanPrice.toFixed(2)}
                                    <span className="text-lg text-muted-foreground font-normal">/mo</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Next billing: {currentSubscription.nextBilling}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border/50">
                                <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
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
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Method</p>
                                    <p className="font-bold">{currentSubscription.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold h-12">
                                Manage Subscription
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12 border-border/50">
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

                        <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl p-1">
                            <Button
                                size="sm"
                                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                                onClick={() => setBillingCycle('monthly')}
                                className="rounded-lg font-bold"
                            >
                                Monthly
                            </Button>
                            <Button
                                size="sm"
                                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                                onClick={() => setBillingCycle('yearly')}
                                className="rounded-lg font-bold"
                            >
                                Yearly
                                <Badge className="ml-2 bg-green-500 text-white border-0 text-[9px]">
                                    SAVE {getSavings()}%
                                </Badge>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = plan.key === user?.plan;
                            const planPrice = plan.pricePerYear / 12;
                            return (
                                <motion.div
                                    key={plan.key}
                                    whileHover={{ scale: 1.02 }}
                                    className={`relative rounded-3xl p-8 border-2 transition-all ${isCurrent
                                        ? 'border-green-500/50 bg-green-500/5 shadow-xl shadow-green-500/10'
                                        : 'border-border/50 bg-card/50 hover:border-border'
                                        }`}
                                >
                                    {isCurrent && (
                                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white border-0 uppercase text-[10px] font-bold px-4">
                                            Current Plan
                                        </Badge>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="text-4xl font-black">
                                            ₹{getPrice(plan).toFixed(2)}
                                            <span className="text-lg text-muted-foreground font-normal">/mo</span>
                                        </div>
                                        {billingCycle === 'yearly' && plan.pricePerYear > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Billed ₹{plan.pricePerYear} annually
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {(plan.features || []).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {isCurrent ? (
                                        <Button
                                            disabled
                                            className="w-full rounded-xl py-6 font-bold bg-green-500/20 text-green-500 hover:bg-green-500/20"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            className={`w-full rounded-xl py-6 font-bold ${plan.key.includes('label') || plan.key.includes('premium')
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                                    : 'bg-primary hover:bg-primary/90'
                                                }`}
                                        >
                                            {planPrice > currentPlanPrice ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    Upgrade
                                                </>
                                            ) : (
                                                'Downgrade'
                                            )}
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <Button variant="outline" className="w-full border-dashed border-2 rounded-2xl py-8 hover:bg-primary/5 hover:border-primary/50">
                        <Zap className="h-5 w-5 mr-2" />
                        View Label Features
                    </Button>
                </div>

                {/* Billing History */}
                <div className="space-y-6">
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
                                            <td className="p-4 font-bold">₹{transaction.amount}</td>
                                            <td className="p-4">
                                                <Badge className="bg-green-500/20 text-green-500 border-0 uppercase text-[10px] font-bold">
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
                </div>
            </div>
        </DashboardLayout>
    );
}
