export const FUNDS: Record<string, { name: string; detail: string }> = {
  SPY: { name: "S&P 500", detail: "SPY · large US companies" },
  EFA: { name: "International", detail: "EFA · developed markets" },
  AGG: { name: "US bonds", detail: "AGG · investment-grade bonds" },
  BIL: { name: "T-bills", detail: "BIL · short-term Treasuries" },
  VTI: { name: "US total market", detail: "VTI · nearly all US stocks" },
  VXUS: { name: "International", detail: "VXUS · stocks outside the US" },
  BND: { name: "US bonds", detail: "BND · broad US bond market" },
};

export const QUOTE_SYMBOLS = ["SPY", "EFA", "AGG", "BIL", "VTI", "VXUS", "BND"] as const;

export type MonthPoint = { d: string; c: number };

export type FundSeries = {
  name: string;
  points: MonthPoint[];
};

export type MarketBundle = {
  fetchedAt: string;
  source: "live" | "snapshot";
  series: Record<string, FundSeries>;
};

type RawSnapshot = {
  fetchedAt: string;
  series: Record<string, { series?: { d: string; c: number }[] }>;
};

function monthKey(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

export function parseYahooChart(symbol: string, payload: unknown): FundSeries {
  const result = (payload as { chart?: { result?: Array<Record<string, unknown>> } })?.chart?.result?.[0];
  if (!result) throw new Error(`No price history for ${symbol}`);

  const timestamps = result.timestamp as number[] | undefined;
  const indicators = result.indicators as
    | {
        adjclose?: Array<{ adjclose?: Array<number | null> }>;
        quote?: Array<{ close?: Array<number | null> }>;
      }
    | undefined;
  const adjusted = indicators?.adjclose?.[0]?.adjclose ?? [];
  const closes = indicators?.quote?.[0]?.close ?? [];
  if (!timestamps?.length) throw new Error(`No price history for ${symbol}`);

  const byMonth = new Map<string, number>();
  for (let index = 0; index < timestamps.length; index += 1) {
    const price = adjusted[index] ?? closes[index];
    if (price == null || !Number.isFinite(price) || price <= 0) continue;
    byMonth.set(monthKey(timestamps[index]), Math.round(price * 10000) / 10000);
  }

  const points = [...byMonth.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([d, c]) => ({ d, c }));
  if (points.length < 13) throw new Error(`Price history for ${symbol} is too short`);

  return { name: FUNDS[symbol]?.name ?? symbol, points };
}

export function fromSnapshot(raw: RawSnapshot): MarketBundle {
  const series: MarketBundle["series"] = {};
  for (const symbol of QUOTE_SYMBOLS) {
    const points = raw.series[symbol]?.series;
    if (!points?.length) throw new Error(`Snapshot is missing ${symbol}`);
    series[symbol] = {
      name: FUNDS[symbol].name,
      points: points.map((point) => ({ d: point.d, c: point.c })),
    };
  }
  return { fetchedAt: raw.fetchedAt, source: "snapshot", series };
}
