'use client'

import Sidebar from './sidebar'
import TopNavbar from './top-navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { UIProvider, useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import UpgradePlanModal from './upgrade-plan-modal'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isUpgradeModalOpen, closeUpgradeModal } = useUI()
  const { user } = useAuth()

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


