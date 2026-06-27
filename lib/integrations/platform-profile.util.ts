export type PlatformSearchResults = { spotify: any[]; apple: any[]; youtube: any[]; source?: 'cosmos' | 'legacy' }

export type RichPlatformProfile = {
    id: string
    name: string
    image: string
    url: string
    followers?: number
    track?: string
}

export function extractAppleArtistId(value: unknown): string | null {
    if (value == null) return null

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>
        const id = typeof record.id === 'string' ? record.id.trim() : ''
        if (/^\d+$/.test(id)) return id
        const url =
            typeof record.url === 'string'
                ? record.url
                : typeof record.externalUrl === 'string'
                  ? record.externalUrl
                  : ''
        return extractAppleArtistId(url)
    }

    if (typeof value !== 'string') return null

    const trimmed = value.trim()
    const fromRegionalUrl = trimmed.match(
        /music\.apple\.com(?:\/[a-z]{2})?\/artist(?:\/[^/?#]+)*\/(\d+)/i,
    )?.[1]
    if (fromRegionalUrl) return fromRegionalUrl

    const fromSimpleUrl = trimmed.match(/music\.apple\.com\/artist\/(\d+)/i)?.[1]
    if (fromSimpleUrl) return fromSimpleUrl

    if (/^\d+$/.test(trimmed)) return trimmed

    return null
}

export function extractSpotifyArtistId(value: unknown): string | null {
    if (value == null) return null

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>
        const id = typeof record.id === 'string' ? record.id.trim() : ''
        if (id && !id.startsWith('http') && /^[a-zA-Z0-9]+$/.test(id)) {
            return id
        }
        const url =
            typeof record.url === 'string'
                ? record.url
                : typeof record.externalUrl === 'string'
                  ? record.externalUrl
                  : ''
        return extractSpotifyArtistId(url)
    }

    if (typeof value !== 'string') return null

    const trimmed = value.trim()
    const fromUrl = trimmed.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/i)?.[1]
    if (fromUrl) return fromUrl

    const fromUri = trimmed.match(/spotify:artist:([a-zA-Z0-9]+)/i)?.[1]
    if (fromUri) return fromUri

    if (/^[a-zA-Z0-9]{15,}$/.test(trimmed)) return trimmed

    return null
}

function normalizeUrl(value: string): string {
    return value.trim().replace(/\/+$/, '').toLowerCase()
}

function profileHasDisplayName(profile: unknown): boolean {
    return (
        typeof profile === 'object' &&
        profile !== null &&
        typeof (profile as { name?: string }).name === 'string' &&
        Boolean((profile as { name?: string }).name?.trim())
    )
}

function toRichProfile(match: any): RichPlatformProfile {
    return {
        id: match.id,
        name: match.name,
        image: match.image || '',
        url: match.externalUrl || match.channelUrl || match.url || '',
        followers: match.followers,
        track: match.track,
    }
}

function spotifyArtistMatches(stored: unknown, artist: any): boolean {
    const storedId = extractSpotifyArtistId(stored)
    if (storedId && artist.id === storedId) return true

    if (typeof stored === 'string') {
        const normalizedStored = normalizeUrl(stored)
        const candidates = [artist.externalUrl, artist.url].filter(Boolean) as string[]
        if (candidates.some((url) => normalizeUrl(url) === normalizedStored)) {
            return true
        }
    }

    if (stored && typeof stored === 'object') {
        const record = stored as Record<string, unknown>
        const storedUrls = [record.url, record.externalUrl].filter(
            (v): v is string => typeof v === 'string' && v.length > 0,
        )
        const candidates = [artist.externalUrl, artist.url].filter(Boolean) as string[]
        if (
            storedUrls.some((storedUrl) =>
                candidates.some((url) => normalizeUrl(url) === normalizeUrl(storedUrl)),
            )
        ) {
            return true
        }
    }

    return false
}

function findSpotifyInResults(stored: unknown, results: any[]): any | null {
    return results.find((artist) => spotifyArtistMatches(stored, artist)) ?? null
}

