import ContactContent from '@/components/ContactContent'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Contact KratoLib | 24/7 Music Distribution Support | Help',
  'Get in touch with KratoLib support team. 24/7 help for music distribution, pricing, technical issues. Email: info@kratolib.com | Phone: 02717448117',
)

export default function ContactPage() {
  return <ContactContent />
}
