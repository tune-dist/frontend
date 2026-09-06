import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Clock } from 'lucide-react'

type MarketingComingSoonPageProps = {
  title: React.ReactNode
  subtitle?: string
  comingSoonMessage: string
}

export default function MarketingComingSoonPage({
  title,
  subtitle,
  comingSoonMessage,
}: MarketingComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 animated-gradient-bg rounded-full blur-3xl opacity-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight text-white">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="pb-32 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 max-w-2xl mx-auto backdrop-blur-md">
              <Clock className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold text-white mb-4 font_heading">
                Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground">{comingSoonMessage}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
