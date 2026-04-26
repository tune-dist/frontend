'use client'

import Lenis from 'lenis'
import { useEffect, useRef, createContext, useContext, ReactNode } from 'react'

// ── Context so any child can access the Lenis instance if needed ──────────────
const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
    return useContext(LenisContext)
}

// ── Provider ──────────────────────────────────────────────────────────────────
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        // iOS/touch devices have native momentum scroll — Lenis conflicts with it
        const isTouchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        const lenis = new Lenis({
            duration: 1.2,          // scroll animation duration (seconds)
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        })

        lenisRef.current = lenis

        // RAF loop
        let rafId: number
        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        // Make anchor links work with smooth scroll
        function handleAnchorClick(e: MouseEvent) {
            const target = e.target as HTMLElement
            const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null
            if (!anchor) return

            const id = anchor.getAttribute('href')
            if (!id || id === '#') return

            const el = document.querySelector(id)
            if (!el) return

            e.preventDefault()
            lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 })
        }

        document.addEventListener('click', handleAnchorClick)

        return () => {
            cancelAnimationFrame(rafId)
            document.removeEventListener('click', handleAnchorClick)
            lenis.destroy()
        }
    }, [])

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    )
}
