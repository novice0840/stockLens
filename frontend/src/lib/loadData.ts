import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '..', 'data');

export interface DividendRecord {
  date: string;
  adjDividend: number;
  dividend: number;
  yield: number;
  frequency: string;
}

export interface SymbolRecord {
  date: string;
  fiscalYear: string;
  dividendPayoutRatio: number;
  dividendYield: number;
  dividendYieldPercentage: number;
  dividendPerShare: number;
  netIncomePerShare: number;
  priceToEarningsRatio: number;
}

export interface AnnualDividendData {
  year: string;
  totalAdjDividend: number;
  avgYield: number;
}

export interface QuarterlyDividendData {
  label: string; // "2024 Q1"
  date: string;
  adjDividend: number;
  yield: number;
}

export interface AnnualMetric {
  year: string;
  eps: number;
  price: number;
  payoutRatio: number;
  dividendYield: number;
}

export interface ValuationMetric {
  label: string;
  date: string;
  price: number;
  ttmEps: number | null;
  ttmPer: number | null;
  bvps: number;
  pbr: number | null;
}

export interface TSYMetric {
  label: string;
  date: string;
  dividendYield: number;
  buybackYield: number;
  tsy: number;
  ttmDividendYield: number | null;
  ttmBuybackYield: number | null;
  ttmTsy: number | null;
}

export interface CashFlowMetric {
  label: string;
  date: string;
  operatingCF: number;       // 총액 (B)
  freeCF: number;            // 총액 (B)
  capex: number;             // 총액 (B)
  operatingCFPerShare: number;
  freeCFPerShare: number;
  capexPerShare: number;
}

export interface QuarterlyMetric {
  label: string; // "FY25 Q1"
  date: string;
  eps: number;
  price: number;
  payoutRatio: number | null;
}

interface IncomeRecord {
  date: string;
  fiscalYear: string;
  period: string;
  eps: number;
}

