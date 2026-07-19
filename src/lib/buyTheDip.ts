import type { Strategy } from '@/lib/types';

function monthsBetween(fromDate: string, toDate: string): number {
    const [fromYear, fromMonth] = fromDate.split('-').map(Number);
    const [toYear, toMonth] = toDate.split('-').map(Number);
    return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

// Models a salaried buyer: one fixed budget per calendar month. Unlike a
// strict "use it or lose it" version, an unspent month's budget carries
// over and stacks with the next one. The first time the dip trigger fires
// after that, the strategy spends the whole accumulated pot at once, then
// resets to zero — so it still buys at most once per calendar month (a pot
// of $0 means this month's allowance was already spent).
export function createBuyTheDipStrategy(amountUsd: number, dropPercent: number): Strategy {
    return {
        id: 'buy-the-dip',
        label: `Buy the dip (${dropPercent}% drop from high, accumulates monthly)`,
        decide({ today, history, trades }) {
            const lastTrade = trades.at(-1);

            // No trade yet: every month since the very start of the backtest
            // (inclusive) has been accumulating, so add 1 for the starting month.
            const monthsAccumulated = lastTrade
                ? monthsBetween(lastTrade.date, today.date)
                : monthsBetween(history[0].date, today.date) + 1;

            if (monthsAccumulated <= 0) {
                return null;
            }

            const highSoFar = Math.max(...history.map((candle) => candle.price));
            const dropFromHigh = ((highSoFar - today.price) / highSoFar) * 100;

            if (dropFromHigh >= dropPercent) {
                return { amountUsd: amountUsd * monthsAccumulated };
            }

            return null;
        },
    };
}
