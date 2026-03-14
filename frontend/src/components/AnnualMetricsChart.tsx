'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnnualMetric } from '@/lib/loadData';

interface Props {
  data: AnnualMetric[];
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>
      <ResponsiveContainer width="100%" height={220}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

const axisProps = {
  tick: { fontSize: 11, fill: '#9ca3af' },
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 },
};

export default function AnnualMetricsChart({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* EPS */}
      <ChartCard title="주당 순이익 (EPS)" subtitle="연간 기준 (USD)">
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis
            {...axisProps}
            tickFormatter={(v) => `$${v.toFixed(1)}`}
            width={48}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, 'EPS']}
          />
          <Line
            dataKey="eps"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartCard>

      {/* 주가 */}
      <ChartCard title="주가 (추정)" subtitle="P/E × EPS 근사값 (USD)">
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis
            {...axisProps}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={52}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, '주가']}
          />
          <Line
            dataKey="price"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#10b981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartCard>

      {/* 배당성향 */}
      <ChartCard title="배당성향" subtitle="배당금 / 순이익 (%)">
        <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" {...axisProps} />
          <YAxis
            {...axisProps}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            width={44}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(v) => [`${Number(v).toFixed(1)}%`, '배당성향']}
          />
          <Area
            dataKey="payoutRatio"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#payoutGradient)"
            dot={{ r: 4, fill: '#f59e0b' }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ChartCard>
    </div>
  );
}
