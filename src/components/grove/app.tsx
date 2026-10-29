import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Check, Sprout } from "lucide-react";
import { depositFills, needsMatch, positions, rebalanceFills } from "@/lib/book";
import { addMonths, formatMonth, formatPct, formatShares, formatStamp, formatUsd } from "@/lib/format";
import { useGrove } from "@/lib/grove-store";
import type { MarketBundle } from "@/lib/market/shape";
import { FUNDS } from "@/lib/market/shape";
import {
  evaluate,
  historyLabel,
  recommend,
  spotPrices,
  strategyCopy,
  threeFundWeights,
  type Report,
  type StrategyId,
} from "@/lib/strategies/engine";

const CHECKS = [
  "An emergency fund stays outside this",
  "I can leave this money for the years I set",
  "I won't sell just because the number falls",
  "I'll place the order at my own broker",
];

const ORDER: StrategyId[] = ["threefund", "gem", "faber"];

export function GroveApp({ market }: { market: MarketBundle }) {
  const profile = useGrove((state) => state.profile);
  const fills = useGrove((state) => state.fills);
  const ready = useGrove((state) => state.ready);
  const setProfile = useGrove((state) => state.setProfile);
  const addFills = useGrove((state) => state.addFills);
  const undoLast = useGrove((state) => state.undoLast);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    void useGrove.persist.rehydrate();
    setMounted(true);
  }, []);

  const weights = useMemo(
    () => threeFundWeights(profile.drop, profile.years),
    [profile.drop, profile.years],
  );
  const suggestion = recommend(profile);
  const active: StrategyId = profile.override ?? suggestion.id;

  const reports = useMemo(() => {
    const next = {} as Record<StrategyId, Report | null>;
    for (const id of ORDER) {
      next[id] = evaluate(market, id, profile.monthly, id === "threefund" ? weights : undefined);
    }
    return next;
  }, [market, profile.monthly, weights]);

  const report = reports[active];
  const prices = useMemo(() => spotPrices(market), [market]);
  const book = useMemo(() => positions(fills), [fills]);
  const rows = Object.values(book).filter((position) => position.shares > 0);
  const bookValue = rows.reduce((sum, position) => sum + position.shares * (prices[position.symbol] ?? 0), 0);
  const offTarget = report ? needsMatch(book, prices, report.live.weights) : false;

  const log = (kind: "deposit" | "match") => {
    if (!report || !ready) return;
    const at = new Date().toISOString();
    const next =
      kind === "deposit"
        ? depositFills(report.live.lines, at)
        : rebalanceFills(book, prices, report.live.weights, 0, at);
    if (!next.length) {
      setNotice("Nothing to log — the book already matches.");
      return;
    }
    addFills(next);
    const spent = next
      .filter((fill) => fill.side === "buy")
      .reduce((sum, fill) => sum + fill.dollars, 0);
    setNotice(kind === "deposit" ? `Logged a ${formatUsd(spent)} deposit.` : "Logged a move of what you already held.");
  };

  const copyTicket = async () => {
    if (!report) return;
    const text = [
      `Grove ticket · ${formatMonth(report.live.month)}`,
      ...report.live.lines.map((line) => `Buy ${formatUsd(line.dollars, 2)} ${line.symbol}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
      setNotice(text);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-forest text-paper">
              <Sprout aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl leading-none text-ink">Grove</p>
              <p className="text-sm text-muted">Monthly buy guide</p>
            </div>
          </div>
          <p className="text-right text-sm text-muted">
            <span className="block text-ink">{formatStamp(market.fetchedAt)}</span>
            {market.source === "live" ? "Live monthly prices" : "Saved prices"}
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-12">
        <section className="min-w-0 lg:col-span-5 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-line bg-card p-5">
            <h1 className="font-display text-3xl leading-tight text-ink">Where this month's money goes.</h1>
            <p className="mt-2 text-sm text-muted">
              Three rules investors have already published and used. Grove turns the one you pick into a buy ticket. It does not send orders, and it does not promise a gain.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm text-muted">Amount each month</span>
                <span className="flex h-11 items-center rounded-xl border border-line bg-paper px-3">
                  <span className="text-muted">$</span>
                  <input
                    className="h-full w-full bg-transparent px-2 text-ink tabular-nums outline-none"
                    inputMode="decimal"
                    min={0}
                    step={50}
                    type="number"
                    value={profile.monthly}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setProfile({ monthly: Number.isFinite(next) ? Math.min(100000, Math.max(0, Math.round(next))) : 0 });
                    }}
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="flex items-baseline justify-between text-sm text-muted">
                  Years you can leave it
                  <span className="font-display text-xl text-ink tabular-nums">{profile.years}</span>
                </span>
                <input
                  aria-valuemax={40}
                  aria-valuemin={1}
                  aria-valuenow={profile.years}
                  className="h-11 w-full"
                  max={40}
                  min={1}
                  type="range"
                  value={profile.years}
                  onChange={(event) => setProfile({ years: Number(event.target.value) })}
                />
              </label>

              <fieldset className="grid gap-2">
                <legend className="text-sm text-muted">A drop of this size would make me want to sell</legend>
                <div className="grid grid-cols-3 gap-2">
                  {([10, 25, 40] as const).map((drop) => (
                    <button
                      key={drop}
                      aria-pressed={profile.drop === drop}
                      className={choiceClass(profile.drop === drop)}
                      type="button"
                      onClick={() => setProfile({ drop })}
                    >
                      {drop}%
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="grid gap-2">
                <legend className="text-sm text-muted">How should the ticket be chosen?</legend>
                <button
                  aria-pressed={profile.style === "schedule"}
                  className={choiceClass(profile.style === "schedule")}
                  type="button"
                  onClick={() => setProfile({ style: "schedule", override: null })}
                >
                  Same mix every month
                </button>
                <button
                  aria-pressed={profile.style === "rule"}
                  className={choiceClass(profile.style === "rule")}
                  type="button"
                  onClick={() => setProfile({ style: "rule", override: null })}
                >
                  Follow a monthly switch rule
                </button>
              </fieldset>
            </div>
          </div>

          <ul className="mt-4 grid gap-2">
            {CHECKS.map((label, index) => (
              <li key={label}>
                <button
                  aria-pressed={checks[index]}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-left text-sm"
                  type="button"
                  onClick={() =>
                    setChecks((current) => current.map((value, item) => (item === index ? !value : value)))
                  }
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${checks[index] ? "border-forest bg-forest text-paper" : "border-line bg-paper"}`}
                    aria-hidden="true"
                  >
                    {checks[index] ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid min-w-0 gap-4 lg:col-span-7">
          {report ? (
            <Ticket
              active={active}
              copied={copied}
              notice={notice}
              offTarget={offTarget && rows.length > 0}
              ready={ready}
              report={report}
              suggested={suggestion.id}
              because={suggestion.because}
              onCopy={() => void copyTicket()}
              onDeposit={() => log("deposit")}
              onMatch={() => log("match")}
              onUse={(id) => setProfile({ override: id === suggestion.id ? null : id })}
            />
          ) : (
            <p className="rounded-2xl border border-line bg-card p-5">Price history didn't load. Try the page again in a moment.</p>
          )}

          <div className="grid gap-3">
            {ORDER.map((id) => {
              const item = reports[id];
              const copy = strategyCopy(id);
              const selected = id === active;
              return (
                <button
                  key={id}
                  aria-pressed={selected}
                  className={`rounded-2xl border p-4 text-left ${selected ? "border-forest bg-leaf" : "border-line bg-card"}`}
                  type="button"
                  onClick={() => setProfile({ override: id === suggestion.id ? null : id })}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">{copy.name}</span>
                    <span className="text-sm text-muted">{copy.aka}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{copy.blurb}</span>
                  {item ? (
                    <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums">
                      <span>{formatPct(item.cagr, 1)} a year since {formatMonth(item.start)}</span>
                      <span className="text-copper">Worst drop {formatPct(item.maxDrawdown, 0)}</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {report ? <Past report={report} mounted={mounted} monthly={profile.monthly} /> : null}
          <Book
            bookValue={bookValue}
            canUndo={fills.length > 0}
            prices={prices}
            ready={ready}
            rows={rows}
            target={report?.live.weights ?? {}}
            onUndo={() => {
              undoLast();
              setNotice("Removed the last log.");
            }}
          />
          <HowTo nextMonth={report ? formatMonth(addMonths(report.live.month, 1)) : "next month"} />
        </section>
      </main>
    </div>
  );
}

function choiceClass(on: boolean): string {
  return `min-h-11 rounded-xl border px-3 text-sm ${on ? "border-forest bg-forest text-paper" : "border-line bg-paper text-ink"}`;
}

function Ticket({
  report,
  active,
  suggested,
  because,
  copied,
  notice,
  ready,
  offTarget,
  onCopy,
  onDeposit,
  onMatch,
  onUse,
}: {
  report: Report;
  active: StrategyId;
  suggested: StrategyId;
  because: string;
  copied: boolean;
  notice: string;
  ready: boolean;
  offTarget: boolean;
  onCopy: () => void;
  onDeposit: () => void;
  onMatch: () => void;
  onUse: (id: StrategyId) => void;
}) {
  const copy = strategyCopy(active);
  const monthly = report.live.lines.reduce((sum, line) => sum + line.dollars, 0);
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <p className="text-sm text-copper">{formatMonth(report.live.month)} ticket · {copy.name}</p>
      <h2 className="mt-1 font-display text-4xl tabular-nums text-ink">{formatUsd(monthly)}</h2>
      <p className="mt-2 text-sm text-muted">{report.live.note}</p>
      {active !== suggested ? (
        <button className="mt-3 text-sm text-forest underline" type="button" onClick={() => onUse(suggested)}>
          Use the suggested rule instead
        </button>
      ) : (
        <p className="mt-3 text-sm">{because}</p>
      )}

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {report.live.lines.map((line) => (
          <li key={line.symbol} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 py-3">
            <span>
              <span className="block font-medium">{line.symbol}</span>
              <span className="block text-sm text-muted">{line.detail}</span>
            </span>
            <span className="text-right tabular-nums">
              <span className="block font-medium">{formatUsd(line.dollars, 2)}</span>
              <span className="block text-sm text-muted">
                {formatShares(line.shares)} sh @ {formatUsd(line.price, 2)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {report.live.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-sm text-muted">{fact.label}</dt>
            <dd className="font-medium tabular-nums">{fact.value}</dd>
            <dd className="text-sm text-muted">{fact.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          className="min-h-11 rounded-xl bg-forest px-4 text-paper disabled:opacity-50"
          disabled={!ready || monthly <= 0}
          type="button"
          onClick={onDeposit}
        >
          I placed this deposit
        </button>
        <button className="min-h-11 rounded-xl border border-line bg-paper px-4" type="button" onClick={onCopy}>
          {copied ? "Copied" : "Copy the ticket"}
        </button>
        {offTarget ? (
          <button
            className="min-h-11 rounded-xl border border-forest px-4 text-forest sm:col-span-2"
            disabled={!ready}
            type="button"
            onClick={onMatch}
          >
            I also moved the old holdings to this rule
          </button>
        ) : null}
      </div>
      {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
    </article>
  );
}

function Past({ report, mounted, monthly }: { report: Report; mounted: boolean; monthly: number }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-2xl">What already happened</h2>
      <p className="mt-1 text-sm text-muted">{historyLabel(report)} Not a forecast.</p>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted">$10,000 once, this rule</dt>
          <dd className="font-display text-3xl tabular-nums">{formatUsd(report.lumpEnd)}</dd>
          <dd className="text-sm text-muted">{formatPct(report.cagr)} a year · worst drop {formatPct(report.maxDrawdown, 0)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{report.benchLabel}</dt>
          <dd className="font-display text-3xl tabular-nums">{formatUsd(report.benchEnd)}</dd>
          <dd className="text-sm text-muted">{formatPct(report.benchCagr)} a year · worst drop {formatPct(report.benchMaxDrawdown, 0)}</dd>
        </div>
      </dl>
      <div className="mt-4 h-56 w-full min-w-0" aria-hidden={!mounted}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.curve} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <YAxis hide domain={["auto", "auto"]} width={0} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length || typeof label !== "string") return null;
                  return (
                    <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm">
                      <p>{formatMonth(label)}</p>
                      <p className="tabular-nums text-forest">Rule {formatUsd(Number(payload[0]?.value ?? 0))}</p>
                      <p className="tabular-nums text-copper">Compare {formatUsd(Number(payload[1]?.value ?? 0))}</p>
                    </div>
                  );
                }}
              />
              <Line type="monotone" dataKey="strategy" stroke="var(--color-forest)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="bench" stroke="var(--color-copper)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted">
        Forest is the rule. Copper is the comparison.
        {report.benchEnd > report.lumpEnd
          ? " In this window the comparison finished higher. What the rule changed was the path, including the worst drop — not a promise of a bigger ending number."
          : " In this window the rule finished higher than the comparison. That is history, not a promise it will again."}{" "}
        {formatUsd(monthly)} every month from {formatMonth(report.start)} would have become{" "}
        <span className="text-ink tabular-nums">{formatUsd(report.dca.end)}</span> after putting in{" "}
        <span className="tabular-nums">{formatUsd(report.dca.contributed)}</span>. The comparison with the same deposits:{" "}
        <span className="tabular-nums">{formatUsd(report.dca.benchEnd)}</span>.
      </p>
    </article>
  );
}

function Book({
  rows,
  prices,
  bookValue,
  target,
  canUndo,
  ready,
  onUndo,
}: {
  rows: { symbol: string; shares: number; cost: number }[];
  prices: Record<string, number>;
  bookValue: number;
  target: Record<string, number>;
  canUndo: boolean;
  ready: boolean;
  onUndo: () => void;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl">Paper book</h2>
        <p className="tabular-nums">{rows.length ? formatUsd(bookValue) : "Nothing logged"}</p>
      </div>
      <p className="mt-1 text-sm text-muted">
        This is your record of orders you placed yourself. Grove does not hold the shares.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm">When you buy at your broker, tap “I placed this deposit” and it will show up here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {rows.map((row) => {
            const price = prices[row.symbol] ?? 0;
            const value = row.shares * price;
            const weight = bookValue > 0 ? value / bookValue : 0;
            const goal = target[row.symbol] ?? 0;
            return (
              <li key={row.symbol} className="grid grid-cols-[1fr_auto] gap-3 py-3 text-sm">
                <span>
                  <span className="block font-medium">{row.symbol}</span>
                  <span className="text-muted">{FUNDS[row.symbol]?.name ?? "Logged fund"} · {formatShares(row.shares)} shares</span>
                </span>
                <span className="text-right tabular-nums">
                  <span className="block">{formatUsd(value)}</span>
                  <span className="text-muted">{Math.round(weight * 100)}% now · {Math.round(goal * 100)}% rule</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {canUndo ? (
        <button className="mt-4 min-h-11 text-sm text-forest underline" disabled={!ready} type="button" onClick={onUndo}>
          Undo the last log
        </button>
      ) : null}
    </article>
  );
}

function HowTo({ nextMonth }: { nextMonth: string }) {
  const steps = [
    "Open the brokerage account you already use. Grove never sees that login.",
    "Search the ticker on the ticket. Choose Buy, in dollars if the broker allows it.",
    "A market order is enough for these large funds while the market is open, 9:30am to 4:00pm Eastern. Use a limit order if you want a ceiling.",
    "Repeat for each line. If the broker only sells whole shares, buy the most whole shares the dollars cover.",
    "Come back and tap “I placed this deposit” so the paper book matches.",
    `Open Grove again in ${nextMonth}. The switch rules are checked once a month, not every day.`,
  ];
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-2xl">Place it yourself</h2>
      <ol className="mt-3 grid gap-3">
        {steps.map((step, index) => (
          <li key={step} className="grid grid-cols-[2rem_1fr] gap-2 text-sm">
            <span className="font-display text-xl text-forest">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">
        Grove is a calculator, not a broker or an adviser. Funds can lose money. The chart is the past record of a published rule on real monthly prices. Taxes, fund fees, and trading spreads are not included.
      </p>
    </article>
  );
}
