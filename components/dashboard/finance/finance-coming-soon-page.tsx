'use client'

import { motion } from 'framer-motion'
import { Clock, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function FinanceComingSoonPage() {
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
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Clock className="h-4 w-4" />
              Coming Soon
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight">Finance is on the way</h1>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              When Finance goes live, your streaming royalties, payouts, and monetization
              earnings will show up here — just like your other earnings in one place.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
