import { createServerFn } from "@tanstack/react-start";
import { QUOTE_SYMBOLS, parseYahooChart, type MarketBundle } from "@/lib/market/shape";

const TTL_MS = 30 * 60 * 1000;
let memo: { at: number; data: MarketBundle } | null = null;

async function fetchSymbol(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=max`;
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Price request failed for ${symbol}`);
  return parseYahooChart(symbol, await response.json());
}

export const getMarket = createServerFn({ method: "GET" }).handler(async (): Promise<MarketBundle> => {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.data;

  const pairs = await Promise.all(
    QUOTE_SYMBOLS.map(async (symbol) => [symbol, await fetchSymbol(symbol)] as const),
  );
  const data: MarketBundle = {
    fetchedAt: new Date().toISOString(),
    source: "live",
    series: Object.fromEntries(pairs),
  };
  memo = { at: Date.now(), data };
  return data;
});
