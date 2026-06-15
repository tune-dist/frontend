/** Release / track identifiers for display (UPC, ISRC). */

export interface ReleaseCodeSource {
  status?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  tracks?: Array<{ isrc?: string }>;
}

/** Collect unique ISRC values from release root and tracks. */
export function getTrackIsrcs(release: ReleaseCodeSource): string[] {
  const codes = new Set<string>();

  if (release.isrc?.trim()) {
    codes.add(release.isrc.trim());
  }

  for (const track of release.tracks ?? []) {
    if (track.isrc?.trim()) {
      codes.add(track.isrc.trim());
    }
  }

  return Array.from(codes);
}

export function formatUpcDisplay(
  release: ReleaseCodeSource,
): string {
  const upc = release.barcode?.trim() || release.upc?.trim();
  if (upc) {
    return upc;
  }
  if (release.status === 'Draft') {
    return 'Pending';
  }
  return 'N/A';
}

/**
 * List view: single ISRC or "IN-KTL-26-00028 +2 more" for multi-track.
 */
export function formatIsrcListDisplay(release: ReleaseCodeSource): string {
  const isrcs = getTrackIsrcs(release);

  if (isrcs.length === 0) {
    return release.status === 'Draft' ? 'Pending' : 'N/A';
  }

  if (isrcs.length === 1) {
    return isrcs[0];
  }

  const remaining = isrcs.length - 1;
  return `${isrcs[0]} +${remaining} more`;
}

/** Detail view: all ISRCs comma-separated, or Pending / N/A. */
export function formatIsrcDetailDisplay(release: ReleaseCodeSource): string {
  const isrcs = getTrackIsrcs(release);

  if (isrcs.length === 0) {
    return release.status === 'Draft' ? 'Pending' : '—';
  }

  return isrcs.join(', ');
}

/** Per-track ISRC for detail tracklist — falls back to release root for singles. */
export function getTrackIsrcDisplay(
  track: { isrc?: string },
  release: ReleaseCodeSource,
): string {
  if (track.isrc?.trim()) {
    return track.isrc.trim();
  }
  const isrcs = getTrackIsrcs(release);
  if (isrcs.length === 1) {
    return isrcs[0];
  }
  return release.status === 'Draft' ? 'Pending' : '—';
}
