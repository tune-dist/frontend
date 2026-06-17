export function isValidYouTubeUrl(url: string): boolean {
    try {
        const parsed = new URL(url.trim());
        const host = parsed.hostname.toLowerCase();
        return (
            host === "youtu.be" ||
            host === "youtube.com" ||
            host === "www.youtube.com" ||
            host === "m.youtube.com" ||
            host.endsWith(".youtube.com")
        );
    } catch {
        return false;
    }
}

export function parseYouTubeLinks(input: string): string[] {
    return input
        .split("\n")
        .map((link) => link.trim())
        .filter(Boolean);
}

export function getInvalidYouTubeLinks(links: string[]): string[] {
    return links.filter((link) => !isValidYouTubeUrl(link));
}
