import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SmartMusicHero from "@/components/smart-music/SmartMusicHero";
import SmartMusicDistribution from "@/components/smart-music/SmartMusicDistribution";
import SmartMusicAIEngine from "@/components/smart-music/SmartMusicAIEngine";
import SmartMusicTechnology from "@/components/smart-music/SmartMusicTechnology";
import SmartMusicCTA from "@/components/smart-music/SmartMusicCTA";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(
  "Smart Music Distribution | AI Release Recommendations | KratoLib",
  "Smart music distribution with AI-powered release timing, data-driven recommendations, and advanced analytics. Let AI optimize your release strategy for maximum reach.",
);

export default function SmartMusicPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <SmartMusicHero />
      <SmartMusicDistribution />
      <SmartMusicAIEngine />
      <SmartMusicTechnology />
      <SmartMusicCTA />
      <Footer />
    </main>
  );
}
