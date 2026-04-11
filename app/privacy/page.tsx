'use client'

import React from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react'

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: Eye,
      content: "We collect personal information that you provide to us, including your name, email address, payment information, and artist details. We also collect usage data, such as IP addresses, browser types, and interaction with our services."
    },
    {
      title: "2. How We Use Your Information",
      icon: CheckCircle,
      content: "We use your information to provide music distribution services, process payments, communicate with you, and improve our platform. This includes delivery of your music to digital platforms and tracking your distribution status."
    },
    {
      title: "3. Information Sharing",
      icon: Shield,
      content: "We share your information with third-party service providers (DSPs like Apple Music, Spotify, etc.) only as necessary to fulfill our distribution services. We do not sell your personal data to advertisers or third parties."
    },
    {
      title: "4. Data Security",
      icon: Lock,
      content: "We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption for all sensitive data transfers."
    },
    {
      title: "5. Cookies & Tracking",
      content: "We use cookies to enhance your browsing experience, provide analytics, and remember your preferences. You can manage your cookie settings through your browser, although some features may not function correctly if disabled."
    },
    {
      title: "6. Your Privacy Rights",
      content: "Depending on your location, you may have rights under the GDPR or other privacy laws, such as the right to access, correct, or delete your personal information. You can manage your data directly through your account settings or by contacting our support team."
    }
  ]

  return (
    <StaticPageLayout 
      title="Privacy Policy" 
      subtitle="KratoLib is committed to protecting your personal data and respect your privacy."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group p-8 rounded-3xl bg-card/40 border border-border/50 hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
          >
            {section.icon && (
              <div className="mb-6 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <section.icon className="w-6 h-6 text-primary" />
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-4">
              {section.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {section.content}
            </p>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-100 opacity-0 transition-opacity" />
          </motion.div>
        ))}
      </div>
      <div className="mt-16 p-8 rounded-3xl border border-dashed border-primary/30 bg-primary/5 text-center">
        <p className="text-lg text-muted-foreground">
          Still have questions about our privacy policy? <a href="/contact" className="text-primary font-semibold hover:underline">Get in touch</a>.
        </p>
      </div>
    </StaticPageLayout>
  )
}
