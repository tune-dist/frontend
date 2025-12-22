'use client'

import React, { createContext, useContext, useState } from 'react'

interface UIContextType {
    isUpgradeModalOpen: boolean
    openUpgradeModal: () => void
    closeUpgradeModal: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

    const openUpgradeModal = () => setIsUpgradeModalOpen(true)
    const closeUpgradeModal = () => setIsUpgradeModalOpen(false)

    return (
        <UIContext.Provider value={{ isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal }}>
            {children}
        </UIContext.Provider>
    )
}

export function useUI() {
    const context = useContext(UIContext)
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider')
    }
    return context
}
