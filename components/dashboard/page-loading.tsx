'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageLoadingProps {
  className?: string
  label?: string
}

/** Consistent in-page loading state — use inside dashboard layout (sidebar stays visible). */
export default function PageLoading({ className, label }: PageLoadingProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center gap-3',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  )
}
