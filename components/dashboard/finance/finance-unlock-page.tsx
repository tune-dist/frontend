'use client'

import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUI } from '@/contexts/UIContext'

export default function FinanceUnlockPage() {
  const { openUpgradeModal } = useUI()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card overflow-hidden">
          <CardContent className="flex flex-col items-center px-8 py-14 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight">Unlock Finance</h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Your streaming royalties, payouts, and monetization earnings — all in one place.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Choose any Kratolib subscription to unlock Finance.
            </p>
            <Button type="button" className="mt-8" onClick={openUpgradeModal}>
              Explore Plans
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
