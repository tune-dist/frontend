"use client";

import { useState } from "react";
import { ArrowRight, Music, Send, CheckCircle2 } from "lucide-react";

export default function SmartMusicCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
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

      {/* ── Newsletter strip ── */}
      <section id="contact" className="py-16 border-t border-border/40 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <Send className="h-3 w-3 text-primary" />
              Stay Updated
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font_heading mb-2">
              Get the <span className="animated-gradient">Latest From Ktarolib</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-8">
              Subscribe to receive product updates, new AI features, and artist tools.
            </p>

            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                You&apos;re subscribed! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/60 focus:bg-background transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2 justify-center"
                >
                  <Send className="h-4 w-4" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
