/**
 * Client-side artist search functionality
 * Searches Spotify and YouTube directly from the frontend
 */

export interface SpotifyArtist {
    id: string;
    name: string;
    image: string;
    followers: number;
    externalUrl: string;
    uri: string;
}

export interface YouTubeChannel {
    id: string;
    name: string;
    image: string;
    track: string;
    channelUrl: string;
}

export interface ArtistSearchResults {
    spotify: SpotifyArtist[];
    apple: any[];
    youtube: YouTubeChannel[];
}

/**
 * Search for artists on Spotify
 * Uses Spotify Web API with Client Credentials
 */
export const searchSpotifyArtists = async (query: string, limit: number = 5): Promise<SpotifyArtist[]> => {
    try {
        // Note: In production, you should implement proper OAuth flow
        // For now, this is a client-side search that uses public Spotify API

        // Get Spotify access token (this should be done server-side in production)
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.warn('Spotify credentials not configured');
            return [];
        }

        // Get access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            },
            body: 'grant_type=client_credentials'
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to get Spotify access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Search for artists
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        if (!searchResponse.ok) {
            throw new Error('Failed to search Spotify artists');
        }

        const searchData = await searchResponse.json();
        const artists = searchData.artists?.items || [];

        return artists.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            image: artist.images?.[0]?.url || '',
            followers: artist.followers?.total || 0,
            externalUrl: artist.external_urls?.spotify || '',
            uri: artist.uri
        }));
    } catch (error) {
        console.error('Spotify search error:', error);
        return [];
    }
};

/**
 * Search for channels on YouTube
 * Uses YouTube Data API v3
 */
export const searchYouTubeChannels = async (query: string, limit: number = 5): Promise<YouTubeChannel[]> => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

        if (!apiKey) {
            console.warn('YouTube API key not configured');
            return [];
        }

        // Search for channels
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=${limit}&key=${apiKey}`
        );

        if (!searchResponse.ok) {
            throw new Error('Failed to search YouTube channels');
        }

        const searchData = await searchResponse.json();
        const channels = searchData.items || [];

        return channels.map((channel: any) => ({
            id: channel.id.channelId,
            name: channel.snippet.title,
            image: channel.snippet.thumbnails?.default?.url || '',
            track: channel.snippet.description || 'YouTube Channel',
            channelUrl: `https://www.youtube.com/channel/${channel.id.channelId}`
        }));
    } catch (error) {
        console.error('YouTube search error:', error);
        return [];
    }
};

/**
 * Search for artists across multiple platforms
 */
export const searchArtists = async (query: string, limit: number = 5): Promise<ArtistSearchResults> => {
    // Search both platforms in parallel
    const [spotifyResults, youtubeResults] = await Promise.all([
        searchSpotifyArtists(query, limit).catch(() => []),
        searchYouTubeChannels(query, limit).catch(() => [])
    ]);

    return {
        spotify: spotifyResults,
        apple: [], // Apple Music search not implemented
        youtube: youtubeResults
    };
};
