import type { Metadata } from 'next'
import PrivacyContent from '@/components/PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy | Data Protection & Security | KratoLib',
  description: 'KratoLib privacy policy. How we protect your personal data, artist information, and payment details. GDPR compliant. Your privacy is our priority.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | Data Protection & Security | KratoLib',
    description: 'KratoLib privacy policy. How we protect your personal data, artist information, and payment details. GDPR compliant. Your privacy is our priority.',
  },
  twitter: {
    title: 'Privacy Policy | Data Protection & Security | KratoLib',
    description: 'KratoLib privacy policy. How we protect your personal data, artist information, and payment details. GDPR compliant. Your privacy is our priority.',
  },
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
