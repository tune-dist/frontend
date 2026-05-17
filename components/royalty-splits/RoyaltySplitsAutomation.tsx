"use client";

import { CheckCircle2, Zap, ShieldCheck, Cpu, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const leftFeatures = [
  { label: "No Annual Limits", desc: "Scale without boundaries." },
  { label: "No Transaction Minimums", desc: "Every cent counts." },
  { label: "No Transaction Charges", desc: "Keep 100% of your splits." },
  { label: "100% Accuracy Commitment", desc: "Surgical precision." },
];

const rightCards = [
  {
    title: "Cross-Contract Recoupment",
    desc: "Sophisticated cross-platform recoupment logic designed for any type of complex deal structure.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    icon: ShieldCheck
  },
  {
    title: "Label Priority Recovery",
    desc: "Automated priority rules ensure recoupment happens at specified levels before profit participation kicks in.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/5",
    border: "border-indigo-500/20",
    icon: Cpu
  },
  {
    title: "Custom Royalty Waterfalls",
    desc: "Establish complex hierarchy and granular payment direction logic with fully customizable models.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
    icon: Zap
  },
];

export default function RoyaltySplitsAutomation() {
  return (
    <section className="py-12 md:py-24 bg-[#030303] relative overflow-hidden">
      {/* Background Ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] -translate-y-1/2 rounded-full opacity-[0.05] bg-emerald-500 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Column: Automated Payouts Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-8">
              <Zap className="h-3 w-3 fill-cyan-400/20" />
              Intelligence Automation
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font_heading tracking-tight">
              Fully Automated <br />
              <span className="animated-gradient">Global Payouts</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-xl font-light">
              Eliminate manual tabulations. KratoLib automates complex royalty distribution
              to every stakeholder across 120+ global currencies with unmatched reliability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {leftFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block mb-0.5">{f.label}</span>
                    <span className="text-[11px] text-muted-foreground font-light">{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Advanced Recoupment Cards */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 text-center lg:text-left"
            >
              <h3 className="text-2xl md:text-3xl font-bold font_heading text-white tracking-tight">
                Advanced Recoupment <br /> & Smart Payments
              </h3>
            </motion.div>

            <div className="space-y-4">
              {rightCards.map(({ title, desc, color, bg, border, icon: Icon }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
                  className={`relative cursor-default rounded-3xl border ${border} ${bg} p-6 md:p-8 transition-all duration-300 group`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`mt-1 h-12 w-12 rounded-2xl ${bg} ${border} flex items-center justify-center transition-transform duration-500 group-hover:rotate-12`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold text-lg md:text-xl font_heading ${color}`}>
                          {title}
                        </h4>
                        <ArrowUpRight className={`h-5 w-5 ${color} opacity-0 group-hover:opacity-60 transition-opacity`} />
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-light">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Decorative corner light */}
                  <div className={`absolute top-0 right-0 h-px w-24 bg-gradient-to-l from-${color.split('-')[1]}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
