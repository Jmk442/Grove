import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as FUNDS } from "./shape-DduZPGIc.mjs";
import { n as Sprout, r as Check } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router--D-I2Fby.mjs";
import { a as Tooltip, i as ResponsiveContainer, n as YAxis, r as Line, t as LineChart } from "../_libs/recharts+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BiCjfVkK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function positions(fills) {
	const book = {};
	for (const fill of fills) {
		const current = book[fill.symbol] ?? {
			symbol: fill.symbol,
			shares: 0,
			cost: 0
		};
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
function id(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}
function depositFills(lines, at) {
	const batchId = id("buy");
	return lines.filter((line) => line.dollars > 0 && line.price > 0).map((line) => ({
		id: id(line.symbol),
		batchId,
		at,
		symbol: line.symbol,
		side: "buy",
		dollars: Math.round(line.dollars * 100) / 100,
		price: line.price,
		shares: line.dollars / line.price
	}));
}
function rebalanceFills(book, prices, weights, extraCash, at) {
	const symbols = /* @__PURE__ */ new Set([...Object.keys(book), ...Object.keys(weights)]);
	let nav = Math.max(0, extraCash);
	for (const symbol of symbols) {
		const qty = book[symbol]?.shares ?? 0;
		const price = prices[symbol];
		if (qty > 0 && price) nav += qty * price;
	}
	const batchId = id("match");
	const fills = [];
	for (const symbol of symbols) {
		const price = prices[symbol];
		if (!price) continue;
		const current = book[symbol]?.shares ?? 0;
		const delta = (weights[symbol] ?? 0) * nav / price - current;
		const dollars = Math.abs(delta) * price;
		if (dollars < .5) continue;
		fills.push({
			id: id(symbol),
			batchId,
			at,
			symbol,
			side: delta > 0 ? "buy" : "sell",
			dollars: Math.round(dollars * 100) / 100,
			price,
			shares: Math.abs(delta)
		});
	}
	return fills;
}
function needsMatch(book, prices, weights) {
	let total = 0;
	const values = {};
	for (const [symbol, position] of Object.entries(book)) {
		if (position.shares <= 0) continue;
		const price = prices[symbol];
		if (!price) return true;
		values[symbol] = position.shares * price;
		total += values[symbol];
	}
	if (total <= 0) return false;
	const symbols = /* @__PURE__ */ new Set([...Object.keys(values), ...Object.keys(weights)]);
	for (const symbol of symbols) {
		const actual = (values[symbol] ?? 0) / total;
		const target = weights[symbol] ?? 0;
		if (Math.abs(actual - target) > .05) return true;
	}
	return false;
}
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function formatMonth(ym) {
	const [year, month] = ym.split("-");
	return `${MONTHS[Number(month) - 1] ?? ym} ${year}`;
}
function formatStamp(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(date);
}
function formatUsd(value, digits = 0) {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: digits,
		minimumFractionDigits: digits
	});
}
function formatPct(value, digits = 1) {
	const shown = value * 100;
	return `${shown > 0 ? "+" : ""}${shown.toFixed(digits)}%`;
}
function formatShares(value) {
	const digits = value >= 100 ? 2 : 4;
	return value.toLocaleString("en-US", {
		maximumFractionDigits: digits,
		minimumFractionDigits: 0
	});
}
function addMonths(ym, delta) {
	const [year, month] = ym.split("-").map(Number);
	const index = year * 12 + (month - 1) + delta;
	const nextYear = Math.floor(index / 12);
	const nextMonth = index % 12 + 1;
	return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}
