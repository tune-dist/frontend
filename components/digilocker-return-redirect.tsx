'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  digilockerCallbackPath,
  isDigilockerReturnQuery,
} from '@/lib/digilocker-return'

export function DigilockerReturnRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isDigilockerReturnQuery(searchParams)) return
    router.replace(digilockerCallbackPath(searchParams.toString()))
  }, [router, searchParams])

  return null
}
