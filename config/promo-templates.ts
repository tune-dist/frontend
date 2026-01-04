export interface PromoCanvas {
    width: number;
    height: number;
}

export interface PromoBackground {
    image: string;
    video?: string;
}

export interface PromoElementPosition {
    x: number;
    y: number;
}

export interface PromoElementSize {
    width: number;
    height: number;
}

export interface PromoElementStyle {
    font?: string;
    size?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
}

export interface PromoElementAnimation {
    mp4: {
        type: 'fade_in' | 'slide_up' | 'zoom_in';
        start: number;
        duration: number;
    };
}

export interface PromoSizeOption {
    label: string;
    width: number;
    height: number;
}

export interface PromoElement {
    id: string;
    type: 'image' | 'text';
    source: 'cover_art' | 'artist_name' | 'track_name' | 'platform_logo' | 'custom_text';
    position: PromoElementPosition;
    size?: PromoElementSize;
    radius?: number;
    style?: PromoElementStyle;
    animation?: PromoElementAnimation;
    allowed?: string[];
    sizeOptions?: PromoSizeOption[];
}

export interface PromoTemplate {
    id: string;
    name: string;
    format: 'story' | 'post';
    canvas: PromoCanvas;
    background: PromoBackground;
    elements: PromoElement[];
}

export const PROMO_TEMPLATES: PromoTemplate[] = [
    {
        id: "classic_story",
        name: "Classic Story",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: {
            image: "s3://promo-templates/classic_story/bg.png",
            video: "s3://promo-templates/classic_story/bg.mp4"
        },
        elements: [
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 150 }, style: { font: "Inter-Bold", size: 48, color: "#ffffff", align: "center" } },
            { id: "cover", type: "image", source: "cover_art", position: { x: 140, y: 300 }, size: { width: 800, height: 800 }, radius: 24 },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1150 }, style: { font: "Inter-Bold", size: 64, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1230 }, style: { font: "Inter-Regular", size: 44, color: "#cccccc", align: "center" } },
            {
                id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1400 },
                sizeOptions: [
                    { label: "small", width: 100, height: 100 },
                    { label: "medium", width: 200, height: 200 },
                    { label: "large", width: 300, height: 300 }
                ]
            }
        ]
    },
    {
        id: "modern_square",
        name: "Modern Square",
        format: "post",
        canvas: { width: 1080, height: 1080 },
        background: { image: "s3://promo-templates/modern_square/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 240, y: 100 }, size: { width: 600, height: 600 }, radius: 12 },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 750 }, style: { font: "Inter-Bold", size: 54, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 820 }, style: { font: "Inter-Regular", size: 36, color: "#aaaaaa", align: "center" } },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 900 }, style: { font: "Inter-Bold", size: 40, color: "#1DB954", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 960 }, sizeOptions: [{ label: "std", width: 200, height: 200 }] }
        ]
    },
    {
        id: "portrait_post",
        name: "Portrait Post",
        format: "post",
        canvas: { width: 1080, height: 1350 },
        background: { image: "s3://promo-templates/portrait_post/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 140, y: 100 }, size: { width: 800, height: 800 }, radius: 40 },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 950 }, style: { font: "Inter-Bold", size: 48, color: "#ffffff", align: "center" } },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1030 }, style: { font: "Inter-Bold", size: 60, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1100 }, style: { font: "Inter-Regular", size: 40, color: "#999999", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1200 }, sizeOptions: [{ label: "std", width: 180, height: 180 }] }
        ]
    },
    {
        id: "cinematic_banner",
        name: "Cinematic Banner",
        format: "post",
        canvas: { width: 1920, height: 1080 },
        background: { image: "s3://promo-templates/cinematic_banner/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 200, y: 140 }, size: { width: 800, height: 800 }, radius: 20 },
            { id: "header", type: "text", source: "custom_text", position: { x: 1400, y: 300 }, style: { font: "Inter-Bold", size: 48, color: "#1DB954", align: "center" } },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 1400, y: 400 }, style: { font: "Inter-Bold", size: 80, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 1400, y: 500 }, style: { font: "Inter-Bold", size: 50, color: "#ffffff", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 1300, y: 650 }, sizeOptions: [{ label: "std", width: 250, height: 250 }] }
        ]
    },
    {
        id: "minimalist_story",
        name: "Minimalist Story",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/minimalist_story/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 340, y: 400 }, size: { width: 400, height: 400 }, radius: 200 },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 850 }, style: { font: "Inter-Bold", size: 40, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 920 }, style: { font: "Inter-Light", size: 30, color: "#888888", align: "center" } },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 200 }, style: { font: "Inter-Light", size: 32, color: "#ffffff", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1600 }, sizeOptions: [{ label: "std", width: 120, height: 120 }] }
        ]
    },
    {
        id: "story_vertical_stack",
        name: "Story - Vertical Stack",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/story_vertical_stack/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 100, y: 200 }, size: { width: 880, height: 880 }, radius: 0 },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 1150 }, style: { font: "Inter-Bold", size: 54, color: "#1DB954", align: "center" } },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1250 }, style: { font: "Inter-Bold", size: 72, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1350 }, style: { font: "Inter-Regular", size: 48, color: "#ffffff", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 415, y: 1550 }, sizeOptions: [{ label: "std", width: 250, height: 250 }] }
        ]
    },
    {
        id: "story_floating_card",
        name: "Story - Floating Card",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/story_floating_card/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 140, y: 400 }, size: { width: 800, height: 800 }, radius: 32 },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 250 }, style: { font: "Inter-Bold", size: 40, color: "#ffffff", align: "center" } },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1300 }, style: { font: "Inter-Bold", size: 64, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1380 }, style: { font: "Inter-Regular", size: 44, color: "#cccccc", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1550 }, sizeOptions: [{ label: "std", width: 200, height: 200 }] }
        ]
    },
    {
        id: "story_blurred_glass",
        name: "Story - Blurred Glass",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/story_blurred_glass/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 190, y: 350 }, size: { width: 700, height: 700 }, radius: 350 },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1100 }, style: { font: "Inter-Bold", size: 56, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1180 }, style: { font: "Inter-Regular", size: 38, color: "#dddddd", align: "center" } },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 200 }, style: { font: "Inter-Bold", size: 44, color: "#1DB954", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1600 }, sizeOptions: [{ label: "std", width: 200, height: 200 }] }
        ]
    },
    {
        id: "story_split_reveal",
        name: "Story - Split Reveal",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/story_split_reveal/bg.png" },
        elements: [
            { id: "cover", type: "image", source: "cover_art", position: { x: 0, y: 0 }, size: { width: 1080, height: 1080 }, radius: 0 },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 1150 }, style: { font: "Inter-Bold", size: 60, color: "#ffffff", align: "center" } },
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 1300 }, style: { font: "Inter-Bold", size: 72, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 1400 }, style: { font: "Inter-Regular", size: 48, color: "#aaaaaa", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1600 }, sizeOptions: [{ label: "std", width: 200, height: 200 }] }
        ]
    },
    {
        id: "story_bold_typography",
        name: "Story - Bold Typography",
        format: "story",
        canvas: { width: 1080, height: 1920 },
        background: { image: "s3://promo-templates/story_bold_typography/bg.png" },
        elements: [
            { id: "artist_name", type: "text", source: "artist_name", position: { x: 540, y: 400 }, style: { font: "Inter-Bold", size: 120, color: "#ffffff", align: "center" } },
            { id: "track_name", type: "text", source: "track_name", position: { x: 540, y: 550 }, style: { font: "Inter-Bold", size: 80, color: "#1DB954", align: "center" } },
            { id: "cover", type: "image", source: "cover_art", position: { x: 290, y: 750 }, size: { width: 500, height: 500 }, radius: 12 },
            { id: "header", type: "text", source: "custom_text", position: { x: 540, y: 1400 }, style: { font: "Inter-Bold", size: 48, color: "#ffffff", align: "center" } },
            { id: "logo", type: "image", source: "platform_logo", position: { x: 440, y: 1600 }, sizeOptions: [{ label: "std", width: 200, height: 200 }] }
        ]
    }
];
