//#region node_modules/.nitro/vite/services/ssr/assets/shape-DduZPGIc.js
var FUNDS = {
	SPY: {
		name: "S&P 500",
		detail: "SPY · large US companies"
	},
	EFA: {
		name: "International",
		detail: "EFA · developed markets"
	},
	AGG: {
		name: "US bonds",
		detail: "AGG · investment-grade bonds"
	},
	BIL: {
		name: "T-bills",
		detail: "BIL · short-term Treasuries"
	},
	VTI: {
		name: "US total market",
		detail: "VTI · nearly all US stocks"
	},
	VXUS: {
		name: "International",
		detail: "VXUS · stocks outside the US"
	},
	BND: {
		name: "US bonds",
		detail: "BND · broad US bond market"
	}
};
var QUOTE_SYMBOLS = [
	"SPY",
	"EFA",
	"AGG",
	"BIL",
	"VTI",
	"VXUS",
	"BND"
];
function monthKey(unixSeconds) {
	const date = /* @__PURE__ */ new Date(unixSeconds * 1e3);
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	return `${date.getUTCFullYear()}-${month}`;
}
function parseYahooChart(symbol, payload) {
	const result = payload?.chart?.result?.[0];
	if (!result) throw new Error(`No price history for ${symbol}`);
	const timestamps = result.timestamp;
	const indicators = result.indicators;
	const adjusted = indicators?.adjclose?.[0]?.adjclose ?? [];
	const closes = indicators?.quote?.[0]?.close ?? [];
	if (!timestamps?.length) throw new Error(`No price history for ${symbol}`);
	const byMonth = /* @__PURE__ */ new Map();
	for (let index = 0; index < timestamps.length; index += 1) {
		const price = adjusted[index] ?? closes[index];
		if (price == null || !Number.isFinite(price) || price <= 0) continue;
		byMonth.set(monthKey(timestamps[index]), Math.round(price * 1e4) / 1e4);
	}
	const points = [...byMonth.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([d, c]) => ({
		d,
		c
	}));
	if (points.length < 13) throw new Error(`Price history for ${symbol} is too short`);
	return {
		name: FUNDS[symbol]?.name ?? symbol,
		points
	};
}
function fromSnapshot(raw) {
	const series = {};
	for (const symbol of QUOTE_SYMBOLS) {
		const points = raw.series[symbol]?.series;
		if (!points?.length) throw new Error(`Snapshot is missing ${symbol}`);
		series[symbol] = {
			name: FUNDS[symbol].name,
			points: points.map((point) => ({
				d: point.d,
				c: point.c
			}))
		};
	}
	return {
		fetchedAt: raw.fetchedAt,
		source: "snapshot",
		series
	};
}
//#endregion
export { parseYahooChart as i, QUOTE_SYMBOLS as n, fromSnapshot as r, FUNDS as t };
