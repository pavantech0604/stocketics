import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useApp } from '../../state/store';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesExecutiveChartProps {
  initialPeriod?: string;
}

export const SalesExecutiveChart: React.FC<SalesExecutiveChartProps> = ({ initialPeriod = 'Month' }) => {
  const [period, setPeriod] = useState(initialPeriod);
  const { theme } = useApp();
  const isDark = theme === 'dark';

  // Dynamic datasets based on period matching reference CRM Image 1
  const dataByPeriod: Record<string, { labels: string[]; values: number[] }> = {
    Month: {
      labels: ['Aditya Roy', 'Sneha Kapur', 'Rohan Deshmukh', 'Kabir Varma', 'Neha Reddy', 'Ananya Sen'],
      values: [540000, 210000, 185000, 160000, 95000, 63100],
    },
    Week: {
      labels: ['Aditya Roy', 'Sneha Kapur', 'Rohan Deshmukh', 'Kabir Varma', 'Neha Reddy', 'Ananya Sen'],
      values: [135000, 52000, 46000, 40000, 24000, 15000],
    },
    Quarter: {
      labels: ['Aditya Roy', 'Sneha Kapur', 'Rohan Deshmukh', 'Kabir Varma', 'Neha Reddy', 'Ananya Sen'],
      values: [1620000, 630000, 555000, 480000, 285000, 189300],
    },
  };

  const activeData = dataByPeriod[period] || dataByPeriod.Month;

  const chartData = {
    labels: activeData.labels,
    datasets: [
      {
        label: 'Closed Sales (₹)',
        data: activeData.values,
        backgroundColor: activeData.values.map((_, i) => 
          i === 0 ? '#2E5685' : isDark ? '#38bdf8' : '#3B82F6'
        ),
        hoverBackgroundColor: '#0088EA',
        borderRadius: 4,
        borderSkipped: false as const,
        barThickness: 28,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Sales: ₹${Number(context.raw).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#475569',
          font: {
            family: 'Plus Jakarta Sans, sans-serif',
            size: 11,
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: 'JetBrains Mono, monospace',
            size: 11,
          },
          callback: (val) => `₹${Number(val) / 1000}k`,
        },
      },
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="chart-card-ref">
      <div className="chart-header-ref">
        <select 
          className="chart-select-filter"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Filter period for sales executives"
        >
          <option value="Month">Month</option>
          <option value="Week">Week</option>
          <option value="Quarter">Quarter</option>
        </select>
        <h3 className="chart-title-ref">SALES EXECUTIVE</h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {period === 'Month' ? 'Sep 2026' : period}
        </span>
      </div>
      <div className="chart-canvas-wrap">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

interface ManagersChartProps {
  initialPeriod?: string;
}

export const ManagersChart: React.FC<ManagersChartProps> = ({ initialPeriod = 'Month' }) => {
  const [period, setPeriod] = useState(initialPeriod);
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const dataByPeriod: Record<string, { labels: string[]; values: number[] }> = {
    Month: {
      labels: ['Vinod', 'Priya', 'Rajesh', 'Anita'],
      values: [1253100, 840000, 620000, 490000],
    },
    Week: {
      labels: ['Vinod', 'Priya', 'Rajesh', 'Anita'],
      values: [313275, 210000, 155000, 122000],
    },
    Quarter: {
      labels: ['Vinod', 'Priya', 'Rajesh', 'Anita'],
      values: [3759300, 2520000, 1860000, 1470000],
    },
  };

  const activeData = dataByPeriod[period] || dataByPeriod.Month;

  const chartData = {
    labels: activeData.labels,
    datasets: [
      {
        label: 'Team Advisory Sales (₹)',
        data: activeData.values,
        backgroundColor: activeData.values.map((_, i) => 
          i === 0 ? '#2E5685' : isDark ? '#60a5fa' : '#4B7BEC'
        ),
        hoverBackgroundColor: '#0088EA',
        borderRadius: 4,
        borderSkipped: false as const,
        barThickness: 42,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Total Revenue: ₹${Number(context.raw).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#475569',
          font: {
            family: 'Plus Jakarta Sans, sans-serif',
            size: 12,
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: 'JetBrains Mono, monospace',
            size: 11,
          },
          callback: (val) => `₹${Number(val) / 1000}k`,
        },
      },
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="chart-card-ref">
      <div className="chart-header-ref">
        <select 
          className="chart-select-filter"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Filter period for managers"
        >
          <option value="Month">Month</option>
          <option value="Week">Week</option>
          <option value="Quarter">Quarter</option>
        </select>
        <h3 className="chart-title-ref">MANAGERS</h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {period === 'Month' ? 'Sep 2026' : period}
        </span>
      </div>
      <div className="chart-canvas-wrap">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
