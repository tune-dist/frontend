'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export interface Msg91WidgetConfig {
  widgetId: string
  tokenAuth: string
  exposeMethods: true
  identifier?: string
  captchaRenderId?: string
  success: (data: unknown) => void
  failure: (error: unknown) => void
}

export interface Msg91SendResponse {
  reqId?: string
  message?: string
  [key: string]: unknown
}

export interface Msg91VerifyResponse {
  access_token?: string
  token?: string
  message?: string
  [key: string]: unknown
}

type Msg91Callback<T = unknown> = (data: T) => void

declare global {
  interface Window {
    initSendOTP?: (config: Msg91WidgetConfig) => void
    sendOtp?: (
      identifier: string,
      success?: Msg91Callback<Msg91SendResponse>,
      failure?: Msg91Callback<unknown>,
    ) => void
    retryOtp?: (
      channel: string | null,
      success?: Msg91Callback<unknown>,
      failure?: Msg91Callback<unknown>,
      reqId?: string,
    ) => void
    verifyOtp?: (
      otp: string,
      success?: Msg91Callback<Msg91VerifyResponse>,
      failure?: Msg91Callback<unknown>,
      reqId?: string,
    ) => void
    getWidgetData?: () => unknown
    isCaptchaVerified?: () => boolean
  }
}

export const MSG91_SCRIPT_SRC = 'https://verify.msg91.com/otp-provider.js'
export const MSG91_SCRIPT_ID = 'msg91-otp-provider-script'
export const MSG91_CAPTCHA_ELEMENT_ID = 'msg91-phone-captcha'

const METHOD_POLL_INTERVAL_MS = 200
const METHOD_POLL_MAX_MS = 30000

export function getMsg91Credentials() {
  const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID
  const tokenAuth = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH

  if (!widgetId || !tokenAuth) {
    return null
  }

  return { widgetId, tokenAuth }
}

export function extractMsg91AccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const nestedResponse =
    record.response && typeof record.response === 'object'
      ? (record.response as Record<string, unknown>)
      : null

  const explicitCandidates = [
    record['access-token'],
    record.access_token,
    nestedResponse?.['access-token'],
    nestedResponse?.access_token,
    record.token,
    nestedResponse?.token,
  ]

  for (const candidate of explicitCandidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  const messageCandidates = [nestedResponse?.message, record.message]
  for (const candidate of messageCandidates) {
    if (typeof candidate === 'string' && looksLikeAccessToken(candidate)) {
      return candidate.trim()
    }
  }

  return null
}

function looksLikeAccessToken(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 40) return false
  // JWT access tokens contain dots; reqId hex strings do not.
  if (trimmed.includes('.')) return true
  return false
}

function isLikelyReqId(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const str = String(value).trim()
  if (str.length < 8) return false
  if (/otp sent|success|verification|invalid|error|failed/i.test(str)) return false
  return /^[a-zA-Z0-9_-]+$/.test(str)
}

function tryGetReqIdFromWidget(): string | null {
  if (typeof window.getWidgetData !== 'function') return null

  try {
    const widgetData = window.getWidgetData() as Record<string, unknown> | null
    if (!widgetData || typeof widgetData !== 'object') return null

    const candidates = [
      widgetData.reqId,
      (widgetData.otpRes as Record<string, unknown> | undefined)?.reqId,
      (widgetData.otpRes as Record<string, unknown> | undefined)?.message,
      (widgetData.response as Record<string, unknown> | undefined)?.reqId,
      (widgetData.response as Record<string, unknown> | undefined)?.message,
    ]

    for (const candidate of candidates) {
      if (isLikelyReqId(candidate)) {
        return String(candidate)
      }
    }
  } catch {
    return null
  }

  return null
}

