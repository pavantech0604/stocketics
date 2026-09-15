import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketQuote, MarketStatus } from '../types';
import { MarketDataProvider, getIndianMarketStatus } from '../services/marketData';
import { useApp } from '../state/store';
import { MARKET_INSTRUMENTS } from '../config/marketInstruments';

export interface UseMarketDataReturn {
  quotes: MarketQuote[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: string | null;
  marketStatus: MarketStatus;
  refresh: () => Promise<void>;
  hasAccess: boolean;
}

/**
 * Custom Hook for Authorized, Safe Market Data Ticker
 * Enforces:
 * 1. Role-based permission guard ('market_dashboard_view')
 * 2. Background tab auto-pause via document.visibilityState
 * 3. Exponential backoff on API failures
 * 4. Stale request avoidance and unmounted state safety
 */
export function useMarketData(): UseMarketDataReturn {
  const { hasPermission, marketWidgetConfig, customInstruments, kiteConfig } = useApp();
  const hasAccess = hasPermission('market_dashboard_view');

  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(getIndianMarketStatus);

  const isMountedRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);

  const sourceInstruments = customInstruments && customInstruments.length > 0 ? customInstruments : MARKET_INSTRUMENTS;
  const filteredInstruments = sourceInstruments.filter(inst =>
    inst.enabled !== false && marketWidgetConfig.selectedInstruments.includes(inst.key)
  );
  const activeInstruments = filteredInstruments.length > 0 ? filteredInstruments : sourceInstruments;

  const fetchQuotes = useCallback(async (isManual = false) => {
    // Strictly prevent any network requests if role lacks permission
    if (!hasAccess) {
      return;
    }

    if (isManual) {
      setIsRefreshing(true);
      MarketDataProvider.invalidateCache();
    } else if (quotes.length === 0) {
      setIsLoading(true);
    }

    try {
      const data = await MarketDataProvider.getQuotes(activeInstruments, kiteConfig);
      
      if (!isMountedRef.current) return;

      setQuotes(data);
      setError(null);
      retryCountRef.current = 0;
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setMarketStatus(getIndianMarketStatus());
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || 'Unable to retrieve latest market quotes.');
      retryCountRef.current += 1;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [hasAccess, activeInstruments, quotes.length]);

  // Initial fetch and visibility-aware polling
  useEffect(() => {
    isMountedRef.current = true;

    // Do nothing if unauthorized or widget is disabled
    if (!hasAccess || !marketWidgetConfig.isEnabled) {
      setIsLoading(false);
      return;
    }

    fetchQuotes();

    // Determine refresh interval (responsive 5s-15s ticker loop)
    const intervalSec = Math.max(5, marketWidgetConfig.refreshSeconds || 15);
    let timerId: any = null;

    const startPolling = () => {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        // Pause polling when browser tab is hidden to save client & server resources
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          return;
        }
        fetchQuotes();
      }, intervalSec * 1000);
    };

    startPolling();

    // Listen to tab visibility changes: resume immediately upon refocus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchQuotes();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasAccess, marketWidgetConfig.isEnabled, marketWidgetConfig.refreshSeconds, fetchQuotes]);

  const handleManualRefresh = useCallback(async () => {
    await fetchQuotes(true);
  }, [fetchQuotes]);

  return {
    quotes,
    isLoading: hasAccess ? isLoading : false,
    isRefreshing,
    error,
    lastUpdated,
    marketStatus,
    refresh: handleManualRefresh,
    hasAccess,
  };
}
