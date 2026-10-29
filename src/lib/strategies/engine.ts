import { addMonths, formatMonth, formatPct, monthSpan, nyMonth } from "@/lib/format";
import { FUNDS, type MarketBundle, type MonthPoint } from "@/lib/market/shape";

export type StrategyId = "threefund" | "gem" | "faber";
export type Weights = Record<string, number>;
export type RiskDrop = 10 | 25 | 40;

export type TicketLine = {
  symbol: string;
  name: string;
  detail: string;
  weight: number;
  dollars: number;
  price: number;
  shares: number;
};

export type Fact = { label: string; value: string; hint: string };

export type Report = {
  strategy: StrategyId;
  benchLabel: string;
  start: string;
  end: string;
  partial: boolean;
  lumpEnd: number;
  benchEnd: number;
  cagr: number;
  benchCagr: number;
  maxDrawdown: number;
  benchMaxDrawdown: number;
  curve: { d: string; strategy: number; bench: number }[];
  dca: { contributed: number; end: number; benchEnd: number };
  live: {
    month: string;
    weights: Weights;
    lines: TicketLine[];
    note: string;
    facts: Fact[];
  };
};

const LUMP = 10000;

type Split = {
  completed: MonthPoint[];
  map: Map<string, number>;
  spot: number;
  spotMonth: string;
  spotIsExtra: boolean;
};

