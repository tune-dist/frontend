"use client";

import { Check } from "lucide-react";

export default function GrowthTeamSection() {
  return (
    <section id="growth" className="py-12 md:py-24 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Decorative Left visual */}
          <div className="md:col-span-7 relative order-2 md:order-1">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-border/40 aspect-[16/10] shadow-2xl">
              <div className="absolute inset-0 bg-[url('/assets/images/music-banner2.jpg')] bg-cover bg-center opacity-80" />
            </div>

            {/* Glow orb offset behind the image */}
            <div className="absolute -top-12 -right-12 sm:-right-24 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
          </div>

          {/* Right Text Block */}
          <div className="md:col-span-5 space-y-4 md:space-y-8 order-1 md:order-2 pl-0 md:pl-8 lg:pl-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold font_heading leading-[1.1]">
              New Artist Special <br />
              <span className="animated-gradient">Growth Team</span>
            </h2>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Starting out? We don&apos;t just distribute; we architect your career.
              Our specialized team guides you through:
            </p>

            <ul className="space-y-5">
              {[
                "Strategic Planning & Release Roadmaps",
                "Store Profile Setup & Optimization",
                "Audience Growth & Social Strategy"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4 text-sm sm:text-base font-medium text-foreground">
                  <div className="h-8 w-8 min-w-[2rem] rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
