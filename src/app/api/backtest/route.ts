import { getPriceHistory } from '@/lib/priceHistory';
import { runBacktest } from '@/lib/backtest';
import { createDcaStrategy } from '@/lib/dca';
import { createBuyTheDipStrategy } from '@/lib/buyTheDip';
import type { Strategy } from '@/lib/types';

function buildStrategy(searchParams: URLSearchParams): Strategy {
    const strategyId = searchParams.get('strategy') ?? 'dca';
    const amountUsd = Number(searchParams.get('amountUsd') ?? 100);

    if (strategyId === 'buy-the-dip') {
        const dropPercent = Number(searchParams.get('dropPercent') ?? 20);
        return createBuyTheDipStrategy(amountUsd, dropPercent);
    }

    const frequencyDays = Number(searchParams.get('frequencyDays') ?? 30);
    return createDcaStrategy(amountUsd, frequencyDays);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const amountUsd = Number(searchParams.get('amountUsd') ?? 100);

    try {
        const history = await getPriceHistory();
        const strategy = buildStrategy(searchParams);
        const dcaBaseline = createDcaStrategy(amountUsd, 30);

        return Response.json({
            strategy: runBacktest(history, strategy),
            dca: runBacktest(history, dcaBaseline),
            history: history
        });
    } catch {
        return Response.json({ error: 'Failed to run backtest' }, { status: 502 });
    }
}
