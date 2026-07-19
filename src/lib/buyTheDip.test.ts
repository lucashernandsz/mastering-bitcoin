import { describe, it, expect } from 'vitest';
import { runBacktest } from './backtest';
import { createBuyTheDipStrategy } from './buyTheDip';
import type { PriceCandle } from './types';

describe('buyTheDipStrategy', () => {
    it('buys the first month allowance once the drop from the high hits the trigger', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 100 }, // high
            { date: '2024-01-02', price: 100 }, // no drop yet
            { date: '2024-01-03', price: 85 },  // -15%, below the 20% trigger
            { date: '2024-01-04', price: 75 },  // -25%, trigger hit
        ];

        const trades = runBacktest(history, createBuyTheDipStrategy(50, 20));

        expect(trades).toHaveLength(1);
        expect(trades[0].date).toBe('2024-01-04');
        expect(trades[0].amountUsd).toBe(50);
    });

    it('does not buy again in the same month even if the price keeps dropping', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 100 },
            { date: '2024-01-02', price: 75 }, // -25%, buys here
            { date: '2024-01-03', price: 70 }, // still down, already bought this month
            { date: '2024-01-04', price: 65 }, // same
        ];

        const trades = runBacktest(history, createBuyTheDipStrategy(50, 20));

        expect(trades).toHaveLength(1);
        expect(trades[0].date).toBe('2024-01-02');
    });

    it('accumulates the allowance across months where the trigger never fires', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 100 }, // Jan: no dip, $50 carries over
            { date: '2024-02-01', price: 95 },  // Feb: -5%, still below trigger, another $50 carries over
            { date: '2024-03-01', price: 75 },  // Mar: -25%, trigger fires
        ];

        const trades = runBacktest(history, createBuyTheDipStrategy(50, 20));

        expect(trades).toHaveLength(1);
        expect(trades[0].date).toBe('2024-03-01');
        expect(trades[0].amountUsd).toBe(150); // Jan + Feb + Mar allowances
    });

    it('resets the pot after spending it, then accumulates again from zero', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 100 },
            { date: '2024-01-02', price: 70 }, // Jan purchase: spends the $50 pot
            { date: '2024-02-01', price: 65 }, // Feb: still below trigger, fresh $50 (not 100)
        ];

        const trades = runBacktest(history, createBuyTheDipStrategy(50, 20));

        expect(trades).toHaveLength(2);
        expect(trades[0].date).toBe('2024-01-02');
        expect(trades[0].amountUsd).toBe(50);
        expect(trades[1].date).toBe('2024-02-01');
        expect(trades[1].amountUsd).toBe(50);
    });

    it('never buys before the trigger fires, no matter how many months pass', () => {
        const history: PriceCandle[] = [
            { date: '2024-01-01', price: 100 },
            { date: '2024-02-01', price: 98 },
            { date: '2024-03-01', price: 96 },
            { date: '2024-04-01', price: 94 }, // still under 20% off the high
        ];

        const trades = runBacktest(history, createBuyTheDipStrategy(50, 20));

        expect(trades).toHaveLength(0);
    });
});
