import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SmartMusicHero from "@/components/smart-music/SmartMusicHero";
import SmartMusicDistribution from "@/components/smart-music/SmartMusicDistribution";
import SmartMusicAIEngine from "@/components/smart-music/SmartMusicAIEngine";
import SmartMusicTechnology from "@/components/smart-music/SmartMusicTechnology";
import SmartMusicCTA from "@/components/smart-music/SmartMusicCTA";

export const metadata: Metadata = {
  title: "Smart Music – Ktarolib | AI Release Engine & Global Distribution",
  description:
    "Ktarolib delivers global music distribution powered by intelligent AI release technology — making releases faster, safer, and more accurate across 150+ streaming platforms.",
};

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
