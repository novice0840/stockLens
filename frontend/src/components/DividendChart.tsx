'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnnualDividendData, QuarterlyDividendData } from '@/lib/loadData';

interface Props {
  annualData: AnnualDividendData[];
  quarterlyData: QuarterlyDividendData[];
}

type ViewMode = 'annual' | 'quarterly';

export default function DividendChart({ annualData, quarterlyData }: Props) {
  const [mode, setMode] = useState<ViewMode>('annual');

  const isAnnual = mode === 'annual';
  const data: (AnnualDividendData | QuarterlyDividendData)[] = isAnnual ? annualData : quarterlyData;
  const xKey = isAnnual ? 'year' : 'label';
  const dividendKey = isAnnual ? 'totalAdjDividend' : 'adjDividend';
  const yieldKey = isAnnual ? 'avgYield' : 'yield';
  const subtitle = isAnnual ? '연간 수정 배당금 합계 및 평균 배당률' : '분기별 수정 배당금 및 배당률';

  const tickCount = data.length;
  const showAllTicks = tickCount <= 20;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-800">배당금 &amp; 배당률</h2>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
          <button
            onClick={() => setMode('annual')}
            className={`px-3 py-1.5 transition-colors ${
              isAnnual ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            연간
          </button>
          <button
            onClick={() => setMode('quarterly')}
            className={`px-3 py-1.5 transition-colors ${
              !isAnnual ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            분기
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-5">{subtitle}</p>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval={showAllTicks ? 0 : Math.floor(tickCount / 20)}
          />
          <YAxis
            yAxisId="dividend"
            orientation="left"
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <YAxis
            yAxisId="yield"
            orientation="right"
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              if (name === '배당금') return [`$${v.toFixed(4)}`, name];
              return [`${v.toFixed(2)}%`, name];
            }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            yAxisId="dividend"
            dataKey={dividendKey}
            name="배당금"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Line
            yAxisId="yield"
            dataKey={yieldKey}
            name="배당률"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={showAllTicks ? { r: 3, fill: '#f59e0b' } : false}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
