'use client';

import { useState } from 'react';
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
import type { AnnualMetric, QuarterlyMetric } from '@/lib/loadData';

type ViewMode = 'annual' | 'quarterly';

interface Props {
  annualData: AnnualMetric[];
  quarterlyData: QuarterlyMetric[];
}

const axisProps = {
  tick: { fontSize: 11, fill: '#9ca3af' },
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 },
};

function ToggleButton({
  mode,
  current,
  onClick,
  label,
}: {
  mode: ViewMode;
  current: ViewMode;
  onClick: (m: ViewMode) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onClick(mode)}
      className={`px-3 py-1.5 text-xs transition-colors ${
        current === mode ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

export default function AnnualMetricsChart({ annualData, quarterlyData }: Props) {
  const [mode, setMode] = useState<ViewMode>('annual');

  const isAnnual = mode === 'annual';
  const data: (AnnualMetric | QuarterlyMetric)[] = isAnnual ? annualData : quarterlyData;
  const xKey = isAnnual ? 'year' : 'label';
  const epsSubtitle = isAnnual ? '연간 기준 (USD)' : '분기 기준 (USD)';
  const priceSubtitle = isAnnual ? 'P/E × EPS 근사값 (USD)' : '분기말 실제 종가 (USD)';
  const payoutSubtitle = isAnnual ? '배당금 / 순이익 (%)' : '분기 배당금 / 분기 EPS (%)';

  const toggle = (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
      <ToggleButton mode="annual" current={mode} onClick={setMode} label="연간" />
      <ToggleButton mode="quarterly" current={mode} onClick={setMode} label="분기" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-700">펀더멘털 지표</h2>
        {toggle}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* EPS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">주당 순이익 (EPS)</h2>
          <p className="text-xs text-gray-400 mb-5">{epsSubtitle}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `$${v.toFixed(1)}`} width={48} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`$${Number(v).toFixed(2)}`, 'EPS']} />
              <Line
                dataKey="eps"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 주가 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">주가</h2>
          <p className="text-xs text-gray-400 mb-5">{priceSubtitle}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `$${v.toFixed(0)}`} width={52} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`$${Number(v).toFixed(2)}`, '주가']} />
              <Line
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 배당성향 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">배당성향</h2>
          <p className="text-xs text-gray-400 mb-5">{payoutSubtitle}</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => `${v.toFixed(0)}%`} width={44} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) =>
                  v == null ? ['N/A', '배당성향'] : [`${Number(v).toFixed(1)}%`, '배당성향']
                }
              />
              <Area
                dataKey="payoutRatio"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#payoutGradient)"
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
