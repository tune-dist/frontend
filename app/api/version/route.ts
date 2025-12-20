export const dynamic = 'force-dynamic';

export async function GET() {
    return Response.json({
        version: process.env.VERCEL_DEPLOYMENT_ID || Date.now().toString(),
    });
}
