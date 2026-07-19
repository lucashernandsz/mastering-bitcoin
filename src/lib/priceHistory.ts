import type { PriceCandle } from '@/lib/types';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const HISTORY_START_MS = Date.UTC(2018, 0, 1); // Jan 1, 2018
const DAY_MS = 24 * 60 * 60 * 1000;
const KLINES_PER_PAGE = 1000; // Binance's max candles per request
const MAX_PAGES = 20; // safety net: ~20k days is far past any real history length

let cache: { data: PriceCandle[]; fetchedAt: number } | null = null;

type BinanceKline = [
    number, // open time
    string, // open
    string, // high
    string, // low
    string, // close
    string, // volume
    ...unknown[],
];

async function fetchKlinesPage(startTime: number): Promise<BinanceKline[]> {
    const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${startTime}&limit=${KLINES_PER_PAGE}`
    );

    if (!res.ok) {
        const body = await res.text().catch(() => '<no body>');
        console.error(`Binance klines request failed: ${res.status} ${res.statusText} — ${body}`);
        throw new Error(`Failed to fetch price history from Binance (status ${res.status})`);
    }

    return res.json();
}

// Binance caps each request at 1000 candles, so a multi-year history has to
// be walked in pages: fetch a chunk, then start the next chunk right after
// the last candle we got, until we either run out of new data or catch up
// to today.
async function fetchAllKlines(): Promise<BinanceKline[]> {
    const allKlines: BinanceKline[] = [];
    let startTime = HISTORY_START_MS;

    for (let page = 0; page < MAX_PAGES; page++) {
        const klines = await fetchKlinesPage(startTime);

        if (klines.length === 0) {
            break;
        }

        allKlines.push(...klines);

        const lastOpenTime = klines[klines.length - 1][0];
        startTime = lastOpenTime + DAY_MS;

        if (klines.length < KLINES_PER_PAGE || startTime > Date.now()) {
            break;
        }
    }

    return allKlines;
}

export async function getPriceHistory(): Promise<PriceCandle[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.data;
    }

    const klines = await fetchAllKlines();

    const history: PriceCandle[] = klines.map((k) => ({
        date: new Date(k[0]).toISOString().slice(0, 10),
        price: parseFloat(k[4]),
    }));

    cache = { data: history, fetchedAt: Date.now() };

    return history;
}