export function extractMsg91ReqId(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return tryGetReqIdFromWidget()
  }

  const record = data as Record<string, unknown>
  const nestedResponse =
    record.response && typeof record.response === 'object'
      ? (record.response as Record<string, unknown>)
      : null

  const candidates = [
    record.reqId,
    record.request_id,
    record.requestId,
    record.referenceId,
    nestedResponse?.reqId,
    nestedResponse?.message,
    record.message,
  ]

  for (const candidate of candidates) {
    if (isLikelyReqId(candidate)) {
      return String(candidate)
    }
  }

  return tryGetReqIdFromWidget()
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function loadMsg91Script(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'))
  }

  if (typeof window.initSendOTP === 'function') {
    return Promise.resolve()
  }

  const existing = document.getElementById(MSG91_SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      if (typeof window.initSendOTP === 'function') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load MSG91 script')),
        { once: true },
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = MSG91_SCRIPT_ID
    script.src = MSG91_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load MSG91 script'))
    document.body.appendChild(script)
  })
}

async function waitForCondition(
  check: () => boolean,
  maxMs: number,
): Promise<boolean> {
  const started = Date.now()

  while (Date.now() - started < maxMs) {
    if (check()) {
      return true
    }
    await sleep(METHOD_POLL_INTERVAL_MS)
  }

  return check()
}

let msg91InitPromise: Promise<void> | null = null
let msg91InitKey: string | null = null

function resetMsg91InitCache() {
  msg91InitPromise = null
  msg91InitKey = null
}

async function ensureMsg91Initialized(widgetId: string, tokenAuth: string) {
  const key = `${widgetId}:${tokenAuth}`

  if (msg91InitPromise && msg91InitKey === key) {
    return msg91InitPromise
  }

  msg91InitKey = key
  msg91InitPromise = (async () => {
    await loadMsg91Script()

    const hasMethods =
      typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function' &&
      typeof window.retryOtp === 'function'

    if (hasMethods) {
      return
    }

    if (typeof window.initSendOTP !== 'function') {
      throw new Error('MSG91 initSendOTP is unavailable')
    }

    // Allow React to paint the captcha mount node first (visible captcha widgets).
    await waitForCondition(
      () => Boolean(document.getElementById(MSG91_CAPTCHA_ELEMENT_ID)),
      5000,
    )

    const captchaMount = document.getElementById(MSG91_CAPTCHA_ELEMENT_ID)

    window.initSendOTP({
      widgetId,
      tokenAuth,
      exposeMethods: true,
      ...(captchaMount ? { captchaRenderId: MSG91_CAPTCHA_ELEMENT_ID } : {}),
      success: () => {},
      failure: () => {},
    })

    const ready = await waitForCondition(
      () =>
        typeof window.sendOtp === 'function' &&
        typeof window.verifyOtp === 'function' &&
        typeof window.retryOtp === 'function',
      METHOD_POLL_MAX_MS,
    )

    if (!ready) {
      throw new Error('MSG91 methods were not exposed in time')
    }
  })()

  try {
    await msg91InitPromise
  } catch (error) {
    resetMsg91InitCache()
    throw error
  }
}

export function useMsg91Otp(enabled = true) {
  const credentials = useMemo(() => getMsg91Credentials(), [])
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback(() => {
    resetMsg91InitCache()
    setInitError(false)
    setReady(false)
    setRetryCount((count) => count + 1)
  }, [])

  useEffect(() => {
    if (!enabled || !credentials) {
      setReady(false)
      return
    }

    let cancelled = false

    ensureMsg91Initialized(credentials.widgetId, credentials.tokenAuth)
      .then(() => {
        if (!cancelled) {
          setReady(true)
          setInitError(false)
        }
      })
      .catch((error) => {
        console.error('MSG91 initialization failed:', error)
        if (!cancelled) {
          setReady(false)
          setInitError(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [credentials, enabled, retryCount])

  return {
    ready: ready && Boolean(credentials),
    configured: Boolean(credentials),
    initError,
    retry,
  }
}
