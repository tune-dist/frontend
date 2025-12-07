'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
    const router = useRouter()

    useEffect(() => {
        router.push('/dashboard/upload')
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting to dashboard...</p>
        </div>
    )
}
