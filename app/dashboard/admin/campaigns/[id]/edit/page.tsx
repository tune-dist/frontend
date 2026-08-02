'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/get-error-message';
import PageLoading from '@/components/dashboard/page-loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  campaignsApi,
  type Campaign,
  type CampaignDiscountType,
  type UpdateCampaignPayload,
} from '@/lib/api/campaigns';
import { getAllPlans, type Plan } from '@/lib/api/plans';
import { ApplicablePlansSelect } from '@/components/dashboard/campaigns/applicable-plans-select';

function toLocalInputValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizePlanIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && '_id' in item) {
        return String((item as { _id: string })._id);
      }
      return String(item);
    })
    .filter(Boolean);
}

type EditForm = {
  code: string;
  name: string;
  description: string;
  discountType: CampaignDiscountType;
  discountValue: number;
  startsAtLocal: string;
  expiresAtLocal: string;
  applicablePlans: string[];
  maxUsage: string;
  maxUsagePerUser: number;
  firstTimeOnly: boolean;
  isActive: boolean;
};

function campaignToForm(campaign: Campaign): EditForm {
  return {
    code: campaign.code,
    name: campaign.name,
    description: campaign.description ?? '',
    discountType: campaign.discountType,
    discountValue: campaign.discountValue,
    startsAtLocal: toLocalInputValue(campaign.startsAt),
    expiresAtLocal: toLocalInputValue(campaign.expiresAt),
    applicablePlans: normalizePlanIds(campaign.applicablePlans),
    maxUsage: campaign.maxUsage != null ? String(campaign.maxUsage) : '',
    maxUsagePerUser: campaign.maxUsagePerUser ?? 1,
    firstTimeOnly: Boolean(campaign.firstTimeOnly),
    isActive: Boolean(campaign.isActive),
  };
}

export default function CampaignEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = typeof params.id === 'string' ? params.id : '';

  const canManage = hasPermission(user, 'MANAGE_CAMPAIGNS');

  const [form, setForm] = useState<EditForm | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!canManage) {
      router.replace(campaignId ? `/dashboard/admin/campaigns/${campaignId}` : '/dashboard');
      return;
    }
    if (!campaignId) return;

    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const [campaignData, planList] = await Promise.all([
          campaignsApi.getById(campaignId),
          getAllPlans(),
        ]);
        if (!active) return;
        setForm(campaignToForm(campaignData));
        setPlans(planList);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load campaign'));
        router.replace('/dashboard/admin/campaigns');
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, canManage, router, campaignId]);

  const handleSave = async () => {
    if (!form || !campaignId) return;

    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required');
      return;
    }
    if (form.applicablePlans.length === 0) {
      toast.error('Select at least one subscription plan');
      return;
    }

    const payload: UpdateCampaignPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startsAt: new Date(form.startsAtLocal).toISOString(),
      expiresAt: new Date(form.expiresAtLocal).toISOString(),
      applicablePlans: form.applicablePlans,
      maxUsage: form.maxUsage === '' ? undefined : Number(form.maxUsage),
      maxUsagePerUser: Number(form.maxUsagePerUser),
      firstTimeOnly: form.firstTimeOnly,
      isActive: form.isActive,
    };

    try {
      setIsSaving(true);
      await campaignsApi.update(campaignId, payload);
      toast.success('Campaign updated');
      router.push(`/dashboard/admin/campaigns/${campaignId}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update campaign'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !canManage || isLoading || !form) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <Link
            href={`/dashboard/admin/campaigns/${campaignId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to view
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit campaign</h1>
            <p className="text-muted-foreground font-mono">{form.code}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Campaign settings</CardTitle>
          <CardDescription>Update discount rules, plans, and validity.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              rows={2}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discountType">Discount type</Label>
            <select
              id="discountType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value as CampaignDiscountType })
              }
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discountValue">Discount value</Label>
            <Input
              id="discountValue"
              type="number"
              min={0}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Applicable subscription plans</Label>
            <ApplicablePlansSelect
              plans={plans}
              selectedIds={form.applicablePlans}
              onChange={(ids) => setForm({ ...form, applicablePlans: ids })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startsAt">Starts at</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={form.startsAtLocal}
              onChange={(e) => setForm({ ...form, startsAtLocal: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiresAt">Expires at</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={form.expiresAtLocal}
              onChange={(e) => setForm({ ...form, expiresAtLocal: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxUsage">Max usage (global)</Label>
            <Input
              id="maxUsage"
              type="number"
              min={1}
              value={form.maxUsage}
              onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxUsagePerUser">Max usage / user</Label>
            <Input
              id="maxUsagePerUser"
              type="number"
              min={1}
              value={form.maxUsagePerUser}
              onChange={(e) => setForm({ ...form, maxUsagePerUser: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
            <Label htmlFor="firstTimeOnly">First-time only</Label>
            <Switch
              id="firstTimeOnly"
              checked={form.firstTimeOnly}
              onCheckedChange={(checked) => setForm({ ...form, firstTimeOnly: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
