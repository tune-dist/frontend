'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Music, Instagram, Twitter, Youtube, Facebook } from 'lucide-react'


export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'Home', href: '#' },
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Contact', href: '#contact' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQs', href: '/faqs' },
    ],
  }

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-400' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-400' },
  ]

  const contactDetails = [
    { icon: Mail, text: 'support@kratolib.com', href: 'mailto:support@kratolib.com' },
    { icon: Phone, text: '02717448117', href: 'tel:+02717448117' },
    { icon: MapPin, text: 'D-1 4044 TRP Mall, The Retail Park Rajyash City, BRTS, Main Rd, Central Bopal, Bopal, Ahmedabad, Gujarat 380058', href: '#' },
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
        {/* subtle centre line glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full opacity-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #be51c5 40%, #7df9ff 60%, transparent)' }}
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

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">

          {/* Brand + Contact — spans 2 cols */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-6">
            <div>
              <img src="/logo.png" alt="KratoLib" className="w-[140px] max-w-full mb-3" />
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
                    {text}
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
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-5 text-foreground/80">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Get the latest news, tips and artist stories straight to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:bg-background transition-colors"
              />
              <button
                type="submit"
                className="w-full rounded-lg animated-gradient-bg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Subscribe
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
            for independent artists
          </div>
        </div>
      </div>
    </footer>
  )
}
