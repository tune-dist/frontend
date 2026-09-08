'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/class-names';

interface PageSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PageSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: PageSearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-secondary pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
      />
    </div>
  );
}

interface PageSearchSectionProps {
  children: React.ReactNode;
  className?: string;
}

/** Standalone search row — visible above list tables (Users page style). */
export function PageSearchSection({ children, className }: PageSearchSectionProps) {
  return (
    <div className={cn('glass-card rounded-2xl border border-border/80 p-3', className)}>
      {children}
    </div>
  );
}
