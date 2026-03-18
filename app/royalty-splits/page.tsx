import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import RoyaltySplitsHero from "@/components/royalty-splits/RoyaltySplitsHero";
import RoyaltySplitsCollaboration from "@/components/royalty-splits/RoyaltySplitsCollaboration";
import RoyaltySplitsRevenue from "@/components/royalty-splits/RoyaltySplitsRevenue";
import RoyaltySplitsAutomation from "@/components/royalty-splits/RoyaltySplitsAutomation";
import RoyaltySplitsTransparency from "@/components/royalty-splits/RoyaltySplitsTransparency";
import RoyaltySplitsCTA from "@/components/royalty-splits/RoyaltySplitsCTA";

export const metadata: Metadata = {
  title: "Royalty Splits – Kratolib | Automated Royalty Management",
  description:
    "Kratolib delivers a powerful, fully automated royalty split infrastructure for artists, labels, producers, and music businesses operating in today's global streaming ecosystem.",
};

export default function RoyaltySplitsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <RoyaltySplitsHero />
      <RoyaltySplitsCollaboration />
      <RoyaltySplitsRevenue />
      <RoyaltySplitsAutomation />
      <RoyaltySplitsTransparency />
      <RoyaltySplitsCTA />
      <Footer />
    </main>
  );
}
