import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SmartMusicFeatures from "@/components/smart-music/SmartMusicFeatures";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata(
  "Music Distribution Features | AI, Analytics, CRBT | KratoLib",
  "Discover KratoLib features: real-time analytics, AI cover art generator, AI mastering, CRBT distribution, credit protection, YouTube Content ID. All included in your plan.",
);

export default function FeaturePage() {
  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      <SmartMusicFeatures />
      <Footer />
    </main>
  );
}
