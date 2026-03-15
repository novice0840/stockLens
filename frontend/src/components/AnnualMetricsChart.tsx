'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AnnualMetric, QuarterlyMetric, CashFlowMetric, ValuationMetric, TSYMetric } from '@/lib/loadData';

type CFUnit = 'total' | 'perShare';

type ViewMode = 'annual' | 'quarterly';

interface Props {
  annualData: AnnualMetric[];
  quarterlyData: QuarterlyMetric[];
  cashFlowData: { annual: CashFlowMetric[]; quarterly: CashFlowMetric[] };
  valuationData: ValuationMetric[];
  tsyData: TSYMetric[];
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

export default function AnnualMetricsChart({ annualData, quarterlyData, cashFlowData, valuationData, tsyData }: Props) {
  const [mode, setMode] = useState<ViewMode>('annual');
  const [cfMode, setCfMode] = useState<ViewMode>('annual');
  const [cfUnit, setCfUnit] = useState<CFUnit>('total');

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
      <div className="flex flex-col gap-4">
        {/* EPS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">주당 순이익 (EPS)</h2>
          <p className="text-xs text-gray-400 mb-5">{epsSubtitle}</p>
          <ResponsiveContainer width="100%" height={320}>
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
          <ResponsiveContainer width="100%" height={320}>
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
          <ResponsiveContainer width="100%" height={320}>
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
        {/* 현금흐름 */}
        {(() => {
          const cfData = cfMode === 'annual' ? cashFlowData.annual : cashFlowData.quarterly;
          const isPerShare = cfUnit === 'perShare';
          const ocfKey = isPerShare ? 'operatingCFPerShare' : 'operatingCF';
          const fcfKey = isPerShare ? 'freeCFPerShare' : 'freeCF';
          const capexKey = isPerShare ? 'capexPerShare' : 'capex';
          const fmt = isPerShare
            ? (v: number) => `$${v.toFixed(2)}`
            : (v: number) => `$${v.toFixed(1)}B`;
          const subtitle = `${cfMode === 'annual' ? '연간' : '분기'} 기준 · ${isPerShare ? '주당 (USD)' : '총액 (B)'}`;

          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-gray-800">현금흐름</h2>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                    <button
                      onClick={() => setCfUnit('total')}
                      className={`px-3 py-1.5 transition-colors ${cfUnit === 'total' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      총액
                    </button>
                    <button
                      onClick={() => setCfUnit('perShare')}
                      className={`px-3 py-1.5 transition-colors ${cfUnit === 'perShare' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      주당
                    </button>
                  </div>
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                    <ToggleButton mode="annual" current={cfMode} onClick={setCfMode} label="연간" />
                    <ToggleButton mode="quarterly" current={cfMode} onClick={setCfMode} label="분기" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">{subtitle} · 영업CF / 잉여CF / CAPEX</p>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={cfData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" {...axisProps} interval={cfMode === 'quarterly' ? 3 : 0} />
                  <YAxis {...axisProps} tickFormatter={fmt} width={isPerShare ? 48 : 56} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v, name) => [fmt(Number(v)), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey={ocfKey} name="영업 CF" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey={fcfKey} name="잉여 CF" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line
                    dataKey={capexKey}
                    name="CAPEX"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          );
        })()}

        {/* PER / PBR */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">밸류에이션 (PER / PBR)</h2>
          <p className="text-xs text-gray-400 mb-5">분기 기준 · TTM EPS 기반 PER · 주당 순자산 기반 PBR</p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={valuationData} margin={{ top: 4, right: 56, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" {...axisProps} interval={3} />
              <YAxis
                yAxisId="per"
                orientation="left"
                {...axisProps}
                tickFormatter={(v) => `${v}x`}
                width={44}
              />
              <YAxis
                yAxisId="pbr"
                orientation="right"
                {...axisProps}
                tickFormatter={(v) => `${v}x`}
                width={44}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v, name) => [`${Number(v).toFixed(1)}x`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="per"
                dataKey="ttmPer"
                name="PER (TTM)"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                yAxisId="pbr"
                dataKey="pbr"
                name="PBR"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* TSY */}
        {(() => {
          const [tsyMode, setTsyMode] = useState<'quarterly' | 'ttm'>('ttm');
          const isQuarterly = tsyMode === 'quarterly';
          const divKey = isQuarterly ? 'dividendYield' : 'ttmDividendYield';
          const buyKey = isQuarterly ? 'buybackYield' : 'ttmBuybackYield';
          const tsyKey = isQuarterly ? 'tsy' : 'ttmTsy';
          const data = isQuarterly ? tsyData : tsyData.filter(r => r.ttmTsy !== null);

          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-semibold text-gray-800">총 주주환원율 (TSY)</h2>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                  <button
                    onClick={() => setTsyMode('ttm')}
                    className={`px-3 py-1.5 transition-colors ${tsyMode === 'ttm' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    TTM
                  </button>
                  <button
                    onClick={() => setTsyMode('quarterly')}
                    className={`px-3 py-1.5 transition-colors ${tsyMode === 'quarterly' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    분기
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                {isQuarterly ? '분기 기준 (%)' : 'TTM 기준 (%) · 최근 4분기 합산'} · 배당수익률 + 자사주매입수익률
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" {...axisProps} interval={3} />
                  <YAxis {...axisProps} tickFormatter={(v) => `${v}%`} width={44} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v, name) => [`${Number(v).toFixed(2)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey={divKey} name="배당수익률" stackId="tsy" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={40} />
                  <Bar dataKey={buyKey} name="자사주매입수익률" stackId="tsy" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line
                    dataKey={tsyKey}
                    name="TSY"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
