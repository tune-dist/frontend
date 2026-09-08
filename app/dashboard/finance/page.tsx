'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLoading from '@/components/dashboard/page-loading'
import FinanceComingSoonPage from '@/components/dashboard/finance/finance-coming-soon-page'
import FinanceUnlockPage from '@/components/dashboard/finance/finance-unlock-page'
import { useAuth } from '@/contexts/AuthContext'
import { canViewBilling } from '@/lib/permissions'
import { isEffectiveFreePlan } from '@/lib/plan-access'

export default function FinancePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user && !canViewBilling(user)) {
      router.push('/dashboard')
    }
  }, [authLoading, user, router])

  if (authLoading || !user || !canViewBilling(user)) {
    return <PageLoading />
  }

  if (isEffectiveFreePlan(user)) {
    return <FinanceUnlockPage />
  }

  return <FinanceComingSoonPage />
}
