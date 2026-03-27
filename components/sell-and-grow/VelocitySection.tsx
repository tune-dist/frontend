"use client";

import { Globe, ShieldCheck, Smartphone, LineChart } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Worldwide Distribution",
    desc: "Access 150+ stores globally including Spotify, Apple Music, and Amazon."
  },
  {
    icon: ShieldCheck,
    title: "100% Artist Protection",
    desc: "Full credit protection and automated rights management for every release."
  },
  {
    icon: Smartphone,
    title: "CRBT / Caller Tune",
    desc: "Unique revenue streams through telecom partnerships and caller tunes."
  },
  {
    icon: LineChart,
    title: "Growth Strategy",
    desc: "Dedicated team helping new artists navigate the global music landscape."
  }
];

export default function VelocitySection() {
  return (
    <section className="py-24 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 w-full">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font_heading tracking-tight mb-4 leading-tight">
              Ultra Fast Release Delivery
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Don&apos;t wait weeks to go live. Our AI-driven release engine ensures your music hits stores in record time.
            </p>
          </div>
          <div className="text-5xl md:text-7xl font-black font_heading text-cyan-500/10 tracking-tighter shrink-0 pt-4 md:pt-0">
            24-48 HOURS
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className="group bg-muted/20 p-8 rounded-2xl transition-all duration-300 hover:bg-muted/40 border-l-[3px] border-transparent hover:border-cyan-400 hover:shadow-xl"
            >
              <item.icon className="h-8 w-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold font_heading text-lg sm:text-xl mb-3 leading-snug">{item.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
