import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SellAndGrowHero from "@/components/sell-grow/SellAndGrowHero";
import VelocitySection from "@/components/sell-grow/VelocitySection";
import GrowthTeamSection from "@/components/sell-grow/GrowthTeamSection";
import PipelineSection from "@/components/sell-grow/PipelineSection";
import CRBTSection from "@/components/sell-grow/CRBTSection";
import CoverageSection from "@/components/sell-grow/CoverageSection";
import EnterpriseSolutionsSection from "@/components/sell-grow/EnterpriseSolutionsSection";
import SellAndGrowCTA from "@/components/sell-grow/SellAndGrowCTA";

export const metadata: Metadata = {
  title: "Grow Your Audience | Pre-Save, Playlist Pitching, UGC Monetization",
  description: "Grow your music audience with pre-save campaigns, playlist pitching, UGC monetization on Meta & TikTok, and fan link tools. Turn listeners into fans. Start free.",
  openGraph: {
    title: "Grow Your Audience | Pre-Save, Playlist Pitching, UGC Monetization",
    description: "Grow your music audience with pre-save campaigns, playlist pitching, UGC monetization on Meta & TikTok, and fan link tools. Turn listeners into fans. Start free.",
  },
  twitter: {
    title: "Grow Your Audience | Pre-Save, Playlist Pitching, UGC Monetization",
    description: "Grow your music audience with pre-save campaigns, playlist pitching, UGC monetization on Meta & TikTok, and fan link tools. Turn listeners into fans. Start free.",
  },
};


export default function SellAndGrowPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <SellAndGrowHero />
      <VelocitySection />
      <GrowthTeamSection />
      <PipelineSection />
      <CRBTSection />
      <CoverageSection />
      <EnterpriseSolutionsSection />
      <SellAndGrowCTA />
      <Footer />
    </main>
  );
}