function monthSpan(start, end) {
	const [startYear, startMonth] = start.split("-").map(Number);
	const [endYear, endMonth] = end.split("-").map(Number);
	return (endYear - startYear) * 12 + (endMonth - startMonth);
}
function nyMonth(iso) {
	const date = new Date(iso);
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit"
	}).formatToParts(date);
	return `${parts.find((part) => part.type === "year")?.value ?? "1970"}-${parts.find((part) => part.type === "month")?.value ?? "01"}`;
}
var defaultProfile = {
	monthly: 500,
	years: 20,
	drop: 25,
	style: "schedule",
	override: null
};
var useGrove = create()(persist((set) => ({
	profile: defaultProfile,
	fills: [],
	ready: false,
	setProfile: (patch) => set((state) => ({ profile: {
		...state.profile,
		...patch
	} })),
	addFills: (fills) => set((state) => ({ fills: [...state.fills, ...fills] })),
	undoLast: () => set((state) => {
		const last = state.fills[state.fills.length - 1];
		if (!last) return state;
		return { fills: state.fills.filter((fill) => fill.batchId !== last.batchId) };
	}),
	setReady: (ready) => set({ ready })
}), {
	name: "grove-book-v1",
	skipHydration: true,
	partialize: (state) => ({
		profile: state.profile,
		fills: state.fills
	}),
	onRehydrateStorage: () => (state) => {
		state?.setReady(true);
	}
}));
var LUMP = 1e4;
function splitSeries(points, liveMonth) {
	const last = points[points.length - 1];
	const spotIsExtra = last.d === liveMonth && points.length > 1;
	const completed = spotIsExtra ? points.slice(0, -1) : points;
	return {
		completed,
		map: new Map(completed.map((point) => [point.d, point.c])),
		spot: last.c,
		spotMonth: last.d,
		spotIsExtra
	};
}
function average(values) {
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function normalize(weights) {
	const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
	const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
	const next = {};
	for (const [symbol, weight] of entries) next[symbol] = weight / total;
	return next;
}
function threeFundWeights(drop, years) {
	let bonds = drop === 10 ? .6 : drop === 25 ? .35 : .12;
	if (years <= 3) bonds = Math.max(bonds, .75);
	else if (years <= 7) bonds = Math.max(bonds, .45);
	const stocks = 1 - bonds;
	return normalize({
		VTI: stocks * .7,
		VXUS: stocks * .3,
		BND: bonds
	});
}
function allocate(totalCents, weights) {
	const normalized = normalize(weights);
	const parts = Object.entries(normalized).map(([symbol, weight]) => {
		const exact = totalCents * weight;
		const cents = Math.floor(exact);
		return {
			symbol,
			weight,
			cents,
			fraction: exact - cents
		};
	});
	let left = totalCents - parts.reduce((sum, part) => sum + part.cents, 0);
	const ranked = [...parts].sort((a, b) => b.fraction - a.fraction || a.symbol.localeCompare(b.symbol));
	for (const part of ranked) {
		if (left <= 0) break;
		part.cents += 1;
		left -= 1;
	}
	return parts.filter((part) => part.cents > 0).sort((a, b) => b.weight - a.weight || a.symbol.localeCompare(b.symbol)).map(({ symbol, cents, weight }) => ({
		symbol,
		cents,
		weight
	}));
}
function priceOn(split, month, livePrices, symbol) {
	if (livePrices && symbol && month === split.spotMonth && split.spotIsExtra) return livePrices[symbol] ?? null;
	return split.map.get(month) ?? null;
}
function commonMonths(splits) {
	const sets = splits.map((split) => new Set(split.completed.map((point) => point.d)));
	return splits[0].completed.map((point) => point.d).filter((month) => sets.every((set) => set.has(month)));
}
function booksFor(bundle) {
	const liveMonth = nyMonth(bundle.fetchedAt);
	const splits = {};
	const prices = {};
	for (const [symbol, series] of Object.entries(bundle.series)) {
		const split = splitSeries(series.points, liveMonth);
		splits[symbol] = split;
		prices[symbol] = split.spot;
	}
	return {
		splits,
		prices,
		liveMonth,
		partial: Object.values(splits).some((split) => split.spotIsExtra)
	};
}
function portReturn(weights, splits, from, to) {
	let result = 0;
	for (const [symbol, weight] of Object.entries(weights)) {
		const start = splits[symbol]?.map.get(from);
		const end = splits[symbol]?.map.get(to);
		if (start == null || end == null || start === 0) return null;
		result += weight * (end / start - 1);
	}
	return result;
}
function maxDrawdown(values) {
	let peak = values[0] ?? 0;
	let worst = 0;
	for (const value of values) {
		if (value > peak) peak = value;
		if (peak > 0) worst = Math.min(worst, value / peak - 1);
	}
	return worst;
}
function cagr(startValue, endValue, start, end) {
	const months = monthSpan(start, end);
	if (months <= 0 || startValue <= 0 || endValue <= 0) return 0;
	return (endValue / startValue) ** (12 / months) - 1;
}
function gemWeights(books, month, live) {
	const symbols = [
		"SPY",
		"EFA",
		"BIL"
	];
	const returns = {};
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
	const facts = [
		{
			label: "S&P 500, past year",
			value: formatPct(returns.SPY),
			hint: "SPY"
		},
		{
			label: "International, past year",
			value: formatPct(returns.EFA),
			hint: "EFA"
		},
		{
			label: "T-bills, past year",
			value: formatPct(returns.BIL),
			hint: "BIL"
		}
	];
	const note = held === "AGG" ? "Both stock markets trail T-bills over the past year, so the rule holds US bonds." : `${FUNDS[held].name} led, and it beat T-bills, so the rule holds only that fund.`;
	return {
		weights,
		facts: [...facts, {
			label: "This month",
			value: held,
			hint: note
		}]
	};
}
function faberWeights(books, month, live) {
	const sleeves = [
		"SPY",
		"EFA",
		"AGG"
	];
	const weights = {};
	const facts = [];
	for (const symbol of sleeves) {
		const values = [];
		for (let ago = 9; ago >= 0; ago -= 1) {
			const key = addMonths(month, -ago);
			const split = books.splits[symbol];
			const price = live && ago === 0 ? books.prices[symbol] : priceOn(split, key, live ? books.prices : void 0, symbol);
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
			hint: `${formatUsdPlain(spot)} vs 10-month average ${formatUsdPlain(mean)}`
		});
	}
	return {
		weights: normalize(weights),
		facts
	};
}
function formatUsdPlain(value) {
	return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2
	});
}
function strategySpec(strategy, custom) {
	if (strategy === "threefund") {
		const weights = normalize(custom ?? {
			VTI: .6,
			VXUS: .3,
			BND: .1
		});
		return {
			symbols: [
				"VTI",
				"VXUS",
				"BND"
			],
			bench: { VTI: 1 },
			benchLabel: "US stocks only",
			weightsAt: (_books, _month, _live) => {
				const shares = allocate(100, weights);
				return {
					weights,
					facts: shares.map((row) => ({
						label: FUNDS[row.symbol].name,
						value: `${row.cents}%`,
						hint: FUNDS[row.symbol].detail
					}))
				};
			},
			note: "Fixed weights. The same mix is bought every month — no timing."
		};
	}
	if (strategy === "gem") return {
		symbols: [
			"SPY",
			"EFA",
			"AGG",
			"BIL"
		],
		bench: { SPY: 1 },
		benchLabel: "Buy and hold the S&P 500",
		weightsAt: gemWeights,
		note: ""
	};
	return {
		symbols: [
			"SPY",
			"EFA",
			"AGG",
			"BIL"
		],
		bench: {
			SPY: 1 / 3,
			EFA: 1 / 3,
			AGG: 1 / 3
		},
		benchLabel: "Same three markets, always invested",
		weightsAt: faberWeights,
		note: ""
	};
}
function simulateDca(months, splits, weightsAt, bench, monthly) {
	const run = (pick) => {
		let shares = {};
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
				shares[symbol] = nav * weight / price;
			}
			end = nav;
		}
		return {
			contributed,
			end
		};
	};
	const strategy = run(weightsAt);
	const benchRun = run(() => bench);
	if (!strategy || !benchRun) return null;
	return {
		contributed: strategy.contributed,
		end: strategy.end,
		benchEnd: benchRun.end
	};
}
function evaluate(bundle, strategy, monthly, weights) {
	const books = booksFor(bundle);
	const spec = strategySpec(strategy, weights);
	for (const symbol of spec.symbols) if (!books.splits[symbol]) return null;
	const months = commonMonths(spec.symbols.map((symbol) => books.splits[symbol]));
	const historical = (month) => spec.weightsAt(books, month, false)?.weights ?? null;
	let start = "";
	for (const month of months) if (historical(month)) {
		start = month;
		break;
	}
	if (!start) return null;
	const invested = months.filter((month) => month >= start && historical(month));
	const end = invested[invested.length - 1];
	if (!end || invested.length < 2) return null;
	let lump = LUMP;
	let bench = LUMP;
	const curve = [{
		d: start,
		strategy: LUMP,
		bench: LUMP
	}];
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
			bench: Math.round(bench * 100) / 100
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
			shares: price > 0 ? dollars / price : 0
		};
	});
	const held = allocate(100, livePick.weights).map((row) => `${row.cents}% ${row.symbol}`).join(", ");
	const note = strategy === "threefund" ? spec.note : strategy === "gem" ? livePick.facts.at(-1)?.hint ?? spec.note : `Each market is checked on its own. This month: ${held}.`;
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
			facts: strategy === "gem" ? livePick.facts.slice(0, 3) : livePick.facts
		}
	};
}
function recommend(input) {
	if (input.style === "schedule") return {
		id: "threefund",
		because: "You want a schedule, not a switch. A fixed three-fund mix is the rule long-term investors have actually kept."
	};
	if (input.years < 5 || input.drop === 10) return {
		id: "faber",
		because: "You want a monthly rule and a smaller ride. The 10-month average can move a slice into T-bills when a market is weak."
	};
	return {
		id: "gem",
		because: "You can follow a switch rule. Dual momentum holds one stock fund when it is leading, and bonds when both stock markets trail T-bills."
	};
}
function strategyCopy(id) {
	if (id === "threefund") return {
		name: "Three-fund",
		aka: "Bogleheads",
		year: "Used since the 1970s",
		blurb: "Own the US market, international stocks, and US bonds. Buy the same weights every month."
	};
	if (id === "gem") return {
		name: "Dual momentum",
		aka: "Antonacci, 2014",
		year: "Global Equity Momentum",
		blurb: "Hold the stronger of US or international stocks, and only if it beat T-bills. Otherwise hold bonds."
	};
	return {
		name: "10-month average",
		aka: "Faber, 2007",
		year: "Tactical asset allocation",
		blurb: "Hold each market only while price is above its 10-month average. Otherwise that slice sits in T-bills."
	};
}
function spotPrices(bundle) {
	return booksFor(bundle).prices;
}
function historyLabel(report) {
	const through = report.partial ? `Finished months through ${formatMonth(report.end)}.` : `Through ${formatMonth(report.end)}.`;
	return `History from ${formatMonth(report.start)}. ${through} Dividend-adjusted prices, so this assumes dividends were reinvested.`;
}
var CHECKS = [
	"An emergency fund stays outside this",
	"I can leave this money for the years I set",
	"I won't sell just because the number falls",
	"I'll place the order at my own broker"
];
var ORDER = [
	"threefund",
	"gem",
	"faber"
];
function GroveApp({ market }) {
	const profile = useGrove((state) => state.profile);
	const fills = useGrove((state) => state.fills);
	const ready = useGrove((state) => state.ready);
	const setProfile = useGrove((state) => state.setProfile);
	const addFills = useGrove((state) => state.addFills);
	const undoLast = useGrove((state) => state.undoLast);
	const [checks, setChecks] = (0, import_react.useState)([
		false,
		false,
		false,
		false
	]);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useGrove.persist.rehydrate();
		setMounted(true);
	}, []);
	const weights = (0, import_react.useMemo)(() => threeFundWeights(profile.drop, profile.years), [profile.drop, profile.years]);
	const suggestion = recommend(profile);
	const active = profile.override ?? suggestion.id;
	const reports = (0, import_react.useMemo)(() => {
		const next = {};
		for (const id of ORDER) next[id] = evaluate(market, id, profile.monthly, id === "threefund" ? weights : void 0);
		return next;
	}, [
		market,
		profile.monthly,
		weights
	]);
	const report = reports[active];
	const prices = (0, import_react.useMemo)(() => spotPrices(market), [market]);
	const book = (0, import_react.useMemo)(() => positions(fills), [fills]);
	const rows = Object.values(book).filter((position) => position.shares > 0);
	const bookValue = rows.reduce((sum, position) => sum + position.shares * (prices[position.symbol] ?? 0), 0);
	const offTarget = report ? needsMatch(book, prices, report.live.weights) : false;
	const log = (kind) => {
		if (!report || !ready) return;
		const at = (/* @__PURE__ */ new Date()).toISOString();
		const next = kind === "deposit" ? depositFills(report.live.lines, at) : rebalanceFills(book, prices, report.live.weights, 0, at);
		if (!next.length) {
			setNotice("Nothing to log — the book already matches.");
			return;
		}
		addFills(next);
		const spent = next.filter((fill) => fill.side === "buy").reduce((sum, fill) => sum + fill.dollars, 0);
		setNotice(kind === "deposit" ? `Logged a ${formatUsd(spent)} deposit.` : "Logged a move of what you already held.");
	};
	const copyTicket = async () => {
		if (!report) return;
		const text = [`Grove ticket · ${formatMonth(report.live.month)}`, ...report.live.lines.map((line) => `Buy ${formatUsd(line.dollars, 2)} ${line.symbol}`)].join("\n");
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
		} catch {
			setCopied(false);
			setNotice(text);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-2xl bg-forest text-paper",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, {
							"aria-hidden": "true",
							className: "size-5"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none text-ink",
						children: "Grove"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Monthly buy guide"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-right text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-ink",
						children: formatStamp(market.fetchedAt)
					}), market.source === "live" ? "Live monthly prices" : "Saved prices"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0 lg:col-span-5 lg:sticky lg:top-4 lg:self-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl leading-tight text-ink",
							children: "Where this month's money goes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Three rules investors have already published and used. Grove turns the one you pick into a buy ticket. It does not send orders, and it does not promise a gain."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted",
										children: "Amount each month"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex h-11 items-center rounded-xl border border-line bg-paper px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: "$"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "h-full w-full bg-transparent px-2 text-ink tabular-nums outline-none",
											inputMode: "decimal",
											min: 0,
											step: 50,
											type: "number",
											value: profile.monthly,
											onChange: (event) => {
												const next = Number(event.target.value);
												setProfile({ monthly: Number.isFinite(next) ? Math.min(1e5, Math.max(0, Math.round(next))) : 0 });
											}
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-baseline justify-between text-sm text-muted",
										children: ["Years you can leave it", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-xl text-ink tabular-nums",
											children: profile.years
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"aria-valuemax": 40,
										"aria-valuemin": 1,
										"aria-valuenow": profile.years,
										className: "h-11 w-full",
										max: 40,
										min: 1,
										type: "range",
										value: profile.years,
										onChange: (event) => setProfile({ years: Number(event.target.value) })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
										className: "text-sm text-muted",
										children: "A drop of this size would make me want to sell"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-2",
										children: [
											10,
											25,
											40
										].map((drop) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											"aria-pressed": profile.drop === drop,
											className: choiceClass(profile.drop === drop),
											type: "button",
											onClick: () => setProfile({ drop }),
											children: [drop, "%"]
										}, drop))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
											className: "text-sm text-muted",
											children: "How should the ticket be chosen?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"aria-pressed": profile.style === "schedule",
											className: choiceClass(profile.style === "schedule"),
											type: "button",
											onClick: () => setProfile({
												style: "schedule",
												override: null
											}),
											children: "Same mix every month"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"aria-pressed": profile.style === "rule",
											className: choiceClass(profile.style === "rule"),
											type: "button",
											onClick: () => setProfile({
												style: "rule",
												override: null
											}),
											children: "Follow a monthly switch rule"
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-2",
					children: CHECKS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"aria-pressed": checks[index],
						className: "flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-left text-sm",
						type: "button",
						onClick: () => setChecks((current) => current.map((value, item) => item === index ? !value : value)),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `flex size-5 shrink-0 items-center justify-center rounded-md border ${checks[index] ? "border-forest bg-forest text-paper" : "border-line bg-paper"}`,
							"aria-hidden": "true",
							children: checks[index] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "size-3",
								strokeWidth: 3
							}) : null
						}), label]
					}) }, label))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid min-w-0 gap-4 lg:col-span-7",
				children: [
					report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, {
						active,
						copied,
						notice,
						offTarget: offTarget && rows.length > 0,
						ready,
						report,
						suggested: suggestion.id,
						because: suggestion.because,
						onCopy: () => void copyTicket(),
						onDeposit: () => log("deposit"),
						onMatch: () => log("match"),
						onUse: (id) => setProfile({ override: id === suggestion.id ? null : id })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl border border-line bg-card p-5",
						children: "Price history didn't load. Try the page again in a moment."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3",
						children: ORDER.map((id) => {
							const item = reports[id];
							const copy = strategyCopy(id);
							const selected = id === active;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								"aria-pressed": selected,
								className: `rounded-2xl border p-4 text-left ${selected ? "border-forest bg-leaf" : "border-line bg-card"}`,
								type: "button",
								onClick: () => setProfile({ override: id === suggestion.id ? null : id }),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-2xl",
											children: copy.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted",
											children: copy.aka
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm text-muted",
										children: copy.blurb
									}),
									item ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											formatPct(item.cagr, 1),
											" a year since ",
											formatMonth(item.start)
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-copper",
											children: ["Worst drop ", formatPct(item.maxDrawdown, 0)]
										})]
									}) : null
								]
							}, id);
						})
					}),
					report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Past, {
						report,
						mounted,
						monthly: profile.monthly
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Book, {
						bookValue,
						canUndo: fills.length > 0,
						prices,
						ready,
						rows,
						target: report?.live.weights ?? {},
						onUndo: () => {
							undoLast();
							setNotice("Removed the last log.");
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowTo, { nextMonth: report ? formatMonth(addMonths(report.live.month, 1)) : "next month" })
				]
			})]
		})]
	});
}
function choiceClass(on) {
	return `min-h-11 rounded-xl border px-3 text-sm ${on ? "border-forest bg-forest text-paper" : "border-line bg-paper text-ink"}`;
}
function Ticket({ report, active, suggested, because, copied, notice, ready, offTarget, onCopy, onDeposit, onMatch, onUse }) {
	const copy = strategyCopy(active);
	const monthly = report.live.lines.reduce((sum, line) => sum + line.dollars, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-copper",
				children: [
					formatMonth(report.live.month),
					" ticket · ",
					copy.name
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-1 font-display text-4xl tabular-nums text-ink",
				children: formatUsd(monthly)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: report.live.note
			}),
			active !== suggested ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mt-3 text-sm text-forest underline",
				type: "button",
				onClick: () => onUse(suggested),
				children: "Use the suggested rule instead"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: because
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-y border-line",
				children: report.live.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: line.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-muted",
						children: line.detail
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-right tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: formatUsd(line.dollars, 2)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-sm text-muted",
							children: [
								formatShares(line.shares),
								" sh @ ",
								formatUsd(line.price, 2)
							]
						})]
					})]
				}, line.symbol))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-4 grid gap-3 sm:grid-cols-3",
				children: report.live.facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: fact.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-medium tabular-nums",
						children: fact.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-sm text-muted",
						children: fact.hint
					})
				] }, fact.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-2 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 rounded-xl bg-forest px-4 text-paper disabled:opacity-50",
						disabled: !ready || monthly <= 0,
						type: "button",
						onClick: onDeposit,
						children: "I placed this deposit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 rounded-xl border border-line bg-paper px-4",
						type: "button",
						onClick: onCopy,
						children: copied ? "Copied" : "Copy the ticket"
					}),
					offTarget ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 rounded-xl border border-forest px-4 text-forest sm:col-span-2",
						disabled: !ready,
						type: "button",
						onClick: onMatch,
						children: "I also moved the old holdings to this rule"
					}) : null
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: notice
			}) : null
		]
	});
}
function Past({ report, mounted, monthly }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "What already happened"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [historyLabel(report), " Not a forecast."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: "$10,000 once, this rule"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-display text-3xl tabular-nums",
						children: formatUsd(report.lumpEnd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-sm text-muted",
						children: [
							formatPct(report.cagr),
							" a year · worst drop ",
							formatPct(report.maxDrawdown, 0)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: report.benchLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-display text-3xl tabular-nums",
						children: formatUsd(report.benchEnd)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "text-sm text-muted",
						children: [
							formatPct(report.benchCagr),
							" a year · worst drop ",
							formatPct(report.benchMaxDrawdown, 0)
						]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-56 w-full min-w-0",
				"aria-hidden": !mounted,
				children: mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: report.curve,
						margin: {
							top: 8,
							right: 0,
							left: 0,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								hide: true,
								domain: ["auto", "auto"],
								width: 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
								if (!active || !payload?.length || typeof label !== "string") return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-line bg-card px-3 py-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: formatMonth(label) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "tabular-nums text-forest",
											children: ["Rule ", formatUsd(Number(payload[0]?.value ?? 0))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "tabular-nums text-copper",
											children: ["Compare ", formatUsd(Number(payload[1]?.value ?? 0))]
										})
									]
								});
							} }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "strategy",
								stroke: "var(--color-forest)",
								strokeWidth: 2,
								dot: false,
								isAnimationActive: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "bench",
								stroke: "var(--color-copper)",
								strokeWidth: 1.5,
								dot: false,
								isAnimationActive: false
							})
						]
					})
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					"Forest is the rule. Copper is the comparison.",
					report.benchEnd > report.lumpEnd ? " In this window the comparison finished higher. What the rule changed was the path, including the worst drop — not a promise of a bigger ending number." : " In this window the rule finished higher than the comparison. That is history, not a promise it will again.",
					" ",
					formatUsd(monthly),
					" every month from ",
					formatMonth(report.start),
					" would have become",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-ink tabular-nums",
						children: formatUsd(report.dca.end)
					}),
					" after putting in",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatUsd(report.dca.contributed)
					}),
					". The comparison with the same deposits:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatUsd(report.dca.benchEnd)
					}),
					"."
				]
			})
		]
	});
}
function Book({ rows, prices, bookValue, target, canUndo, ready, onUndo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Paper book"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "tabular-nums",
					children: rows.length ? formatUsd(bookValue) : "Nothing logged"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "This is your record of orders you placed yourself. Grove does not hold the shares."
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm",
				children: "When you buy at your broker, tap “I placed this deposit” and it will show up here."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-y border-line",
				children: rows.map((row) => {
					const price = prices[row.symbol] ?? 0;
					const value = row.shares * price;
					const weight = bookValue > 0 ? value / bookValue : 0;
					const goal = target[row.symbol] ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[1fr_auto] gap-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: row.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								FUNDS[row.symbol]?.name ?? "Logged fund",
								" · ",
								formatShares(row.shares),
								" shares"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-right tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block",
								children: formatUsd(value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									Math.round(weight * 100),
									"% now · ",
									Math.round(goal * 100),
									"% rule"
								]
							})]
						})]
					}, row.symbol);
				})
			}),
			canUndo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "mt-4 min-h-11 text-sm text-forest underline",
				disabled: !ready,
				type: "button",
				onClick: onUndo,
				children: "Undo the last log"
			}) : null
		]
	});
}
function HowTo({ nextMonth }) {
	const steps = [
		"Open the brokerage account you already use. Grove never sees that login.",
		"Search the ticker on the ticket. Choose Buy, in dollars if the broker allows it.",
		"A market order is enough for these large funds while the market is open, 9:30am to 4:00pm Eastern. Use a limit order if you want a ceiling.",
		"Repeat for each line. If the broker only sells whole shares, buy the most whole shares the dollars cover.",
		"Come back and tap “I placed this deposit” so the paper book matches.",
		`Open Grove again in ${nextMonth}. The switch rules are checked once a month, not every day.`
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-line bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Place it yourself"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 grid gap-3",
				children: steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "grid grid-cols-[2rem_1fr] gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl text-forest",
						children: index + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: step })]
				}, step))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Grove is a calculator, not a broker or an adviser. Funds can lose money. The chart is the past record of a published rule on real monthly prices. Taxes, fund fees, and trading spreads are not included."
			})
		]
	});
}
function Home() {
	const { market } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroveApp, { market });
}
//#endregion
export { Home as component };