function appleArtistMatches(stored: unknown, artist: any): boolean {
    const storedId = extractAppleArtistId(stored)
    if (storedId && artist.id === storedId) return true

    if (typeof stored === 'string') {
        const normalizedStored = normalizeUrl(stored)
        const candidates = [artist.externalUrl, artist.url].filter(Boolean) as string[]
        if (candidates.some((url) => normalizeUrl(url) === normalizedStored)) {
            return true
        }
    }

    if (stored && typeof stored === 'object') {
        const record = stored as Record<string, unknown>
        const storedUrls = [record.url, record.externalUrl].filter(
            (v): v is string => typeof v === 'string' && v.length > 0,
        )
        const candidates = [artist.externalUrl, artist.url].filter(Boolean) as string[]
        if (
            storedUrls.some((storedUrl) =>
                candidates.some((url) => normalizeUrl(url) === normalizeUrl(storedUrl)),
            )
        ) {
            return true
        }
    }

    return false
}

function findGenericInResults(
    stored: unknown,
    results: any[],
    platform: 'apple' | 'youtube',
): any | null {
    const matchStored = (candidate: unknown, artist: any) => {
        if (platform === 'apple') {
            return appleArtistMatches(candidate, artist)
        }

        if (typeof candidate === 'string') {
            return (
                artist.id === candidate ||
                artist.externalUrl === candidate ||
                artist.url === candidate ||
                artist.channelUrl === candidate
            )
        }
        if (candidate && typeof candidate === 'object') {
            const record = candidate as Record<string, unknown>
            const id = typeof record.id === 'string' ? record.id : undefined
            const urls = [record.url, record.externalUrl, record.channelUrl].filter(
                (v): v is string => typeof v === 'string',
            )
            return (
                (id && artist.id === id) ||
                urls.some(
                    (url) =>
                        url === artist.externalUrl ||
                        url === artist.url ||
                        url === artist.channelUrl,
                )
            )
        }
        return false
    }

    return results.find((artist) => matchStored(stored, artist)) ?? null
}

export function profileNeedsSearchHydration(profile: unknown): boolean {
    if (!profile || profile === 'new') return false
    if (profileHasDisplayName(profile)) return false
    return true
}

export function profileNeedsAppleEnrichment(profile: unknown): boolean {
    if (!profile || profile === 'new') return false

    if (typeof profile === 'object' && profile !== null) {
        const record = profile as Record<string, unknown>
        if (typeof record.image === 'string' && record.image.trim()) return false
        return Boolean(extractAppleArtistId(profile))
    }

    return (
        typeof profile === 'string' &&
        profile.startsWith('http') &&
        Boolean(extractAppleArtistId(profile))
    )
}

/** Resolve stored profile (URL, id, lean object) to a rich card using search/roster data. */
export function resolvePlatformProfile(
    platform: 'spotify' | 'apple' | 'youtube',
    profileData: unknown,
    artistName: string,
    results: PlatformSearchResults,
    roster: any[] = [],
): unknown {
    if (!profileData) return null
    if (profileData === 'new') return 'new'
    if (profileHasDisplayName(profileData)) return profileData

    const resultKey = platform === 'spotify' ? 'spotify' : platform === 'apple' ? 'apple' : 'youtube'
    const platformResults = results[resultKey] || []

    const found =
        platform === 'spotify'
            ? findSpotifyInResults(profileData, platformResults)
            : findGenericInResults(profileData, platformResults, platform)

    if (found) return toRichProfile(found)

    const rosterArtist = roster.find((a) => (typeof a === 'string' ? a : a.name) === artistName)
    if (rosterArtist && typeof rosterArtist === 'object') {
        const field =
            platform === 'spotify'
                ? rosterArtist.spotifyProfile
                : platform === 'apple'
                  ? rosterArtist.appleMusicProfile
                  : rosterArtist.youtubeMusicProfile
        if (profileHasDisplayName(field)) return field

        if (platform === 'spotify' && field) {
            const rosterMatch = findSpotifyInResults(field, platformResults)
            if (rosterMatch) return toRichProfile(rosterMatch)
        }

        if (platform === 'apple' && field) {
            const rosterMatch = findGenericInResults(field, platformResults, 'apple')
            if (rosterMatch) return toRichProfile(rosterMatch)
        }
    }

    return profileData
}
