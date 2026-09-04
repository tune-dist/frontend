'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/class-names'

interface TooltipProps {
  children: ReactNode
  content: string
  enabled?: boolean
  className?: string
}

export const Tooltip = ({ children, content, enabled = true, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)

  if (!enabled) return <>{children}</>

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -5, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              "absolute left-full ml-3 z-50 pointer-events-none",
              className
            )}
          >
            {/* Tooltip Content */}
            <div className="relative px-3 py-1.5 text-xs font-medium text-foreground whitespace-nowrap rounded-md border border-border/50 bg-card/90 backdrop-blur-md shadow-xl">
              {/* Arrow */}
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b border-border/50 bg-card/90" />
              <span className="relative z-10">{content}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
