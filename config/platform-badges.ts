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
        logoUrl: '/assets/images/social-platform-logo/spotify-circle-logo-promotion.png',
        fallbackText: 'SP',
        color: '#1DB954'
    },
    {
        id: 'apple-music',
        name: 'Apple Music',
        logoUrl: '/assets/images/social-platform-logo/apple-music-circle-icon-promotion.png',
        fallbackText: 'AM',
        color: '#FC3C44'
    },
    {
        id: 'youtube-music',
        name: 'YouTube Music',
        logoUrl: '/assets/images/social-platform-logo/youtube-music-circle-logo-promotion.png',
        fallbackText: 'YT',
        color: '#FF0000'
    },
    {
        id: 'amazon-music',
        name: 'Amazon Music',
        logoUrl: '/assets/images/social-platform-logo/amazon-music-circle-logo-promotion.png',
        fallbackText: 'AZ',
        color: '#00A8E1'
    },
    {
        id: 'soundcloud',
        name: 'SoundCloud',
        logoUrl: '/assets/images/social-platform-logo/soundcloud-circle-logo-promotion.png',
        fallbackText: 'SC',
        color: '#FF7700'
    },
    {
        id: 'deezer',
        name: 'Deezer',
        logoUrl: '/assets/images/social-platform-logo/deezer-circle-logo-promotion.png',
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
        logoUrl: "/assets/images/social-platform-logo/jiosavan-circle-logo-promotion.png",
        fallbackText: 'JS',
        color: '#2C99C9'
    },
    {
        id: 'gaana',
        name: 'Gaana',
        logoUrl: '/assets/images/social-platform-logo/ganna-circle-logo-promotion.png',
        fallbackText: 'GN',
        color: '#E72C2C'
    },
    {
        id: 'facebook',
        name: 'Meta',
        logoUrl: '/assets/images/social-platform-logo/facebook-circle-logo-promotion.png',
        fallbackText: 'FB',
        color: '#0081FB'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        logoUrl: '/assets/images/social-platform-logo/instagram-circle-logo-promotion.png',
        fallbackText: 'IG',
        color: '#E1306C'
    },
    {
        id: "wynk",
        name: "Wynk Music",
        logoUrl: '/assets/images/social-platform-logo/wynk-music-circle-logo-promotion.png',
        fallbackText: 'WK',
        color: '#E11B22'
    }
];
