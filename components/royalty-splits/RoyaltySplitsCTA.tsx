"use client";

export default function RoyaltySplitsCTA() {
  return (
    <section className="py-12 md:py-24 bg-background relative overflow-hidden border-t border-border/30">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 m-auto w-[600px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 font_heading tracking-tight">
          Power Your <span className="animated-gradient">Music Business</span><br />
          With Confidence.
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="/auth?tab=signup"
            className="group inline-flex items-center justify-center px-8 py-3.5 rounded-xl animated-gradient-bg text-white font-semibold text-md hover:opacity-90 transition-opacity shadow-xl min-w-[200px] w-full md:w-auto"
          >
            Create Your First Split
          </a>
          <a
            href="/auth?tab=signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-muted/20 hover:bg-white hover:text-black text-white font-semibold text-md transition-colors border border-white/5 min-w-[200px] w-full md:w-auto"
          >
            Schedule a Demo
          </a>
        </div>
      </div>
    </section>
  );
}
