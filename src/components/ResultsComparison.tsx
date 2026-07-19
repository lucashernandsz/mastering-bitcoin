import type { PortfolioPoint } from '@/lib/types';

interface ResultsComparisonProps {
    strategy: PortfolioPoint;
    dca: PortfolioPoint;
}

function computeReturn(point: PortfolioPoint): number {
    if (point.investedUsd === 0) {
        return 0;
    }

    return (point.portfolioValueUsd - point.investedUsd) / point.investedUsd;
}

interface ResultCardProps {
    label: string;
    point: PortfolioPoint;
    returnPct: number;
    isWinner: boolean;
}

function ResultCard({ label, point, returnPct, isWinner }: ResultCardProps) {
    return (
        <div
            className={`rounded-xl border p-6 ${
                isWinner
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
            }`}
        >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                ${point.portfolioValueUsd.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Invested: ${point.investedUsd.toFixed(2)}
            </p>
            <p
                className={`mt-1 text-sm font-medium ${
                    returnPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
            >
                Return: {(returnPct * 100).toFixed(1)}%
            </p>
            {isWinner && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Best performer
                </p>
            )}
        </div>
    );
}

export function ResultsComparison({ strategy, dca }: ResultsComparisonProps) {
    const strategyReturn = computeReturn(strategy);
    const dcaReturn = computeReturn(dca);
    const strategyWins = strategyReturn > dcaReturn;

    return (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ResultCard label="Buy the dip" point={strategy} returnPct={strategyReturn} isWinner={strategyWins} />
            <ResultCard label="DCA" point={dca} returnPct={dcaReturn} isWinner={!strategyWins} />
        </div>
    );
}
