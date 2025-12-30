'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

function CallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { loginWithToken } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        const refreshToken = searchParams.get('refresh_token')

        if (token) {
            loginWithToken(token, refreshToken || undefined)
                .then(() => {
                    toast.success('Successfully logged in!')
                })
                .catch((error) => {
                    console.error('Auth callback error:', error)
                    toast.error('Authentication failed')
                    router.push('/auth')
                })
        } else {
            toast.error('No token found')
            router.push('/auth')
        }
    }, [searchParams, loginWithToken, router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Completing sign in...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you.</p>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    )
}
