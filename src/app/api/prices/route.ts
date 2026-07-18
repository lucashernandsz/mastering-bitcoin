
import type { PriceCandle } from '@/lib/types';

type BinanceKline = [
    number,
    string,
    string,
    string,
    string,
    ...unknown[],
]

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { data: PriceCandle[]; fetchedAt: number } | null = null;


export async function GET() {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return Response.json(cache.data);
    }

    const res = await fetch(
        'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=1000'
    );

    if (!res.ok) {
        return Response.json({ error: 'Falha ao buscar preços' }, { status: 502 });
    }

    const klines = (await res.json()) as BinanceKline[];

    const history: PriceCandle[] = klines.map((k) => ({
        date: new Date(k[0]).toISOString().slice(0, 10),
        price: parseFloat(k[4])
    }))

    return Response.json(history);
}
