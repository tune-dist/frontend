'use client'

import React from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <StaticPageLayout
      title="Privacy Policy"
    >
      <motion.div {...fadeIn}>
        <section className="prose prose-invert max-w-none prose-headings:font_heading prose-p:text-muted-foreground prose-li:text-muted-foreground pt-5">
          <p className="text-base leading-relaxed mb-4"><b>Effective Date:</b> April 2025<br />
            <b>Last Updated:</b> April 2025
          </p>
          <p className="text-base leading-relaxed mb-4">
            Welcome to KratoLib, India&apos;s growing online music distribution platform. KratoLib (“we,” “our,” or “us”) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use our website and services at <a href="https://www.kratolib.com" className="text-primary hover:underline">www.kratolib.com</a> (the “Platform”).
          </p>
          <p className="text-base leading-relaxed mb-12">
            By accessing or using our Platform, you agree to the terms of this Privacy Policy. Please read it carefully.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-border/50 pb-4">
            1. Information We Collect
          </h2>
          <p className="text-base leading-relaxed mb-4">We collect the following categories of information when you register, use, or interact with our Platform:</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">a) Personal Identification Information</h3>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Full name, artist/band name, and stage name</li>
            <li>Email address and phone number</li>
            <li>Date of birth and country of residence</li>
            <li>Government-issued ID (for identity verification and royalty payments)</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">b) Financial Information</h3>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Bank account details, UPI ID, or payment wallet information</li>
            <li>PAN card or GST number (for Indian tax compliance)</li>
            <li>Billing address and transaction history</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">c) Music & Content Data</h3>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Uploaded audio files, album art, lyrics, and metadata</li>
            <li>ISRC codes, UPC barcodes, and distribution preferences</li>
            <li>Royalty splits and collaborator information</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">d) Technical & Usage Data</h3>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>IP address, browser type, and operating system</li>
            <li>Pages visited, features used, and time spent on the Platform</li>
            <li>Device identifiers and referring URLs</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-base leading-relaxed mb-4">We use the information we collect for the following purposes:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>To create and manage your KratoLib account</li>
            <li>To distribute your music to Digital Service Providers (DSPs) such as Spotify, Apple Music, JioSaavn, Gaana, Amazon Music, YouTube Music, and others</li>
            <li>To process payments and transfer royalties to you</li>
            <li>To generate streaming and sales reports and analytics for your dashboard</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To comply with Indian tax regulations, including TDS deductions where applicable</li>
            <li>To communicate with you via email, SMS, or in-app notifications regarding your account, distributions, and platform updates</li>
            <li>To improve and personalize your experience on the Platform</li>
            <li>To respond to customer support inquiries</li>
            <li>To enforce our Terms of Service and legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            3. Sharing of Your Information
          </h2>
          <p className="text-base leading-relaxed mb-4">KratoLib does not sell your personal data to third parties or advertisers. We share your information only in the following circumstances:</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">a) Digital Service Providers (DSPs)</h3>
          <p className="text-base leading-relaxed mb-4">We share your music metadata, artist information, and relevant personal details with DSPs (such as Spotify, Apple Music, JioSaavn, etc.) as required to distribute and deliver your content on those platforms.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">b) Payment Processors</h3>
          <p className="text-base leading-relaxed mb-4">We share financial information with payment gateways, banks, and UPI providers as necessary to process your earnings and subscription payments.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">c) Government & Legal Authorities</h3>
          <p className="text-base leading-relaxed mb-4">We may disclose your information if required by law, court order, or government authority, including the Income Tax Department of India, GST authorities, or any other statutory body.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">d) Service Partners</h3>
          <p className="text-base leading-relaxed mb-4">We may share data with trusted third-party service providers who assist us in operating our Platform (e.g., cloud hosting, analytics, email services). These partners are contractually obligated to protect your data and may not use it for any other purpose.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            4. Data Storage & Security
          </h2>
          <p className="text-base leading-relaxed mb-4">We take the security of your data seriously. KratoLib implements the following measures:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Industry-standard SSL/TLS encryption for all data transfers</li>
            <li>Secure, encrypted storage of sensitive information including financial and personal data</li>
            <li>Access controls ensuring only authorized personnel can access your data</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Two-factor authentication options to protect your account</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            Your data is primarily stored on servers located in India. In certain cases, data may be processed by our DSP partners or service providers located outside India. We ensure that appropriate safeguards are in place for any cross-border data transfers, in accordance with applicable Indian data protection laws.
          </p>
          <p className="italic">
            While we take every reasonable precaution, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            5. Data Retention
          </h2>
          <p className="text-base leading-relaxed mb-4">We retain your personal information for as long as your account is active or as needed to provide our services. Specifically:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Account data is retained for the duration of your active subscription and for a period of 3 years thereafter for legal and financial compliance</li>
            <li>Financial and transaction records are retained for a minimum of 7 years as required under Indian tax and financial regulations</li>
            <li>Music content and metadata may be retained even after account deletion to fulfill outstanding distribution obligations, after which it will be removed from DSPs and our systems</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">You may request deletion of your account and personal data at any time, subject to our legal retention obligations.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            6. Cookies & Tracking Technologies
          </h2>
          <p className="text-base leading-relaxed mb-4">KratoLib uses cookies and similar tracking technologies to enhance your experience on the Platform. These include:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li><strong>Essential Cookies:</strong> Required for the Platform to function correctly (login sessions, preferences)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Platform (e.g., Google Analytics)</li>
            <li><strong>Marketing Cookies:</strong> Used to show relevant promotions (only with your consent)</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            You can manage or disable cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of the Platform. By continuing to use our Platform without changing your cookie settings, you consent to our use of cookies.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            7. Your Rights & Choices
          </h2>
          <p className="text-base leading-relaxed mb-4">As a user of KratoLib, you have the following rights regarding your personal data:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Right to Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements</li>
            <li><strong>Right to Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time (this may affect your ability to use the Platform)</li>
            <li><strong>Right to Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            To exercise any of these rights, you may log in to your account settings or contact our support team at <a href="mailto:privacy@kratolib.com" className="text-primary hover:underline">privacy@kratolib.com</a>. We will respond to your request within 30 days.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            8. Children’s Privacy
          </h2>
          <p className="text-base leading-relaxed mb-4">
            KratoLib&apos;s services are intended for users who are 18 years of age or older. We do not knowingly collect personal information from individuals under the age of 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:privacy@kratolib.com" className="text-primary hover:underline">privacy@kratolib.com</a> and we will promptly delete such information.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            9. Third-Party Links & Platforms
          </h2>
          <p className="text-base leading-relaxed mb-4">
            Our Platform may contain links to third-party websites or services (such as DSP platforms, social media, or payment gateways). KratoLib is not responsible for the privacy practices of these third parties. We encourage you to review their respective privacy policies before providing any personal information.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4" id="changes">
            10. Changes to This Privacy Policy
          </h2>
          <p className="text-base leading-relaxed mb-4">
            We reserve the right to update or modify this Privacy Policy at any time. When we make significant changes, we will notify you via email or a prominent notice on our Platform at least 7 days before the changes take effect. Your continued use of the Platform after the effective date of the revised policy constitutes your acceptance of the changes.
          </p>
          <p className="text-base leading-relaxed mb-4">
            We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4" id="grievance">
            11. Grievance Officer
          </h2>
          <p className="text-base leading-relaxed mb-4">
            In accordance with the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the details of our Grievance Officer are as follows:
          </p>
          <div className="space-y-2">
            <p className="mb-2 text-base leading-relaxed"><strong>Name:</strong> [Grievance Officer Name]</p>
            <p className="mb-2 text-base leading-relaxed"><strong>Email:</strong> <a href="mailto:grievance@kratolib.com" className="text-primary hover:underline">grievance@kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Address:</strong> 4044, The Retail Park Rajyash City, Bopal, Ahmedabad, Gujarat 380058</p>

            <p className="mb-0 text-base leading-relaxed ml-0">Response Time: Within 30 days of receiving a complaint</p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            12. Contact Us
          </h2>
          <p className="text-base leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at:
          </p>
          <div className="space-y-2">
            <p className="font-bold text-white">KratoLib Music Distribution</p>
            <p className="text-base leading-relaxed mb-4"><strong>Email:</strong> <a href="mailto:support@kratolib.com" className="text-primary hover:underline">support@kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Website:</strong> <a href="https://www.kratolib.com" className="text-primary hover:underline">www.kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Address:</strong> 4044, The Retail Park Rajyash City, Bopal, Ahmedabad, Gujarat - 380058</p>
          </div>

          <p className="mt-16 pt-8 border-t border-border/50 text-sm text-center italic text-muted-foreground">
            This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Ahmedabad, Gujarat, India.
          </p>
        </section>
      </motion.div>
    </StaticPageLayout>
  )
}
