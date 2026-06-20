import type { StaticImageData } from "next/image";
import AmazonLogo from "@/public/assets/images/platform-img/amazon-logo.png";
import AppleMusicLogo from "@/public/assets/images/platform-img/apple-music-logo.png";
import GaanaLogo from "@/public/assets/images/platform-img/gaana-logo.png";
import JioSaavnLogo from "@/public/assets/images/platform-img/jiosaavan-logo.png";
import MetaLogo from "@/public/assets/images/platform-img/meta-logo.png";
import SpotifyLogo from "@/public/assets/images/platform-img/spotify-logo.png";

export type PlatformDspKey =
  | "total"
  | "spotify"
  | "applemusic"
  | "amazon"
  | "gaana"
  | "jiosaavn"
  | "facebook";

export interface PlatformMeta {
  key: PlatformDspKey;
  label: string;
  color: string;
  logo?: StaticImageData;
}

export const PLATFORM_LOGOS: Partial<Record<PlatformDspKey, StaticImageData>> = {
  spotify: SpotifyLogo,
  applemusic: AppleMusicLogo,
  amazon: AmazonLogo,
  gaana: GaanaLogo,
  jiosaavn: JioSaavnLogo,
  facebook: MetaLogo,
};

export const PLATFORM_COLORS: Record<string, string> = {
  spotify: "#1DB954",
  applemusic: "#FC3C44",
  amazon: "#00A8E1",
  gaana: "#E72C2C",
  jiosaavn: "#2C99C9",
  facebook: "#0081FB",
};

export const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  applemusic: "Apple Music",
  amazon: "Amazon Music",
  gaana: "Gaana",
  jiosaavn: "JioSaavn",
  facebook: "Meta",
};

export const ANALYTICS_PLATFORMS: PlatformMeta[] = [
  { key: "total", label: "Total", color: "#8b5cf6" },
  { key: "applemusic", label: "Apple Music", color: PLATFORM_COLORS.applemusic, logo: AppleMusicLogo },
  { key: "gaana", label: "Gaana", color: PLATFORM_COLORS.gaana, logo: GaanaLogo },
  { key: "jiosaavn", label: "JioSaavn", color: PLATFORM_COLORS.jiosaavn, logo: JioSaavnLogo },
  { key: "spotify", label: "Spotify", color: PLATFORM_COLORS.spotify, logo: SpotifyLogo },
  { key: "amazon", label: "Amazon Music", color: PLATFORM_COLORS.amazon, logo: AmazonLogo },
  { key: "facebook", label: "Meta", color: PLATFORM_COLORS.facebook, logo: MetaLogo },
];

export function getPlatformLogo(dsp: string): StaticImageData | undefined {
  return PLATFORM_LOGOS[dsp as PlatformDspKey];
}

export function getPlatformColor(dsp: string): string {
  return PLATFORM_COLORS[dsp] ?? "#94a3b8";
}

export function getPlatformLabel(dsp: string, fallback?: string): string {
  return PLATFORM_LABELS[dsp] ?? fallback ?? dsp;
}
