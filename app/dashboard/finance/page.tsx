'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageLoading from '@/components/dashboard/page-loading'
import FinanceComingSoonPage from '@/components/dashboard/finance/finance-coming-soon-page'
import { useAuth } from '@/contexts/AuthContext'
import { canViewBilling } from '@/lib/permissions'

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

  return <FinanceComingSoonPage />
}
