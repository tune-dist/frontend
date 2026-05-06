import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Page Not Found | KratoLib',
    description:
        'The page you are looking for could not be found. Head back to KratoLib home or explore our music distribution features.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative flex-1 flex items-center justify-center overflow-hidden pt-32 pb-20">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/3 w-[480px] h-[480px] animated-gradient-bg rounded-full blur-3xl opacity-10" />
                    <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] animated-gradient-bg rounded-full blur-3xl opacity-10" />
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-8xl sm:text-9xl font-bold mb-4 font_heading animated-gradient leading-none">
                            404
                        </p>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading">
                            Page not found
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                            The page you are looking for has either moved, been renamed, or is not yet live.
                            Let's get you back on track.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-6 py-6 group animated-gradient-bg text-white border-0"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Back to home
                                </Button>
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto px-6 py-6 hover:bg-white hover:text-black transition-colors"
                                >
                                    <Search className="mr-2 h-5 w-5" />
                                    Contact support
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
