import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { i as parseYahooChart, n as QUOTE_SYMBOLS } from "./shape-DduZPGIc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes-D8VyX4OH.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var TTL_MS = 18e5;
var memo = null;
async function fetchSymbol(symbol) {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=max`;
	const response = await fetch(url, {
		headers: { "user-agent": "Mozilla/5.0" },
		signal: AbortSignal.timeout(12e3)
	});
	if (!response.ok) throw new Error(`Price request failed for ${symbol}`);
	return parseYahooChart(symbol, await response.json());
}
var getMarket_createServerFn_handler = createServerRpc({
	id: "dcb6a66934d86a6b3914a6c724401dea17492057d2a3afde0b5a356a62ce1b42",
	name: "getMarket",
	filename: "src/lib/market/quotes.ts"
}, (opts) => getMarket.__executeServer(opts));
var getMarket = createServerFn({ method: "GET" }).handler(getMarket_createServerFn_handler, async () => {
	if (memo && Date.now() - memo.at < TTL_MS) return memo.data;
	const pairs = await Promise.all(QUOTE_SYMBOLS.map(async (symbol) => [symbol, await fetchSymbol(symbol)]));
	const data = {
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		source: "live",
		series: Object.fromEntries(pairs)
	};
	memo = {
		at: Date.now(),
		data
	};
	return data;
});
//#endregion
export { getMarket_createServerFn_handler };
