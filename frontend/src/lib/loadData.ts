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
