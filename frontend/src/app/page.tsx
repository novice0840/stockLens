import { loadDividendData, loadQuarterlyDividendData, loadAnnualMetrics, loadQuarterlyMetrics, loadCashFlowMetrics, loadValuationMetrics, loadTSYMetrics, loadSummary } from '@/lib/loadData';
import DividendChart from '@/components/DividendChart';
import AnnualMetricsChart from '@/components/AnnualMetricsChart';

export default function Home() {
  const dividendData = loadDividendData();
  const quarterlyDividendData = loadQuarterlyDividendData();
  const annualMetrics = loadAnnualMetrics();
  const quarterlyMetrics = loadQuarterlyMetrics();
  const cashFlowMetrics = loadCashFlowMetrics();
  const valuationMetrics = loadValuationMetrics();
  const tsyMetrics = loadTSYMetrics();
  const summary = loadSummary();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AAPL Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Apple Inc. · FY{summary.year} 기준</p>
          </div>
          <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
            Data: FMP
          </span>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="주당순이익 (EPS)" value={`$${summary.eps.toFixed(2)}`} />
          <SummaryCard label="주가 (추정)" value={`$${summary.price.toFixed(0)}`} sub="P/E × EPS" />
          <SummaryCard label="배당수익률" value={`${summary.dividendYield.toFixed(2)}%`} />
          <SummaryCard label="배당성향" value={`${summary.payoutRatio.toFixed(1)}%`} />
        </div>

        {/* 배당금 & 배당률 차트 */}
        <DividendChart annualData={dividendData} quarterlyData={quarterlyDividendData} />

        {/* EPS / 주가 / 배당성향 차트 */}
        <AnnualMetricsChart annualData={annualMetrics} quarterlyData={quarterlyMetrics} cashFlowData={cashFlowMetrics} valuationData={valuationMetrics} tsyData={tsyMetrics} />

      </div>
    </main>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-300 mt-1">{sub}</p>}
    </div>
  );
}
