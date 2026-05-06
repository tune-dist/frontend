import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ArrowRight, Clock, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Coming Soon | KratoLib',
    description:
        'This area of KratoLib is launching shortly. Reach out to our team for early access and partnership enquiries while we put the finishing touches in place.',
    robots: {
        index: false,
        follow: false,
    },
}

export default function ComingSoonPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="relative flex-1 flex items-center justify-center overflow-hidden pt-32 pb-20">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] animated-gradient-bg rounded-full blur-3xl opacity-10" />
                    <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] animated-gradient-bg rounded-full blur-3xl opacity-10" />
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-xs font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Launching Soon
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight font_heading">
                            Something{' '}
                            <span className="animated-gradient">incredible</span>{' '}
                            is on the way
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Our artist dashboard, distribution flow, and royalty tools are being polished
                            for launch. Want early access or have a partnership in mind? Drop us a note
                            and our team will reach out as soon as we go live.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link href="/contact" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto px-6 py-6 group animated-gradient-bg text-white border-0"
                                >
                                    Talk to our team
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto px-6 py-6 hover:bg-white hover:text-black transition-colors"
                                >
                                    Back to home
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm px-5 py-4 text-left">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg animated-gradient-bg">
                                    <Clock className="h-5 w-5 text-white" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </p>
                                    <p className="text-sm font-semibold">Final testing in progress</p>
                                </div>
                            </div>
                            <a
                                href="mailto:support@kratolib.com"
                                className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm px-5 py-4 text-left hover:border-primary/50 transition-colors group"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg animated-gradient-bg">
                                    <Mail className="h-5 w-5 text-white" />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Reach us
                                    </p>
                                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                                        support@kratolib.com
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
