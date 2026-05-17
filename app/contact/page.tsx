import type { Metadata } from 'next'
import ContactContent from '@/components/ContactContent'

export const metadata: Metadata = {
  title: 'Contact KratoLib | 24/7 Music Distribution Support | Help',
  description: 'Get in touch with KratoLib support team. 24/7 help for music distribution, pricing, technical issues. Email: info@kratolib.com | Phone: 02717448117',
  openGraph: {
    title: 'Contact KratoLib | 24/7 Music Distribution Support | Help',
    description: 'Get in touch with KratoLib support team. 24/7 help for music distribution, pricing, technical issues. Email: info@kratolib.com | Phone: 02717448117',
  },
  twitter: {
    title: 'Contact KratoLib | 24/7 Music Distribution Support | Help',
    description: 'Get in touch with KratoLib support team. 24/7 help for music distribution, pricing, technical issues. Email: info@kratolib.com | Phone: 02717448117',
  },
}

export default function ContactPage() {
  return <ContactContent />
}
