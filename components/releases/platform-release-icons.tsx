"use client";

import type { ReactNode } from "react";
import {
  getPlatformBadge,
  getPlatformOpenUrl,
} from "@/lib/releases/platform-release-links";
import type { ReleasedOnPlatform } from "@/lib/releases/types";

interface PlatformReleaseIconsProps {
  platforms?: ReleasedOnPlatform[] | null;
  className?: string;
  iconClassName?: string;
  /** @deprecated Logos are always filtered to known badge assets. */
  iconsOnly?: boolean;
  /** Shown when no known-logo platforms remain (list cells). */
  emptyFallback?: ReactNode;
}

/** DSP icons for Released releases — click opens live link or profile fallback. */
export function PlatformReleaseIcons({
  platforms,
  className = "flex items-center gap-1.5 flex-wrap",
  iconClassName = "h-7 w-7",
  emptyFallback = null,
}: PlatformReleaseIconsProps) {
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return emptyFallback ?? null;
  }

  // Only platforms with a known logo — never letter fallbacks for unknown DSPs.
  const visible = platforms.filter((platform) => !!getPlatformBadge(platform.key));

  if (visible.length === 0) {
    return emptyFallback ?? null;
  }

  return (
    <div className={className}>
      {visible.map((platform) => {
        const badge = getPlatformBadge(platform.key);
        const href = getPlatformOpenUrl(platform);
        const label = platform.name || badge?.name || platform.key;
        const content = badge ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.logoUrl}
            alt={label}
            className={`${iconClassName} rounded-full object-cover border border-border/60 bg-background`}
          />
        ) : (
          <span
            className={`inline-flex ${iconClassName} items-center justify-center rounded-full bg-muted text-[9px] font-black uppercase`}
            title={label}
          >
            {label.slice(0, 2)}
          </span>
        );

        if (!href) {
          return (
            <span key={`${platform.key}-${platform.name}`} title={`${label} (no link)`}>
              {content}
            </span>
          );
        }

        return (
          <a
            key={`${platform.key}-${platform.name}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open on ${label}`}
            className="inline-flex transition-transform hover:scale-110"
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
