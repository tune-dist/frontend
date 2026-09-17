'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { completeDigilockerCallback } from '@/lib/api/profile-verifications'
import { getErrorMessage } from '@/lib/get-error-message'
import { useAuth } from '@/contexts/AuthContext'

function DigilockerCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, loading, isAuthenticated } = useAuth()
  const started = useRef(false)

  useEffect(() => {
    if (loading) return
    if (started.current) return
    started.current = true

    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    if (error) {
      toast.error(errorDescription || 'DigiLocker verification was cancelled')
      router.replace('/dashboard/profile')
      return
    }

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (!code || !state) {
      toast.error('DigiLocker did not return a verification code')
      router.replace('/dashboard/profile')
      return
    }

    if (!isAuthenticated) {
      toast.error('Log in to finish DigiLocker verification')
      router.replace('/auth')
      return
    }

    completeDigilockerCallback({ code, state })
      .then(async () => {
        await refreshUser()
        toast.success('KYC details saved from DigiLocker')
        router.replace('/dashboard/profile')
      })
      .catch((callbackError) => {
        toast.error(getErrorMessage(callbackError, 'DigiLocker verification failed'))
        router.replace('/dashboard/profile')
      })
  }, [isAuthenticated, loading, refreshUser, router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold">Completing DigiLocker verification...</h2>
      <p className="text-muted-foreground">Please wait while we save your verified details.</p>
    </div>
  )
}

export default function DigilockerCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <DigilockerCallbackContent />
    </Suspense>
  )
}
