"use client";

import { ArrowRight, Music } from "lucide-react";

export default function SmartMusicCTA() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {/* ── Main CTA band ── */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 m-auto w-[800px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(ellipse, #be51c5 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-6">
            <Music className="h-3.5 w-3.5 text-primary" />
            Start Your Global Music Distribution
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font_heading mb-6 leading-[1.1]">
            Release Faster.{" "}
            <span className="animated-gradient">Distribute Smarter.</span>
            <br />
            Grow Globally.
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of independent artists who trust Ktarolib to distribute their music
            with confidence, accuracy, and full ownership.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/auth?tab=signup"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl animated-gradient-bg text-white font-bold text-base hover:opacity-90 transition-opacity shadow-2xl"
            >
              Create Account
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border border-border/60 bg-muted/30 text-foreground font-bold text-base hover:bg-muted/60 transition-colors"
            >
              Start Distribution
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required &bull; 14-day free trial &bull; Full cancellation anytime
          </p>
        </div>
      </section>
    </>
  );
}
