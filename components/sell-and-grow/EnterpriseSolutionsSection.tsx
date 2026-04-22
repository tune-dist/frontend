"use client";

import { Layers, Split, PackageOpen } from "lucide-react";

export default function EnterpriseSolutionsSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold font_heading mb-6 tracking-tight leading-[1.1]">
              Label &amp; Professional Artist <br className="hidden sm:block" />
              <span className="animated-gradient">Solutions</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed mb-10 max-w-lg">
              Managing a large catalog? Our enterprise-grade dashboard provides the
              control you need to scale your music business efficiently.
            </p>

            <div className="space-y-8">
              {[
                {
                  icon: Layers,
                  title: "Bulk Distribution",
                  desc: "Upload and manage hundreds of releases simultaneously with automated validation."
                },
                {
                  icon: Split,
                  title: "Revenue Splits",
                  desc: "Complex royalty split management for collaborators, producers, and labels."
                },
                {
                  icon: PackageOpen,
                  title: "Catalog Migration",
                  desc: "Seamlessly transfer your existing catalog with preserved ISRC and UPC codes."
                }
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-5 group">
                  <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-violet-500/30 group-hover:bg-violet-500/10 transition-colors">
                    <Icon className="h-6 w-6 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Image Mockup */}
          <div className="bg-muted/10 p-4 sm:p-6 rounded-[3rem] border border-border/40  shadow-2xl">
            <div className="rounded-[2.5rem] overflow-hidden bg-background border border-border/50 relative aspect-[4/3] group">
              <div className="absolute inset-0 bg-[url('/assets/images/music-banner3.jpg')] bg-cover bg-center grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
