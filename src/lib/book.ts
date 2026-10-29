import type { Weights } from "@/lib/strategies/engine";

export type Fill = {
  id: string;
  batchId: string;
  at: string;
  symbol: string;
  side: "buy" | "sell";
  dollars: number;
  price: number;
  shares: number;
};

export type Position = {
  symbol: string;
  shares: number;
  cost: number;
};

export function positions(fills: Fill[]): Record<string, Position> {
  const book: Record<string, Position> = {};
  for (const fill of fills) {
    const current = book[fill.symbol] ?? { symbol: fill.symbol, shares: 0, cost: 0 };
    if (fill.side === "buy") {
      current.shares += fill.shares;
      current.cost += fill.dollars;
    } else {
      const average = current.shares > 0 ? current.cost / current.shares : 0;
      current.shares -= fill.shares;
      current.cost -= average * fill.shares;
    }
    if (current.shares < 1e-6) {
      current.shares = 0;
      current.cost = 0;
    }
    book[fill.symbol] = current;
  }
  return book;
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function depositFills(
  lines: { symbol: string; dollars: number; price: number }[],
  at: string,
): Fill[] {
  const batchId = id("buy");
  return lines
    .filter((line) => line.dollars > 0 && line.price > 0)
    .map((line) => ({
      id: id(line.symbol),
      batchId,
      at,
      symbol: line.symbol,
      side: "buy" as const,
      dollars: Math.round(line.dollars * 100) / 100,
      price: line.price,
      shares: line.dollars / line.price,
    }));
}

export function rebalanceFills(
  book: Record<string, Position>,
  prices: Record<string, number>,
  weights: Weights,
  extraCash: number,
  at: string,
): Fill[] {
  const symbols = new Set([...Object.keys(book), ...Object.keys(weights)]);
  let nav = Math.max(0, extraCash);
  for (const symbol of symbols) {
    const qty = book[symbol]?.shares ?? 0;
    const price = prices[symbol];
    if (qty > 0 && price) nav += qty * price;
  }

  const batchId = id("match");
  const fills: Fill[] = [];
  for (const symbol of symbols) {
    const price = prices[symbol];
    if (!price) continue;
    const current = book[symbol]?.shares ?? 0;
    const target = ((weights[symbol] ?? 0) * nav) / price;
    const delta = target - current;
    const dollars = Math.abs(delta) * price;
    if (dollars < 0.5) continue;
    fills.push({
      id: id(symbol),
      batchId,
      at,
      symbol,
      side: delta > 0 ? "buy" : "sell",
      dollars: Math.round(dollars * 100) / 100,
      price,
      shares: Math.abs(delta),
    });
  }
  return fills;
}

export function needsMatch(book: Record<string, Position>, prices: Record<string, number>, weights: Weights): boolean {
  let total = 0;
  const values: Record<string, number> = {};
  for (const [symbol, position] of Object.entries(book)) {
    if (position.shares <= 0) continue;
    const price = prices[symbol];
    if (!price) return true;
    values[symbol] = position.shares * price;
    total += values[symbol];
  }
  if (total <= 0) return false;
  const symbols = new Set([...Object.keys(values), ...Object.keys(weights)]);
  for (const symbol of symbols) {
    const actual = (values[symbol] ?? 0) / total;
    const target = weights[symbol] ?? 0;
    if (Math.abs(actual - target) > 0.05) return true;
  }
  return false;
}
