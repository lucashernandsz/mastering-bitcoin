'use client';

interface StrategyFormProps {
    amountUsd: number;
    dropPercent: number;
    loading: boolean;
    onAmountChange: (amountUsd: number) => void;
    onDropChange: (dropPercent: number) => void;
    onSubmit: () => void;
}

export function StrategyForm({
    amountUsd,
    dropPercent,
    loading,
    onAmountChange,
    onDropChange,
    onSubmit,
}: StrategyFormProps) {
    return (
        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-1">
                <label htmlFor="amountUsd" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Amount per buy (USD)
                </label>
                <input
                    id="amountUsd"
                    type="number"
                    value={amountUsd}
                    onChange={(e) => onAmountChange(Number(e.target.value))}
                    className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="dropPercent" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Drop trigger (%)
                </label>
                <input
                    id="dropPercent"
                    type="number"
                    value={dropPercent}
                    onChange={(e) => onDropChange(Number(e.target.value))}
                    className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:border-black dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
                />
            </div>
            <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="rounded-lg bg-black px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
                {loading ? 'Calculating...' : 'Calcular'}
            </button>
        </div>
    );
}
