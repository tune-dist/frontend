'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanExpiredModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PlanExpiredModal({ isOpen, onClose }: PlanExpiredModalProps) {
    const router = useRouter()

    const handleUpgrade = () => {
        onClose()
        router.push('/dashboard/subscription')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#1a1c23] border-border/50">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                    <DialogTitle className="text-xl text-center">Your Plan Has Expired</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Your premium subscription has ended. You've been moved to the <span className="text-primary font-semibold">Free Plan</span>. Some features may be restricted until you upgrade.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex sm:justify-center gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Continue with Free
                    </Button>
                    <Button onClick={handleUpgrade} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                        Upgrade Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
