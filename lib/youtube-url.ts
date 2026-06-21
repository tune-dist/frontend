function isYouTubeHost(host: string): boolean {
    return (
        host === "youtu.be" ||
        host === "youtube.com" ||
        host === "www.youtube.com" ||
        host === "m.youtube.com" ||
        host.endsWith(".youtube.com")
    );
}

export function isValidYouTubeUrl(url: string): boolean {
    try {
        const parsed = new URL(url.trim());
        return isYouTubeHost(parsed.hostname.toLowerCase());
    } catch {
        return false;
    }
}

export function extractYouTubeVideoId(url: string): string | null {
    try {
        let candidate = url.trim();
        if (!candidate) return null;
        if (!/^https?:\/\//i.test(candidate)) {
            candidate = `https://${candidate}`;
        }

        const parsed = new URL(candidate);
        const host = parsed.hostname.toLowerCase();
        if (!isYouTubeHost(host)) return null;

        if (host === "youtu.be") {
            const id = parsed.pathname.replace(/^\//, "").split("/")[0];
            return id || null;
        }

        const pathParts = parsed.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "shorts" && pathParts[1]) {
            return pathParts[1];
        }
        if (pathParts[0] === "embed" && pathParts[1]) {
            return pathParts[1];
        }
        if (pathParts[0] === "live" && pathParts[1]) {
            return pathParts[1];
        }

        const v = parsed.searchParams.get("v");
        return v || null;
    } catch {
        return null;
    }
}

/** Canonical claim URL: video only, no playlist/radio/index params. */
export function canonicalYouTubeVideoUrl(url: string): string | null {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId || !/^[\w-]{6,}$/.test(videoId)) {
        return null;
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export function parseYouTubeLinks(input: string): string[] {
    return input
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean);
}

export function getInvalidYouTubeLinks(links: string[]): string[] {
    return links.filter((link) => !canonicalYouTubeVideoUrl(link));
}

export function normalizeYouTubeUrl(url: string): string | null {
    return canonicalYouTubeVideoUrl(url);
}

/** Valid, deduplicated YouTube links ready for Excel export. */
export function getExportableYouTubeLinks(links: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const link of links) {
        const normalized = canonicalYouTubeVideoUrl(link);
        if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            result.push(normalized);
        }
    }

    return result;
}
