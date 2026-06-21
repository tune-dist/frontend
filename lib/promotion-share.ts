export function getPromotionUrl(slug: string): string {
    if (typeof window === "undefined") {
        return `https://kratolib.com/p/${slug}`;
    }
    return `${window.location.origin}/p/${slug}`;
}

export function getPromotionShareText(title?: string, artistName?: string): string {
    if (title && artistName) {
        return `Listen to "${title}" by ${artistName} on KratoLib`;
    }
    if (title) {
        return `Listen to "${title}" on KratoLib`;
    }
    return "Check out my music on KratoLib";
}

export type SharePlatform = "copy" | "facebook" | "instagram" | "whatsapp" | "twitter";

export async function sharePromotionLink(
    platform: SharePlatform,
    url: string,
    shareText?: string
): Promise<{ copied?: boolean }> {
    const text = shareText || "Check out my music on KratoLib";

    switch (platform) {
        case "copy": {
            await navigator.clipboard.writeText(url);
            return { copied: true };
        }
        case "facebook": {
            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                "_blank",
                "noopener,noreferrer,width=600,height=400"
            );
            return {};
        }
        case "twitter": {
            window.open(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
                "_blank",
                "noopener,noreferrer,width=600,height=400"
            );
            return {};
        }
        case "whatsapp": {
            window.open(
                `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
                "_blank",
                "noopener,noreferrer"
            );
            return {};
        }
        case "instagram": {
            await navigator.clipboard.writeText(url);
            window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
            return { copied: true };
        }
        default:
            return {};
    }
}