interface PriceRecord {
  date: string;
  adjClose: number;
}

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function loadDividendData(): AnnualDividendData[] {
  const records = readJson<DividendRecord[]>('apple-dividend-data.json');

  const byYear: Record<string, { dividends: number[]; yields: number[] }> = {};

  for (const r of records) {
    const year = r.date.slice(0, 4);
    if (!byYear[year]) byYear[year] = { dividends: [], yields: [] };
    byYear[year].dividends.push(r.adjDividend);
    byYear[year].yields.push(r.yield);
  }

  return Object.entries(byYear)
    .map(([year, { dividends, yields }]) => ({
      year,
      totalAdjDividend: dividends.reduce((a, b) => a + b, 0),
      avgYield: yields.reduce((a, b) => a + b, 0) / yields.length,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export function loadQuarterlyDividendData(): QuarterlyDividendData[] {
  const records = readJson<DividendRecord[]>('apple-dividend-data.json');

  return records
    .filter((r) => r.frequency === 'Quarterly')
    .map((r) => {
      const month = parseInt(r.date.slice(5, 7), 10);
      const quarter = Math.ceil(month / 3);
      const year = r.date.slice(0, 4);
      return {
        label: `${year} Q${quarter}`,
        date: r.date,
        adjDividend: r.adjDividend,
        yield: r.yield,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function loadQuarterlyMetrics(): QuarterlyMetric[] {
  const income = readJson<IncomeRecord[]>('aapl-income-quarterly.json');
  const prices = readJson<PriceRecord[]>('aapl-price-daily.json');
  const dividends = readJson<DividendRecord[]>('apple-dividend-data.json');

  // 날짜 → adjClose 맵
  const priceMap = new Map(prices.map((p) => [p.date, p.adjClose]));

  // 날짜 기준 가장 가까운 종가 조회
  const getPrice = (targetDate: string): number => {
    const sorted = prices
      .map((p) => p.date)
      .sort()
      .reverse();
    const found = sorted.find((d) => d <= targetDate);
    return priceMap.get(found ?? sorted[0]) ?? 0;
  };

  // 분기 기간(시작~끝) 내 배당금 합산
  const getDividendInRange = (start: string, end: string): number => {
    return dividends
      .filter((d) => d.date >= start && d.date <= end)
      .reduce((sum, d) => sum + d.adjDividend, 0);
  };

  return income
    .map((r, i) => {
      const prevDate = income[i + 1]?.date ?? '';
      const quarterStart = prevDate
        ? new Date(new Date(prevDate).getTime() + 86400000).toISOString().slice(0, 10)
        : '1900-01-01';
      const div = getDividendInRange(quarterStart, r.date);
      const payoutRatio = r.eps > 0 && div > 0 ? (div / r.eps) * 100 : null;

      return {
        label: `${r.fiscalYear} ${r.period}`,
        date: r.date,
        eps: r.eps,
        price: getPrice(r.date),
        payoutRatio,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function loadAnnualMetrics(): AnnualMetric[] {
  const records = readJson<SymbolRecord[]>('apple-symbol.json');

  return records
    .map((r) => ({
      year: r.fiscalYear,
      eps: r.netIncomePerShare,
      price: r.priceToEarningsRatio * r.netIncomePerShare,
      payoutRatio: r.dividendPayoutRatio * 100,
      dividendYield: r.dividendYieldPercentage,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

interface CashFlowRecord {
  date: string;
  fiscalYear: string;
  period: string;
  operatingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  weightedAverageShsOut: number;
}

interface SymbolCashFlowRecord {
  fiscalYear: string;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  capexPerShare: number;
}

export function loadCashFlowMetrics(): { annual: CashFlowMetric[]; quarterly: CashFlowMetric[] } {
  const quarterly = readJson<CashFlowRecord[]>('aapl-cashflow-quarterly.json')
    .map((r) => {
      const shares = r.weightedAverageShsOut || 1;
      return {
        label: `${r.fiscalYear} ${r.period}`,
        date: r.date,
        operatingCF: r.operatingCashFlow / 1e9,
        freeCF: r.freeCashFlow / 1e9,
        capex: Math.abs(r.capitalExpenditure) / 1e9,
        operatingCFPerShare: r.operatingCashFlow / shares,
        freeCFPerShare: r.freeCashFlow / shares,
        capexPerShare: Math.abs(r.capitalExpenditure) / shares,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const symbolRecords = readJson<SymbolCashFlowRecord[]>('apple-symbol.json');
  const annual = symbolRecords
    .map((r) => ({
      label: r.fiscalYear,
      date: r.fiscalYear,
      operatingCF: r.operatingCashFlowPerShare * 15,  // 근사치
      freeCF: r.freeCashFlowPerShare * 15,
      capex: r.capexPerShare * 15,
      operatingCFPerShare: r.operatingCashFlowPerShare,
      freeCFPerShare: r.freeCashFlowPerShare,
      capexPerShare: r.capexPerShare,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // 연간은 분기 데이터를 FY 기준으로 합산
  const byYear: Record<string, CashFlowMetric[]> = {};
  for (const q of quarterly) {
    const fy = q.label.split(' ')[0];
    if (!byYear[fy]) byYear[fy] = [];
    byYear[fy].push(q);
  }

  const annualFromQuarterly = Object.entries(byYear)
    .map(([fy, quarters]) => ({
      label: fy,
      date: fy,
      operatingCF: quarters.reduce((s, q) => s + q.operatingCF, 0),
      freeCF: quarters.reduce((s, q) => s + q.freeCF, 0),
      capex: quarters.reduce((s, q) => s + q.capex, 0),
      operatingCFPerShare: symbolRecords.find((r) => r.fiscalYear === fy)?.operatingCashFlowPerShare ?? 0,
      freeCFPerShare: symbolRecords.find((r) => r.fiscalYear === fy)?.freeCashFlowPerShare ?? 0,
      capexPerShare: symbolRecords.find((r) => r.fiscalYear === fy)?.capexPerShare ?? 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  void annual;
  return { annual: annualFromQuarterly, quarterly };
}

interface ValuationRecord {
  date: string;
  fiscalYear: string;
  period: string;
  price: number;
  ttmEps: number | null;
  ttmPer: number | null;
  bvps: number;
  pbr: number | null;
}

export function loadValuationMetrics(): ValuationMetric[] {
  const records = readJson<ValuationRecord[]>('aapl-valuation-quarterly.json');
  return records
    .filter((r) => r.ttmPer !== null)
    .map((r) => ({
      label: `${r.fiscalYear} ${r.period}`,
      date: r.date,
      price: r.price,
      ttmEps: r.ttmEps,
      ttmPer: r.ttmPer,
      bvps: r.bvps,
      pbr: r.pbr,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

interface TSYRecord {
  date: string;
  fiscalYear: string;
  period: string;
  dividendYield: number;
  buybackYield: number;
  tsy: number;
  ttm: { dividendYield: number; buybackYield: number; tsy: number } | null;
}

export function loadTSYMetrics(): TSYMetric[] {
  const records = readJson<TSYRecord[]>('aapl-tsy-quarterly.json');
  return records
    .map((r) => ({
      label: `${r.fiscalYear} ${r.period}`,
      date: r.date,
      dividendYield: r.dividendYield,
      buybackYield: r.buybackYield,
      tsy: r.tsy,
      ttmDividendYield: r.ttm?.dividendYield ?? null,
      ttmBuybackYield: r.ttm?.buybackYield ?? null,
      ttmTsy: r.ttm?.tsy ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function loadSummary() {
  const metrics = loadAnnualMetrics();
  const dividends = loadDividendData();

  const latest = metrics[metrics.length - 1];
  const latestDiv = dividends[dividends.length - 1];

  return {
    eps: latest.eps,
    price: latest.price,
    dividendYield: latest.dividendYield,
    payoutRatio: latest.payoutRatio,
    totalDividend: latestDiv.totalAdjDividend,
    year: latest.year,
  };
}
