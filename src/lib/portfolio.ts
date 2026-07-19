import type { PriceCandle, PortfolioPoint, Trade } from '@/lib/types';

export function portfolio(history: PriceCandle[], trades: Trade[]): PortfolioPoint {
    const lastCandle = history.at(-1);
    if (!lastCandle) {
        throw new Error('Cannot compute portfolio for empty history');
    }
    
    const btcNow = lastCandle.price;
    const today = lastCandle.date;


    let btcAccumulated: number = 0;
    let investedUsd: number = 0;

    for (const trade of trades) {
        investedUsd = trade.amountUsd + investedUsd
        btcAccumulated = trade.amountBtc + btcAccumulated
    }

    const portfolioValueUsd = btcAccumulated * btcNow;

    return ({
        date: today,
        btcAccumulated: btcAccumulated,
        investedUsd: investedUsd,
        portfolioValueUsd: portfolioValueUsd,

    });

}