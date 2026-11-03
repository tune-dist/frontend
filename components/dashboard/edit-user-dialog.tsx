'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/lib/api/auth';
import { getAllPlans } from '@/lib/api/plans';
import { getUserById, updateUserByAdmin } from '@/lib/api/users';
import { getErrorMessage } from '@/lib/get-error-message';
import { formatPlanDisplayName } from '@/lib/plans-display';

interface EditUserDialogProps {
  open: boolean;
  userId: string;
  onOpenChange: (open: boolean) => void;
  onUpdated: (user: User) => void;
}

export default function EditUserDialog({
  open,
  userId,
  onOpenChange,
  onUpdated,
}: EditUserDialogProps) {
  const [plans, setPlans] = useState<{ key: string; title: string }[]>([]);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [originalPhone, setOriginalPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    let cancelled = false;
    setLoading(true);
    Promise.all([getUserById(userId), getAllPlans()])
      .then(([user, planList]) => {
        if (cancelled) return;
        const nextPlans = planList.map((item) => ({
          key: item.key,
          title: item.title || formatPlanDisplayName(item.key),
        }));
        if (user.plan && !nextPlans.some((item) => item.key === user.plan)) {
          nextPlans.push({
            key: user.plan,
            title: formatPlanDisplayName(user.plan),
          });
        }
        setPlans(nextPlans);
        setFullName(user.fullName || '');
        setPhoneNumber(user.phoneNumber || '');
        setOriginalPhone(user.phoneNumber || '');
        setAddress(user.address || '');
        setPlan(user.plan || 'free');
        setPhoneVerified(Boolean(user.isPhoneVerified));
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getErrorMessage(error, 'Failed to load user'));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      toast.error('Full name must be at least 2 characters.');
      return;
    }
    if (!plan) return;

    setSaving(true);
    try {
      const updated = await updateUserByAdmin(userId, {
        fullName: trimmedName,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        plan,
      });
      onUpdated(updated);
      toast.success(`${updated.fullName} updated`);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    } finally {
      setSaving(false);
    }
  };

  const phoneChanged = phoneVerified && phoneNumber.trim() !== originalPhone.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-user-name">Full name</Label>
            <Input
              id="edit-user-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-user-phone">Phone</Label>
            <Input
              id="edit-user-phone"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              disabled={loading || saving}
            />
            {phoneChanged ? (
              <p className="text-xs text-muted-foreground">
                Changing this number clears phone verification.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-user-address">Address</Label>
            <Textarea
              id="edit-user-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={loading || saving}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-user-plan">Plan</Label>
            <Select value={plan} onValueChange={setPlan} disabled={loading || saving || !plan}>
              <SelectTrigger id="edit-user-plan" className="w-full">
                <SelectValue placeholder={loading ? 'Loading...' : 'Select plan'} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The new plan is applied immediately. Paid plans stay active for one year.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || loading || !plan}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
