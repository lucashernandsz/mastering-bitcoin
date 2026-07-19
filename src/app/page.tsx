'use client';

import { useState, useEffect } from 'react';
import type { PortfolioPoint, Trade, PriceCandle } from '@/lib/types';
import { portfolio } from '@/lib/portfolio';
import { StrategyForm } from '@/components/StrategyForm';
import { ResultsComparison } from '@/components/ResultsComparison';
import { PriceChart } from '@/components/PriceChart';

export default function Home() {
  const [result, setResult] = useState<{ strategy: PortfolioPoint; dca: PortfolioPoint } | null>(null);
  const [history, setHistory] = useState<PriceCandle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [amountUsd, setAmountUsd] = useState<number>(100);
  const [dropPercent, setDropPercent] = useState<number>(20);

  function fetchBacktest() {
    return fetch(`/api/backtest?strategy=buy-the-dip&amountUsd=${amountUsd}&dropPercent=${dropPercent}`)
      .then((res) => res.json())
      .then((data: { strategy: Trade[]; dca: Trade[]; history: PriceCandle[] }) => {
        const strategyPortfolio = portfolio(data.history, data.strategy);
        const dcaPortfolio = portfolio(data.history, data.dca);
        setResult({ strategy: strategyPortfolio, dca: dcaPortfolio });
        setHistory(data.history);
      })
      .catch(() => setError('Failed to load backtest'))
      .finally(() => setLoading(false));
  }

  function runBacktest() {
    setLoading(true);
    setError(null);
    fetchBacktest();
  }

  useEffect(() => {
    fetchBacktest();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Bitcoin Strategy
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Compare a &quot;buy the dip&quot; strategy against plain DCA.
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Buy the dip</span>{' '}
          only buys when the price falls at least the chosen drop % below its all-time high so far, spending the chosen amount once per month it triggers &mdash; unlike DCA, which buys on a fixed schedule no matter what the price is doing.
        </p>

        <StrategyForm
          amountUsd={amountUsd}
          dropPercent={dropPercent}
          loading={loading}
          onAmountChange={setAmountUsd}
          onDropChange={setDropPercent}
          onSubmit={runBacktest}
        />

        {loading && <p className="mt-8 text-zinc-500 dark:text-zinc-400">Loading...</p>}
        {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}

        {!loading && !error && history.length > 0 && (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">BTC/USD price history</p>
            <PriceChart history={history} />
          </div>
        )}

        {!loading && !error && result && (
          <ResultsComparison strategy={result.strategy} dca={result.dca} />
        )}
      </div>
    </div>
  );
}
