"use client";

import { TrendingUp, Activity, Globe, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const chartData = [40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 80, 85, 70, 75, 60, 65, 50, 55, 40, 45, 60, 80, 100, 95, 85, 75, 60, 50, 40, 45, 55, 45, 65, 75, 85];

export default function RoyaltySplitsRevenue() {
  return (
    <section className="py-12 md:py-24 bg-muted/10 relative overflow-hidden">
      {/* Background radial effects */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-8 md:mb-16">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-6"
            >
              <Globe className="h-3 w-3" />
              Global Reach
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 font_heading tracking-tight"
            >
              Unified Multi-Platform <br />
              <span className="animated-gradient">Revenue Intelligence</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl font-light"
            >
              A consolidated home to ingest and report metadata from over 150+
              streaming platforms across 200+ global territories with surgical precision.
            </motion.p>
          </div>
        </div>

        {/* Interactive Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">

          {/* Analytics Visualization Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-[2.5rem] border border-white/10 bg-[#0a0a0c] p-8 md:p-10 flex flex-col shadow-2xl relative overflow-hidden group"
          >
            {/* Header of the Graph */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 relative z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-lg text-white">Global Network Analytics</h3>
              </div>
              <div className="flex bg-white/5 p-1.5 rounded-xl border border-white/5 gap-1">
                {["Platform", "Territory", "Royalties"].map((tab, i) => (
                  <button key={i} className={`text-[10px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider transition-all ${i === 0 ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}>{tab}</button>
                ))}
              </div>
            </div>

            {/* Dynamic Graph Area */}
            <div className="flex-1 min-h-[300px] flex items-end gap-1.5 relative z-10">
              {/* Scanning Line Animation */}
              <motion.div
                animate={{ left: ["0%", "100%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent z-20 pointer-events-none"
              />

              {chartData.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: `${h}%`, opacity: 0.6 }}
                  whileHover={{ height: `${h + 5}%`, opacity: 1, scaleX: 1.2 }}
                  viewport={{ once: true }}
                  transition={{
                    height: { duration: 0.8, delay: i * 0.015, ease: "easeOut" },
                    opacity: { duration: 0.5, delay: i * 0.015 }
                  }}
                  className="flex-1 bg-gradient-to-t from-emerald-600/10 via-emerald-500/40 to-emerald-400 rounded-t-full cursor-pointer relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-[8px] font-bold text-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-0 pointer-events-none transition-opacity">
                    {h}%
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Background Grid Lines */}
            <div className="absolute inset-x-10 bottom-10 top-28 pointer-events-none flex flex-col justify-between opacity-[0.03]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-px bg-white"></div>
              ))}
            </div>

            {/* Gradient Overlay for bottom base */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0c] to-transparent z-20 pointer-events-none" />
          </motion.div>

          {/* Revenue Distribution Strategy Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-[2.5rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-600/90 to-indigo-950 p-10 flex flex-col justify-center text-center shadow-2xl relative overflow-hidden"
          >
            {/* Glow inner */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

            <div className="flex justify-center mb-8 relative z-10">
              <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="font-bold text-2xl text-white mb-6 tracking-tight relative z-10">Revenue Channels</h3>
            <p className="text-white/70 text-lg leading-relaxed relative z-10 font-light">
              Streaming, downloads, syncs, CRBT — all revenue channels tracked with industrial precision and daily parity.
            </p>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-center gap-6 relative z-10">
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-xl">150+</span>
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Platforms</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-xl">200+</span>
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Territories</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
