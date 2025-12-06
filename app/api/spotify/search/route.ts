import { NextResponse } from 'next/server';
import axios from 'axios';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        console.error('Spotify credentials missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        // 1. Get Access Token
        const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const tokenResponse = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // 2. Search for Artist
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            params: {
                q: query,
                type: 'artist',
                limit: 5,
            },
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // 3. Format Results
        const artists = searchResponse.data.artists.items.map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            image: artist.images[0]?.url || 'https://via.placeholder.com/150',
            track: `${artist.followers.total.toLocaleString()} followers`, // Spotify doesn't give "latest track" easily in search, using followers as metadata
            url: artist.external_urls.spotify
        }));

        return NextResponse.json({ artists });

    } catch (error: any) {
        console.error('Spotify API Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch from Spotify' }, { status: 500 });
    }
}
