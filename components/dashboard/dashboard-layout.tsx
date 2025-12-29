'use client'

import Sidebar from './sidebar'
import TopNavbar from './top-navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { UIProvider, useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import UpgradePlanModal from './upgrade-plan-modal'
import PlanExpiredModal from './plan-expired-modal'
import { useState, useEffect } from 'react'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isUpgradeModalOpen, closeUpgradeModal } = useUI()
  const { user } = useAuth()
  const [isPlanExpiredModalOpen, setIsPlanExpiredModalOpen] = useState(false)

  useEffect(() => {
    if (user?.planEndDate) {
      const expiryDate = new Date(user.planEndDate)
      const now = new Date()
      const hasShownExpiryModal = localStorage.getItem(`hasShownExpiryModal_${user._id}_${user.planEndDate}`)

      if (expiryDate < now && !hasShownExpiryModal) {
        setIsPlanExpiredModalOpen(true)
        localStorage.setItem(`hasShownExpiryModal_${user._id}_${user.planEndDate}`, 'true')
      }
    }
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopNavbar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlanKey={user?.plan}
      />
      <PlanExpiredModal
        isOpen={isPlanExpiredModalOpen}
        onClose={() => setIsPlanExpiredModalOpen(false)}
      />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <UIProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </UIProvider>
    </ProtectedRoute>
  )
}


