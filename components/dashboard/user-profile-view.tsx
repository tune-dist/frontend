'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/lib/api/auth';
import { formatPlanDisplayName } from '@/lib/utils';
import { getUserAccountStatus } from '@/lib/user-status';
import { formatRoleLabel, formatPermissionLabel } from '@/lib/rbac-labels';
import { getDisplayUrl } from '@/lib/api/s3';
import { S3Image } from '@/components/ui/s3-image';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function formatDate(date?: string | null) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface UserProfileViewProps {
  profile: User;
  backHref?: string;
  canManage?: boolean;
  isSelf?: boolean;
  updatingStatus?: boolean;
  onToggleSuspend?: () => void;
}

function ReadOnlyVerificationDocCard({
  label,
  document,
  isVerified,
}: {
  label: string;
  document?: { url: string; filename: string; uploadedAt: string };
  isVerified?: boolean;
}) {
  const [opening, setOpening] = useState(false);

  const handleView = async () => {
    if (!document?.url) return;
    setOpening(true);
    try {
      const signedUrl = await getDisplayUrl(document.url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open document');
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="flex-1 space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {isVerified ? (
          <span className="flex items-center gap-1 text-xs font-medium text-green-500">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
          </span>
        ) : document ? (
          <span className="text-xs font-medium text-amber-500">Uploaded</span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">Not uploaded</span>
        )}
      </div>

      {document ? (
        <Button size="sm" variant="outline" onClick={handleView} disabled={opening}>
          {opening ? <Loader2 className="mx-4 h-3 w-3 animate-spin" /> : 'View'}
        </Button>
      ) : null}
    </div>
  );
}

export default function UserProfileView({
  profile,
  backHref = '/dashboard/users',
  canManage = false,
  isSelf = false,
  updatingStatus = false,
  onToggleSuspend,
}: UserProfileViewProps) {
  const accountStatus = getUserAccountStatus(profile);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              <span className="animated-gradient">User</span> Profile
            </h1>
            <p className="text-muted-foreground">
              View account details, verification status, and subscription information
            </p>
          </div>
        </div>

        {canManage && !isSelf && onToggleSuspend ? (
          <Button
            type="button"
            variant={profile.isSuspended ? 'default' : 'destructive'}
            onClick={onToggleSuspend}
            disabled={updatingStatus}
            className="shrink-0"
          >
            {updatingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            {profile.isSuspended ? 'Unsuspend User' : 'Suspend User'}
          </Button>
        ) : null}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>User personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="order-2 flex-1 space-y-4 md:order-1">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={profile.fullName || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      disabled
                      className="bg-muted pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profile.phoneNumber || 'Not provided'}
                      disabled
                      className="bg-muted pl-10"
                    />
                  </div>
                  {(profile.isPhoneNumberVerified || profile.isPhoneVerified) && (
                    <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Phone verified
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={formatRoleLabel(profile.role)} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>User Code</Label>
                    <Input value={profile.userCode || 'N/A'} disabled className="bg-muted font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Input value={accountStatus} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Verified</Label>
                    <Input
                      value={profile.isEmailVerified ? 'Yes' : 'No'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <div className="order-1 flex flex-col items-center gap-4 md:order-2">
                <div className="relative">
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted">
                    {profile.avatar ? (
                      <S3Image
                        src={profile.avatar}
                        alt={profile.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>Residential address on file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address || 'No address provided'}
                disabled
                rows={3}
                className="bg-muted resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {profile.role === 'artist' && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile Verification
              </CardTitle>
              <CardDescription>PAN and Aadhar verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.isProfileVerified ? (
                <p className="flex items-center gap-2 text-sm font-medium text-green-500">
                  <CheckCircle2 className="h-4 w-4" /> Profile is fully verified
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Profile verification is incomplete or pending review.
                </p>
              )}

              <div className="flex flex-col gap-4 sm:flex-row">
                <ReadOnlyVerificationDocCard
                  label="PAN Card"
                  document={profile.pan}
                  isVerified={profile.isPanVerified}
                />
                <ReadOnlyVerificationDocCard
                  label="Aadhar Card"
                  document={profile.aadhar}
                  isVerified={profile.isAadharVerified}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Current plan and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/80 p-4">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="mt-1 text-2xl font-bold">{formatPlanDisplayName(profile.plan)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="mt-1 text-lg font-semibold">{formatDate(profile.createdAt)}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Plan Started</p>
                <p className="mt-1 text-lg font-semibold">{formatDate(profile.planStartDate)}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Plan Ends</p>
                <p className="mt-1 text-lg font-semibold">{formatDate(profile.planEndDate)}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Subscription Status</p>
                <p className="mt-1 text-lg font-semibold capitalize">
                  {profile.subscriptionStatus || (profile.isSubscriptionActive ? 'active' : 'inactive')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Activity and usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="mt-1 text-2xl font-bold">{profile.usage?.totalReleases || 0}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="mt-1 text-2xl font-bold">{profile.usage?.totalStreams || 0}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Revenue Earned</p>
                <p className="mt-1 text-2xl font-bold">
                  ${(profile.usage?.revenueEarned ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="mt-1 text-2xl font-bold">
                  {((profile.usage?.storageUsed ?? 0) / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {profile.permissions?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>Effective permissions from role and direct assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-md border border-purple-500/30 bg-purple-500/15 px-2.5 py-1 text-xs font-medium text-purple-200"
                  >
                    {formatPermissionLabel(permission)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
