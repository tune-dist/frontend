'use client'

import React from 'react'
import ContentPageLayout from '@/components/content-page-layout'
import { motion } from 'framer-motion'

export default function TermsContent() {
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <ContentPageLayout
      title="Music Distribution Terms of Service - Artist Rights & Copyright Protection"
    >
      <motion.div {...fadeIn}>
        <section className="prose prose-invert max-w-none prose-headings:font_heading prose-p:text-muted-foreground prose-li:text-muted-foreground pt-5 pb-32">
          <p className="text-base leading-relaxed mb-4">
            <b>Effective Date:</b> October 2025<br />
            <b>Last Updated:</b> October 2025
          </p>

          <p className="text-base leading-relaxed mb-4 font-bold">
            PLEASE READ THESE TERMS OF SERVICE (“TERMS”) CAREFULLY BEFORE USING THE KRATOLIB PLATFORM. BY ACCESSING OR USING KRATOLIB, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, DO NOT USE OUR PLATFORM.
          </p>

          <p className="text-base leading-relaxed mb-4">
            These Terms constitute a legally binding agreement between you (“User,” “Artist,” or “You”) and KratoLib (“we,” “our,” or “us”), governing your access to and use of the KratoLib music distribution platform, website, and all related services (collectively, the “Platform”).
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-6 border-b border-border/50 pb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-base leading-relaxed mb-4">By registering for an account, uploading content, or using any feature of the KratoLib Platform, you confirm that:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>You are at least 18 years of age (or have obtained verifiable parental or legal guardian consent)</li>
            <li>You have the legal capacity and authority to enter into this agreement</li>
            <li>You accept these Terms in their entirety on behalf of yourself and/or the entity you represent</li>
            <li>You agree to comply with all applicable laws, including the laws of India</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            These Terms apply to all Artists, independent musicians, music labels, producers, and any other users of the Platform. If you are entering into these Terms on behalf of a record label or other entity, you represent and warrant that you have the authority to bind that entity.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            2. Description of Services
          </h2>
          <p className="text-base leading-relaxed mb-4">KratoLib provides an online platform for independent artists and music labels to distribute their music to Digital Service Providers (DSPs) worldwide. Our services include, but are not limited to:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Distribution of audio content to DSPs including Spotify, Apple Music, Amazon Music, YouTube Music, JioSaavn, Gaana, Wynk Music, Hungama, and other platforms</li>
            <li>Collection and disbursement of streaming and download royalties on your behalf</li>
            <li>Generation of real-time streaming analytics and revenue reports</li>
            <li>ISRC code registration and UPC barcode generation</li>
            <li>Music release scheduling and pre-save campaign tools</li>
            <li>Royalty split management for collaborators and co-artists</li>
            <li>Takedown and content management services</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            We reserve the right to modify, suspend, or discontinue any part of our services at any time with reasonable prior notice to users.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            3. Account Registration & Responsibilities
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3.1 Account Creation</h3>
          <p className="text-base leading-relaxed mb-4">To use our Platform, you must create an account by providing accurate, complete, and current information, including your legal name, valid email address, country of residence, and payment details. You agree to keep this information updated at all times.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3.2 Account Security</h3>
          <p className="text-base leading-relaxed mb-4">You are solely responsible for maintaining the confidentiality of your account credentials. You agree to:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Use a strong, unique password for your KratoLib account</li>
            <li>Not share your login credentials with any third party</li>
            <li>Immediately notify us at info@kratolib.com if you suspect any unauthorized access to your account</li>
            <li>Accept full responsibility for all activities that occur under your account</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3.3 One Account Per User</h3>
          <p className="text-base leading-relaxed mb-4">Each user or entity may maintain only one active account. Creating duplicate or fraudulent accounts is strictly prohibited and may result in immediate termination of all associated accounts.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            4. Intellectual Property Rights
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">4.1 Ownership</h3>
          <p className="text-base leading-relaxed mb-4">You retain full ownership of all copyright and intellectual property rights in the music, sound recordings, artwork, lyrics, and other content you upload to KratoLib (“Your Content”). Nothing in these Terms transfers any ownership rights to KratoLib.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">4.2 License Granted to KratoLib</h3>
          <p className="text-base leading-relaxed mb-4">By uploading Your Content to the Platform, you grant KratoLib a non-exclusive, worldwide, royalty-free license to:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Reproduce, encode, and transmit Your Content to DSPs and streaming platforms</li>
            <li>Display your artist name, track titles, album artwork, and metadata for distribution purposes</li>
            <li>Collect royalties and payments from DSPs on your behalf</li>
            <li>Use your artist name and release information for promotional activities related to KratoLib’s services (e.g., social media posts, newsletters), with your prior consent</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">
            This license is valid only for the duration of your active subscription or distribution agreement with KratoLib and terminates upon account closure, subject to outstanding distribution obligations.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">4.3 Your Representations</h3>
          <p className="text-base leading-relaxed mb-4">You represent and warrant that:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>You are the original creator or authorized rights holder of all content you upload</li>
            <li>Your Content does not infringe upon any third-party copyright, trademark, or other intellectual property rights</li>
            <li>You have obtained all necessary licenses, permissions, and clearances for any samples, interpolations, cover versions, or third-party materials included in your content</li>
            <li>Your Content complies with all applicable laws in India and the countries where it will be distributed</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            5. Distribution & Royalties
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">5.1 Distribution Process</h3>
          <p className="text-base leading-relaxed mb-4">Upon submission of your release, KratoLib will review your content for compliance and initiate distribution to your selected DSPs. Standard distribution timelines are 3–5 business days, though individual DSPs may take additional time to publish content on their platforms. KratoLib is not responsible for delays caused by DSPs.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">5.2 Royalty Collection</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib collects 100% of the royalties generated by your music on DSPs and credits them to your KratoLib account, subject to our service plan fees and applicable deductions.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">5.3 Payouts</h3>
          <p className="text-base leading-relaxed mb-4">Royalty payouts are processed according to the following terms:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Payouts are initiated once your account balance meets the minimum withdrawal threshold specified in your plan</li>
            <li>Payments are made via bank transfer, UPI, or other available payment methods</li>
            <li>KratoLib deducts applicable TDS (Tax Deducted at Source) as required under Indian tax law</li>
            <li>Royalties collected from DSPs may be subject to a 60–90 day reporting lag from the DSP before appearing in your dashboard</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">5.4 Withholding of Payments</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib reserves the right to temporarily withhold royalty payments in cases of:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Suspected fraudulent streaming activity or manipulation of streaming counts</li>
            <li>Pending copyright infringement claims or disputes</li>
            <li>Outstanding amounts owed by you to KratoLib</li>
            <li>Investigations by DSPs or rights management organizations</li>
          </ul>
          <p className="text-base leading-relaxed mb-4">In such cases, we will notify you of the withholding and provide a reasonable opportunity to respond.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">5.5 Service Fees</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib’s pricing plans and associated fees are detailed on our website at <a href="/pricing" className="text-primary hover:underline">www.kratolib.com/pricing</a>. Fees are subject to change with 30 days’ prior notice. Continued use of the Platform after the effective date of a fee change constitutes acceptance of the new fees.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            6. Prohibited Content & Conduct
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">6.1 Prohibited Content</h3>
          <p className="text-base leading-relaxed mb-4">You may not upload, distribute, or submit content that:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Infringes upon the copyright, trademark, or intellectual property rights of any third party</li>
            <li>Contains unauthorized use of samples, interpolations, or copyrighted compositions without proper licensing or sync clearance</li>
            <li>Constitutes hate speech, incites violence, or discriminates on the basis of race, religion, gender, nationality, sexual orientation, or disability</li>
            <li>Is obscene, pornographic, defamatory, or violates any applicable law in India</li>
            <li>Is fraudulent, misleading, or misrepresents the origin of the content</li>
            <li>Contains content designed to artificially inflate streaming numbers or manipulate DSP algorithms</li>
            <li>Violates the guidelines or policies of any DSP to which it is submitted</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">6.2 Prohibited Conduct</h3>
          <p className="text-base leading-relaxed mb-4">You may not use the Platform to:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Create or use fake streaming bots, scripts, or automated tools to generate fraudulent plays</li>
            <li>Upload content belonging to another artist without authorization</li>
            <li>Reverse-engineer, copy, or recreate any part of the KratoLib Platform</li>
            <li>Interfere with or disrupt the technical infrastructure of the Platform</li>
            <li>Attempt to gain unauthorized access to other users’ accounts or data</li>
            <li>Violate any applicable local, state, national, or international law or regulation</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            7. Content Review & Takedowns
          </h2>
          <p className="text-base leading-relaxed mb-4">
            KratoLib reserves the right to review any content uploaded to the Platform and to reject, remove, or take down content at our discretion if it violates these Terms, DSP policies, or applicable law. We will notify you of any such action via email where reasonably practicable.
          </p>
          <p className="text-base leading-relaxed mb-4">
            If a DSP issues a takedown request or flags your content for copyright infringement, KratoLib may remove the content immediately and notify you. You will have the opportunity to dispute such claims through the appropriate process.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            8. Subscription Plans & Cancellation
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">8.1 Plans</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib offers various subscription plans with differing features, distribution limits, and fee structures. Details of current plans are available at <a href="/pricing" className="text-primary hover:underline">www.kratolib.com/pricing</a>.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">8.2 Cancellation</h3>
          <p className="text-base leading-relaxed mb-4">You may cancel your subscription at any time through your account settings. Upon cancellation:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Your plan benefits will remain active until the end of the current billing period</li>
            <li>KratoLib will initiate the takedown of your distributed content from DSPs unless you upgrade to a plan that maintains active distribution</li>
            <li>Royalties accrued prior to cancellation will continue to be paid out per the standard payout schedule</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">8.3 Refunds</h3>
          <p className="text-base leading-relaxed mb-4">Subscription fees are non-refundable except as required by applicable law. If you believe you are entitled to a refund, please contact info@kratolib.com within 7 days of the charge.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            9. Termination & Suspension
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">9.1 Termination by KratoLib</h3>
          <p className="text-base leading-relaxed mb-4">We reserve the right to suspend or permanently terminate your account, with or without prior notice, if we determine that you have:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Violated any provision of these Terms</li>
            <li>Engaged in fraudulent, abusive, or illegal activity</li>
            <li>Uploaded infringing content or repeatedly received valid copyright claims</li>
            <li>Provided false or misleading information during registration</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">9.2 Effect of Termination</h3>
          <p className="text-base leading-relaxed mb-4">Upon termination of your account:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Your access to the Platform will be immediately revoked</li>
            <li>KratoLib will initiate removal of your content from DSPs (subject to DSP processing timelines)</li>
            <li>Any outstanding, verified royalties will be paid to you within 60 days, after deducting any amounts owed</li>
            <li>KratoLib shall not be liable to you or any third party for any termination of your account</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">9.3 Termination by You</h3>
          <p className="text-base leading-relaxed mb-4">You may terminate your account at any time by contacting info@kratolib.com or using the account closure option in your settings.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            10. Dispute Resolution & Copyright Claims
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">10.1 Copyright Infringement Claims</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib respects intellectual property rights and complies with the provisions of the Copyright Act, 1957 (India). If you believe that content distributed through our Platform infringes your copyright, please send a written notice to legal@kratolib.com with the following:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Your full name, contact information, and a description of the copyrighted work</li>
            <li>Identification of the infringing content and its location on our Platform</li>
            <li>A statement that you have a good faith belief that the use is not authorized</li>
            <li>A declaration, under penalty of law, that the information in your notice is accurate</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">10.2 Counter-Notice</h3>
          <p className="text-base leading-relaxed mb-4">If your content was removed due to a copyright claim and you believe the removal was in error, you may submit a counter-notice to legal@kratolib.com. KratoLib will evaluate the counter-notice in accordance with applicable law.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">10.3 Governing Law & Jurisdiction</h3>
          <p className="text-base leading-relaxed mb-4">
            These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Ahmedabad, India. The parties agree to attempt good-faith mediation before initiating formal legal proceedings.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            11. Limitation of Liability
          </h2>
          <p className="text-base leading-relaxed mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, KRATOLIB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, LOSS OF DATA, LOSS OF GOODWILL, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p className="text-base leading-relaxed mb-4">
            KRATOLIB’S TOTAL AGGREGATE LIABILITY TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU TO KRATOLIB IN THE SIX (6) MONTHS PRECEDING THE CLAIM.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            12. Disclaimer of Warranties
          </h2>
          <p className="text-base leading-relaxed mb-4">
            THE PLATFORM IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. KRATOLIB DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            13. Indemnification
          </h2>
          <p className="text-base leading-relaxed mb-4">You agree to indemnify, defend, and hold harmless KratoLib and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:</p>
          <ul className="text-base leading-relaxed mb-4 space-y-2 list-disc list-inside">
            <li>Your use of the Platform or violation of these Terms</li>
            <li>Your Content and any claims that it infringes any third-party intellectual property rights</li>
            <li>Any misrepresentation made by you in connection with the Platform</li>
            <li>Your violation of any applicable law or regulation</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            14. Modifications to Terms
          </h2>
          <p className="text-base leading-relaxed mb-4">
            KratoLib reserves the right to update or amend these Terms at any time. When we make material changes, we will notify you via email or a prominent notice on the Platform at least 14 days before the changes take effect. Your continued use of the Platform after the effective date of the revised Terms constitutes your acceptance of the changes.
          </p>
          <p className="text-base leading-relaxed mb-4">
            We encourage you to review these Terms periodically. The most current version will always be available at <a href="https://www.kratolib.com/terms" className="text-primary hover:underline">www.kratolib.com/terms</a>.
          </p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            15. Miscellaneous
          </h2>
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">15.1 Entire Agreement</h3>
          <p className="text-base leading-relaxed mb-4">These Terms, together with our Privacy Policy and any other agreements or policies incorporated by reference, constitute the entire agreement between you and KratoLib with respect to the Platform and supersede all prior agreements.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">15.2 Severability</h3>
          <p className="text-base leading-relaxed mb-4">If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">15.3 No Waiver</h3>
          <p className="text-base leading-relaxed mb-4">KratoLib’s failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">15.4 Assignment</h3>
          <p className="text-base leading-relaxed mb-4">You may not assign or transfer your rights or obligations under these Terms without KratoLib’s prior written consent. KratoLib may assign its rights and obligations without restriction.</p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">15.5 Language</h3>
          <p className="text-base leading-relaxed mb-4">These Terms are written in English. In the event of any conflict between an English version and a translated version, the English version shall prevail.</p>

          <h2 className="text-2xl font-bold text-white mt-16 mb-6 border-b border-border/50 pb-4">
            16. Contact Us
          </h2>
          <p className="text-base leading-relaxed mb-4">For any questions, concerns, or legal notices regarding these Terms of Service, please contact:</p>
          <div className="space-y-2">
            <p className="font-bold text-white">KratoLib Music Distribution</p>
            <p className="text-base leading-relaxed mb-4"><strong>Legal:</strong> <a href="mailto:legal@kratolib.com" className="text-primary hover:underline">legal@kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Support:</strong> <a href="mailto:info@kratolib.com" className="text-primary hover:underline">info@kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Website:</strong> <a href="https://www.kratolib.com" className="text-primary hover:underline">www.kratolib.com</a></p>
            <p className="text-base leading-relaxed mb-4"><strong>Address:</strong> 4044, The Retail Park Rajyash City, Bopal, Ahmedabad, Gujarat - 380058</p>
          </div>

          <p className="mt-16 pt-8 border-t border-border/50 text-sm text-center italic text-muted-foreground">
            These Terms of Service are governed by the laws of India. © 2026 KratoLib. All rights reserved.
          </p>
        </section>
      </motion.div>
    </ContentPageLayout>
  )
}
