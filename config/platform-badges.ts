export interface Badge {
    id: string;
    name: string;
    logoUrl: string;
    fallbackText: string;
    color: string;
}

export const PLATFORM_BADGES: Badge[] = [
    {
        id: 'spotify',
        name: 'Spotify',
        logoUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png',
        fallbackText: 'SP',
        color: '#1DB954'
    },
    {
        id: 'apple-music',
        name: 'Apple Music',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apple_Music_logo.svg/2560px-Apple_Music_logo.svg.png',
        fallbackText: 'AM',
        color: '#FC3C44'
    },
    {
        id: 'youtube-music',
        name: 'YouTube Music',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/2048px-Youtube_Music_icon.svg.png',
        fallbackText: 'YT',
        color: '#FF0000'
    },
    {
        id: 'amazon-music',
        name: 'Amazon Music',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Amazon_Music_logo.svg/2560px-Amazon_Music_logo.svg.png',
        fallbackText: 'AZ',
        color: '#00A8E1'
    },
    {
        id: 'soundcloud',
        name: 'SoundCloud',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/SoundCloud_logo.svg/2560px-SoundCloud_logo.svg.png',
        fallbackText: 'SC',
        color: '#FF7700'
    },
    {
        id: 'deezer',
        name: 'Deezer',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Deezer_logo.svg/2560px-Deezer_logo.svg.png',
        fallbackText: 'DZ',
        color: '#FF0092'
    },
    {
        id: 'tidal',
        name: 'Tidal',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Tidal_logo.svg/2560px-Tidal_logo.svg.png',
        fallbackText: 'TD',
        color: '#000000'
    },
    {
        id: "jiosaavn",
        name: "JioSaavn",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/JioSaavn_Logo.png",
        fallbackText: 'JS',
        color: '#2C99C9'
    },
    {
        id: "wynk",
        name: "Wynk Music",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Wynk_Music_Logo.png",
        fallbackText: 'WK',
        color: '#E11B22'
    }
];
