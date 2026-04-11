'use client'

import React from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion } from 'framer-motion'

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using KratoLib, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use this platform. These terms apply to all artists, labels, and users of our services."
    },
    {
      title: "2. Description of Service",
      content: "KratoLib provides music distribution services, including delivery of audio content to Digital Service Providers (DSPs), royalty collection, and marketing tools. We facilitate the release of your music to platforms like Spotify, Apple Music, and others globally."
    },
    {
      title: "3. Your Account",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate."
    },
    {
      title: "4. Intellectual Property Rights",
      content: "You retain all ownership rights to the music and content you upload to KratoLib. By using our service, you grant KratoLib a non-exclusive license to distribute, perform, and display your content to DSPs for the purpose of providing our services."
    },
    {
      title: "5. Distribution & Royalties",
      content: "KratoLib will collect royalties on your behalf from DSPs. Royalties will be distributed according to the payout structure associated with your service plan. We reserve the right to withhold payments in cases of suspected fraudulent activity or copyright infringement."
    },
    {
      title: "6. Prohibited Content",
      content: "You may not upload content that infringes on third-party copyrights, contains hate speech, or violates any laws. Uploading unauthorized remixes or samples without proper licensing is strictly prohibited and may result in account termination."
    },
    {
      title: "7. Termination",
      content: "We reserve the right to terminate or suspend your account at our sole discretion, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the platform."
    }
  ]

  return (
    <StaticPageLayout 
      title="Terms of Service" 
      subtitle="Last updated: October 2025. Please read these terms carefully before using our platform."
    >
      <div className="space-y-12">
        {sections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
              {section.title}
            </h2>
            <div className="p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm group-hover:border-primary/30 transition-all duration-300">
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}
        
        <div className="pt-10 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            Have questions about our terms? <a href="/contact" className="text-primary hover:underline underline-offset-4">Contact our legal team</a>.
          </p>
        </div>
      </div>
    </StaticPageLayout>
  )
}
