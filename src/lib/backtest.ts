import type { PriceCandle, Strategy, Trade } from '@/lib/types';

export function runBacktest(history: PriceCandle[], strategy: Strategy): Trade[] {
    const trades: Trade[] = [];

    for (let i = 0; i < history.length; i++) {
        const today = history[i];
        const decision = strategy.decide({
            today,
            history: history.slice(0, i + 1),
            trades,
        });

        if (decision) {
            trades.push({
                amountUsd: decision.amountUsd,
                amountBtc: decision.amountUsd / today.price,
                date: today.date,
            });
        }
    }

    return trades;
}
