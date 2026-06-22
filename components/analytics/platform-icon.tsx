"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getPlatformColor,
  getPlatformLogo,
  PlatformDspKey,
  PlatformMeta,
} from "@/lib/platform-logos";

interface PlatformLogoProps {
  dsp: string;
  label: string;
  size?: number;
  className?: string;
  active?: boolean;
}

export function PlatformLogo({
  dsp,
  label,
  size = 28,
  className,
  active = false,
}: PlatformLogoProps) {
  const logo = getPlatformLogo(dsp);

  if (!logo) {
    return (
      <span
        className={cn("rounded-full shrink-0", className)}
        style={{
          width: size,
          height: size,
          backgroundColor: getPlatformColor(dsp),
        }}
        title={label}
      />
    );
  }

  return (
    <Image
      src={logo}
      alt={label}
      width={size}
      height={size}
      className={cn(
        "object-contain shrink-0",
        active && "brightness-0 invert",
        className,
      )}
      title={label}
    />
  );
}

interface PlatformFilterButtonProps {
  platform: PlatformMeta;
  isActive: boolean;
  onClick: () => void;
}

export function PlatformFilterButton({
  platform,
  isActive,
  onClick,
}: PlatformFilterButtonProps) {
  if (platform.key === "total") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-12 min-w-[4.5rem] rounded-xl border px-4 text-sm font-semibold transition-all",
          isActive
            ? "border-transparent bg-primary text-primary-foreground shadow-md"
            : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground",
        )}
        title={platform.label}
      >
        Total
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 min-w-[3.25rem] rounded-xl border flex items-center justify-center overflow-hidden transition-all px-2.5",
        isActive
          ? "border-transparent shadow-md scale-[1.02]"
          : "border-border/60 bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50",
      )}
      style={isActive ? { backgroundColor: platform.color } : undefined}
      title={platform.label}
    >
      {platform.logo ? (
        <Image
          src={platform.logo}
          alt={platform.label}
          width={36}
          height={36}
          className={cn(
            "h-8 w-auto max-w-[5.5rem] object-contain",
            isActive && "brightness-0 invert",
          )}
        />
      ) : (
        <PlatformLogo
          dsp={platform.key}
          label={platform.label}
          size={32}
          active={isActive}
        />
      )}
    </button>
  );
}

interface PlatformLegendItemProps {
  dsp: string;
  label: string;
  className?: string;
}

export function PlatformLegendItem({ dsp, label, className }: PlatformLegendItemProps) {
  const logo = getPlatformLogo(dsp);
  const color = getPlatformColor(dsp);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {logo ? (
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 p-1.5 shadow-sm"
          style={{ backgroundColor: color }}
          title={label}
        >
          <Image
            src={logo}
            alt={label}
            width={28}
            height={28}
            className="h-6 w-auto max-w-full object-contain brightness-0 invert"
          />
        </div>
      ) : (
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black uppercase text-white shadow-sm"
          style={{ backgroundColor: color }}
          title={label}
        >
          {label.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

export type { PlatformDspKey };
