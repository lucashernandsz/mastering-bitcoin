import type { PriceCandle, Strategy, Trade } from '@/lib/types';
import { runBacktest } from './backtest';

// Wrapper fino em cima do motor genérico — prova que o DCA é só mais uma
// Strategy. Mantido com essa assinatura só pra não quebrar o teste já escrito.
export function runDcaBacktest(
    history: PriceCandle[],
    amountUsd: number,
    frequencyDays: number
): Trade[] {
    return runBacktest(history, createDcaStrategy(amountUsd, frequencyDays));
}

export function createDcaStrategy(amountUsd: number, frequencyDays: number): Strategy {
    return {
        id: 'dca',
        label: 'DCA',
        decide({ today, trades }) {
            const lastTrade = trades.at(-1)

            if (!lastTrade) {
                return { amountUsd };
            }

            const MS_PER_DAY = 24 * 60 * 60 * 1000;
            const daysSinceLast =
                (new Date(today.date).getTime() - new Date(lastTrade.date).getTime()) / MS_PER_DAY;

            if(daysSinceLast >= frequencyDays){
                return { amountUsd };
            }

            return null;

        },
    };
}
