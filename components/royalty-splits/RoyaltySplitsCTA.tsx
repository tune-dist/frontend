"use client";

import { useState } from "react";
import { DollarSign, Send, CheckCircle2, Settings, TrendingUp, Zap } from "lucide-react";

export default function RoyaltySplitsCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <>
      {/* ── Main CTA ── */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 m-auto w-[800px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }} />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font_heading mb-6 leading-[1.1]">
            Power Your Music  {" "}
            <span className="animated-gradient">Business</span>
            <br />
            With Confidence
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Kratolib combines automation, transparency, and financial intelligence to create the next standard in royalty management.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { title: "Start managing splits smarter.", icon: <Settings className="h-6 w-6 text-emerald-400" /> },
              { title: "Start scaling faster.", icon: <TrendingUp className="h-6 w-6 text-indigo-400" /> },
              { title: "Start with Kratolib.", icon: <Zap className="h-6 w-6 text-amber-400" /> },
            ].map(({ title, icon }, i) => (
              <div key={i} className="group flex items-center justify-center gap-4 p-4 rounded-2xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 group-hover:bg-muted/60 transition-colors group-hover:scale-110 duration-300">
                  {icon}
                </div>
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section id="contact" className="py-16 border-t border-border/40 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-muted/30 text-xs text-muted-foreground mb-4">
              <Send className="h-3 w-3 text-primary" />
              Stay Updated
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font_heading mb-2">
              Get the <span className="animated-gradient">Latest From Kratolib</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-8">
              Receive product updates, new royalty features, and artist finance tools.
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
                  className="px-6 py-3 rounded-xl animated-gradient-bg text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
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
