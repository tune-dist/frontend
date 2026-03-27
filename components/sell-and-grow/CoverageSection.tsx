"use client";

import { BarChart3, Share2, Download, RadioReceiver } from "lucide-react";

export default function CoverageSection() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font_heading tracking-tight">Omni-Channel <span className="animated-gradient">Coverage</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Streaming", icon: BarChart3 },
            { label: "Social Media", icon: Share2 },
            { label: "Download Stores", icon: Download },
            { label: "Telecom", icon: RadioReceiver },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="group flex items-center justify-center sm:justify-start gap-4 bg-background p-6 rounded-2xl border border-border/40 hover:border-violet-500/30 hover:shadow-lg transition-all duration-300">
              <div className="h-10 w-10 shrink-0 bg-muted/40 rounded-xl flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                <Icon className="h-5 w-5 text-violet-500" />
              </div>
              <span className="font-bold font_heading text-sm sm:text-base hidden sm:block">{label}</span>
              {/* Show mobile label smaller and below icon perhaps, or just hide/wrap depending on screen space */}
              <span className="font-bold font_heading text-xs sm:hidden">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
