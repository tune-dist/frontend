'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    Plus,
    Eye,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Users,
    Save,
    Trash2,
    X,
    CreditCard,
    Zap,
    Shield,
    Layers,
    HelpCircle,
    Globe,
    Upload,
    PieChart,
} from 'lucide-react';
import { Plan, getAllPlans, adminUpdatePlan, adminCreatePlan, adminDeletePlan, adminSyncRazorpayPlan, derivePlanKey, BillingPeriod, currencySymbol, derivePeriodLabel, calculateTotalWithGst, getGstPercent, isGstIncluded, getPlanTotalWithGst } from '@/lib/api/plans';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/get-error-message';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

const emptyNewPlan: Partial<Plan> = {
    key: '',
    title: '',
    description: '',
    pricePerYear: 0,
    royaltyPercent: 10,
    gstPercent: 18,
    gstIncluded: false,
    isActive: true,
    billingPeriod: 'yearly',
    interval: 1,
    currency: 'INR',
    features: [],
    limits: {
        maxPendingReleases: 1,
        maxArtists: 1,
        maxStorageGB: 1,
        allowConcurrent: false,
        allowedFormats: ['single'],
    },
    fieldRules: {},
};

const BILLING_PERIODS: BillingPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const;

export default function PlanManagementPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Plan>>({});
    const [activeTab, setActiveTab] = useState('general');
    const [currency, setCurrency] = useState('INR');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<Plan>>(emptyNewPlan);
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSyncingRazorpay, setIsSyncingRazorpay] = useState(false);

    const planNeedsRazorpaySync = (plan: Plan) => plan.pricePerYear > 0 && !plan.razorpayPlanId;

    const billingFieldsChanged = (before: Plan, after: Partial<Plan>) =>
        before.pricePerYear !== after.pricePerYear ||
        getGstPercent(before) !== getGstPercent(after) ||
        isGstIncluded(before) !== isGstIncluded(after) ||
        (before.billingPeriod ?? 'yearly') !== (after.billingPeriod ?? 'yearly') ||
        (before.interval ?? 1) !== (after.interval ?? 1) ||
        (before.currency ?? 'INR') !== (after.currency ?? 'INR');

    const formatRazorpayCharge = (plan: Pick<Plan, 'pricePerYear' | 'gstPercent' | 'gstIncluded' | 'currency'>) => {
        const symbol = currencySymbol(plan.currency);
        const total = getPlanTotalWithGst(plan);
        const mode = isGstIncluded(plan) ? 'GST included' : 'GST excluded (+GST on top)';
        return `${symbol}${total.toFixed(2)} (${mode})`;
    };

    const promptRazorpaySync = async (plan: Plan, options?: { billingChanged?: boolean }) => {
        if (plan.pricePerYear <= 0) {
            return;
        }

        const needsInitialSync = planNeedsRazorpaySync(plan);
        const needsResync = options?.billingChanged === true;

        if (!needsInitialSync && !needsResync) {
            return;
        }

        const ok = window.confirm(
            needsResync
                ? `Price/GST changed for "${plan.title}".\n\n` +
                  `Razorpay billing plans cannot be edited — a new plan must be created.\n\n` +
                  `New charge: ${formatRazorpayCharge(plan)}\n\n` +
                  'Create updated Razorpay billing plan now?'
                : `Plan "${plan.title}" is not linked to Razorpay yet.\n\n` +
                  `Charge amount: ${formatRazorpayCharge(plan)}\n\n` +
                  'Users cannot subscribe with auto-renew until you sync it.\n\n' +
                  'Create Razorpay billing plan now?',
        );
        if (!ok) {
            toast(
                needsResync
                    ? 'Razorpay link cleared. Use "Sync Razorpay Plan" before users can subscribe.'
                    : 'Use "Sync Razorpay Plan" when ready.',
                { icon: 'ℹ️' },
            );
            return;
        }
        await handleSyncRazorpay(plan.key);
    };

    const handleSyncRazorpay = async (planKey: string) => {
        try {
            setIsSyncingRazorpay(true);
            const result = await adminSyncRazorpayPlan(planKey);
            toast.success(
                result.created
                    ? `Razorpay plan created — ${formatRazorpayCharge(result.plan)}`
                    : `Razorpay plan updated — ${formatRazorpayCharge(result.plan)}`,
            );
            await fetchPlans();
            if (selectedPlan?.key === planKey) {
                handleSelectPlan(result.plan);
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error, 'Failed to sync Razorpay plan'));
        } finally {
            setIsSyncingRazorpay(false);
        }
    };

    const getCurrencySymbol = (curr: string) => {
        switch (curr) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'INR': return '₹';
            default: return '₹';
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async (): Promise<Plan[]> => {
        try {
            setIsLoading(true);
            const data = await getAllPlans(true);
            setPlans(data);
            if (data.length > 0 && !selectedPlan) {
                handleSelectPlan(data[0]);
            }
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load plans'));
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setEditForm({ ...plan });
    };

    const handleInputChange = (field: keyof Plan, value: any) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleLimitChange = (field: string, value: any) => {
        setEditForm((prev) => ({
            ...prev,
            limits: {
                ...(prev.limits || {}),
                [field]: value,
            } as any,
        }));
    };

    const handleCreatePlan = async () => {
        const key = (newPlan.key || '').trim().toLowerCase();
        const title = (newPlan.title || '').trim();

        if (!key) {
            toast.error('Plan key is required');
            return;
        }
        if (!/^[a-z0-9_]+$/.test(key)) {
            toast.error('Plan key must be lowercase letters, numbers, or underscores');
            return;
        }
        if (!title) {
            toast.error('Plan name is required');
            return;
        }
        if ((newPlan.pricePerYear ?? 0) < 0) {
            toast.error('Price cannot be negative');
            return;
        }

        // Auto-populate priceDisplay/period so the new plan card renders the same
        // way as the seeded ones ("₹999/year") instead of falling back to raw "999.00".
        // Period default mirrors the billing cycle the admin picked — picking weekly
        // must NOT store "/year". Admin can still override these from the edit panel.
        const priceValue = newPlan.pricePerYear ?? 0;
        const priceDisplay = (newPlan.priceDisplay || '').trim() ||
            `${getCurrencySymbol(currency)}${priceValue}`;
        const PERIOD_FROM_BILLING: Record<string, string> = {
            daily: '/day',
            weekly: '/week',
            monthly: '/month',
            yearly: '/year',
        };
        const periodFallback = PERIOD_FROM_BILLING[newPlan.billingPeriod ?? 'yearly'] ?? '/year';
        const period = (newPlan.period || '').trim() || periodFallback;

        try {
            setIsCreating(true);
            const created = await adminCreatePlan({
                ...newPlan,
                key,
                title,
                priceDisplay,
                period,
            });
            toast.success(`Plan "${created.title}" created`);
            setIsCreateOpen(false);
            setNewPlan(emptyNewPlan);
            await fetchPlans();
            handleSelectPlan(created);
            await promptRazorpaySync(created);
        } catch (error: any) {
            console.error('Create plan error:', error);
            toast.error(getErrorMessage(error, 'Failed to create plan'));
        } finally {
            setIsCreating(false);
        }
    };

    const updateNewPlanField = (field: keyof Plan, value: any) => {
        setNewPlan((prev) => {
            const next = { ...prev, [field]: value };
            // Title drives the key — admin doesn't enter the key manually.
            if (field === 'title') next.key = derivePlanKey(value);
            return next;
        });
    };

    const updateNewPlanLimit = (field: string, value: any) => {
        setNewPlan((prev) => ({
            ...prev,
            limits: {
                ...(prev.limits || emptyNewPlan.limits!),
                [field]: value,
            } as any,
        }));
    };

    const handleSave = async () => {
        if (!selectedPlan) return;
        const billingChanged = billingFieldsChanged(selectedPlan, editForm);
        const {
            _id,
            createdAt,
            updatedAt,
            razorpayPlanId,
            razorpayPlanSyncedAt,
            ...planUpdates
        } = editForm;
        try {
            setIsSaving(true);
            console.log('Sending update:', planUpdates);
            await adminUpdatePlan(selectedPlan.key, planUpdates);
            toast.success('Plan updated successfully');
            const refreshed = await fetchPlans();
            const updated = refreshed.find((p) => p.key === selectedPlan.key) ?? selectedPlan;
            await promptRazorpaySync(updated, { billingChanged });
        } catch (error: any) {
            console.error('Update error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(getErrorMessage(error, 'Failed to update plan'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;
        const deletedKey = planToDelete.key;
        try {
            setIsDeleting(true);
            await adminDeletePlan(deletedKey);
            toast.success(`Plan "${planToDelete.title}" deleted`);
            // If the selected/editor plan is the one being deleted, clear it
            if (selectedPlan?.key === deletedKey) {
                setSelectedPlan(null);
                setEditForm({});
            }
            setPlanToDelete(null);
            await fetchPlans();
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(getErrorMessage(error, 'Failed to delete plan'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight">Plan Management</h1>
                        <p className="text-muted-foreground text-lg">
                            Configure subscription tiers, manage pricing logic, and define feature entitlements.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm border-border/50">
                            <Eye className="h-4 w-4" />
                            User View
                        </Button>
                        <Button
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                            onClick={() => {
                                setNewPlan(emptyNewPlan);
                                setIsCreateOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Create New Plan
                        </Button>
                    </div>
                </div>

                {/* Plan Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 shadow-xl overflow-hidden
                ${selectedPlan?.key === plan.key
                                    ? 'border-primary/50 bg-primary/5 shadow-primary/10'
                                    : 'glass-card border-border/80'}`}
                            onClick={() => handleSelectPlan(plan)}
                        >
                            {selectedPlan?.key === plan.key && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-px">
                                    <Badge className="bg-primary text-primary-foreground rounded-t-none rounded-b-lg border-0 px-4 py-1 text-[10px] uppercase font-bold tracking-widest animate-pulse">
                                        Editing Now
                                    </Badge>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                                    <p className="text-sm text-muted-foreground">{plan.description || (plan.key === 'free' ? 'Free Tier' : 'Paid Tier')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={`${plan.isActive ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'} border-0 uppercase text-[10px] font-bold`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPlanToDelete(plan);
                                        }}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        aria-label={`Delete plan ${plan.title}`}
                                        title="Delete plan"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="text-4xl font-black mb-8">
                                {plan.priceDisplay?.trim().toLowerCase() === 'custom' ? (
                                    plan.priceDisplay
                                ) : (
                                    <>
                                        {plan.priceDisplay?.trim() || `${currencySymbol(plan.currency)}${plan.pricePerYear}`}
                                        <span className="text-lg text-muted-foreground font-normal">
                                            {derivePeriodLabel(plan) ?? '/yr'}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-border/50">
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Users</span>
                                        <span>24k Users</span>
                                    </div>
                                    <div className="w-px h-8 bg-border/50" />
                                    <div className="flex items-center gap-1 text-primary">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>+12%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Editing Area */}
                {selectedPlan ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-bold">Editing: {selectedPlan?.title}</h2>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-8 items-end">
                                    <TabsTrigger
                                        value="general"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-lg"
                                    >
                                        General
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pricing"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-lg"
                                    >
                                        Pricing
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="features"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 font-bold text-lg"
                                    >
                                        Features
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-8 glass-card p-8 rounded-3xl">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Plan Identity</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Plan Name</Label>
                                            <Input
                                                value={editForm.title || ''}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                className="bg-card/50 border-border/50 rounded-xl h-12 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Badge Text</Label>
                                            <Input
                                                value={editForm.ctaLabel || ''}
                                                onChange={(e) => handleInputChange('ctaLabel', e.target.value)}
                                                placeholder="Most Popular"
                                                className="bg-card/50 border-border/50 rounded-xl h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground font-semibold">Description</Label>
                                        <textarea
                                            value={editForm.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={4}
                                            className="w-full bg-card/50 border border-border/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                            placeholder="Perfect for independent artists looking to grow their audience."
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="pricing" className="space-y-8 glass-card p-8 rounded-3xl">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Pricing Configuration</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Monthly Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol(currency)}</span>
                                                <Input
                                                    type="number"
                                                    value={editForm.pricePerYear ? (editForm.pricePerYear / 12).toFixed(2) : '0'}
                                                    onChange={(e) => handleInputChange('pricePerYear', parseFloat(e.target.value) * 12)}
                                                    className="bg-card/50 border-border/50 rounded-xl h-12 pl-8"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Annual Price (Discounted)</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{getCurrencySymbol(currency)}</span>
                                                <Input
                                                    type="number"
                                                    value={editForm.pricePerYear || 0}
                                                    onChange={(e) => handleInputChange('pricePerYear', parseFloat(e.target.value))}
                                                    className="bg-card/50 border-border/50 rounded-xl h-12 pl-8"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">GST %</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={editForm.gstPercent ?? 0}
                                                onChange={(e) => handleInputChange('gstPercent', parseFloat(e.target.value) || 0)}
                                                className="bg-card/50 border-border/50 rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">GST Treatment</Label>
                                            <select
                                                value={editForm.gstIncluded ? 'included' : 'excluded'}
                                                onChange={(e) => handleInputChange('gstIncluded', e.target.value === 'included')}
                                                className="flex h-12 w-full rounded-xl border border-border/50 bg-card/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="included">Included — price is final (e.g. ₹999 total)</option>
                                                <option value="excluded">Excluded — price + GST (e.g. ₹999 + 18% GST)</option>
                                            </select>
                                            {(editForm.pricePerYear ?? 0) > 0 && (editForm.gstPercent ?? 0) > 0 && (
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                    Checkout total: {getCurrencySymbol(currency)}
                                                    {calculateTotalWithGst(
                                                        editForm.pricePerYear ?? 0,
                                                        getGstPercent(editForm),
                                                        isGstIncluded(editForm),
                                                    ).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Trial Period (Days)</Label>
                                            <Input
                                                type="number"
                                                value={30} // Placeholder as not in schema
                                                className="bg-card/50 border-border/50 rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold">Currency</Label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="flex h-12 w-full rounded-xl border border-border/50 bg-card/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="EUR">EUR (€)</option>
                                                <option value="GBP">GBP (£)</option>
                                                <option value="INR">INR (₹)</option>
                                            </select>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="features" className="space-y-8 glass-card p-8 rounded-3xl">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Internal Limits & Entitlements</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold flex items-center justify-between">
                                                Max Pending Releases
                                                <span className="text-primary font-bold">{editForm.limits?.maxPendingReleases || 0}</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                value={editForm.limits?.maxPendingReleases || 0}
                                                onChange={(e) => handleLimitChange('maxPendingReleases', parseInt(e.target.value))}
                                                className="bg-card/50 border-border/50 rounded-xl h-12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-semibold flex items-center justify-between">
                                                Max Artists
                                                <span className="text-primary font-bold">{editForm.limits?.maxArtists || 0}</span>
                                            </Label>
                                            <Input
                                                type="number"
                                                value={editForm.limits?.maxArtists || 0}
                                                onChange={(e) => handleLimitChange('maxArtists', parseInt(e.target.value))}
                                                className="bg-card/50 border-border/50 rounded-xl h-12"
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-border/80 bg-card/30 p-5 flex items-center justify-between gap-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-muted-foreground font-semibold capitalize">Allow Concurrent Streams</Label>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Setting</p>
                                        </div>
                                        <Switch
                                            checked={editForm.limits?.allowConcurrent || false}
                                            onCheckedChange={(checked: boolean) => handleLimitChange('allowConcurrent', checked)}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold flex items-center justify-between">
                                <span>Display Features</span>
                                <Button variant="ghost" className="text-[10px] uppercase font-bold text-primary tracking-widest hover:bg-transparent h-auto p-0">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add New Feature
                                </Button>
                            </h3>

                            <div className="space-y-4">
                                {(editForm.features || []).map((feature: string, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl border border-border/80 glass-card flex items-center justify-between transition-all hover:bg-card/50 group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Input
                                                    value={feature}
                                                    className="bg-transparent border-none p-0 h-auto font-bold text-sm tracking-tight focus-visible:ring-0 w-full"
                                                    onChange={(e) => {
                                                        const newFeatures = [...(editForm.features || [])];
                                                        newFeatures[idx] = e.target.value;
                                                        handleInputChange('features', newFeatures);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                                            onClick={() => {
                                                const newFeatures = (editForm.features || []).filter((_, i) => i !== idx);
                                                handleInputChange('features', newFeatures);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-2 rounded-2xl py-8 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all h-auto"
                                    onClick={() => {
                                        handleInputChange('features', [...(editForm.features || []), 'New Plan Feature']);
                                    }}
                                >
                                    <Plus className="h-6 w-6 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add Plan Entitlement</span>
                                </Button>
                            </div>

                            {/* Sticky Save Footer-ish */}
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 mt-8 space-y-4">
                                {selectedPlan && selectedPlan.pricePerYear > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-primary/10">
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p>
                                                Razorpay charge:{' '}
                                                <span className="text-foreground font-semibold">
                                                    {formatRazorpayCharge(editForm as Plan)}
                                                </span>
                                            </p>
                                            <p>
                                                Linked plan:{' '}
                                                {editForm.razorpayPlanId ? (
                                                    <span className="text-emerald-400 font-mono">{editForm.razorpayPlanId}</span>
                                                ) : (
                                                    <span className="text-amber-400 font-semibold">Not linked — sync required after price/GST changes</span>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg"
                                            disabled={isSyncingRazorpay}
                                            onClick={() => handleSyncRazorpay(selectedPlan.key)}
                                        >
                                            {isSyncingRazorpay ? 'Syncing…' : 'Sync Razorpay Plan'}
                                        </Button>
                                    </div>
                                )}
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                                    Last updated: {selectedPlan?.updatedAt ? new Date(selectedPlan.updatedAt).toLocaleDateString() : 'Never'}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl font-bold bg-white/5 hover:bg-white/10"
                                        onClick={() => selectedPlan && handleSelectPlan(selectedPlan)}
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/20 py-6 h-auto"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-12 bg-card/30 rounded-3xl">
                        <p className="text-muted-foreground text-lg">Select a plan to start editing</p>
                    </div>
                )}

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Plan</DialogTitle>
                            <DialogDescription>
                                Set the essentials. Paid plans need a Razorpay sync before users can subscribe with auto-renew. Choose whether GST is included in the price or added on top.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            <div className="space-y-2">
                                <Label>Plan Name <span className="text-destructive">*</span></Label>
                                <Input
                                    placeholder="e.g. Pro Plus"
                                    value={newPlan.title || ''}
                                    onChange={(e) => updateNewPlanField('title', e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    Generated key:{' '}
                                    <span className="text-foreground font-mono normal-case tracking-normal">
                                        {newPlan.key || '—'}
                                    </span>
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <select
                                    value={newPlan.currency || 'INR'}
                                    onChange={(e) => updateNewPlanField('currency', e.target.value)}
                                    className="w-full bg-card/50 border border-border/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <textarea
                                    rows={2}
                                    placeholder="What this plan is for"
                                    value={newPlan.description || ''}
                                    onChange={(e) => updateNewPlanField('description', e.target.value)}
                                    className="w-full bg-card/50 border border-border/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Annual Price ({getCurrencySymbol(currency)})</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newPlan.pricePerYear ?? 0}
                                    onChange={(e) => updateNewPlanField('pricePerYear', parseFloat(e.target.value) || 0)}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    0 = free plan (no Razorpay sync)
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Royalty %</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={newPlan.royaltyPercent ?? 10}
                                    onChange={(e) => updateNewPlanField('royaltyPercent', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>GST %</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={newPlan.gstPercent ?? 18}
                                    onChange={(e) => updateNewPlanField('gstPercent', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>GST Treatment</Label>
                                <select
                                    value={newPlan.gstIncluded ? 'included' : 'excluded'}
                                    onChange={(e) => updateNewPlanField('gstIncluded', e.target.value === 'included')}
                                    className="w-full bg-card/50 border border-border/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="included">Included — entered price is final (GST inside)</option>
                                    <option value="excluded">Excluded — GST added on top at checkout</option>
                                </select>
                                {(newPlan.pricePerYear ?? 0) > 0 && (newPlan.gstPercent ?? 0) > 0 && (
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                        Customer pays: {getCurrencySymbol(newPlan.currency || 'INR')}
                                        {calculateTotalWithGst(
                                            newPlan.pricePerYear ?? 0,
                                            getGstPercent(newPlan),
                                            isGstIncluded(newPlan),
                                        ).toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Billing Period</Label>
                                <select
                                    value={newPlan.billingPeriod || 'yearly'}
                                    onChange={(e) => updateNewPlanField('billingPeriod', e.target.value as BillingPeriod)}
                                    className="w-full bg-card/50 border border-border/50 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 capitalize"
                                >
                                    {BILLING_PERIODS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    Razorpay cycle. How often the user is charged.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Interval</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={newPlan.interval ?? 1}
                                    onChange={(e) => updateNewPlanField('interval', parseInt(e.target.value) || 1)}
                                />
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    Every N periods (e.g. 1 yearly = once per year).
                                </p>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-4">
                                    Plan Limits
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Pending Releases</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={newPlan.limits?.maxPendingReleases ?? 1}
                                            onChange={(e) => updateNewPlanLimit('maxPendingReleases', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Artists</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={newPlan.limits?.maxArtists ?? 1}
                                            onChange={(e) => updateNewPlanLimit('maxArtists', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 rounded-2xl border border-border/80 bg-card/30 p-4 flex items-center justify-between gap-4">
                                    <Label>Allow Concurrent Uploads</Label>
                                    <Switch
                                        checked={newPlan.limits?.allowConcurrent ?? false}
                                        onCheckedChange={(checked: boolean) => updateNewPlanLimit('allowConcurrent', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreateOpen(false)}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreatePlan}
                                disabled={isCreating}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isCreating ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Plan
                                    </span>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <Dialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete plan?</DialogTitle>
                            <DialogDescription>
                                You're about to delete <span className="font-semibold">{planToDelete?.title}</span>.
                                The plan will be hidden from users and from new subscription / upgrade flows.
                                Existing subscribers on this plan are not cancelled automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setPlanToDelete(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                                {isDeleting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete plan
                                    </span>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
    );
}
