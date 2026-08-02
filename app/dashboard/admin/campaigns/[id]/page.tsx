'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Tag, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/get-error-message';
import PageLoading from '@/components/dashboard/page-loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  campaignsApi,
  formatCampaignDiscount,
  getCampaignUsagePlan,
  getCampaignUsageUser,
  type Campaign,
  type CampaignUsage,
} from '@/lib/api/campaigns';
import { getAllPlans, type Plan } from '@/lib/api/plans';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(value?: number) {
  if (value == null) return '—';
  return `₹${value.toLocaleString('en-IN')}`;
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

function formatPlanPrice(plan: Plan): string {
  if (plan.priceDisplay?.trim()) return plan.priceDisplay.trim();
  return `₹${Number(plan.pricePerYear || 0).toLocaleString('en-IN')}`;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{value}</div>
    </div>
  );
}

export default function CampaignViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = typeof params.id === 'string' ? params.id : '';

  const canView = hasPermission(user, 'VIEW_CAMPAIGNS');
  const canManage = hasPermission(user, 'MANAGE_CAMPAIGNS');

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [usages, setUsages] = useState<CampaignUsage[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!canView) {
      router.replace('/dashboard');
      return;
    }
    if (!campaignId) return;

    let active = true;
    (async () => {
      try {
        setIsLoading(true);
        const [campaignData, usageData, planList] = await Promise.all([
          campaignsApi.getById(campaignId),
          campaignsApi.getUsages(campaignId),
          getAllPlans(),
        ]);
        if (!active) return;
        setCampaign(campaignData);
        setUsages(usageData);
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
  }, [user, canView, router, campaignId]);

  const applicablePlans = useMemo(() => {
    if (!campaign) return [];
    const ids = new Set(normalizePlanIds(campaign.applicablePlans));
    return plans.filter((plan) => ids.has(plan._id));
  }, [campaign, plans]);

  if (!user || !canView || isLoading || !campaign) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3">
          <Link
            href="/dashboard/admin/campaigns"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to campaigns
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
              {campaign.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">{campaign.code}</p>
        </div>
        {canManage && (
          <Link
            href={`/dashboard/admin/campaigns/${campaign._id}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Discount</CardDescription>
            <CardTitle className="text-2xl">{formatCampaignDiscount(campaign)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Total redemptions</CardDescription>
            <CardTitle className="text-2xl">
              {campaign.usedCount}
              {campaign.maxUsage != null ? ` / ${campaign.maxUsage}` : ''}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Starts</CardDescription>
            <CardTitle className="text-base font-medium">{formatDate(campaign.startsAt)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Expires</CardDescription>
            <CardTitle className="text-base font-medium">{formatDate(campaign.expiresAt)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Campaign details
          </CardTitle>
          <CardDescription>Read-only campaign configuration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <DetailItem label="Code" value={<span className="font-mono">{campaign.code}</span>} />
          <DetailItem label="Name" value={campaign.name} />
          <DetailItem
            label="Description"
            value={campaign.description?.trim() || '—'}
          />
          <DetailItem
            label="Discount"
            value={`${campaign.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'} · ${formatCampaignDiscount(campaign)}`}
          />
          <DetailItem label="Max usage (global)" value={campaign.maxUsage ?? 'Unlimited'} />
          <DetailItem label="Max usage / user" value={campaign.maxUsagePerUser ?? 1} />
          <DetailItem label="First-time only" value={campaign.firstTimeOnly ? 'Yes' : 'No'} />
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Applicable subscription plans
            </p>
            {applicablePlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">No plans linked.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {applicablePlans.map((plan) => (
                  <Badge key={plan._id} variant="secondary" className="font-normal">
                    {plan.title} · {formatPlanPrice(plan)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users from this campaign
          </CardTitle>
          <CardDescription>
            {usages.length === 0
              ? 'No users have redeemed this campaign yet.'
              : `${usages.length} redemption${usages.length === 1 ? '' : 's'} recorded.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No usage data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Redeemed at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usages.map((usage) => {
                  const usageUser = getCampaignUsageUser(usage);
                  const usagePlan = getCampaignUsagePlan(usage);
                  return (
                    <TableRow key={usage._id}>
                      <TableCell>
                        <div className="font-medium">
                          {usageUser?.fullName || 'Unknown user'}
                        </div>
                        {usageUser?.userCode && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {usageUser.userCode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{usageUser?.email || '—'}</TableCell>
                      <TableCell>
                        {usagePlan?.title || usagePlan?.key || usageUser?.plan || '—'}
                      </TableCell>
                      <TableCell>{formatAmount(usage.originalAmount)}</TableCell>
                      <TableCell>{formatAmount(usage.discountAmount)}</TableCell>
                      <TableCell>{formatAmount(usage.payableAmount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(usage.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
