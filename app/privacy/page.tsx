import PrivacyContent from '@/components/privacy-page-content'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Privacy Policy | Data Protection & Security | KratoLib',
  'KratoLib privacy policy. How we protect your personal data, artist information, and payment details. GDPR compliant. Your privacy is our priority.',
)

export default function PrivacyPage() {
  return <PrivacyContent />
}
