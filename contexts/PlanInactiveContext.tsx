'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import UpgradePlanModal from '@/components/dashboard/upgrade-plan-modal'
import { useAuth } from '@/contexts/AuthContext'
import { setPlanInactiveHandler, PlanInactivePayload } from '@/lib/plan-inactive'

interface PlanInactiveContextValue {
    open: (payload?: PlanInactivePayload) => void
    close: () => void
}

const PlanInactiveContext = createContext<PlanInactiveContextValue | null>(null)

export const PlanInactiveProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback((_payload?: PlanInactivePayload) => {
        setIsOpen(true)
    }, [])

    const close = useCallback(() => setIsOpen(false), [])

    useEffect(() => {
        setPlanInactiveHandler(open)
        return () => setPlanInactiveHandler(null)
    }, [open])

    const value = useMemo(() => ({ open, close }), [open, close])

    return (
        <PlanInactiveContext.Provider value={value}>
            {children}
            {/* PLAN_INACTIVE means the user's previous sub is gone (cancelled / halted /
                expired), so the new purchase is a fresh subscription, not an upgrade. */}
            <UpgradePlanModal
                isOpen={isOpen}
                onClose={close}
                currentPlanKey={user?.plan}
                hasActiveSubscription={false}
                title="Your subscription is no longer active"
                subtitle="Choose a plan to continue using this feature."
            />
        </PlanInactiveContext.Provider>
    )
}

export const usePlanInactiveModal = () => {
    const ctx = useContext(PlanInactiveContext)
    if (!ctx) throw new Error('usePlanInactiveModal must be used within PlanInactiveProvider')
    return ctx
}
