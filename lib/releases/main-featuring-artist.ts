function normalizedArtistName(name: string): string {
  return name.trim().toLowerCase();
}

function trimmedArtistName(name: string | null | undefined): string {
  return typeof name === 'string' ? name.trim() : '';
}

export function artistRoleConflictMessage(name: string): string {
  return `${name} cannot be both a main artist and a featuring artist.`;
}

/** First featuring name that matches a main artist, ignoring case and surrounding spaces. */
export function sharedArtistName(
  mainNames: Array<string | null | undefined>,
  featuringNames: Array<string | null | undefined>,
): string | null {
  const mains = new Set<string>();
  for (const name of mainNames) {
    const trimmed = trimmedArtistName(name);
    if (!trimmed) continue;
    mains.add(normalizedArtistName(trimmed));
  }

  for (const name of featuringNames) {
    const trimmed = trimmedArtistName(name);
    if (!trimmed) continue;
    if (mains.has(normalizedArtistName(trimmed))) return trimmed;
  }

  return null;
}

export function releaseMainArtistNames(input: {
  artistName?: string | null;
  artists?: Array<{ name?: string | null }> | null;
  tracks?: Array<{
    artistName?: string | null;
    trackMainArtists?: Array<{ name?: string | null }> | null;
  }> | null;
}): string[] {
  const names: string[] = [];
  const main = trimmedArtistName(input.artistName);
  if (main) names.push(main);

  for (const artist of input.artists || []) {
    const name = trimmedArtistName(artist?.name);
    if (name) names.push(name);
  }

  for (const track of input.tracks || []) {
    const trackMains = track.trackMainArtists || [];
    if (trackMains.length > 0) {
      for (const artist of trackMains) {
        const name = trimmedArtistName(artist?.name);
        if (name) names.push(name);
      }
      continue;
    }
    const trackName = trimmedArtistName(track.artistName);
    if (trackName) names.push(trackName);
  }

  return names;
}

export function releaseFeaturingArtistNames(input: {
  featuringArtist?: string | null;
  tracks?: Array<{ featuringArtist?: string | null }> | null;
}): string[] {
  const names: string[] = [];
  const releaseFeaturing = trimmedArtistName(input.featuringArtist);
  if (releaseFeaturing) names.push(releaseFeaturing);

  for (const track of input.tracks || []) {
    const name = trimmedArtistName(track.featuringArtist);
    if (name) names.push(name);
  }

  return names;
}

/** Drop artists already used in the other role. Keep the name currently selected in this field. */
export function omitBlockedArtistNames(
  options: string[],
  blockedNames: Array<string | null | undefined>,
  keepName?: string,
): string[] {
  const keep = trimmedArtistName(keepName);
  return options.filter((option) => {
    const name = trimmedArtistName(option);
    if (!name) return false;
    if (keep && normalizedArtistName(name) === normalizedArtistName(keep)) return true;
    return sharedArtistName([name], blockedNames) === null;
  });
}
