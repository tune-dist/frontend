import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import FaqsAccordion from '@/components/faqs-accordion'
import { faqStats } from '@/lib/marketing/faq-categories'
import { HelpCircle } from 'lucide-react'

export default function FaqsContent() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-0 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs md:text-sm uppercase tracking-[0.15em] mb-6">
            <HelpCircle className="w-3 h-3" />
            Frequently Asked Questions
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 font_heading">
            Music Distribution FAQs <br />{' '}
            <span className="animated-gradient">
              How to Distribute, Earn Royalties & Get Paid
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Plans, pricing, royalties, CRBT, Spotify, JioSaavn — everything an
            Indian independent artist needs to know, answered honestly.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto mt-6 md:mt-12 px-4">
            {faqStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: stat.color,
                  borderColor: stat.border,
                }}
                className="flex flex-col items-center p-8 md:p-5 rounded-2xl md:rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] hover:bg-opacity-20"
              >
                <span className={`text-2xl md:text-3xl font-bold mb-2 ${stat.text}`}>
                  {stat.value}
                </span>
                <span className="text-xs md:text-xs font-bold text-white/30 uppercase text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqsAccordion />

      <section className="mt-10 relative rounded-[2.5rem] overflow-hidden border border-border/40 p-8 md:p-14 bg-[#0d0d0d] max-w-7xl mx-auto mb-32 px-4 md:px-14">
        <div
          className="absolute inset-0 opacity-[0.9] pointer-events-none"
          style={{
            backgroundImage: "url('/assets/images/bg-noice-texture.jpg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-5 md:gap-10">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold text-white font_heading leading-tight">
              Still have a question?
            </h2>
            <p className="text-white text-base md:text-lg leading-relaxed mx-auto">
              Our team responds fast. Start free and get your music earning on 150+
              platforms — including CRBT Hello Tune across all Indian telecoms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-w-[280px] justify-center">
            <a
              href="/auth"
              className="px-10 py-5 bg-white text-black font-bold rounded-2xl text-center hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center min-w-[240px]"
            >
              Start Free on KratoLib
            </a>
            <a
              href="/contact"
              className="px-10 py-5 border border-white/20 text-white font-bold rounded-2xl text-center hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center min-w-[240px]"
            >
              Talk to Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
