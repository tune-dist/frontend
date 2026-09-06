import TermsContent from '@/components/terms-page-content'
import { createPageMetadata } from '@/lib/site-metadata'

export const metadata = createPageMetadata(
  'Terms of Service | Artist Rights Protection | KratoLib',
  "Read KratoLib's terms of service. Understand copyright protections, royalty terms, artist rights, content policies, and platform usage agreements for music distribution.",
)

export default function TermsPage() {
  return <TermsContent />
}
