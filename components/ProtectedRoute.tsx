'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // TEMPORARILY DISABLED - Bypass login for testing
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/auth');
  //   }
  // }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  // If not authenticated, don't render children
  // if (!isAuthenticated) {
  //   return null;
  // }

  return <>{children}</>;
}