function splitSeries(points: MonthPoint[], liveMonth: string): Split {
  const last = points[points.length - 1];
  const spotIsExtra = last.d === liveMonth && points.length > 1;
  const completed = spotIsExtra ? points.slice(0, -1) : points;
  return {
    completed,
    map: new Map(completed.map((point) => [point.d, point.c])),
    spot: last.c,
    spotMonth: last.d,
    spotIsExtra,
  };
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function normalize(weights: Weights): Weights {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const next: Weights = {};
  for (const [symbol, weight] of entries) next[symbol] = weight / total;
  return next;
}

export function threeFundWeights(drop: RiskDrop, years: number): Weights {
  let bonds = drop === 10 ? 0.6 : drop === 25 ? 0.35 : 0.12;
  if (years <= 3) bonds = Math.max(bonds, 0.75);
  else if (years <= 7) bonds = Math.max(bonds, 0.45);
  const stocks = 1 - bonds;
  return normalize({ VTI: stocks * 0.7, VXUS: stocks * 0.3, BND: bonds });
}

export function allocate(totalCents: number, weights: Weights): { symbol: string; cents: number; weight: number }[] {
  const normalized = normalize(weights);
  const parts = Object.entries(normalized).map(([symbol, weight]) => {
    const exact = totalCents * weight;
    const cents = Math.floor(exact);
    return { symbol, weight, cents, fraction: exact - cents };
  });
  let left = totalCents - parts.reduce((sum, part) => sum + part.cents, 0);
  const ranked = [...parts].sort((a, b) => b.fraction - a.fraction || a.symbol.localeCompare(b.symbol));
  for (const part of ranked) {
    if (left <= 0) break;
    part.cents += 1;
    left -= 1;
  }
  return parts
    .filter((part) => part.cents > 0)
    .sort((a, b) => b.weight - a.weight || a.symbol.localeCompare(b.symbol))
    .map(({ symbol, cents, weight }) => ({ symbol, cents, weight }));
}

function priceOn(split: Split, month: string, livePrices?: Record<string, number>, symbol?: string): number | null {
  if (livePrices && symbol && month === split.spotMonth && split.spotIsExtra) {
    return livePrices[symbol] ?? null;
  }
  return split.map.get(month) ?? null;
}

function commonMonths(splits: Split[]): string[] {
  const sets = splits.map((split) => new Set(split.completed.map((point) => point.d)));
  return splits[0].completed.map((point) => point.d).filter((month) => sets.every((set) => set.has(month)));
}

type Books = {
  splits: Record<string, Split>;
  prices: Record<string, number>;
  liveMonth: string;
  partial: boolean;
};

function booksFor(bundle: MarketBundle): Books {
  const liveMonth = nyMonth(bundle.fetchedAt);
  const splits: Record<string, Split> = {};
  const prices: Record<string, number> = {};
  for (const [symbol, series] of Object.entries(bundle.series)) {
    const split = splitSeries(series.points, liveMonth);
    splits[symbol] = split;
    prices[symbol] = split.spot;
  }
  return {
    splits,
    prices,
    liveMonth,
    partial: Object.values(splits).some((split) => split.spotIsExtra),
  };
}

function portReturn(
  weights: Weights,
  splits: Record<string, Split>,
  from: string,
  to: string,
): number | null {
  let result = 0;
  for (const [symbol, weight] of Object.entries(weights)) {
    const start = splits[symbol]?.map.get(from);
    const end = splits[symbol]?.map.get(to);
    if (start == null || end == null || start === 0) return null;
    result += weight * (end / start - 1);
  }
  return result;
}

function maxDrawdown(values: number[]): number {
  let peak = values[0] ?? 0;
  let worst = 0;
  for (const value of values) {
    if (value > peak) peak = value;
    if (peak > 0) worst = Math.min(worst, value / peak - 1);
  }
  return worst;
}

function cagr(startValue: number, endValue: number, start: string, end: string): number {
  const months = monthSpan(start, end);
  if (months <= 0 || startValue <= 0 || endValue <= 0) return 0;
  return (endValue / startValue) ** (12 / months) - 1;
}

function gemWeights(books: Books, month: string, live: boolean): { weights: Weights; facts: Fact[] } | null {
  const symbols = ["SPY", "EFA", "BIL"] as const;
  const returns: Record<string, number> = {};
  for (const symbol of symbols) {
    const split = books.splits[symbol];
    const now = live ? books.prices[symbol] : split?.map.get(month);
    const then = split?.map.get(addMonths(month, -12));
    if (now == null || then == null || then === 0) return null;
    returns[symbol] = now / then - 1;
  }
  const best = returns.SPY >= returns.EFA ? "SPY" : "EFA";
  const weights = returns[best] > returns.BIL ? { [best]: 1 } : { AGG: 1 };
  const held = Object.keys(weights)[0];
  const facts: Fact[] = [
    { label: "S&P 500, past year", value: formatPct(returns.SPY), hint: "SPY" },
    { label: "International, past year", value: formatPct(returns.EFA), hint: "EFA" },
    { label: "T-bills, past year", value: formatPct(returns.BIL), hint: "BIL" },
  ];
  const note =
    held === "AGG"
      ? "Both stock markets trail T-bills over the past year, so the rule holds US bonds."
      : `${FUNDS[held].name} led, and it beat T-bills, so the rule holds only that fund.`;
  return { weights, facts: [...facts, { label: "This month", value: held, hint: note }] };
}

function faberWeights(books: Books, month: string, live: boolean): { weights: Weights; facts: Fact[] } | null {
  const sleeves = ["SPY", "EFA", "AGG"] as const;
  const weights: Weights = {};
  const facts: Fact[] = [];
  for (const symbol of sleeves) {
    const values: number[] = [];
    for (let ago = 9; ago >= 0; ago -= 1) {
      const key = addMonths(month, -ago);
      const split = books.splits[symbol];
      const price =
        live && ago === 0 ? books.prices[symbol] : priceOn(split, key, live ? books.prices : undefined, symbol);
      if (price == null) return null;
      values.push(price);
    }
    const spot = values[values.length - 1];
    const mean = average(values);
    const above = spot > mean;
    const hold = above ? symbol : "BIL";
    weights[hold] = (weights[hold] ?? 0) + 1 / sleeves.length;
    facts.push({
      label: FUNDS[symbol].name,
      value: above ? "Above average" : "Below average",
      hint: `${formatUsdPlain(spot)} vs 10-month average ${formatUsdPlain(mean)}`,
    });
  }
  return { weights: normalize(weights), facts };
}

function formatUsdPlain(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function strategySpec(strategy: StrategyId, custom?: Weights): {
  symbols: string[];
  bench: Weights;
  benchLabel: string;
  weightsAt: (books: Books, month: string, live: boolean) => { weights: Weights; facts: Fact[] } | null;
  note: string;
} {
  if (strategy === "threefund") {
    const weights = normalize(custom ?? { VTI: 0.6, VXUS: 0.3, BND: 0.1 });
    return {
      symbols: ["VTI", "VXUS", "BND"],
      bench: { VTI: 1 },
      benchLabel: "US stocks only",
      weightsAt: (_books: Books, _month: string, _live: boolean) => {
        const shares = allocate(100, weights);
        return {
          weights,
          facts: shares.map((row) => ({
            label: FUNDS[row.symbol].name,
            value: `${row.cents}%`,
            hint: FUNDS[row.symbol].detail,
          })),
        };
      },
      note: "Fixed weights. The same mix is bought every month — no timing.",
    };
  }
  if (strategy === "gem") {
    return {
      symbols: ["SPY", "EFA", "AGG", "BIL"],
      bench: { SPY: 1 },
      benchLabel: "Buy and hold the S&P 500",
      weightsAt: gemWeights,
      note: "",
    };
  }
  return {
    symbols: ["SPY", "EFA", "AGG", "BIL"],
    bench: { SPY: 1 / 3, EFA: 1 / 3, AGG: 1 / 3 },
    benchLabel: "Same three markets, always invested",
    weightsAt: faberWeights,
    note: "",
  };
}

function simulateDca(
  months: string[],
  splits: Record<string, Split>,
  weightsAt: (month: string) => Weights | null,
  bench: Weights,
  monthly: number,
) {
  const run = (pick: (month: string) => Weights | null) => {
    let shares: Record<string, number> = {};
    let contributed = 0;
    let end = 0;
    for (const month of months) {
      const weights = pick(month);
      if (!weights) continue;
      let nav = monthly;
      contributed += monthly;
      for (const [symbol, qty] of Object.entries(shares)) {
        const price = splits[symbol]?.map.get(month);
        if (price == null) return null;
        nav += qty * price;
      }
      shares = {};
      for (const [symbol, weight] of Object.entries(weights)) {
        const price = splits[symbol]?.map.get(month);
        if (price == null || price === 0) return null;
        shares[symbol] = (nav * weight) / price;
      }
      end = nav;
    }
    return { contributed, end };
  };
  const strategy = run(weightsAt);
  const benchRun = run(() => bench);
  if (!strategy || !benchRun) return null;
  return { contributed: strategy.contributed, end: strategy.end, benchEnd: benchRun.end };
}

export function evaluate(
  bundle: MarketBundle,
  strategy: StrategyId,
  monthly: number,
  weights?: Weights,
): Report | null {
  const books = booksFor(bundle);
  const spec = strategySpec(strategy, weights);
  for (const symbol of spec.symbols) {
    if (!books.splits[symbol]) return null;
  }
  const splits = spec.symbols.map((symbol) => books.splits[symbol]);
  const months = commonMonths(splits);
  const historical = (month: string) => spec.weightsAt(books, month, false)?.weights ?? null;

  let start = "";
  for (const month of months) {
    if (historical(month)) {
      start = month;
      break;
    }
  }
  if (!start) return null;
  const invested = months.filter((month) => month >= start && historical(month));
  const end = invested[invested.length - 1];
  if (!end || invested.length < 2) return null;

  let lump = LUMP;
  let bench = LUMP;
  const curve: Report["curve"] = [{ d: start, strategy: LUMP, bench: LUMP }];
  for (let index = 0; index < invested.length - 1; index += 1) {
    const from = invested[index];
    const to = invested[index + 1];
    const held = historical(from);
    if (!held) continue;
    const gain = portReturn(held, books.splits, from, to);
    const benchGain = portReturn(spec.bench, books.splits, from, to);
    if (gain == null || benchGain == null) continue;
    lump *= 1 + gain;
    bench *= 1 + benchGain;
    curve.push({
      d: to,
      strategy: Math.round(lump * 100) / 100,
      bench: Math.round(bench * 100) / 100,
    });
  }

  const dca = simulateDca(invested, books.splits, historical, spec.bench, Math.max(0, monthly));
  if (!dca) return null;

  const signalMonth = books.partial ? books.liveMonth : end;
  const livePick = spec.weightsAt(books, signalMonth, true);
  if (!livePick) return null;
  const lines = allocate(Math.round(Math.max(0, monthly) * 100), livePick.weights).map((row) => {
    const price = books.prices[row.symbol];
    const dollars = row.cents / 100;
    return {
      symbol: row.symbol,
      name: FUNDS[row.symbol]?.name ?? row.symbol,
      detail: FUNDS[row.symbol]?.detail ?? row.symbol,
      weight: row.weight,
      dollars,
      price,
      shares: price > 0 ? dollars / price : 0,
    };
  });

  const held = allocate(100, livePick.weights)
    .map((row) => `${row.cents}% ${row.symbol}`)
    .join(", ");
  const note =
    strategy === "threefund"
      ? spec.note
      : strategy === "gem"
        ? (livePick.facts.at(-1)?.hint ?? spec.note)
        : `Each market is checked on its own. This month: ${held}.`;

  return {
    strategy,
    benchLabel: spec.benchLabel,
    start,
    end,
    partial: books.partial,
    lumpEnd: curve[curve.length - 1]?.strategy ?? LUMP,
    benchEnd: curve[curve.length - 1]?.bench ?? LUMP,
    cagr: cagr(LUMP, curve[curve.length - 1]?.strategy ?? LUMP, curve[0].d, curve[curve.length - 1].d),
    benchCagr: cagr(LUMP, curve[curve.length - 1]?.bench ?? LUMP, curve[0].d, curve[curve.length - 1].d),
    maxDrawdown: maxDrawdown(curve.map((point) => point.strategy)),
    benchMaxDrawdown: maxDrawdown(curve.map((point) => point.bench)),
    curve,
    dca,
    live: {
      month: signalMonth,
      weights: livePick.weights,
      lines,
      note: strategy === "threefund" ? spec.note : note,
      facts: strategy === "gem" ? livePick.facts.slice(0, 3) : livePick.facts,
    },
  };
}

export function recommend(input: { style: "schedule" | "rule"; drop: RiskDrop; years: number }): {
  id: StrategyId;
  because: string;
} {
  if (input.style === "schedule") {
    return {
      id: "threefund",
      because:
        "You want a schedule, not a switch. A fixed three-fund mix is the rule long-term investors have actually kept.",
    };
  }
  if (input.years < 5 || input.drop === 10) {
    return {
      id: "faber",
      because:
        "You want a monthly rule and a smaller ride. The 10-month average can move a slice into T-bills when a market is weak.",
    };
  }
  return {
    id: "gem",
    because:
      "You can follow a switch rule. Dual momentum holds one stock fund when it is leading, and bonds when both stock markets trail T-bills.",
  };
}

export function strategyCopy(id: StrategyId): { name: string; aka: string; year: string; blurb: string } {
  if (id === "threefund") {
    return {
      name: "Three-fund",
      aka: "Bogleheads",
      year: "Used since the 1970s",
      blurb: "Own the US market, international stocks, and US bonds. Buy the same weights every month.",
    };
  }
  if (id === "gem") {
    return {
      name: "Dual momentum",
      aka: "Antonacci, 2014",
      year: "Global Equity Momentum",
      blurb: "Hold the stronger of US or international stocks, and only if it beat T-bills. Otherwise hold bonds.",
    };
  }
  return {
    name: "10-month average",
    aka: "Faber, 2007",
    year: "Tactical asset allocation",
    blurb: "Hold each market only while price is above its 10-month average. Otherwise that slice sits in T-bills.",
  };
}

export function spotPrices(bundle: MarketBundle): Record<string, number> {
  return booksFor(bundle).prices;
}

export function historyLabel(report: Report): string {
  const through = report.partial ? `Finished months through ${formatMonth(report.end)}.` : `Through ${formatMonth(report.end)}.`;
  return `History from ${formatMonth(report.start)}. ${through} Dividend-adjusted prices, so this assumes dividends were reinvested.`;
}
