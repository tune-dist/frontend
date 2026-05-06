'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Music, Instagram, Twitter, Youtube, Linkedin, Loader2 } from 'lucide-react'

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.306c-.22.36-.68.473-1.04.253-2.884-1.763-6.512-2.162-10.785-1.183-.41.094-.823-.16-.917-.57-.094-.41.16-.823.57-.917 4.675-1.07 8.683-.62 11.92 1.36.36.22.473.68.252 1.04zm1.47-3.26c-.276.45-.86.593-1.31.317-3.298-2.028-8.326-2.617-12.23-1.433-.51.155-1.04-.138-1.194-.648-.154-.51.138-1.04.648-1.194 4.453-1.353 10.003-.703 13.77 1.614.45.276.593.86.316 1.31zm.126-3.415c-3.955-2.348-10.48-2.564-14.26-1.417-.607.184-1.25-.16-1.435-.767-.184-.607.16-1.25.767-1.435 4.34-1.318 11.536-1.066 16.085 1.633.546.324.726 1.03.402 1.576-.324.546-1.03.726-1.576.41z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" />
  </svg>
)


const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || ''

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterBotcheck, setNewsletterBotcheck] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newsletterBotcheck) return

    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!WEB3FORMS_ACCESS_KEY) {
      toast.error('Subscription unavailable. Please email support@kratolib.com.')
      return
    }

    setNewsletterLoading(true)

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          from_name: 'KratoLib Site',
          subject: 'Newsletter signup',
          email: newsletterEmail,
          message: `New newsletter subscription: ${newsletterEmail}`,
          source: 'kratolib.com footer newsletter',
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || 'Failed to subscribe')
      }

      toast.success("You're on the list! Welcome aboard.")
      setNewsletterEmail('')
    } catch (error: any) {
      toast.error(error?.message || 'Subscription failed. Please try again later.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  const footerLinks = {
    company: [
      { name: 'Home', href: '/' },
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blogs', href: '/blogs' },
      { name: 'Academy', href: '/academy' },
      { name: 'Guides', href: '/guides' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    support: [
      { name: 'FAQs', href: '/faqs' },
    ],
  }

  const socialLinks = [
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: SpotifyIcon, href: '#', label: 'Spotify', color: 'hover:text-green-500' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: XIcon, href: '#', label: 'X (Twitter)', color: 'hover:text-foreground' },
  ]

  const contactDetails = [
    { icon: Mail, text: 'support@kratolib.com', href: 'mailto:support@kratolib.com' },
    // { icon: Phone, text: '02717448117', href: 'tel:+02717448117' },
    { icon: MapPin, text: '4044, The Retail Park Rajyash City,<br /> Bopal, Ahmedabad, Gujarat - 380058', href: '#' },
  ]

  return (
    <footer id="contact" className="relative border-t border-border/40 overflow-hidden bg-background">

      {/* ── Animated background orbs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* large purple orb top-left */}
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #be51c5 0%, transparent 70%)',
            animation: 'footerOrb1 8s ease-in-out infinite alternate',
          }}
        />
        {/* cyan orb bottom-right */}
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #7df9ff 0%, transparent 70%)',
            animation: 'footerOrb2 10s ease-in-out infinite alternate',
          }}
        />
      </div>

      <style>{`
        @keyframes footerOrb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes footerOrb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-40px, -30px) scale(1.2); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14%       { transform: scale(1.3); }
          28%       { transform: scale(1); }
          42%       { transform: scale(1.3); }
          70%       { transform: scale(1); }
        }
      `}</style>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-6 gap-y-10 mb-8 md:mb-14">

          {/* Brand + Contact — spans 2 cols */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.png"
                  alt="KratoLib"
                  width={140}
                  height={32}
                  className="w-[140px] h-auto max-w-full mb-3 hover:opacity-80 transition-opacity"
                />
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Empowering independent artists to distribute their music worldwide and grow their careers without giving up ownership.
              </p>
            </div>

            {/* Contact details */}
            <div className="space-y-3">
              {contactDetails.map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-center gap-3 group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors group-hover:border-primary/50 group-hover:bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </span>
                  <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                    {text.split('<br />').map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </a>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-all hover:border-border hover:bg-muted/60 hover:scale-110 ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-foreground/80">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-0 bg-primary transition-all group-hover:w-3 rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-foreground/80">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-0 bg-primary transition-all group-hover:w-3 rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-foreground/80">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-0 bg-primary transition-all group-hover:w-3 rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-foreground/80">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Get the latest news, tips and artist stories straight to your inbox.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col gap-2"
            >
              <input
                type="checkbox"
                tabIndex={-1}
                autoComplete="off"
                checked={!!newsletterBotcheck}
                onChange={(e) => setNewsletterBotcheck(e.target.checked ? '1' : '')}
                style={{ display: 'none' }}
                aria-hidden="true"
              />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:bg-background transition-colors"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="w-full rounded-lg animated-gradient-bg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {newsletterLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} KratoLib. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Made with
            <span
              className="text-red-400 mx-0.5 inline-block"
              style={{ animation: 'heartbeat 1.4s ease-in-out infinite' }}
            >❤️</span>
            for independent artists and labels
          </div>
        </div>
      </div>
    </footer>
  )
}
