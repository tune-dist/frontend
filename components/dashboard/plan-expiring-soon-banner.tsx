'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { resumeSubscription } from '@/lib/api/payments'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface PlanExpiringSoonBannerProps {
    daysRemaining: number
    onClose: () => void
}

export default function PlanExpiringSoonBanner({ daysRemaining, onClose }: PlanExpiringSoonBannerProps) {
    const router = useRouter()
    const { refreshUser } = useAuth()
    const [loading, setLoading] = useState(false)

    const handleRenew = async () => {
        setLoading(true)
        try {
            const result = await resumeSubscription()
            if (result.success) {
                toast.success(result.message || 'Auto-pay re-enabled successfully!')
                await refreshUser()
                onClose()
            } else {
                toast.error(result.message || 'Failed to re-enable auto-pay')
                // Fallback to subscription page if resume fails
                router.push('/dashboard/subscription')
                onClose()
            }
        } catch (error) {
            console.error('Failed to resume subscription:', error)
            toast.error('Something went wrong. Redirecting to subscription page...')
            router.push('/dashboard/subscription')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="z-[100] w-full max-w-sm"
            >
                <div className="bg-[#1e293b] border border-amber-500/50 shadow-2xl rounded-2xl p-5 flex flex-col items-center text-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-500" />
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-base font-bold text-foreground">
                            Plan expiring in <span className="text-amber-500">{daysRemaining} days</span>
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your premium features will not be accessible after expiration. Would you like to renew?
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full pt-2">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-10 border-border/50 font-medium"
                            onClick={onClose}
                            disabled={loading}
                        >
                            No
                        </Button>
                        <Button 
                            className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-white border-none font-bold shadow-lg shadow-amber-500/20"
                            onClick={handleRenew}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Yes, Renew'
                            )}
                        </Button>
                    </div>

                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
