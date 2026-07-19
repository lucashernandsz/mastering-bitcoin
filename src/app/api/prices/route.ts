import { getPriceHistory } from '@/lib/priceHistory';

export const maxDuration = 30;

export async function GET() {
    try {
        const history = await getPriceHistory();
        return Response.json(history);
    } catch (error) {
        console.error('Prices route failed:', error);
        return Response.json({ error: 'Failed to fetch prices' }, { status: 502 });
    }
}
