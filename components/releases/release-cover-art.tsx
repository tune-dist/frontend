'use client';

import { Music } from 'lucide-react';
import { S3Image } from '@/components/ui/s3-image';
import { cn } from '@/lib/class-names';

interface ReleaseCoverArtProps {
  coverArtUrl?: string | null;
  title: string;
  className?: string;
  iconClassName?: string;
}

function CoverFallback({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50',
        className,
      )}
    >
      <Music className={cn('h-7 w-7 text-muted-foreground/30', iconClassName)} />
    </div>
  );
}

export function ReleaseCoverArt({
  coverArtUrl,
  title,
  className,
  iconClassName,
}: ReleaseCoverArtProps) {
  const src = coverArtUrl?.trim();

  if (!src) {
    return <CoverFallback className={className} iconClassName={iconClassName} />;
  }

  return (
    <S3Image
      src={src}
      alt={title}
      className={cn('h-full w-full object-cover', className)}
      fallback={<CoverFallback className={className} iconClassName={iconClassName} />}
    />
  );
}
