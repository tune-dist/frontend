import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

        if (!YOUTUBE_API_KEY) {
            console.error('YouTube API key not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Use YouTube Data API v3 to search for channels (artist pages)
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query,
                type: 'channel',
                maxResults: 5,
                key: YOUTUBE_API_KEY,
            },
        });

        const results = searchResponse.data.items || [];

        // Get channel statistics for subscriber count
        const channelIds = results.map((item: any) => item.id.channelId).join(',');
        let channelDetails: any = {};

        if (channelIds) {
            const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
                params: {
                    part: 'statistics,snippet',
                    id: channelIds,
                    key: YOUTUBE_API_KEY,
                },
            });

            channelDetails = channelResponse.data.items.reduce((acc: any, channel: any) => {
                acc[channel.id] = channel;
                return acc;
            }, {});
        }

        const artists = results.map((item: any) => {
            const channelId = item.id.channelId;
            const details = channelDetails[channelId];
            const subscriberCount = details?.statistics?.subscriberCount || '0';

            return {
                id: channelId,
                name: item.snippet.title,
                image: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || 'https://via.placeholder.com/150',
                track: `${parseInt(subscriberCount).toLocaleString()} subscribers`,
                url: `https://music.youtube.com/channel/${channelId}`
            };
        });

        return NextResponse.json({ artists });
    } catch (error: any) {
        console.error('YouTube Music search error:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to search YouTube Music', artists: [] },
            { status: 500 }
        );
    }
}
