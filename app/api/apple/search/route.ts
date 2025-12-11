import { NextResponse } from 'next/server';
import axios from 'axios';

const APPLE_DEVELOPER_TOKEN = process.env.APPLE_DEVELOPER_TOKEN;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    if (!APPLE_DEVELOPER_TOKEN) {
        console.error('Apple Developer Token missing');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        // Search Apple Music Catalog
        // Defaulting to 'us' storefront. In a real app, you might want to detect the user's region.
        const searchResponse = await axios.get('https://api.music.apple.com/v1/catalog/us/search', {
            params: {
                term: query,
                types: 'artists',
                limit: 5,
            },
            headers: {
                'Authorization': `Bearer ${APPLE_DEVELOPER_TOKEN}`,
            },
        });

        const results = searchResponse.data.results.artists?.data || [];

        // Format Results
        const artists = results.map((artist: any) => ({
            id: artist.id,
            name: artist.attributes.name,
            image: artist.attributes.artwork?.url?.replace('{w}', '150').replace('{h}', '150') || 'https://via.placeholder.com/150',
            track: artist.attributes.genreNames[0] || 'Artist', // Using Genre as metadata
            url: artist.attributes.url
        }));

        return NextResponse.json({ artists });

    } catch (error: any) {
        console.error('Apple Music API Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch from Apple Music' }, { status: 500 });
    }
}
