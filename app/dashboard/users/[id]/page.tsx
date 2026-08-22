'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/api/auth';
import { getUserById, updateUserStatus } from '@/lib/api/users';
import { canManageUsers, canViewUsers } from '@/lib/permissions';
import { getErrorMessage } from '@/lib/get-error-message';
import UserProfileView from '@/components/dashboard/user-profile-view';

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser && !canViewUsers(currentUser)) {
      router.push('/dashboard');
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    const loadUser = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const data = await getUserById(params.id);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        toast.error(getErrorMessage(error, 'Failed to load user profile'));
        router.push('/dashboard/users');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && currentUser && canViewUsers(currentUser)) {
      loadUser();
    }
  }, [params.id, authLoading, currentUser, router]);

  const handleToggleSuspend = async () => {
    if (!profile) return;

    const action = profile.isSuspended ? 'unsuspend' : 'suspend';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${profile.fullName}?`,
    );
    if (!confirmed) return;

    setUpdatingStatus(true);
    try {
      const updated = await updateUserStatus(profile._id, !profile.isSuspended);
      setProfile(updated);
      toast.success(`User ${updated.isSuspended ? 'suspended' : 'unsuspended'} successfully`);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toast.error(getErrorMessage(error, `Failed to ${action} user`));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <UserProfileView
      profile={profile}
      canManage={canManageUsers(currentUser)}
      isSelf={currentUser?._id === profile._id}
      updatingStatus={updatingStatus}
      onToggleSuspend={handleToggleSuspend}
    />
  );
}
