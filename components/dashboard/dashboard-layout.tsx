'use client'

import Sidebar from './sidebar'
import TopNavbar from './top-navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { cn } from '@/lib/utils'
import { UIProvider, useUI } from '@/contexts/UIContext'
import { useAuth } from '@/contexts/AuthContext'
import UpgradePlanModal from './upgrade-plan-modal'
import PlanExpiredModal from './plan-expired-modal'
import PlanExpiringSoonBanner from './plan-expiring-soon-banner'
import { useState, useEffect } from 'react'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isUpgradeModalOpen, closeUpgradeModal, isSidebarCollapsed } = useUI()
  const { user } = useAuth()
  const [isPlanExpiredModalOpen, setIsPlanExpiredModalOpen] = useState(false)
  const [isExpiringSoonBannerOpen, setIsExpiringSoonBannerOpen] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    if (user?.planEndDate) {
      const expiryDate = new Date(user.planEndDate)
      const now = new Date()

      // Handle expired plan
      const hasShownExpiryModal = localStorage.getItem(`hasShownExpiryModal_${user._id}_${user.planEndDate}`)
      if (expiryDate < now && !hasShownExpiryModal) {
        setIsPlanExpiredModalOpen(true)
        localStorage.setItem(`hasShownExpiryModal_${user._id}_${user.planEndDate}`, 'true')
      }

      // Handle expiring soon
      if (user.plan !== 'free' && expiryDate > now) {
        const diffTime = expiryDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Threshold: 5 days
        if (diffDays <= 5) {
          setDaysRemaining(diffDays)

          // Check if dismissed in this session
          const isDismissed = sessionStorage.getItem(`dismissedExpiringSoon_${user._id}_${user.planEndDate}`)
          if (!isDismissed) {
            setIsExpiringSoonBannerOpen(true)
          }
        }
      }
    }
  }, [user])

  const handleCloseExpiringSoon = () => {
    setIsExpiringSoonBannerOpen(false)
    if (user) {
      sessionStorage.setItem(`dismissedExpiringSoon_${user._id}_${user.planEndDate}`, 'true')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
      )}>
        <TopNavbar />
        {isExpiringSoonBannerOpen && (
          <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none lg:pl-64">
            <div className="pointer-events-auto w-[90%] max-w-2xl">
              <PlanExpiringSoonBanner
                daysRemaining={daysRemaining}
                onClose={handleCloseExpiringSoon}
              />
            </div>
          </div>
        )}
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


