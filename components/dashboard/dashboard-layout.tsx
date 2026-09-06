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
import PhoneVerificationModal from './phone-verification-modal'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { config } from '@/lib/config'
import { dispatchAuthUserUpdated } from '@/lib/auth-session'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isUpgradeModalOpen, closeUpgradeModal, isSidebarCollapsed } = useUI()
  const { user, refreshUser } = useAuth()
  const needsPlanSelection = user?.planSelected === false
  const needsPhoneVerification = Boolean(
    user && !user.isPhoneVerified && !user.isPhoneNumberVerified,
  )
  const showPhoneVerification = needsPhoneVerification && !needsPlanSelection
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

  const handlePhoneVerified = (updatedUser: Parameters<typeof dispatchAuthUserUpdated>[0]) => {
    dispatchAuthUserUpdated(updatedUser)
    Cookies.set('user', JSON.stringify(updatedUser), {
      expires: 7,
      sameSite: 'lax',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[220px]"
      )}>
        <TopNavbar />
        {isExpiringSoonBannerOpen && (
          <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none lg:pl-[220px]">
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
        isOpen={needsPlanSelection || isUpgradeModalOpen}
        onClose={needsPlanSelection ? () => {} : closeUpgradeModal}
        requireSelection={needsPlanSelection}
        currentPlanKey={needsPlanSelection ? undefined : user?.plan}
        hasActiveSubscription={
          !needsPlanSelection &&
          user?.hasPaidPlanAccess === true &&
          user.subscriptionStatus !== 'cancelled'
        }
        subscriptionStatus={user?.subscriptionStatus === 'cancelled' ? 'cancelled' : user?.subscriptionStatus === 'active' ? 'active' : undefined}
        onPaymentSuccess={refreshUser}
        title={needsPlanSelection ? 'Choose Your Plan' : undefined}
        subtitle={needsPlanSelection ? 'Select a plan to get started. You can begin with the free plan or upgrade for more features.' : undefined}
      />
      <PlanExpiredModal
        isOpen={isPlanExpiredModalOpen}
        onClose={() => setIsPlanExpiredModalOpen(false)}
      />
      <PhoneVerificationModal
        active={needsPhoneVerification}
        isOpen={showPhoneVerification}
        onVerified={handlePhoneVerified}
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


