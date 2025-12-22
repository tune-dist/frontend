'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
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
import { Plan, getAllPlans, adminUpdatePlan } from '@/lib/api/plans';
import toast from 'react-hot-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlanManagementPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Plan>>({});
    const [activeTab, setActiveTab] = useState('general');
    const [currency, setCurrency] = useState('INR');

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

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const data = await getAllPlans(true);
            setPlans(data);
            if (data.length > 0 && !selectedPlan) {
                handleSelectPlan(data[0]);
            }
        } catch (error) {
            toast.error('Failed to load plans');
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

    const handleSave = async () => {
        if (!selectedPlan) return;
        try {
            setIsSaving(true);
            console.log('Sending update:', editForm);
            await adminUpdatePlan(selectedPlan.key, editForm);
            toast.success('Plan updated successfully');
            fetchPlans();
        } catch (error: any) {
            console.error('Update error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to update plan');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
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
                        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(124,58,237,0.3)]">
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
                                    : 'border-border/50 bg-card/50 hover:bg-card hover:border-border'}`}
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
                                <Badge className={`${plan.isActive ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'} border-0 uppercase text-[10px] font-bold`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <div className="text-4xl font-black mb-8">
                                {plan.priceDisplay || (plan.pricePerYear).toFixed(2)}<span className="text-lg text-muted-foreground font-normal">/yr</span>
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

                                <TabsContent value="general" className="space-y-8 bg-card/30 p-8 rounded-3xl border border-border/50 backdrop-blur-sm">
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

                                <TabsContent value="pricing" className="space-y-8 bg-card/30 p-8 rounded-3xl border border-border/50 backdrop-blur-sm">
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

                                <TabsContent value="features" className="space-y-8 bg-card/30 p-8 rounded-3xl border border-border/50 backdrop-blur-sm">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2">Internal Limits & Entitlements</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                        <div className="space-y-4">
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
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground font-semibold flex items-center justify-between">
                                                    Max Storage (GB)
                                                    <span className="text-primary font-bold">{editForm.limits?.maxStorageGB || 0}</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={editForm.limits?.maxStorageGB || 0}
                                                    onChange={(e) => handleLimitChange('maxStorageGB', parseInt(e.target.value))}
                                                    className="bg-card/50 border-border/50 rounded-xl h-12"
                                                />
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <div className="flex items-center justify-between">
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
                                            </div>
                                        </div>
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
                                    <div key={idx} className="p-4 rounded-2xl border border-border/50 bg-card/30 flex items-center justify-between transition-all hover:bg-card/50 group">
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
            </div>
        </DashboardLayout>
    );
}
