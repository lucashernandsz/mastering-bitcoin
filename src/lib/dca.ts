import type { PriceCandle, Trade } from '@/lib/types';

export function runDcaBacktest(
    history: PriceCandle[],
    amountUsd: number,
    frequencyDays: number
): Trade[] {
    const trades: Trade[] = [];

    if (history.length === 0) {
        return trades;
    }

    const tradeDate = new Date(history[0].date);
    const finalDate = new Date(history[history.length - 1].date);

    while (tradeDate <= finalDate) {
        const isoDate = tradeDate.toISOString().slice(0, 10);
        const candle = history.find((h) => h.date === isoDate);

        if (candle) {
            trades.push({
                amountUsd,
                amountBtc: amountUsd / candle.price,
                date: candle.date,
            });
        }

        tradeDate.setUTCDate(tradeDate.getUTCDate() + frequencyDays);
    }

    return trades;
}
