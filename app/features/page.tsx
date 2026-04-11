import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SmartMusicFeatures from "@/components/smart-music/SmartMusicFeatures";

export const metadata: Metadata = {
  title: "Features – Ktarolib",
  description: "Advanced Music Analytics System and Everything You Need in One Platform",
};

export default function FeaturePage() {
  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      <SmartMusicFeatures />
      <Footer />
    </main>
  );
}
