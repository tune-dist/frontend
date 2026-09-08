'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqCategories } from '@/lib/marketing/faq-categories'

export default function FaqsAccordion() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].id)
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })
    setActiveCategory(id)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (let index = faqCategories.length - 1; index >= 0; index--) {
        const section = document.getElementById(faqCategories[index].id)
        if (section && scrollPosition >= section.offsetTop) {
          setActiveCategory(faqCategories[index].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 pb-8 md:pb-20 pt-4">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        <div className="lg:w-1/4">
          <div className="lg:hidden w-full mb-0">
            <h2 className="text-xl md:text-2xl font-bold mb-2 font_heading">
              Everything <span className="animated-gradient"> about Kratolib</span>
            </h2>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => scrollToCategory(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-2xl px-5 py-3.5 pr-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer capitalize transition-all duration-200"
                style={{ backgroundImage: 'none' }}
              >
                {faqCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    className="bg-[#0f0f14] text-white capitalize"
                  >
                    {category.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <ChevronDown className="w-4 h-4 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:sticky lg:top-32 lg:flex-col gap-3">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className={`px-6 py-3 rounded-full border transition-all duration-300 text-xs font-semibold text-left w-full group capitalize ${
                  activeCategory === category.id
                    ? 'bg-purple-800 text-white border-purple-800 shadow-xl shadow-purple-800/10'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-3/4 space-y-[50px]">
          {faqCategories.map((category, categoryIndex) => (
            <section key={category.id} id={category.id} className="scroll-mt-32 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] md:text-xs font-bold text-white/30 uppercase">
                    {String(categoryIndex + 1).padStart(2, '0')} — {category.subTitle}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white font_heading tracking-tight">
                  {category.title}
                </h2>
              </div>

              <div className="grid gap-3">
                {category.faqs.map((faq, index) => {
                  const id = `${category.id}-${index}`
                  const isOpen = openFaq === id

                  return (
                    <div
                      key={id}
                      className={`border rounded-2xl transition-all duration-500 overflow-hidden ${
                        isOpen
                          ? 'bg-white/[0.05] border-primary/30 shadow-2xl'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(id)}
                        className="w-full text-left p-2 md:p-4 flex items-center justify-between gap-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                          <span
                            className={`font-semibold text-sm md:text-base transition-colors ${
                              isOpen ? 'text-primary' : 'text-white/80'
                            }`}
                          >
                            {faq.q}
                          </span>
                          {faq.badge ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider w-fit">
                              {faq.badge}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isOpen
                              ? 'bg-primary text-black rotate-180'
                              : 'bg-white/5 text-muted-foreground'
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {isOpen ? (
                        <div className="overflow-hidden">
                          <div className="px-5 md:px-6 pb-6 pt-0">
                            <div className="h-px bg-white/5 w-full mb-5" />
                            <div
                              className="text-white/60 leading-relaxed text-sm md:text-md"
                              dangerouslySetInnerHTML={{ __html: faq.a }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
