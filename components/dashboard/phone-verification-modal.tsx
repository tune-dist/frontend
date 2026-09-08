'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Phone, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  extractMsg91AccessToken,
  extractMsg91ReqId,
  MSG91_CAPTCHA_ELEMENT_ID,
  useMsg91Otp,
} from '@/hooks/use-msg91-otp'
import { verifyMsg91PhoneToken } from '@/lib/api/users'
import { formatPhoneForMsg91 } from '@/lib/phone-format'
import { getErrorMessage } from '@/lib/get-error-message'
import { User } from '@/lib/api/auth'

interface PhoneVerificationModalProps {
  /** Load MSG91 script when user still needs phone verification */
  active: boolean
  /** Show blocking modal UI */
  isOpen: boolean
  onVerified: (user: User) => void
}

type Step = 'phone' | 'otp'

export default function PhoneVerificationModal({
  active,
  isOpen,
  onVerified,
}: PhoneVerificationModalProps) {
  const { ready, configured, initError, retry } = useMsg91Otp(active && isOpen)
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [reqId, setReqId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const canResend = step === 'otp' && timer <= 0

  useEffect(() => {
    if (!isOpen) {
      setStep('phone')
      setPhone('')
      setOtp('')
      setReqId(null)
      setLoading(false)
      setTimer(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) {
      return
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [step, timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleSendOtp = () => {
    if (!configured) {
      toast.error('Phone verification is not configured. Contact support.')
      return
    }

    if (!ready || typeof window.sendOtp !== 'function') {
      if (initError) {
        toast.error('Verification service failed to load. Please refresh the page.')
      } else {
        toast.error('Verification service is loading. Please wait a moment.')
      }
      return
    }

    const identifier = formatPhoneForMsg91(phone)
    if (identifier.length < 12) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    window.sendOtp(
      identifier,
      (data) => {
        const nextReqId = extractMsg91ReqId(data)

        setReqId(nextReqId)
        setStep('otp')
        setOtp('')
        setTimer(120)
        setLoading(false)
        toast.success('OTP sent to your mobile number')
      },
      (error) => {
        console.error('MSG91 sendOtp failed:', error)
        toast.error('Failed to send OTP. Please try again.')
        setLoading(false)
      },
    )
  }

  const handleVerifyOtp = () => {
    if (!ready || typeof window.verifyOtp !== 'function') {
      toast.error('Verification service is not ready')
      return
    }

    if (otp.trim().length < 4) {
      toast.error('Please enter the OTP')
      return
    }

    setLoading(true)
    window.verifyOtp(
      otp.trim(),
      async (data) => {
        try {
          const accessToken = extractMsg91AccessToken(data)
          if (!accessToken) {
            throw new Error('Missing verification token')
          }

          const updatedUser = await verifyMsg91PhoneToken(
            accessToken,
            formatPhoneForMsg91(phone),
          )
          toast.success('Phone number verified successfully')
          onVerified(updatedUser)
        } catch (error) {
          toast.error(getErrorMessage(error, 'Phone verification failed'))
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error('MSG91 verifyOtp failed:', error)
        toast.error('Invalid OTP. Please try again.')
        setLoading(false)
      },
      reqId ?? undefined,
    )
  }

  const handleResendOtp = () => {
    if (!ready || typeof window.retryOtp !== 'function') {
      return
    }

    setLoading(true)
    window.retryOtp(
      null,
      () => {
        setTimer(120)
        setLoading(false)
        toast.success('OTP resent successfully')
      },
      (error) => {
        console.error('MSG91 retryOtp failed:', error)
        toast.error('Failed to resend OTP')
        setLoading(false)
      },
      reqId ?? undefined,
    )
  }

  if (!active || !isOpen) {
    return null
  }

  return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-[121] w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Verify your mobile number
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Mobile verification is required to continue using KratoLib.
              </p>
            </div>

            {configured && (
              <div
                id={MSG91_CAPTCHA_ELEMENT_ID}
                className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                aria-hidden="true"
              />
            )}

            {!configured ? (
              <p className="text-center text-sm text-destructive">
                Phone verification is temporarily unavailable. Please contact support.
              </p>
            ) : initError ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">
                  Could not load the verification service. Please try again.
                </p>
                <div className="flex justify-center gap-2">
                  <Button type="button" variant="outline" onClick={retry}>
                    Try again
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => window.location.reload()}>
                    Refresh page
                  </Button>
                </div>
              </div>
            ) : !ready ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Setting up phone verification...
                </p>
              </div>
            ) : step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-phone">Mobile number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <span className="absolute left-10 top-2.5 text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="verify-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="pl-16"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We will send a one-time password to this number.
                  </p>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Enter the OTP sent to{' '}
                    <span className="font-medium text-foreground">
                      +91 {phone}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-otp">One-Time Password</Label>
                  <Input
                    id="verify-otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="- - - - - -"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    className="text-center text-lg tracking-widest"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 4}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStep('phone')
                      setOtp('')
                      setReqId(null)
                    }}
                    disabled={loading}
                  >
                    Change number
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                  >
                    {canResend
                      ? 'Resend OTP'
                      : `Resend OTP in ${formatTime(timer)}`}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
  )
}
