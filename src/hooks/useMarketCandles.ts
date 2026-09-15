import { useState, useEffect, useCallback, useRef } from 'react';
import { CandleData, MarketTimeframe, MarketQuote } from '../types';
import { MarketDataProvider } from '../services/marketData';

export interface UseMarketCandlesReturn {
  candles: CandleData[];
  isLoading: boolean;
  error: string | null;
  timeframe: MarketTimeframe;
  setTimeframe: (tf: MarketTimeframe) => void;
  refreshCandles: () => Promise<void>;
}

/**
 * Custom Hook for Candlestick Chart Data
 * Handles:
 * 1. Fetching historical candle series based on instrument and timeframe
 * 2. Updating current bar dynamically with incoming live ticks
 * 3. Proper unmount cancellation
 */
export function useMarketCandles(
  instrumentKey: string,
  latestQuote?: MarketQuote,
  initialTimeframe: MarketTimeframe = '1D'
): UseMarketCandlesReturn {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<MarketTimeframe>(initialTimeframe);

  const isMountedRef = useRef<boolean>(true);

  const loadCandles = useCallback(async () => {
    if (!instrumentKey) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await MarketDataProvider.getCandleHistory(
        instrumentKey,
        timeframe,
        latestQuote?.value
      );

      if (!isMountedRef.current) return;
      setCandles(data);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || 'Failed to load chart candle history.');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [instrumentKey, timeframe, latestQuote?.value]);

  useEffect(() => {
    isMountedRef.current = true;
    loadCandles();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadCandles]);

  // Update last candle close/high/low in real-time if a new quote arrives
  useEffect(() => {
    if (!latestQuote || candles.length === 0) return;

    setCandles(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const newPrice = latestQuote.value;

      const updatedLast: CandleData = {
        ...last,
        close: newPrice,
        high: Math.max(last.high, newPrice),
        low: Math.min(last.low, newPrice),
      };

      return [...prev.slice(0, prev.length - 1), updatedLast];
    });
  }, [latestQuote?.value]);

  return {
    candles,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    refreshCandles: loadCandles,
  };
}
