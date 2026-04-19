'use client'

import React from 'react'
import StaticPageLayout from '@/components/StaticPageLayout'
import { motion } from 'framer-motion'
import { Search, Book, HelpCircle, Users, Zap, Headphones } from 'lucide-react'

export default function HelpCenter() {
  const categories = [
    {
      title: "Getting Started",
      icon: Zap,
      description: "Learn how to set up your account and start distributing your music today.",
      links: ["Creating an Account", "Uploading Your First Release", "Choosing a Metadata Profile", "Verification Process"]
    },
    {
      title: "Content & Releases",
      icon: Book,
      description: "Guidelines for your audio files, artwork, and metadata requirements.",
      links: ["Audio Quality Standards", "Artwork Requirements", "Cover Song Licensing", "Adding Collaborators"]
    },
    {
      title: "Account Management",
      icon: Users,
      description: "Manage your profile, security settings, and label information.",
      links: ["Resetting Your Password", "Changing Your Email", "Two-Factor Authentication", "Artist Profile Hub"]
    },
    {
      title: "Royalties & Payouts",
      icon: Headphones,
      description: "How to track your earnings, set up splits, and withdraw your funds.",
      links: ["Withdrawal Methods", "Understanding Your Analytics", "Splits & Collaboration", "Monthly Statements"]
    }
  ]

  return (
    <StaticPageLayout 
      title="Help Center" 
      subtitle="Welcome to the KratoLib Knowledge Base. How can we assist you today?"
    >
      <div className="relative mb-20">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-6 h-6 text-muted-foreground" />
        </div>
        <input 
          type="text" 
          placeholder="Search for articles, guides, or tutorials..." 
          className="w-full h-16 md:h-20 pl-16 pr-8 bg-card/40 border border-border/50 rounded-2xl text-lg text-white focus:border-primary/60 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 backdrop-blur-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group p-8 rounded-3xl bg-card/30 border border-border/50 hover:bg-card/40 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <category.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors font_heading">
                {category.title}
              </h2>
            </div>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{category.description}</p>
            <ul className="space-y-3">
              {category.links.map((link, lIndex) => (
                <li key={lIndex}>
                  <a href="#" className="flex items-center gap-3 text-white/80 hover:text-primary transition-colors text-base group/link">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/link:bg-primary" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 p-12 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-card/50 to-background border border-primary/20 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700" />
        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4 font_heading tracking-tight">Still Need Help?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Our specialized support team is available 24/7 to assist you with any questions or issues you may have.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <a href="/contact" className="px-10 py-5 rounded-2xl animated-gradient-bg text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center whitespace-nowrap">
            Contact Support
          </a>
          <a href="mailto:support@kratolib.com" className="px-10 py-5 rounded-2xl bg-card/50 border border-border/50 text-white font-bold hover:bg-card/80 hover:border-primary/50 transition-all flex items-center justify-center backdrop-blur-sm whitespace-nowrap">
            Email Us
          </a>
          <a href="tel:02717448117" className="px-10 py-5 rounded-2xl bg-card/50 border border-border/50 text-white font-bold hover:bg-card/80 hover:border-primary/50 transition-all flex items-center justify-center backdrop-blur-sm whitespace-nowrap">
            Call Us
          </a>
        </div>
      </div>
    </StaticPageLayout>
  )
}
