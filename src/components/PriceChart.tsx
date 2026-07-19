'use client';

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { PriceCandle } from '@/lib/types';

function formatPrice(price: number): string {
    return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatDateTick(date: string): string {
    return date.slice(0, 4);
}

function ChartTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ payload: PriceCandle }>;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const point = payload[0].payload;

    return (
        <div
            className="rounded-lg border px-3 py-2 text-sm shadow-sm"
            style={{
                background: 'var(--chart-tooltip-bg)',
                color: 'var(--chart-tooltip-text)',
                borderColor: 'var(--chart-grid)',
            }}
        >
            <p className="font-medium">{point.date}</p>
            <p>{formatPrice(point.price)}</p>
        </div>
    );
}

export function PriceChart({ history }: { history: PriceCandle[] }) {
    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDateTick}
                        tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--chart-grid)' }}
                        tickLine={false}
                        minTickGap={40}
                    />
                    <YAxis
                        tickFormatter={formatPrice}
                        tick={{ fill: 'var(--chart-muted)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--chart-line)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
