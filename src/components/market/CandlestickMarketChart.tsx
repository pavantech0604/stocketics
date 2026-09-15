import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  HistogramSeries, 
  ColorType, 
  CrosshairMode,
  IChartApi,
  ISeriesApi 
} from 'lightweight-charts';
import { CandleData, MarketTimeframe } from '../../types';
import { useApp } from '../../state/store';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface CandlestickMarketChartProps {
  candles: CandleData[];
  instrumentLabel: string;
  timeframe: MarketTimeframe;
  onTimeframeChange: (tf: MarketTimeframe) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  height?: number;
}

const TIMEFRAMES: MarketTimeframe[] = ['1m', '5m', '15m', '1h', '1D', '1W'];

export const CandlestickMarketChart: React.FC<CandlestickMarketChartProps> = ({
  candles,
  instrumentLabel,
  timeframe,
  onTimeframeChange,
  isLoading = false,
  onRefresh,
  height = 420,
}) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Crosshair hover OHLC data
  const [hoverData, setHoverData] = useState<{
    time?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    change?: number;
    changePct?: number;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    container.innerHTML = '';

    const chart = createChart(container, {
      width: container.clientWidth,
      height: isFullscreen ? window.innerHeight - 120 : height,
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? '#0b1120' : '#ffffff',
        },
        textColor: isDark ? '#94a3b8' : '#475569',
        fontSize: 11,
      },
      grid: {
        vertLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        horzLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? '#38bdf8' : '#0284c7',
          width: 1,
          style: 3,
          labelBackgroundColor: isDark ? '#1e293b' : '#0284c7',
        },
        horzLine: {
          color: isDark ? '#38bdf8' : '#0284c7',
          width: 1,
          style: 3,
          labelBackgroundColor: isDark ? '#1e293b' : '#0284c7',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        scaleMargins: {
          top: 0.12,
          bottom: 0.22, // Space for volume bars at the bottom
        },
      },
      timeScale: {
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        timeVisible: timeframe !== '1D' && timeframe !== '1W',
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Add Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.3)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Overlay over chart
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78, // volume bars occupy bottom 22%
        bottom: 0,
      },
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Crosshair listener for live OHLC updates
    chart.subscribeCrosshairMove(param => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }

      const bar: any = param.seriesData.get(candleSeries);
      const volBar: any = param.seriesData.get(volumeSeries);

      if (bar) {
        const change = bar.close - bar.open;
        const changePct = bar.open > 0 ? (change / bar.open) * 100 : 0;
        setHoverData({
          time: String(param.time),
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: volBar?.value,
          change,
          changePct,
        });
      }
    });

    // Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0 && entries[0].contentRect) {
        const { width } = entries[0].contentRect;
        const newHeight = isFullscreen ? window.innerHeight - 120 : height;
        chart.applyOptions({ width, height: newHeight });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartInstanceRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [isDark, height, isFullscreen, timeframe]);

  // Update data whenever candles change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    try {
      // Sort candles ascending by time to ensure lightweight-charts invariant
      const sortedCandles = [...candles].sort((a, b) => {
        if (typeof a.time === 'number' && typeof b.time === 'number') {
          return a.time - b.time;
        }
        return String(a.time).localeCompare(String(b.time));
      });

      candleSeriesRef.current.setData(sortedCandles as any);

      const volumeData = sortedCandles.map(c => ({
        time: c.time as any,
        value: c.volume || 10000,
        color: c.close >= c.open
          ? isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.4)'
          : isDark ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.4)',
      }));

      volumeSeriesRef.current.setData(volumeData);
      chartInstanceRef.current?.timeScale().fitContent();
    } catch (err) {
      console.warn('[CandlestickChart] Error updating chart data:', err);
    }
  }, [candles, isDark]);

  const activeBar = hoverData || (candles.length > 0 ? {
    open: candles[candles.length - 1].open,
    high: candles[candles.length - 1].high,
    low: candles[candles.length - 1].low,
    close: candles[candles.length - 1].close,
    volume: candles[candles.length - 1].volume,
    change: candles[candles.length - 1].close - candles[candles.length - 1].open,
    changePct: candles[candles.length - 1].open > 0 
      ? ((candles[candles.length - 1].close - candles[candles.length - 1].open) / candles[candles.length - 1].open) * 100 
      : 0,
  } : null);

  return (
    <div className={`candlestick-chart-card card ${isFullscreen ? 'chart-fullscreen-mode' : ''}`}>
      {/* Chart Toolbar & Controls Header */}
      <div className="chart-toolbar-header">
        <div className="chart-toolbar-left">
          {/* Timeframe Selector */}
          <div className="chart-timeframe-group" role="group" aria-label="Chart Timeframes">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                type="button"
                className={`chart-timeframe-pill ${timeframe === tf ? 'active' : ''}`}
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Quick Refresh */}
          {onRefresh && (
            <button
              type="button"
              className={`chart-refresh-btn ${isLoading ? 'is-spinning' : ''}`}
              onClick={onRefresh}
              title="Refresh Chart Candlesticks"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>

        {/* Live OHLC Bar Readout */}
        {activeBar && (
          <div className="chart-ohlc-readout">
            <span className="ohlc-item">
              <span className="ohlc-label">O</span>
              <span className="ohlc-value">{activeBar.open?.toFixed(2)}</span>
            </span>
            <span className="ohlc-item">
              <span className="ohlc-label">H</span>
              <span className="ohlc-value">{activeBar.high?.toFixed(2)}</span>
            </span>
            <span className="ohlc-item">
              <span className="ohlc-label">L</span>
              <span className="ohlc-value">{activeBar.low?.toFixed(2)}</span>
            </span>
            <span className="ohlc-item">
              <span className="ohlc-label">C</span>
              <span className="ohlc-value" style={{ 
                color: (activeBar.change || 0) >= 0 ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)' 
              }}>
                {activeBar.close?.toFixed(2)}
              </span>
            </span>
            <span className="ohlc-item ohlc-delta" style={{ 
              color: (activeBar.change || 0) >= 0 ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)' 
            }}>
              {(activeBar.change || 0) >= 0 ? '+' : ''}{activeBar.change?.toFixed(2)} ({(activeBar.changePct || 0) >= 0 ? '+' : ''}{activeBar.changePct?.toFixed(2)}%)
            </span>
            {activeBar.volume && (
              <span className="ohlc-item ohlc-vol">
                <span className="ohlc-label">Vol</span>
                <span className="ohlc-value">{activeBar.volume.toLocaleString('en-IN')}</span>
              </span>
            )}
          </div>
        )}

        {/* Fullscreen Toggle */}
        <div className="chart-toolbar-right">
          <button
            type="button"
            className="chart-tool-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Chart'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Chart Canvas Mount Point */}
      <div 
        ref={chartContainerRef} 
        className="candlestick-canvas-wrapper" 
        style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 120px)' : `${height}px`, position: 'relative' }}
      />
    </div>
  );
};
