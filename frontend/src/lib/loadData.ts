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

export interface AnnualMetric {
  year: string;
  eps: number;
  price: number;
  payoutRatio: number;
  dividendYield: number;
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
