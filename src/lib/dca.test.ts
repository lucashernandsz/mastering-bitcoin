import { describe, it, expect } from 'vitest';
import { runDcaBacktest } from './dca';
import type { PriceCandle } from './types';

describe('runDcaBacktest', () => {
    it('compra o valor certo de BTC com preço constante', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 50000 },
            { date: '2024-01-02', price: 50000 },
            { date: '2024-01-03', price: 50000 },
            { date: '2024-01-04', price: 50000 },
            { date: '2024-01-05', price: 50000 },
            { date: '2024-01-06', price: 50000 },
            { date: '2024-01-07', price: 50000 },
            { date: '2024-01-08', price: 50000 },
        ];

        const trades = runDcaBacktest(history, 100, 7);

        expect(trades).toHaveLength(2); // dia 1 e dia 8 (7 dias depois)
        expect(trades[0].amountUsd).toBe(100);
        expect(trades[0].amountBtc).toBeCloseTo(100 / 50000);
        expect(trades[1].date).toBe('2024-01-08');
    });
});
