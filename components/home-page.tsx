'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Features from '@/components/features'
import HowItWorks from '@/components/how-it-works'
import Testimonials from '@/components/testimonials'
import StaticPricing2 from '@/components/StaticPricing2'
import Contact from '@/components/contact'
import FaqSection from '@/components/faq-section'
import Footer from '@/components/footer'
import { completeDigilockerVerification } from '@/lib/digilocker-flow'
import { getErrorMessage } from '@/lib/get-error-message'
import { Loader2 } from 'lucide-react'

function DigilockerCallbackGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, refreshUser } = useAuth()
  const [handling, setHandling] = useState(false)
  const startedRef = useRef(false)

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const hasDigilockerReturn = Boolean(code || state || error)

  useEffect(() => {
    if (loading || startedRef.current) return

    if (error) {
      startedRef.current = true
      toast.error(errorDescription || error || 'DigiLocker authorization failed')
      router.replace(isAuthenticated ? '/dashboard/profile' : '/auth')
      return
    }

    if (!code || !state) {
      if (isAuthenticated) {
        router.push('/dashboard')
      }
      return
    }

    if (!isAuthenticated) {
      startedRef.current = true
      toast.error('Log in first, then start DigiLocker again from Profile')
      router.replace('/auth')
      return
    }

    startedRef.current = true
    setHandling(true)

    ;(async () => {
      try {
        await completeDigilockerVerification(code, state)
        await refreshUser()
        toast.success('DigiLocker verification completed')
        router.replace('/dashboard/profile')
      } catch (err) {
        toast.error(getErrorMessage(err, 'DigiLocker verification failed'))
        router.replace('/dashboard/profile')
      }
    })()
  }, [loading, isAuthenticated, code, state, error, errorDescription, router, refreshUser])

  if (loading || handling || hasDigilockerReturn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {code || state ? 'Completing DigiLocker verification…' : 'Loading…'}
        </p>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }
    >
      <DigilockerCallbackGate>
        <main className="min-h-screen">
          <Navbar />
          <Hero />
          <Features />
          <HowItWorks />
          <Testimonials />
          <StaticPricing2 />
          <FaqSection />
          <Suspense fallback={<div className="min-h-[600px] w-full" />}>
            <Contact />
          </Suspense>
          <Footer />
        </main>
      </DigilockerCallbackGate>
    </Suspense>
  )
}
