import { getPriceHistory } from '@/lib/priceHistory';

export async function GET() {
    try {
        const history = await getPriceHistory();
        return Response.json(history);
    } catch {
        return Response.json({ error: 'Failed to fetch prices' }, { status: 502 });
    }
}
