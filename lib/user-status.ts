export type UserAccountStatus = 'Active' | 'Pending' | 'Suspended';

export interface UserStatusFields {
  isSuspended?: boolean;
  isEmailVerified?: boolean;
}

/** Account status shown in admin users list and profile — based on email verification, not legacy `isActive`. */
export function getUserAccountStatus(user: UserStatusFields): UserAccountStatus {
  if (user.isSuspended) return 'Suspended';
  if (user.isEmailVerified) return 'Active';
  return 'Pending';
}

export function getUserStatusDotClass(user: UserStatusFields): string {
  if (user.isSuspended) return 'bg-red-500';
  if (user.isEmailVerified) return 'bg-primary shadow-[0_0_8px_rgba(51,230,122,0.6)]';
  return 'bg-yellow-500';
}
