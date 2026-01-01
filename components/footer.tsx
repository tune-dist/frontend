import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    legal: [
      { name: 'Terms', href: '#terms' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Finance', href: '/finance' },
    ],
    support: [
      { name: 'Contact', href: '#contact' },
      { name: 'Help Center', href: '#help' },
    ],
  }

  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img src="/logo.png" alt="KratoLib" className="w-[150px] max-w-[100%] mb-3" />
            <p className="text-muted-foreground max-w-md">
              Empowering independent artists to distribute their music worldwide
              and grow their careers.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">
            © {currentYear} KratoLib. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

