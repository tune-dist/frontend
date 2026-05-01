'use client'

import React from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export default function BlogsContent() {
  return (
    <StaticPageLayout
      title="Music Distribution Blog - Guides, Tips & Artist Success Stories"
    >
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-12 max-w-2xl mx-auto backdrop-blur-md"
        >
          <Clock className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold text-white mb-4 font_heading">Coming Soon</h2>
          <p className="text-lg text-muted-foreground">
            Our editorial team is writing amazing articles and industry updates for you. We'll be live very soon!
          </p>
        </motion.div>
      </div>
    </StaticPageLayout>
  )
}
