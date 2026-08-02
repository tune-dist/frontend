'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, Loader2, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/get-error-message';
import PageLoading from '@/components/dashboard/page-loading';
import { PageSearchBar, PageSearchSection } from '@/components/dashboard/page-search-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  campaignsApi,
  formatCampaignDiscount,
  type Campaign,
  type CampaignDiscountType,
  type CreateCampaignPayload,
} from '@/lib/api/campaigns';
import { getAllPlans, type Plan } from '@/lib/api/plans';
import { ApplicablePlansSelect } from '@/components/dashboard/campaigns/applicable-plans-select';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalInputValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultCreateForm(): CreateCampaignPayload & {
  startsAtLocal: string;
  expiresAtLocal: string;
} {
  const starts = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  return {
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startsAt: starts.toISOString(),
    expiresAt: expires.toISOString(),
    startsAtLocal: toLocalInputValue(starts.toISOString()),
    expiresAtLocal: toLocalInputValue(expires.toISOString()),
    applicablePlans: [],
    maxUsage: undefined,
    maxUsagePerUser: 1,
    firstTimeOnly: false,
    isActive: true,
  };
}

function matchesCampaignSearch(campaign: Campaign, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [campaign.code, campaign.name, campaign.description ?? ''].some((field) =>
    field.toLowerCase().includes(q),
  );
}

export default function CampaignsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canView = hasPermission(user, 'VIEW_CAMPAIGNS');
  const canManage = hasPermission(user, 'MANAGE_CAMPAIGNS');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(defaultCreateForm);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const [data, planList] = await Promise.all([
        campaignsApi.getAll(),
        getAllPlans(),
      ]);
      setCampaigns(data);
      setPlans(planList);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load campaigns'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!canView) {
      router.replace('/dashboard');
      return;
    }
    fetchCampaigns();
  }, [user, canView, router]);

  const filteredCampaigns = useMemo(
    () => campaigns.filter((item) => matchesCampaignSearch(item, searchQuery)),
    [campaigns, searchQuery],
  );

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code and name are required');
      return;
    }
    if (form.applicablePlans.length === 0) {
      toast.error('Select at least one subscription plan');
      return;
    }

    try {
      setIsSaving(true);
      const payload: CreateCampaignPayload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startsAt: new Date(form.startsAtLocal).toISOString(),
        expiresAt: new Date(form.expiresAtLocal).toISOString(),
        applicablePlans: form.applicablePlans,
        maxUsage:
          form.maxUsage != null && !Number.isNaN(Number(form.maxUsage))
            ? Number(form.maxUsage)
            : undefined,
        maxUsagePerUser: Number(form.maxUsagePerUser ?? 1),
        firstTimeOnly: Boolean(form.firstTimeOnly),
        isActive: form.isActive !== false,
      };

      const created = await campaignsApi.create(payload);
      toast.success('Campaign created');
      setIsDialogOpen(false);
      setForm(defaultCreateForm());
      await fetchCampaigns();
      router.push(`/dashboard/admin/campaigns/${created._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create campaign'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId || isDeactivating) return;
    try {
      setIsDeactivating(true);
      await campaignsApi.deactivate(deactivateId);
      toast.success('Campaign deactivated');
      setDeactivateId(null);
      fetchCampaigns();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to deactivate campaign'));
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!user || !canView) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage discount campaigns and track which users redeemed them.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setForm(defaultCreateForm());
              setIsDialogOpen(true);
            }}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        )}
      </div>

      <PageSearchSection>
        <PageSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by code or name…"
        />
      </PageSearchSection>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No campaigns found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell className="font-mono font-medium">{campaign.code}</TableCell>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{formatCampaignDiscount(campaign)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{formatDate(campaign.startsAt)}</div>
                      <div>→ {formatDate(campaign.expiresAt)}</div>
                    </TableCell>
                    <TableCell>
                      {campaign.usedCount}
                      {campaign.maxUsage != null ? ` / ${campaign.maxUsage}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/campaigns/${campaign._id}`}
                          className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        {canManage && (
                          <Link
                            href={`/dashboard/admin/campaigns/${campaign._id}/edit`}
                            className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                        )}
                        {canManage && campaign.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive"
                            onClick={() => setDeactivateId(campaign._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Set discount rules and validity for a new campaign code.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Welcome Offer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid gap-2">
              <Label>Applicable subscription plans</Label>
              <ApplicablePlansSelect
                plans={plans}
                selectedIds={form.applicablePlans}
                onChange={(ids) => setForm({ ...form, applicablePlans: ids })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxUsage">Max usage (global)</Label>
                <Input
                  id="maxUsage"
                  type="number"
                  min={1}
                  value={form.maxUsage ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxUsage: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxUsagePerUser">Max usage / user</Label>
                <Input
                  id="maxUsagePerUser"
                  type="number"
                  min={1}
                  value={form.maxUsagePerUser ?? 1}
                  onChange={(e) => setForm({ ...form, maxUsagePerUser: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
              <Label htmlFor="firstTimeOnly">First-time only</Label>
              <Switch
                id="firstTimeOnly"
                checked={Boolean(form.firstTimeOnly)}
                onCheckedChange={(checked) => setForm({ ...form, firstTimeOnly: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deactivateId)} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate campaign?</DialogTitle>
            <DialogDescription>
              The campaign will be marked inactive and can no longer be redeemed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateId(null)} disabled={isDeactivating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={isDeactivating}>
              {isDeactivating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
