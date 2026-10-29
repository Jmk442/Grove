import { i as __toESM } from "../_runtime.mjs";
import { _ as createFileRoute, b as require_jsx_runtime, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, q as require_react, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { r as fromSnapshot } from "./shape-DduZPGIc.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router--D-I2Fby.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CwP0vw_L.css";
var APP_NAME = "Grove";
var Route$1 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "A monthly stock-buying ticket from investing rules people have already used."
			},
			{
				name: "theme-color",
				content: "#1f4a38"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Outfit:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var snapshot_default = {
	fetchedAt: "2026-10-29T05:35:27Z",
	series: /* @__PURE__ */ JSON.parse("{\"SPY\":{\"name\":\"State Street SPDR S&P 500 ETF T\",\"currency\":\"USD\",\"last\":772.31,\"series\":[{\"d\":\"1993-02\",\"c\":24.3101},{\"d\":\"1993-03\",\"c\":24.8547},{\"d\":\"1993-04\",\"c\":24.2187},{\"d\":\"1993-05\",\"c\":24.8719},{\"d\":\"1993-06\",\"c\":24.9616},{\"d\":\"1993-07\",\"c\":24.8404},{\"d\":\"1993-08\",\"c\":25.7925},{\"d\":\"1993-09\",\"c\":25.6048},{\"d\":\"1993-10\",\"c\":26.11},{\"d\":\"1993-11\",\"c\":25.8313},{\"d\":\"1993-12\",\"c\":26.1484},{\"d\":\"1994-01\",\"c\":27.0603},{\"d\":\"1994-02\",\"c\":26.2712},{\"d\":\"1994-03\",\"c\":25.1704},{\"d\":\"1994-04\",\"c\":25.4526},{\"d\":\"1994-05\",\"c\":25.8583},{\"d\":\"1994-06\",\"c\":25.2658},{\"d\":\"1994-07\",\"c\":26.0825},{\"d\":\"1994-08\",\"c\":27.0768},{\"d\":\"1994-09\",\"c\":26.393},{\"d\":\"1994-10\",\"c\":27.1432},{\"d\":\"1994-11\",\"c\":26.0625},{\"d\":\"1994-12\",\"c\":26.2523},{\"d\":\"1995-01\",\"c\":27.1346},{\"d\":\"1995-02\",\"c\":28.2419},{\"d\":\"1995-03\",\"c\":29.0284},{\"d\":\"1995-04\",\"c\":29.8883},{\"d\":\"1995-05\",\"c\":31.074},{\"d\":\"1995-06\",\"c\":31.7027},{\"d\":\"1995-07\",\"c\":32.7224},{\"d\":\"1995-08\",\"c\":32.868},{\"d\":\"1995-09\",\"c\":34.2609},{\"d\":\"1995-10\",\"c\":34.1602},{\"d\":\"1995-11\",\"c\":35.6797},{\"d\":\"1995-12\",\"c\":36.241},{\"d\":\"1996-01\",\"c\":37.5304},{\"d\":\"1996-02\",\"c\":37.6501},{\"d\":\"1996-03\",\"c\":38.2984},{\"d\":\"1996-04\",\"c\":38.7147},{\"d\":\"1996-05\",\"c\":39.5935},{\"d\":\"1996-06\",\"c\":39.9428},{\"d\":\"1996-07\",\"c\":38.1479},{\"d\":\"1996-08\",\"c\":38.8826},{\"d\":\"1996-09\",\"c\":41.0551},{\"d\":\"1996-10\",\"c\":42.3824},{\"d\":\"1996-11\",\"c\":45.4765},{\"d\":\"1996-12\",\"c\":44.3943},{\"d\":\"1997-01\",\"c\":47.1372},{\"d\":\"1997-02\",\"c\":47.5882},{\"d\":\"1997-03\",\"c\":45.4884},{\"d\":\"1997-04\",\"c\":48.3362},{\"d\":\"1997-05\",\"c\":51.3914},{\"d\":\"1997-06\",\"c\":53.5036},{\"d\":\"1997-07\",\"c\":57.7446},{\"d\":\"1997-08\",\"c\":54.7532},{\"d\":\"1997-09\",\"c\":57.3863},{\"d\":\"1997-10\",\"c\":55.9802},{\"d\":\"1997-11\",\"c\":58.1464},{\"d\":\"1997-12\",\"c\":59.2554},{\"d\":\"1998-01\",\"c\":60.0185},{\"d\":\"1998-02\",\"c\":64.1774},{\"d\":\"1998-03\",\"c\":67.3082},{\"d\":\"1998-04\",\"c\":68.1692},{\"d\":\"1998-05\",\"c\":66.7534},{\"d\":\"1998-06\",\"c\":69.5953},{\"d\":\"1998-07\",\"c\":68.6548},{\"d\":\"1998-08\",\"c\":58.9621},{\"d\":\"1998-09\",\"c\":62.7145},{\"d\":\"1998-10\",\"c\":67.7994},{\"d\":\"1998-11\",\"c\":71.5746},{\"d\":\"1998-12\",\"c\":76.2572},{\"d\":\"1999-01\",\"c\":78.9434},{\"d\":\"1999-02\",\"c\":76.4118},{\"d\":\"1999-03\",\"c\":79.5804},{\"d\":\"1999-04\",\"c\":82.6024},{\"d\":\"1999-05\",\"c\":80.7137},{\"d\":\"1999-06\",\"c\":85.1835},{\"d\":\"1999-07\",\"c\":82.5409},{\"d\":\"1999-08\",\"c\":82.1134},{\"d\":\"1999-09\",\"c\":80.2793},{\"d\":\"1999-10\",\"c\":85.4234},{\"d\":\"1999-11\",\"c\":86.8459},{\"d\":\"1999-12\",\"c\":91.8056},{\"d\":\"2000-01\",\"c\":87.2348},{\"d\":\"2000-02\",\"c\":85.9065},{\"d\":\"2000-03\",\"c\":94.2321},{\"d\":\"2000-04\",\"c\":90.9226},{\"d\":\"2000-05\",\"c\":89.4931},{\"d\":\"2000-06\",\"c\":91.2545},{\"d\":\"2000-07\",\"c\":89.8216},{\"d\":\"2000-08\",\"c\":95.6906},{\"d\":\"2000-09\",\"c\":90.4408},{\"d\":\"2000-10\",\"c\":90.0177},{\"d\":\"2000-11\",\"c\":83.2976},{\"d\":\"2000-12\",\"c\":82.8623},{\"d\":\"2001-01\",\"c\":86.5463},{\"d\":\"2001-02\",\"c\":78.2909},{\"d\":\"2001-03\",\"c\":73.9036},{\"d\":\"2001-04\",\"c\":80.218},{\"d\":\"2001-05\",\"c\":79.7683},{\"d\":\"2001-06\",\"c\":77.8675},{\"d\":\"2001-07\",\"c\":77.0735},{\"d\":\"2001-08\",\"c\":72.5006},{\"d\":\"2001-09\",\"c\":66.5823},{\"d\":\"2001-10\",\"c\":67.4493},{\"d\":\"2001-11\",\"c\":72.7089},{\"d\":\"2001-12\",\"c\":73.1189},{\"d\":\"2002-01\",\"c\":72.4024},{\"d\":\"2002-02\",\"c\":71.1038},{\"d\":\"2002-03\",\"c\":73.4695},{\"d\":\"2002-04\",\"c\":69.1968},{\"d\":\"2002-05\",\"c\":68.7862},{\"d\":\"2002-06\",\"c\":63.7093},{\"d\":\"2002-07\",\"c\":58.6877},{\"d\":\"2002-08\",\"c\":59.0869},{\"d\":\"2002-09\",\"c\":52.8915},{\"d\":\"2002-10\",\"c\":57.2436},{\"d\":\"2002-11\",\"c\":60.7745},{\"d\":\"2002-12\",\"c\":57.3364},{\"d\":\"2003-01\",\"c\":55.9263},{\"d\":\"2003-02\",\"c\":55.1724},{\"d\":\"2003-03\",\"c\":55.2905},{\"d\":\"2003-04\",\"c\":59.9687},{\"d\":\"2003-05\",\"c\":63.2572},{\"d\":\"2003-06\",\"c\":63.931},{\"d\":\"2003-07\",\"c\":65.0834},{\"d\":\"2003-08\",\"c\":66.4259},{\"d\":\"2003-09\",\"c\":65.7015},{\"d\":\"2003-10\",\"c\":69.2182},{\"d\":\"2003-11\",\"c\":69.9742},{\"d\":\"2003-12\",\"c\":73.4948},{\"d\":\"2004-01\",\"c\":74.9478},{\"d\":\"2004-02\",\"c\":75.9648},{\"d\":\"2004-03\",\"c\":74.9587},{\"d\":\"2004-04\",\"c\":73.5403},{\"d\":\"2004-05\",\"c\":74.7996},{\"d\":\"2004-06\",\"c\":76.1835},{\"d\":\"2004-07\",\"c\":73.729},{\"d\":\"2004-08\",\"c\":73.9086},{\"d\":\"2004-09\",\"c\":74.6504},{\"d\":\"2004-10\",\"c\":75.6122},{\"d\":\"2004-11\",\"c\":78.9783},{\"d\":\"2004-12\",\"c\":81.3572},{\"d\":\"2005-01\",\"c\":79.5331},{\"d\":\"2005-02\",\"c\":81.1957},{\"d\":\"2005-03\",\"c\":79.7103},{\"d\":\"2005-04\",\"c\":78.2169},{\"d\":\"2005-05\",\"c\":80.7375},{\"d\":\"2005-06\",\"c\":80.8598},{\"d\":\"2005-07\",\"c\":83.9536},{\"d\":\"2005-08\",\"c\":83.1666},{\"d\":\"2005-09\",\"c\":83.834},{\"d\":\"2005-10\",\"c\":81.8513},{\"d\":\"2005-11\",\"c\":85.4488},{\"d\":\"2005-12\",\"c\":85.2853},{\"d\":\"2006-01\",\"c\":87.3334},{\"d\":\"2006-02\",\"c\":87.8334},{\"d\":\"2006-03\",\"c\":89.283},{\"d\":\"2006-04\",\"c\":90.4109},{\"d\":\"2006-05\",\"c\":87.6875},{\"d\":\"2006-06\",\"c\":87.9162},{\"d\":\"2006-07\",\"c\":88.31},{\"d\":\"2006-08\",\"c\":90.2372},{\"d\":\"2006-09\",\"c\":92.6737},{\"d\":\"2006-10\",\"c\":95.5944},{\"d\":\"2006-11\",\"c\":97.4954},{\"d\":\"2006-12\",\"c\":98.799},{\"d\":\"2007-01\",\"c\":100.2849},{\"d\":\"2007-02\",\"c\":98.3176},{\"d\":\"2007-03\",\"c\":99.457},{\"d\":\"2007-04\",\"c\":103.8625},{\"d\":\"2007-05\",\"c\":107.3855},{\"d\":\"2007-06\",\"c\":105.8155},{\"d\":\"2007-07\",\"c\":102.5024},{\"d\":\"2007-08\",\"c\":103.8178},{\"d\":\"2007-09\",\"c\":107.837},{\"d\":\"2007-10\",\"c\":109.3},{\"d\":\"2007-11\",\"c\":105.0665},{\"d\":\"2007-12\",\"c\":103.8834},{\"d\":\"2008-01\",\"c\":97.6025},{\"d\":\"2008-02\",\"c\":95.0802},{\"d\":\"2008-03\",\"c\":94.23},{\"d\":\"2008-04\",\"c\":98.7212},{\"d\":\"2008-05\",\"c\":100.2135},{\"d\":\"2008-06\",\"c\":91.8381},{\"d\":\"2008-07\",\"c\":91.0128},{\"d\":\"2008-08\",\"c\":92.4193},{\"d\":\"2008-09\",\"c\":83.7159},{\"d\":\"2008-10\",\"c\":69.8872},{\"d\":\"2008-11\",\"c\":65.0225},{\"d\":\"2008-12\",\"c\":65.6595},{\"d\":\"2009-01\",\"c\":60.2679},{\"d\":\"2009-02\",\"c\":53.7922},{\"d\":\"2009-03\",\"c\":58.2737},{\"d\":\"2009-04\",\"c\":64.0629},{\"d\":\"2009-05\",\"c\":67.8076},{\"d\":\"2009-06\",\"c\":67.7632},{\"d\":\"2009-07\",\"c\":72.8187},{\"d\":\"2009-08\",\"c\":75.5086},{\"d\":\"2009-09\",\"c\":78.186},{\"d\":\"2009-10\",\"c\":76.6828},{\"d\":\"2009-11\",\"c\":81.407},{\"d\":\"2009-12\",\"c\":82.962},{\"d\":\"2010-01\",\"c\":79.9469},{\"d\":\"2010-02\",\"c\":82.4408},{\"d\":\"2010-03\",\"c\":87.4598},{\"d\":\"2010-04\",\"c\":88.8128},{\"d\":\"2010-05\",\"c\":81.7562},{\"d\":\"2010-06\",\"c\":77.5261},{\"d\":\"2010-07\",\"c\":82.8212},{\"d\":\"2010-08\",\"c\":79.0958},{\"d\":\"2010-09\",\"c\":86.1792},{\"d\":\"2010-10\",\"c\":89.4715},{\"d\":\"2010-11\",\"c\":89.4715},{\"d\":\"2010-12\",\"c\":95.4528},{\"d\":\"2011-01\",\"c\":97.6769},{\"d\":\"2011-02\",\"c\":101.0699},{\"d\":\"2011-03\",\"c\":101.0821},{\"d\":\"2011-04\",\"c\":104.0096},{\"d\":\"2011-05\",\"c\":102.8431},{\"d\":\"2011-06\",\"c\":101.1082},{\"d\":\"2011-07\",\"c\":99.0856},{\"d\":\"2011-08\",\"c\":93.6383},{\"d\":\"2011-09\",\"c\":87.1378},{\"d\":\"2011-10\",\"c\":96.6487},{\"d\":\"2011-11\",\"c\":96.2559},{\"d\":\"2011-12\",\"c\":97.2617},{\"d\":\"2012-01\",\"c\":101.7721},{\"d\":\"2012-02\",\"c\":106.1895},{\"d\":\"2012-03\",\"c\":109.605},{\"d\":\"2012-04\",\"c\":108.8733},{\"d\":\"2012-05\",\"c\":102.3349},{\"d\":\"2012-06\",\"c\":106.4878},{\"d\":\"2012-07\",\"c\":107.7475},{\"d\":\"2012-08\",\"c\":110.4468},{\"d\":\"2012-09\",\"c\":113.2467},{\"d\":\"2012-10\",\"c\":111.1858},{\"d\":\"2012-11\",\"c\":111.8151},{\"d\":\"2012-12\",\"c\":112.8142},{\"d\":\"2013-01\",\"c\":118.589},{\"d\":\"2013-02\",\"c\":120.1022},{\"d\":\"2013-03\",\"c\":124.6626},{\"d\":\"2013-04\",\"c\":127.0577},{\"d\":\"2013-05\",\"c\":130.0574},{\"d\":\"2013-06\",\"c\":128.3219},{\"d\":\"2013-07\",\"c\":134.9532},{\"d\":\"2013-08\",\"c\":130.9056},{\"d\":\"2013-09\",\"c\":135.0483},{\"d\":\"2013-10\",\"c\":141.3019},{\"d\":\"2013-11\",\"c\":145.4898},{\"d\":\"2013-12\",\"c\":149.2619},{\"d\":\"2014-01\",\"c\":144.0006},{\"d\":\"2014-02\",\"c\":150.5549},{\"d\":\"2014-03\",\"c\":151.8039},{\"d\":\"2014-04\",\"c\":152.8591},{\"d\":\"2014-05\",\"c\":156.4064},{\"d\":\"2014-06\",\"c\":159.6354},{\"d\":\"2014-07\",\"c\":157.4903},{\"d\":\"2014-08\",\"c\":163.7054},{\"d\":\"2014-09\",\"c\":161.4469},{\"d\":\"2014-10\",\"c\":165.2491},{\"d\":\"2014-11\",\"c\":169.7888},{\"d\":\"2014-12\",\"c\":169.3582},{\"d\":\"2015-01\",\"c\":164.3402},{\"d\":\"2015-02\",\"c\":173.5769},{\"d\":\"2015-03\",\"c\":170.8508},{\"d\":\"2015-04\",\"c\":172.5308},{\"d\":\"2015-05\",\"c\":174.7489},{\"d\":\"2015-06\",\"c\":171.1995},{\"d\":\"2015-07\",\"c\":175.0667},{\"d\":\"2015-08\",\"c\":164.3964},{\"d\":\"2015-09\",\"c\":160.2016},{\"d\":\"2015-10\",\"c\":173.8284},{\"d\":\"2015-11\",\"c\":174.4637},{\"d\":\"2015-12\",\"c\":171.4485},{\"d\":\"2016-01\",\"c\":162.9127},{\"d\":\"2016-02\",\"c\":162.7781},{\"d\":\"2016-03\",\"c\":173.7275},{\"d\":\"2016-04\",\"c\":174.4122},{\"d\":\"2016-05\",\"c\":177.3793},{\"d\":\"2016-06\",\"c\":177.9958},{\"d\":\"2016-07\",\"c\":184.4876},{\"d\":\"2016-08\",\"c\":184.7085},{\"d\":\"2016-09\",\"c\":184.7192},{\"d\":\"2016-10\",\"c\":181.5168},{\"d\":\"2016-11\",\"c\":188.2035},{\"d\":\"2016-12\",\"c\":192.0187},{\"d\":\"2017-01\",\"c\":195.4549},{\"d\":\"2017-02\",\"c\":203.1346},{\"d\":\"2017-03\",\"c\":203.3885},{\"d\":\"2017-04\",\"c\":205.4073},{\"d\":\"2017-05\",\"c\":208.3062},{\"d\":\"2017-06\",\"c\":209.6342},{\"d\":\"2017-07\",\"c\":213.943},{\"d\":\"2017-08\",\"c\":214.5672},{\"d\":\"2017-09\",\"c\":218.8907},{\"d\":\"2017-10\",\"c\":224.0486},{\"d\":\"2017-11\",\"c\":230.8969},{\"d\":\"2017-12\",\"c\":233.6971},{\"d\":\"2018-01\",\"c\":246.8681},{\"d\":\"2018-02\",\"c\":237.892},{\"d\":\"2018-03\",\"c\":231.3712},{\"d\":\"2018-04\",\"c\":232.5669},{\"d\":\"2018-05\",\"c\":238.2204},{\"d\":\"2018-06\",\"c\":239.5905},{\"d\":\"2018-07\",\"c\":248.4664},{\"d\":\"2018-08\",\"c\":256.3974},{\"d\":\"2018-09\",\"c\":257.9218},{\"d\":\"2018-10\",\"c\":240.0984},{\"d\":\"2018-11\",\"c\":244.552},{\"d\":\"2018-12\",\"c\":223.0196},{\"d\":\"2019-01\",\"c\":240.8758},{\"d\":\"2019-02\",\"c\":248.6839},{\"d\":\"2019-03\",\"c\":253.1853},{\"d\":\"2019-04\",\"c\":263.5285},{\"d\":\"2019-05\",\"c\":246.7229},{\"d\":\"2019-06\",\"c\":263.8915},{\"d\":\"2019-07\",\"c\":267.8814},{\"d\":\"2019-08\",\"c\":263.3962},{\"d\":\"2019-09\",\"c\":268.5214},{\"d\":\"2019-10\",\"c\":274.457},{\"d\":\"2019-11\",\"c\":284.3918},{\"d\":\"2019-12\",\"c\":292.6549},{\"d\":\"2020-01\",\"c\":292.5367},{\"d\":\"2020-02\",\"c\":269.3779},{\"d\":\"2020-03\",\"c\":235.7403},{\"d\":\"2020-04\",\"c\":265.6754},{\"d\":\"2020-05\",\"c\":278.3335},{\"d\":\"2020-06\",\"c\":283.2696},{\"d\":\"2020-07\",\"c\":299.952},{\"d\":\"2020-08\",\"c\":320.8877},{\"d\":\"2020-09\",\"c\":308.8725},{\"d\":\"2020-10\",\"c\":301.1712},{\"d\":\"2020-11\",\"c\":333.9317},{\"d\":\"2020-12\",\"c\":346.3033},{\"d\":\"2021-01\",\"c\":342.7742},{\"d\":\"2021-02\",\"c\":352.3053},{\"d\":\"2021-03\",\"c\":368.2997},{\"d\":\"2021-04\",\"c\":387.7867},{\"d\":\"2021-05\",\"c\":390.3329},{\"d\":\"2021-06\",\"c\":399.087},{\"d\":\"2021-07\",\"c\":408.8297},{\"d\":\"2021-08\",\"c\":420.9964},{\"d\":\"2021-09\",\"c\":401.3758},{\"d\":\"2021-10\",\"c\":429.5376},{\"d\":\"2021-11\",\"c\":426.0864},{\"d\":\"2021-12\",\"c\":445.7919},{\"d\":\"2022-01\",\"c\":422.2803},{\"d\":\"2022-02\",\"c\":409.8159},{\"d\":\"2022-03\",\"c\":425.2209},{\"d\":\"2022-04\",\"c\":387.8997},{\"d\":\"2022-05\",\"c\":388.7754},{\"d\":\"2022-06\",\"c\":356.7168},{\"d\":\"2022-07\",\"c\":389.5659},{\"d\":\"2022-08\",\"c\":373.6708},{\"d\":\"2022-09\",\"c\":339.1265},{\"d\":\"2022-10\",\"c\":366.6892},{\"d\":\"2022-11\",\"c\":387.0739},{\"d\":\"2022-12\",\"c\":364.7676},{\"d\":\"2023-01\",\"c\":387.7069},{\"d\":\"2023-02\",\"c\":377.9589},{\"d\":\"2023-03\",\"c\":391.9728},{\"d\":\"2023-04\",\"c\":398.2345},{\"d\":\"2023-05\",\"c\":400.0729},{\"d\":\"2023-06\",\"c\":425.9975},{\"d\":\"2023-07\",\"c\":439.9418},{\"d\":\"2023-08\",\"c\":432.7919},{\"d\":\"2023-09\",\"c\":412.2626},{\"d\":\"2023-10\",\"c\":403.3129},{\"d\":\"2023-11\",\"c\":440.153},{\"d\":\"2023-12\",\"c\":460.2484},{\"d\":\"2024-01\",\"c\":467.5786},{\"d\":\"2024-02\",\"c\":491.98},{\"d\":\"2024-03\",\"c\":508.0687},{\"d\":\"2024-04\",\"c\":487.5836},{\"d\":\"2024-05\",\"c\":512.2454},{\"d\":\"2024-06\",\"c\":530.3174},{\"d\":\"2024-07\",\"c\":536.7391},{\"d\":\"2024-08\",\"c\":549.2805},{\"d\":\"2024-09\",\"c\":560.8178},{\"d\":\"2024-10\",\"c\":555.8133},{\"d\":\"2024-11\",\"c\":588.9584},{\"d\":\"2024-12\",\"c\":574.788},{\"d\":\"2025-01\",\"c\":590.2247},{\"d\":\"2025-02\",\"c\":582.7319},{\"d\":\"2025-03\",\"c\":550.2625},{\"d\":\"2025-04\",\"c\":545.4917},{\"d\":\"2025-05\",\"c\":579.7731},{\"d\":\"2025-06\",\"c\":609.5654},{\"d\":\"2025-07\",\"c\":623.6046},{\"d\":\"2025-08\",\"c\":636.4007},{\"d\":\"2025-09\",\"c\":659.0695},{\"d\":\"2025-10\",\"c\":674.78},{\"d\":\"2025-11\",\"c\":676.0958},{\"d\":\"2025-12\",\"c\":676.635},{\"d\":\"2026-01\",\"c\":686.6071},{\"d\":\"2026-02\",\"c\":680.6735},{\"d\":\"2026-03\",\"c\":647.0621},{\"d\":\"2026-04\",\"c\":715.0377},{\"d\":\"2026-05\",\"c\":752.6671},{\"d\":\"2026-06\",\"c\":744.9202},{\"d\":\"2026-07\",\"c\":745.1796},{\"d\":\"2026-08\",\"c\":765.15},{\"d\":\"2026-09\",\"c\":762.63},{\"d\":\"2026-10\",\"c\":772.31}]},\"EFA\":{\"name\":\"iShares MSCI EAFE ETF\",\"currency\":\"USD\",\"last\":103.68,\"series\":[{\"d\":\"2001-09\",\"c\":19.2079},{\"d\":\"2001-10\",\"c\":19.5583},{\"d\":\"2001-11\",\"c\":20.2124},{\"d\":\"2001-12\",\"c\":20.3356},{\"d\":\"2002-01\",\"c\":19.1594},{\"d\":\"2002-02\",\"c\":19.3896},{\"d\":\"2002-03\",\"c\":20.472},{\"d\":\"2002-04\",\"c\":20.7839},{\"d\":\"2002-05\",\"c\":20.8947},{\"d\":\"2002-06\",\"c\":20.2078},{\"d\":\"2002-07\",\"c\":18.2816},{\"d\":\"2002-08\",\"c\":18.1026},{\"d\":\"2002-09\",\"c\":16.2276},{\"d\":\"2002-10\",\"c\":16.8497},{\"d\":\"2002-11\",\"c\":17.7958},{\"d\":\"2002-12\",\"c\":17.1999},{\"d\":\"2003-01\",\"c\":16.4599},{\"d\":\"2003-02\",\"c\":16.1124},{\"d\":\"2003-03\",\"c\":15.7389},{\"d\":\"2003-04\",\"c\":17.3389},{\"d\":\"2003-05\",\"c\":18.4576},{\"d\":\"2003-06\",\"c\":18.8155},{\"d\":\"2003-07\",\"c\":19.1004},{\"d\":\"2003-08\",\"c\":19.7293},{\"d\":\"2003-09\",\"c\":20.3251},{\"d\":\"2003-10\",\"c\":21.6454},{\"d\":\"2003-11\",\"c\":22.1926},{\"d\":\"2003-12\",\"c\":24.1317},{\"d\":\"2004-01\",\"c\":24.4034},{\"d\":\"2004-02\",\"c\":24.9644},{\"d\":\"2004-03\",\"c\":24.9821},{\"d\":\"2004-04\",\"c\":24.1352},{\"d\":\"2004-05\",\"c\":24.4104},{\"d\":\"2004-06\",\"c\":25.2291},{\"d\":\"2004-07\",\"c\":24.1528},{\"d\":\"2004-08\",\"c\":24.4404},{\"d\":\"2004-09\",\"c\":24.9468},{\"d\":\"2004-10\",\"c\":25.8201},{\"d\":\"2004-11\",\"c\":27.3903},{\"d\":\"2004-12\",\"c\":28.7069},{\"d\":\"2005-01\",\"c\":28.1605},{\"d\":\"2005-02\",\"c\":29.2264},{\"d\":\"2005-03\",\"c\":28.4597},{\"d\":\"2005-04\",\"c\":27.9993},{\"d\":\"2005-05\",\"c\":27.7574},{\"d\":\"2005-06\",\"c\":28.1551},{\"d\":\"2005-07\",\"c\":28.9989},{\"d\":\"2005-08\",\"c\":30.1113},{\"d\":\"2005-09\",\"c\":31.2238},{\"d\":\"2005-10\",\"c\":30.2295},{\"d\":\"2005-11\",\"c\":30.9282},{\"d\":\"2005-12\",\"c\":32.5311},{\"d\":\"2006-01\",\"c\":34.4086},{\"d\":\"2006-02\",\"c\":34.1677},{\"d\":\"2006-03\",\"c\":35.5362},{\"d\":\"2006-04\",\"c\":37.2386},{\"d\":\"2006-05\",\"c\":35.8154},{\"d\":\"2006-06\",\"c\":35.7935},{\"d\":\"2006-07\",\"c\":36.0836},{\"d\":\"2006-08\",\"c\":37.0032},{\"d\":\"2006-09\",\"c\":37.0853},{\"d\":\"2006-10\",\"c\":38.4757},{\"d\":\"2006-11\",\"c\":39.658},{\"d\":\"2006-12\",\"c\":40.9259},{\"d\":\"2007-01\",\"c\":41.4961},{\"d\":\"2007-02\",\"c\":41.4458},{\"d\":\"2007-03\",\"c\":42.6475},{\"d\":\"2007-04\",\"c\":44.2461},{\"d\":\"2007-05\",\"c\":45.2913},{\"d\":\"2007-06\",\"c\":45.146},{\"d\":\"2007-07\",\"c\":44.1119},{\"d\":\"2007-08\",\"c\":43.8325},{\"d\":\"2007-09\",\"c\":46.1633},{\"d\":\"2007-10\",\"c\":48.1252},{\"d\":\"2007-11\",\"c\":46.3812},{\"d\":\"2007-12\",\"c\":44.9985},{\"d\":\"2008-01\",\"c\":41.4674},{\"d\":\"2008-02\",\"c\":41.0432},{\"d\":\"2008-03\",\"c\":41.2152},{\"d\":\"2008-04\",\"c\":43.4565},{\"d\":\"2008-05\",\"c\":43.9724},{\"d\":\"2008-06\",\"c\":40.1086},{\"d\":\"2008-07\",\"c\":38.7769},{\"d\":\"2008-08\",\"c\":37.1298},{\"d\":\"2008-09\",\"c\":32.8836},{\"d\":\"2008-10\",\"c\":26.0324},{\"d\":\"2008-11\",\"c\":24.3736},{\"d\":\"2008-12\",\"c\":26.5351},{\"d\":\"2009-01\",\"c\":22.8914},{\"d\":\"2009-02\",\"c\":20.5136},{\"d\":\"2009-03\",\"c\":22.2348},{\"d\":\"2009-04\",\"c\":24.7961},{\"d\":\"2009-05\",\"c\":28.0671},{\"d\":\"2009-06\",\"c\":27.6728},{\"d\":\"2009-07\",\"c\":30.4516},{\"d\":\"2009-08\",\"c\":31.8228},{\"d\":\"2009-09\",\"c\":33.031},{\"d\":\"2009-10\",\"c\":32.1974},{\"d\":\"2009-11\",\"c\":33.4599},{\"d\":\"2009-12\",\"c\":33.6973},{\"d\":\"2010-01\",\"c\":31.9905},{\"d\":\"2010-02\",\"c\":32.0759},{\"d\":\"2010-03\",\"c\":34.124},{\"d\":\"2010-04\",\"c\":33.167},{\"d\":\"2010-05\",\"c\":29.4547},{\"d\":\"2010-06\",\"c\":28.8473},{\"d\":\"2010-07\",\"c\":32.1966},{\"d\":\"2010-08\",\"c\":30.9748},{\"d\":\"2010-09\",\"c\":34.0636},{\"d\":\"2010-10\",\"c\":35.3599},{\"d\":\"2010-11\",\"c\":33.6542},{\"d\":\"2010-12\",\"c\":36.4502},{\"d\":\"2011-01\",\"c\":37.214},{\"d\":\"2011-02\",\"c\":38.535},{\"d\":\"2011-03\",\"c\":37.6147},{\"d\":\"2011-04\",\"c\":39.7309},{\"d\":\"2011-05\",\"c\":38.8544},{\"d\":\"2011-06\",\"c\":38.3839},{\"d\":\"2011-07\",\"c\":37.4712},{\"d\":\"2011-08\",\"c\":34.1907},{\"d\":\"2011-09\",\"c\":30.4952},{\"d\":\"2011-10\",\"c\":33.4312},{\"d\":\"2011-11\",\"c\":32.7036},{\"d\":\"2011-12\",\"c\":31.9923},{\"d\":\"2012-01\",\"c\":33.6781},{\"d\":\"2012-02\",\"c\":35.3058},{\"d\":\"2012-03\",\"c\":35.4544},{\"d\":\"2012-04\",\"c\":34.718},{\"d\":\"2012-05\",\"c\":30.849},{\"d\":\"2012-06\",\"c\":33.0218},{\"d\":\"2012-07\",\"c\":33.0482},{\"d\":\"2012-08\",\"c\":34.1058},{\"d\":\"2012-09\",\"c\":35.0311},{\"d\":\"2012-10\",\"c\":35.4145},{\"d\":\"2012-11\",\"c\":36.3993},{\"d\":\"2012-12\",\"c\":37.994},{\"d\":\"2013-01\",\"c\":39.4106},{\"d\":\"2013-02\",\"c\":38.9028},{\"d\":\"2013-03\",\"c\":39.4106},{\"d\":\"2013-04\",\"c\":41.3885},{\"d\":\"2013-05\",\"c\":40.139},{\"d\":\"2013-06\",\"c\":39.0641},{\"d\":\"2013-07\",\"c\":41.1434},{\"d\":\"2013-08\",\"c\":40.3389},{\"d\":\"2013-09\",\"c\":43.4954},{\"d\":\"2013-10\",\"c\":44.9135},{\"d\":\"2013-11\",\"c\":45.1589},{\"d\":\"2013-12\",\"c\":46.1416},{\"d\":\"2014-01\",\"c\":43.7417},{\"d\":\"2014-02\",\"c\":46.4236},{\"d\":\"2014-03\",\"c\":46.2104},{\"d\":\"2014-04\",\"c\":46.9806},{\"d\":\"2014-05\",\"c\":47.7301},{\"d\":\"2014-06\",\"c\":48.1696},{\"d\":\"2014-07\",\"c\":46.9155},{\"d\":\"2014-08\",\"c\":47.0},{\"d\":\"2014-09\",\"c\":45.1753},{\"d\":\"2014-10\",\"c\":45.0555},{\"d\":\"2014-11\",\"c\":45.0837},{\"d\":\"2014-12\",\"c\":43.2836},{\"d\":\"2015-01\",\"c\":43.5539},{\"d\":\"2015-02\",\"c\":46.3143},{\"d\":\"2015-03\",\"c\":45.6527},{\"d\":\"2015-04\",\"c\":47.3174},{\"d\":\"2015-05\",\"c\":47.4099},{\"d\":\"2015-06\",\"c\":45.9315},{\"d\":\"2015-07\",\"c\":46.8648},{\"d\":\"2015-08\",\"c\":43.385},{\"d\":\"2015-09\",\"c\":41.4679},{\"d\":\"2015-10\",\"c\":44.2098},{\"d\":\"2015-11\",\"c\":43.877},{\"d\":\"2015-12\",\"c\":42.8538},{\"d\":\"2016-01\",\"c\":40.4893},{\"d\":\"2016-02\",\"c\":39.1391},{\"d\":\"2016-03\",\"c\":41.7153},{\"d\":\"2016-04\",\"c\":42.6422},{\"d\":\"2016-05\",\"c\":42.6057},{\"d\":\"2016-06\",\"c\":41.5749},{\"d\":\"2016-07\",\"c\":43.2283},{\"d\":\"2016-08\",\"c\":43.4592},{\"d\":\"2016-09\",\"c\":44.0402},{\"d\":\"2016-10\",\"c\":43.0645},{\"d\":\"2016-11\",\"c\":42.2973},{\"d\":\"2016-12\",\"c\":43.442},{\"d\":\"2017-01\",\"c\":44.8718},{\"d\":\"2017-02\",\"c\":45.406},{\"d\":\"2017-03\",\"c\":46.8734},{\"d\":\"2017-04\",\"c\":48.0097},{\"d\":\"2017-05\",\"c\":49.7104},{\"d\":\"2017-06\",\"c\":49.8575},{\"d\":\"2017-07\",\"c\":51.1804},{\"d\":\"2017-08\",\"c\":51.1575},{\"d\":\"2017-09\",\"c\":52.3657},{\"d\":\"2017-10\",\"c\":53.2451},{\"d\":\"2017-11\",\"c\":53.6121},{\"d\":\"2017-12\",\"c\":54.3353},{\"d\":\"2018-01\",\"c\":57.0632},{\"d\":\"2018-02\",\"c\":54.3044},{\"d\":\"2018-03\",\"c\":53.8484},{\"d\":\"2018-04\",\"c\":54.6676},{\"d\":\"2018-05\",\"c\":53.632},{\"d\":\"2018-06\",\"c\":52.7824},{\"d\":\"2018-07\",\"c\":54.2878},{\"d\":\"2018-08\",\"c\":53.0741},{\"d\":\"2018-09\",\"c\":53.5864},{\"d\":\"2018-10\",\"c\":49.2279},{\"d\":\"2018-11\",\"c\":49.4722},{\"d\":\"2018-12\",\"c\":46.8256},{\"d\":\"2019-01\",\"c\":49.9324},{\"d\":\"2019-02\",\"c\":51.199},{\"d\":\"2019-03\",\"c\":51.669},{\"d\":\"2019-04\",\"c\":53.1826},{\"d\":\"2019-05\",\"c\":50.506},{\"d\":\"2019-06\",\"c\":53.4917},{\"d\":\"2019-07\",\"c\":52.45},{\"d\":\"2019-08\",\"c\":51.4409},{\"d\":\"2019-09\",\"c\":53.0685},{\"d\":\"2019-10\",\"c\":54.867},{\"d\":\"2019-11\",\"c\":55.4855},{\"d\":\"2019-12\",\"c\":57.1476},{\"d\":\"2020-01\",\"c\":55.5345},{\"d\":\"2020-02\",\"c\":51.2221},{\"d\":\"2020-03\",\"c\":43.9964},{\"d\":\"2020-04\",\"c\":46.5558},{\"d\":\"2020-05\",\"c\":49.0824},{\"d\":\"2020-06\",\"c\":50.8058},{\"d\":\"2020-07\",\"c\":51.7907},{\"d\":\"2020-08\",\"c\":54.2362},{\"d\":\"2020-09\",\"c\":53.1261},{\"d\":\"2020-10\",\"c\":51.2398},{\"d\":\"2020-11\",\"c\":58.5514},{\"d\":\"2020-12\",\"c\":61.488},{\"d\":\"2021-01\",\"c\":61.0076},{\"d\":\"2021-02\",\"c\":62.3729},{\"d\":\"2021-03\",\"c\":63.9404},{\"d\":\"2021-04\",\"c\":65.8282},{\"d\":\"2021-05\",\"c\":68.1205},{\"d\":\"2021-06\",\"c\":67.3862},{\"d\":\"2021-07\",\"c\":67.9073},{\"d\":\"2021-08\",\"c\":68.8897},{\"d\":\"2021-09\",\"c\":66.643},{\"d\":\"2021-10\",\"c\":68.7616},{\"d\":\"2021-11\",\"c\":65.6434},{\"d\":\"2021-12\",\"c\":68.5258},{\"d\":\"2022-01\",\"c\":66.0349},{\"d\":\"2022-02\",\"c\":63.7705},{\"d\":\"2022-03\",\"c\":64.1014},{\"d\":\"2022-04\",\"c\":59.7815},{\"d\":\"2022-05\",\"c\":60.9747},{\"d\":\"2022-06\",\"c\":55.6293},{\"d\":\"2022-07\",\"c\":58.5047},{\"d\":\"2022-08\",\"c\":54.926},{\"d\":\"2022-09\",\"c\":49.8607},{\"d\":\"2022-10\",\"c\":52.7984},{\"d\":\"2022-11\",\"c\":59.751},{\"d\":\"2022-12\",\"c\":58.6677},{\"d\":\"2023-01\",\"c\":63.95},{\"d\":\"2023-02\",\"c\":61.9837},{\"d\":\"2023-03\",\"c\":63.9232},{\"d\":\"2023-04\",\"c\":65.8001},{\"d\":\"2023-05\",\"c\":63.1634},{\"d\":\"2023-06\",\"c\":65.9869},{\"d\":\"2023-07\",\"c\":67.7708},{\"d\":\"2023-08\",\"c\":65.104},{\"d\":\"2023-09\",\"c\":62.7285},{\"d\":\"2023-10\",\"c\":60.9082},{\"d\":\"2023-11\",\"c\":65.9141},{\"d\":\"2023-12\",\"c\":69.4411},{\"d\":\"2024-01\",\"c\":69.1278},{\"d\":\"2024-02\",\"c\":71.1921},{\"d\":\"2024-03\",\"c\":73.5975},{\"d\":\"2024-04\",\"c\":71.2106},{\"d\":\"2024-05\",\"c\":74.8139},{\"d\":\"2024-06\",\"c\":73.4473},{\"d\":\"2024-07\",\"c\":75.3507},{\"d\":\"2024-08\",\"c\":77.8074},{\"d\":\"2024-09\",\"c\":78.4169},{\"d\":\"2024-10\",\"c\":74.2818},{\"d\":\"2024-11\",\"c\":74.0474},{\"d\":\"2024-12\",\"c\":71.8629},{\"d\":\"2025-01\",\"c\":75.313},{\"d\":\"2025-02\",\"c\":77.537},{\"d\":\"2025-03\",\"c\":77.6796},{\"d\":\"2025-04\",\"c\":80.5499},{\"d\":\"2025-05\",\"c\":84.4087},{\"d\":\"2025-06\",\"c\":86.4313},{\"d\":\"2025-07\",\"c\":84.6232},{\"d\":\"2025-08\",\"c\":88.4521},{\"d\":\"2025-09\",\"c\":90.2796},{\"d\":\"2025-10\",\"c\":91.3625},{\"d\":\"2025-11\",\"c\":92.0393},{\"d\":\"2025-12\",\"c\":94.534},{\"d\":\"2026-01\",\"c\":99.1707},{\"d\":\"2026-02\",\"c\":103.7384},{\"d\":\"2026-03\",\"c\":95.6169},{\"d\":\"2026-04\",\"c\":100.7261},{\"d\":\"2026-05\",\"c\":103.1674},{\"d\":\"2026-06\",\"c\":103.88},{\"d\":\"2026-07\",\"c\":105.58},{\"d\":\"2026-08\",\"c\":107.45},{\"d\":\"2026-09\",\"c\":103.89},{\"d\":\"2026-10\",\"c\":103.68}]},\"AGG\":{\"name\":\"iShares Core U.S. Aggregate Bon\",\"currency\":\"USD\",\"last\":95.89,\"series\":[{\"d\":\"2003-10\",\"c\":48.538},{\"d\":\"2003-11\",\"c\":48.7003},{\"d\":\"2003-12\",\"c\":49.1772},{\"d\":\"2004-01\",\"c\":49.3938},{\"d\":\"2004-02\",\"c\":49.9576},{\"d\":\"2004-03\",\"c\":50.2993},{\"d\":\"2004-04\",\"c\":48.8877},{\"d\":\"2004-05\",\"c\":48.7028},{\"d\":\"2004-06\",\"c\":49.0576},{\"d\":\"2004-07\",\"c\":49.5113},{\"d\":\"2004-08\",\"c\":50.3127},{\"d\":\"2004-09\",\"c\":50.5727},{\"d\":\"2004-10\",\"c\":51.011},{\"d\":\"2004-11\",\"c\":50.634},{\"d\":\"2004-12\",\"c\":51.0377},{\"d\":\"2005-01\",\"c\":51.2869},{\"d\":\"2005-02\",\"c\":51.0965},{\"d\":\"2005-03\",\"c\":50.5986},{\"d\":\"2005-04\",\"c\":51.4704},{\"d\":\"2005-05\",\"c\":51.8964},{\"d\":\"2005-06\",\"c\":52.3511},{\"d\":\"2005-07\",\"c\":51.8091},{\"d\":\"2005-08\",\"c\":52.4211},{\"d\":\"2005-09\",\"c\":51.9302},{\"d\":\"2005-10\",\"c\":51.4156},{\"d\":\"2005-11\",\"c\":51.6082},{\"d\":\"2005-12\",\"c\":52.1936},{\"d\":\"2006-01\",\"c\":52.1624},{\"d\":\"2006-02\",\"c\":52.2462},{\"d\":\"2006-03\",\"c\":51.793},{\"d\":\"2006-04\",\"c\":51.7158},{\"d\":\"2006-05\",\"c\":51.6132},{\"d\":\"2006-06\",\"c\":51.5301},{\"d\":\"2006-07\",\"c\":52.2459},{\"d\":\"2006-08\",\"c\":53.0771},{\"d\":\"2006-09\",\"c\":53.6139},{\"d\":\"2006-10\",\"c\":53.9816},{\"d\":\"2006-11\",\"c\":54.5548},{\"d\":\"2006-12\",\"c\":54.2272},{\"d\":\"2007-01\",\"c\":54.1892},{\"d\":\"2007-02\",\"c\":55.07},{\"d\":\"2007-03\",\"c\":54.9625},{\"d\":\"2007-04\",\"c\":55.2867},{\"d\":\"2007-05\",\"c\":54.7796},{\"d\":\"2007-06\",\"c\":54.5731},{\"d\":\"2007-07\",\"c\":55.1588},{\"d\":\"2007-08\",\"c\":55.8645},{\"d\":\"2007-09\",\"c\":56.218},{\"d\":\"2007-10\",\"c\":56.7847},{\"d\":\"2007-11\",\"c\":57.8088},{\"d\":\"2007-12\",\"c\":57.8034},{\"d\":\"2008-01\",\"c\":59.1405},{\"d\":\"2008-02\",\"c\":59.0458},{\"d\":\"2008-03\",\"c\":59.1223},{\"d\":\"2008-04\",\"c\":59.316},{\"d\":\"2008-05\",\"c\":58.5656},{\"d\":\"2008-06\",\"c\":58.4573},{\"d\":\"2008-07\",\"c\":58.6876},{\"d\":\"2008-08\",\"c\":59.123},{\"d\":\"2008-09\",\"c\":58.0825},{\"d\":\"2008-10\",\"c\":56.7576},{\"d\":\"2008-11\",\"c\":58.4741},{\"d\":\"2008-12\",\"c\":62.37},{\"d\":\"2009-01\",\"c\":61.1309},{\"d\":\"2009-02\",\"c\":60.4858},{\"d\":\"2009-03\",\"c\":61.1529},{\"d\":\"2009-04\",\"c\":61.468},{\"d\":\"2009-05\",\"c\":61.9042},{\"d\":\"2009-06\",\"c\":62.1647},{\"d\":\"2009-07\",\"c\":62.9536},{\"d\":\"2009-08\",\"c\":63.7218},{\"d\":\"2009-09\",\"c\":64.4789},{\"d\":\"2009-10\",\"c\":64.622},{\"d\":\"2009-11\",\"c\":65.4532},{\"d\":\"2009-12\",\"c\":64.2219},{\"d\":\"2010-01\",\"c\":65.1305},{\"d\":\"2010-02\",\"c\":65.2597},{\"d\":\"2010-03\",\"c\":65.2554},{\"d\":\"2010-04\",\"c\":65.8905},{\"d\":\"2010-05\",\"c\":66.6037},{\"d\":\"2010-06\",\"c\":67.7817},{\"d\":\"2010-07\",\"c\":68.3611},{\"d\":\"2010-08\",\"c\":69.2408},{\"d\":\"2010-09\",\"c\":69.2458},{\"d\":\"2010-10\",\"c\":69.3513},{\"d\":\"2010-11\",\"c\":68.7722},{\"d\":\"2010-12\",\"c\":68.3078},{\"d\":\"2011-01\",\"c\":68.2496},{\"d\":\"2011-02\",\"c\":68.4479},{\"d\":\"2011-03\",\"c\":68.2952},{\"d\":\"2011-04\",\"c\":69.3657},{\"d\":\"2011-05\",\"c\":70.2257},{\"d\":\"2011-06\",\"c\":69.9131},{\"d\":\"2011-07\",\"c\":71.0923},{\"d\":\"2011-08\",\"c\":72.1732},{\"d\":\"2011-09\",\"c\":72.7294},{\"d\":\"2011-10\",\"c\":72.8214},{\"d\":\"2011-11\",\"c\":72.5805},{\"d\":\"2011-12\",\"c\":73.5652},{\"d\":\"2012-01\",\"c\":74.099},{\"d\":\"2012-02\",\"c\":74.089},{\"d\":\"2012-03\",\"c\":73.6645},{\"d\":\"2012-04\",\"c\":74.3319},{\"d\":\"2012-05\",\"c\":75.1333},{\"d\":\"2012-06\",\"c\":75.1185},{\"d\":\"2012-07\",\"c\":76.1417},{\"d\":\"2012-08\",\"c\":76.1417},{\"d\":\"2012-09\",\"c\":76.3446},{\"d\":\"2012-10\",\"c\":76.3086},{\"d\":\"2012-11\",\"c\":76.5151},{\"d\":\"2012-12\",\"c\":76.3275},{\"d\":\"2013-01\",\"c\":75.8534},{\"d\":\"2013-02\",\"c\":76.3015},{\"d\":\"2013-03\",\"c\":76.3767},{\"d\":\"2013-04\",\"c\":77.1165},{\"d\":\"2013-05\",\"c\":75.5734},{\"d\":\"2013-06\",\"c\":74.3903},{\"d\":\"2013-07\",\"c\":74.5905},{\"d\":\"2013-08\",\"c\":73.9741},{\"d\":\"2013-09\",\"c\":74.8031},{\"d\":\"2013-10\",\"c\":75.4259},{\"d\":\"2013-11\",\"c\":75.2368},{\"d\":\"2013-12\",\"c\":74.818},{\"d\":\"2014-01\",\"c\":75.9708},{\"d\":\"2014-02\",\"c\":76.2568},{\"d\":\"2014-03\",\"c\":76.1439},{\"d\":\"2014-04\",\"c\":76.7696},{\"d\":\"2014-05\",\"c\":77.6747},{\"d\":\"2014-06\",\"c\":77.63},{\"d\":\"2014-07\",\"c\":77.4352},{\"d\":\"2014-08\",\"c\":78.3255},{\"d\":\"2014-09\",\"c\":77.8439},{\"d\":\"2014-10\",\"c\":78.6722},{\"d\":\"2014-11\",\"c\":79.1891},{\"d\":\"2014-12\",\"c\":79.306},{\"d\":\"2015-01\",\"c\":80.9336},{\"d\":\"2015-02\",\"c\":80.2094},{\"d\":\"2015-03\",\"c\":80.51},{\"d\":\"2015-04\",\"c\":80.2501},{\"d\":\"2015-05\",\"c\":79.8991},{\"d\":\"2015-06\",\"c\":79.0388},{\"d\":\"2015-07\",\"c\":79.7202},{\"d\":\"2015-08\",\"c\":79.4525},{\"d\":\"2015-09\",\"c\":80.0972},{\"d\":\"2015-10\",\"c\":80.1521},{\"d\":\"2015-11\",\"c\":79.8403},{\"d\":\"2015-12\",\"c\":79.6873},{\"d\":\"2016-01\",\"c\":80.6759},{\"d\":\"2016-02\",\"c\":81.3915},{\"d\":\"2016-03\",\"c\":82.1034},{\"d\":\"2016-04\",\"c\":82.3128},{\"d\":\"2016-05\",\"c\":82.3239},{\"d\":\"2016-06\",\"c\":83.917},{\"d\":\"2016-07\",\"c\":84.3739},{\"d\":\"2016-08\",\"c\":84.1922},{\"d\":\"2016-09\",\"c\":84.2356},{\"d\":\"2016-10\",\"c\":83.5472},{\"d\":\"2016-11\",\"c\":81.4039},{\"d\":\"2016-12\",\"c\":81.6107},{\"d\":\"2017-01\",\"c\":81.7844},{\"d\":\"2017-02\",\"c\":82.3126},{\"d\":\"2017-03\",\"c\":82.2672},{\"d\":\"2017-04\",\"c\":83.0133},{\"d\":\"2017-05\",\"c\":83.5837},{\"d\":\"2017-06\",\"c\":83.5685},{\"d\":\"2017-07\",\"c\":83.8475},{\"d\":\"2017-08\",\"c\":84.6368},{\"d\":\"2017-09\",\"c\":84.1531},{\"d\":\"2017-10\",\"c\":84.2354},{\"d\":\"2017-11\",\"c\":84.1105},{\"d\":\"2017-12\",\"c\":84.5101},{\"d\":\"2018-01\",\"c\":83.5593},{\"d\":\"2018-02\",\"c\":82.7165},{\"d\":\"2018-03\",\"c\":83.2716},{\"d\":\"2018-04\",\"c\":82.488},{\"d\":\"2018-05\",\"c\":83.034},{\"d\":\"2018-06\",\"c\":83.1192},{\"d\":\"2018-07\",\"c\":83.0949},{\"d\":\"2018-08\",\"c\":83.5668},{\"d\":\"2018-09\",\"c\":83.049},{\"d\":\"2018-10\",\"c\":82.5141},{\"d\":\"2018-11\",\"c\":83.1507},{\"d\":\"2018-12\",\"c\":84.7981},{\"d\":\"2019-01\",\"c\":85.5705},{\"d\":\"2019-02\",\"c\":85.4731},{\"d\":\"2019-03\",\"c\":87.2874},{\"d\":\"2019-04\",\"c\":87.1125},{\"d\":\"2019-05\",\"c\":88.7771},{\"d\":\"2019-06\",\"c\":89.7524},{\"d\":\"2019-07\",\"c\":89.9156},{\"d\":\"2019-08\",\"c\":92.4177},{\"d\":\"2019-09\",\"c\":91.852},{\"d\":\"2019-10\",\"c\":92.0432},{\"d\":\"2019-11\",\"c\":92.0114},{\"d\":\"2019-12\",\"c\":91.9684},{\"d\":\"2020-01\",\"c\":93.8344},{\"d\":\"2020-02\",\"c\":95.3214},{\"d\":\"2020-03\",\"c\":94.8192},{\"d\":\"2020-04\",\"c\":96.4492},{\"d\":\"2020-05\",\"c\":97.0979},{\"d\":\"2020-06\",\"c\":97.7379},{\"d\":\"2020-07\",\"c\":99.0409},{\"d\":\"2020-08\",\"c\":98.2252},{\"d\":\"2020-09\",\"c\":98.1296},{\"d\":\"2020-10\",\"c\":97.5817},{\"d\":\"2020-11\",\"c\":98.7593},{\"d\":\"2020-12\",\"c\":98.844},{\"d\":\"2021-01\",\"c\":98.1081},{\"d\":\"2021-02\",\"c\":96.6187},{\"d\":\"2021-03\",\"c\":95.5111},{\"d\":\"2021-04\",\"c\":96.2102},{\"d\":\"2021-05\",\"c\":96.4063},{\"d\":\"2021-06\",\"c\":97.2045},{\"d\":\"2021-07\",\"c\":98.2898},{\"d\":\"2021-08\",\"c\":98.0929},{\"d\":\"2021-09\",\"c\":97.1932},{\"d\":\"2021-10\",\"c\":97.1847},{\"d\":\"2021-11\",\"c\":97.4479},{\"d\":\"2021-12\",\"c\":97.0984},{\"d\":\"2022-01\",\"c\":95.1577},{\"d\":\"2022-02\",\"c\":94.0676},{\"d\":\"2022-03\",\"c\":91.4222},{\"d\":\"2022-04\",\"c\":87.9428},{\"d\":\"2022-05\",\"c\":88.6116},{\"d\":\"2022-06\",\"c\":87.2355},{\"d\":\"2022-07\",\"c\":89.4496},{\"d\":\"2022-08\",\"c\":86.7283},{\"d\":\"2022-09\",\"c\":83.1334},{\"d\":\"2022-10\",\"c\":82.0706},{\"d\":\"2022-11\",\"c\":85.1962},{\"d\":\"2022-12\",\"c\":84.4546},{\"d\":\"2023-01\",\"c\":87.2671},{\"d\":\"2023-02\",\"c\":84.9409},{\"d\":\"2023-03\",\"c\":87.1843},{\"d\":\"2023-04\",\"c\":87.6861},{\"d\":\"2023-05\",\"c\":86.6827},{\"d\":\"2023-06\",\"c\":86.3635},{\"d\":\"2023-07\",\"c\":86.3503},{\"d\":\"2023-08\",\"c\":85.8051},{\"d\":\"2023-09\",\"c\":83.5831},{\"d\":\"2023-10\",\"c\":82.2703},{\"d\":\"2023-11\",\"c\":86.0489},{\"d\":\"2023-12\",\"c\":89.2307},{\"d\":\"2024-01\",\"c\":89.0959},{\"d\":\"2024-02\",\"c\":87.782},{\"d\":\"2024-03\",\"c\":88.5743},{\"d\":\"2024-04\",\"c\":86.3792},{\"d\":\"2024-05\",\"c\":87.8214},{\"d\":\"2024-06\",\"c\":88.599},{\"d\":\"2024-07\",\"c\":90.7423},{\"d\":\"2024-08\",\"c\":92.0685},{\"d\":\"2024-09\",\"c\":93.2956},{\"d\":\"2024-10\",\"c\":90.9457},{\"d\":\"2024-11\",\"c\":91.9561},{\"d\":\"2024-12\",\"c\":90.399},{\"d\":\"2025-01\",\"c\":90.8654},{\"d\":\"2025-02\",\"c\":92.8984},{\"d\":\"2025-03\",\"c\":92.874},{\"d\":\"2025-04\",\"c\":93.2743},{\"d\":\"2025-05\",\"c\":92.7083},{\"d\":\"2025-06\",\"c\":94.0575},{\"d\":\"2025-07\",\"c\":93.8092},{\"d\":\"2025-08\",\"c\":94.9259},{\"d\":\"2025-09\",\"c\":95.9955},{\"d\":\"2025-10\",\"c\":96.5863},{\"d\":\"2025-11\",\"c\":97.1713},{\"d\":\"2025-12\",\"c\":96.9003},{\"d\":\"2026-01\",\"c\":97.1428},{\"d\":\"2026-02\",\"c\":98.6953},{\"d\":\"2026-03\",\"c\":96.9241},{\"d\":\"2026-04\",\"c\":97.0877},{\"d\":\"2026-05\",\"c\":97.3728},{\"d\":\"2026-06\",\"c\":97.6204},{\"d\":\"2026-07\",\"c\":96.3547},{\"d\":\"2026-08\",\"c\":96.73},{\"d\":\"2026-09\",\"c\":94.206},{\"d\":\"2026-10\",\"c\":95.89}]},\"BIL\":{\"name\":\"State Street SPDR Bloomberg 1-3\",\"currency\":\"USD\",\"last\":91.66,\"series\":[{\"d\":\"2007-06\",\"c\":70.2665},{\"d\":\"2007-07\",\"c\":70.5473},{\"d\":\"2007-08\",\"c\":70.8477},{\"d\":\"2007-09\",\"c\":70.9822},{\"d\":\"2007-10\",\"c\":71.2616},{\"d\":\"2007-11\",\"c\":71.5434},{\"d\":\"2007-12\",\"c\":71.712},{\"d\":\"2008-01\",\"c\":71.9939},{\"d\":\"2008-02\",\"c\":72.1117},{\"d\":\"2008-03\",\"c\":72.2799},{\"d\":\"2008-04\",\"c\":72.2327},{\"d\":\"2008-05\",\"c\":72.3021},{\"d\":\"2008-06\",\"c\":72.471},{\"d\":\"2008-07\",\"c\":72.6069},{\"d\":\"2008-08\",\"c\":72.664},{\"d\":\"2008-09\",\"c\":73.0334},{\"d\":\"2008-10\",\"c\":72.8634},{\"d\":\"2008-11\",\"c\":72.8269},{\"d\":\"2008-12\",\"c\":72.8491},{\"d\":\"2009-01\",\"c\":72.9923},{\"d\":\"2009-02\",\"c\":72.9891},{\"d\":\"2009-03\",\"c\":72.9843},{\"d\":\"2009-04\",\"c\":73.0289},{\"d\":\"2009-05\",\"c\":73.0369},{\"d\":\"2009-06\",\"c\":73.0273},{\"d\":\"2009-07\",\"c\":72.9811},{\"d\":\"2009-08\",\"c\":73.0321},{\"d\":\"2009-09\",\"c\":73.0512},{\"d\":\"2009-10\",\"c\":73.0544},{\"d\":\"2009-11\",\"c\":73.0241},{\"d\":\"2009-12\",\"c\":73.0464},{\"d\":\"2010-01\",\"c\":73.0464},{\"d\":\"2010-02\",\"c\":73.0305},{\"d\":\"2010-03\",\"c\":73.0305},{\"d\":\"2010-04\",\"c\":72.9987},{\"d\":\"2010-05\",\"c\":73.0305},{\"d\":\"2010-06\",\"c\":73.0464},{\"d\":\"2010-07\",\"c\":73.0145},{\"d\":\"2010-08\",\"c\":73.0145},{\"d\":\"2010-09\",\"c\":73.0145},{\"d\":\"2010-10\",\"c\":73.0305},{\"d\":\"2010-11\",\"c\":73.0305},{\"d\":\"2010-12\",\"c\":73.0145},{\"d\":\"2011-01\",\"c\":73.0145},{\"d\":\"2011-02\",\"c\":73.0145},{\"d\":\"2011-03\",\"c\":73.0145},{\"d\":\"2011-04\",\"c\":73.0145},{\"d\":\"2011-05\",\"c\":73.0305},{\"d\":\"2011-06\",\"c\":73.0305},{\"d\":\"2011-07\",\"c\":73.0305},{\"d\":\"2011-08\",\"c\":73.0305},{\"d\":\"2011-09\",\"c\":73.0145},{\"d\":\"2011-10\",\"c\":72.9827},{\"d\":\"2011-11\",\"c\":72.9987},{\"d\":\"2011-12\",\"c\":72.9859},{\"d\":\"2012-01\",\"c\":72.97},{\"d\":\"2012-02\",\"c\":72.9859},{\"d\":\"2012-03\",\"c\":72.97},{\"d\":\"2012-04\",\"c\":72.9859},{\"d\":\"2012-05\",\"c\":72.9859},{\"d\":\"2012-06\",\"c\":72.9541},{\"d\":\"2012-07\",\"c\":72.9541},{\"d\":\"2012-08\",\"c\":72.9541},{\"d\":\"2012-09\",\"c\":72.9541},{\"d\":\"2012-10\",\"c\":72.97},{\"d\":\"2012-11\",\"c\":72.9541},{\"d\":\"2012-12\",\"c\":72.9541},{\"d\":\"2013-01\",\"c\":72.9541},{\"d\":\"2013-02\",\"c\":72.9541},{\"d\":\"2013-03\",\"c\":72.9541},{\"d\":\"2013-04\",\"c\":72.9381},{\"d\":\"2013-05\",\"c\":72.9541},{\"d\":\"2013-06\",\"c\":72.9381},{\"d\":\"2013-07\",\"c\":72.9381},{\"d\":\"2013-08\",\"c\":72.9381},{\"d\":\"2013-09\",\"c\":72.9222},{\"d\":\"2013-10\",\"c\":72.9063},{\"d\":\"2013-11\",\"c\":72.8903},{\"d\":\"2013-12\",\"c\":72.8903},{\"d\":\"2014-01\",\"c\":72.8903},{\"d\":\"2014-02\",\"c\":72.9063},{\"d\":\"2014-03\",\"c\":72.8903},{\"d\":\"2014-04\",\"c\":72.8903},{\"d\":\"2014-05\",\"c\":72.8903},{\"d\":\"2014-06\",\"c\":72.8744},{\"d\":\"2014-07\",\"c\":72.8585},{\"d\":\"2014-08\",\"c\":72.8744},{\"d\":\"2014-09\",\"c\":72.8744},{\"d\":\"2014-10\",\"c\":72.8585},{\"d\":\"2014-11\",\"c\":72.8585},{\"d\":\"2014-12\",\"c\":72.8426},{\"d\":\"2015-01\",\"c\":72.8266},{\"d\":\"2015-02\",\"c\":72.8266},{\"d\":\"2015-03\",\"c\":72.8266},{\"d\":\"2015-04\",\"c\":72.8108},{\"d\":\"2015-05\",\"c\":72.7948},{\"d\":\"2015-06\",\"c\":72.7948},{\"d\":\"2015-07\",\"c\":72.7948},{\"d\":\"2015-08\",\"c\":72.7948},{\"d\":\"2015-09\",\"c\":72.7629},{\"d\":\"2015-10\",\"c\":72.747},{\"d\":\"2015-11\",\"c\":72.7629},{\"d\":\"2015-12\",\"c\":72.747},{\"d\":\"2016-01\",\"c\":72.7629},{\"d\":\"2016-02\",\"c\":72.7629},{\"d\":\"2016-03\",\"c\":72.7629},{\"d\":\"2016-04\",\"c\":72.7948},{\"d\":\"2016-05\",\"c\":72.7948},{\"d\":\"2016-06\",\"c\":72.7789},{\"d\":\"2016-07\",\"c\":72.8108},{\"d\":\"2016-08\",\"c\":72.8108},{\"d\":\"2016-09\",\"c\":72.8266},{\"d\":\"2016-10\",\"c\":72.8426},{\"d\":\"2016-11\",\"c\":72.8108},{\"d\":\"2016-12\",\"c\":72.8267},{\"d\":\"2017-01\",\"c\":72.8586},{\"d\":\"2017-02\",\"c\":72.8952},{\"d\":\"2017-03\",\"c\":72.8824},{\"d\":\"2017-04\",\"c\":72.9367},{\"d\":\"2017-05\",\"c\":72.9479},{\"d\":\"2017-06\",\"c\":73.0228},{\"d\":\"2017-07\",\"c\":73.0468},{\"d\":\"2017-08\",\"c\":73.1299},{\"d\":\"2017-09\",\"c\":73.1827},{\"d\":\"2017-10\",\"c\":73.234},{\"d\":\"2017-11\",\"c\":73.274},{\"d\":\"2017-12\",\"c\":73.3285},{\"d\":\"2018-01\",\"c\":73.4248},{\"d\":\"2018-02\",\"c\":73.4859},{\"d\":\"2018-03\",\"c\":73.5815},{\"d\":\"2018-04\",\"c\":73.6579},{\"d\":\"2018-05\",\"c\":73.7683},{\"d\":\"2018-06\",\"c\":73.878},{\"d\":\"2018-07\",\"c\":73.9806},{\"d\":\"2018-08\",\"c\":74.0979},{\"d\":\"2018-09\",\"c\":74.2016},{\"d\":\"2018-10\",\"c\":74.3282},{\"d\":\"2018-11\",\"c\":74.4664},{\"d\":\"2018-12\",\"c\":74.6025},{\"d\":\"2019-01\",\"c\":74.733},{\"d\":\"2019-02\",\"c\":74.8711},{\"d\":\"2019-03\",\"c\":75.0021},{\"d\":\"2019-04\",\"c\":75.1465},{\"d\":\"2019-05\",\"c\":75.306},{\"d\":\"2019-06\",\"c\":75.4427},{\"d\":\"2019-07\",\"c\":75.5788},{\"d\":\"2019-08\",\"c\":75.7069},{\"d\":\"2019-09\",\"c\":75.8294},{\"d\":\"2019-10\",\"c\":75.9513},{\"d\":\"2019-11\",\"c\":76.0335},{\"d\":\"2019-12\",\"c\":76.1184},{\"d\":\"2020-01\",\"c\":76.2099},{\"d\":\"2020-02\",\"c\":76.3},{\"d\":\"2020-03\",\"c\":76.456},{\"d\":\"2020-04\",\"c\":76.441},{\"d\":\"2020-05\",\"c\":76.4276},{\"d\":\"2020-06\",\"c\":76.4276},{\"d\":\"2020-07\",\"c\":76.4359},{\"d\":\"2020-08\",\"c\":76.4359},{\"d\":\"2020-09\",\"c\":76.4193},{\"d\":\"2020-10\",\"c\":76.4276},{\"d\":\"2020-11\",\"c\":76.4193},{\"d\":\"2020-12\",\"c\":76.4218},{\"d\":\"2021-01\",\"c\":76.4218},{\"d\":\"2021-02\",\"c\":76.4134},{\"d\":\"2021-03\",\"c\":76.4051},{\"d\":\"2021-04\",\"c\":76.4051},{\"d\":\"2021-05\",\"c\":76.3967},{\"d\":\"2021-06\",\"c\":76.38},{\"d\":\"2021-07\",\"c\":76.3716},{\"d\":\"2021-08\",\"c\":76.3633},{\"d\":\"2021-09\",\"c\":76.3716},{\"d\":\"2021-10\",\"c\":76.3633},{\"d\":\"2021-11\",\"c\":76.3466},{\"d\":\"2021-12\",\"c\":76.3466},{\"d\":\"2022-01\",\"c\":76.3466},{\"d\":\"2022-02\",\"c\":76.3299},{\"d\":\"2022-03\",\"c\":76.365},{\"d\":\"2022-04\",\"c\":76.3566},{\"d\":\"2022-05\",\"c\":76.3817},{\"d\":\"2022-06\",\"c\":76.441},{\"d\":\"2022-07\",\"c\":76.4686},{\"d\":\"2022-08\",\"c\":76.6167},{\"d\":\"2022-09\",\"c\":76.7751},{\"d\":\"2022-10\",\"c\":76.8969},{\"d\":\"2022-11\",\"c\":77.1392},{\"d\":\"2022-12\",\"c\":77.4189},{\"d\":\"2023-01\",\"c\":77.639},{\"d\":\"2023-02\",\"c\":77.9074},{\"d\":\"2023-03\",\"c\":78.2184},{\"d\":\"2023-04\",\"c\":78.5023},{\"d\":\"2023-05\",\"c\":78.7969},{\"d\":\"2023-06\",\"c\":79.1598},{\"d\":\"2023-07\",\"c\":79.4654},{\"d\":\"2023-08\",\"c\":79.8601},{\"d\":\"2023-09\",\"c\":80.1788},{\"d\":\"2023-10\",\"c\":80.5243},{\"d\":\"2023-11\",\"c\":80.9013},{\"d\":\"2023-12\",\"c\":81.2472},{\"d\":\"2024-01\",\"c\":81.5939},{\"d\":\"2024-02\",\"c\":81.9565},{\"d\":\"2024-03\",\"c\":82.2926},{\"d\":\"2024-04\",\"c\":82.6483},{\"d\":\"2024-05\",\"c\":83.0263},{\"d\":\"2024-06\",\"c\":83.3577},{\"d\":\"2024-07\",\"c\":83.7336},{\"d\":\"2024-08\",\"c\":84.1202},{\"d\":\"2024-09\",\"c\":84.4753},{\"d\":\"2024-10\",\"c\":84.8089},{\"d\":\"2024-11\",\"c\":85.1232},{\"d\":\"2024-12\",\"c\":85.4664},{\"d\":\"2025-01\",\"c\":85.7655},{\"d\":\"2025-02\",\"c\":86.0432},{\"d\":\"2025-03\",\"c\":86.3246},{\"d\":\"2025-04\",\"c\":86.6183},{\"d\":\"2025-05\",\"c\":86.9329},{\"d\":\"2025-06\",\"c\":87.2239},{\"d\":\"2025-07\",\"c\":87.5349},{\"d\":\"2025-08\",\"c\":87.8595},{\"d\":\"2025-09\",\"c\":88.1496},{\"d\":\"2025-10\",\"c\":88.4591},{\"d\":\"2025-11\",\"c\":88.7134},{\"d\":\"2025-12\",\"c\":89.0108},{\"d\":\"2026-01\",\"c\":89.2738},{\"d\":\"2026-02\",\"c\":89.5122},{\"d\":\"2026-03\",\"c\":89.7698},{\"d\":\"2026-04\",\"c\":90.0292},{\"d\":\"2026-05\",\"c\":90.3149},{\"d\":\"2026-06\",\"c\":90.561},{\"d\":\"2026-07\",\"c\":90.8662},{\"d\":\"2026-08\",\"c\":91.1178},{\"d\":\"2026-09\",\"c\":91.377},{\"d\":\"2026-10\",\"c\":91.66}]},\"VTI\":{\"name\":\"Vanguard Morningstar Total Stoc\",\"currency\":\"USD\",\"last\":379.17,\"series\":[{\"d\":\"2001-07\",\"c\":35.6536},{\"d\":\"2001-08\",\"c\":33.566},{\"d\":\"2001-09\",\"c\":30.6514},{\"d\":\"2001-10\",\"c\":31.2809},{\"d\":\"2001-11\",\"c\":33.6633},{\"d\":\"2001-12\",\"c\":34.1487},{\"d\":\"2002-01\",\"c\":33.8506},{\"d\":\"2002-02\",\"c\":33.2577},{\"d\":\"2002-03\",\"c\":34.4789},{\"d\":\"2002-04\",\"c\":32.9419},{\"d\":\"2002-05\",\"c\":32.4773},{\"d\":\"2002-06\",\"c\":30.2385},{\"d\":\"2002-07\",\"c\":27.7165},{\"d\":\"2002-08\",\"c\":27.9283},{\"d\":\"2002-09\",\"c\":25.1052},{\"d\":\"2002-10\",\"c\":26.9861},{\"d\":\"2002-11\",\"c\":28.6053},{\"d\":\"2002-12\",\"c\":27.1552},{\"d\":\"2003-01\",\"c\":26.4027},{\"d\":\"2003-02\",\"c\":25.9951},{\"d\":\"2003-03\",\"c\":26.1905},{\"d\":\"2003-04\",\"c\":28.4468},{\"d\":\"2003-05\",\"c\":30.1059},{\"d\":\"2003-06\",\"c\":30.5925},{\"d\":\"2003-07\",\"c\":31.3039},{\"d\":\"2003-08\",\"c\":32.0518},{\"d\":\"2003-09\",\"c\":31.7142},{\"d\":\"2003-10\",\"c\":33.6337},{\"d\":\"2003-11\",\"c\":34.1385},{\"d\":\"2003-12\",\"c\":35.5036},{\"d\":\"2004-01\",\"c\":36.4307},{\"d\":\"2004-02\",\"c\":36.9409},{\"d\":\"2004-03\",\"c\":36.5628},{\"d\":\"2004-04\",\"c\":35.7497},{\"d\":\"2004-05\",\"c\":36.2683},{\"d\":\"2004-06\",\"c\":37.0048},{\"d\":\"2004-07\",\"c\":35.6887},{\"d\":\"2004-08\",\"c\":35.7089},{\"d\":\"2004-09\",\"c\":36.3094},{\"d\":\"2004-10\",\"c\":36.963},{\"d\":\"2004-11\",\"c\":38.7152},{\"d\":\"2004-12\",\"c\":40.0415},{\"d\":\"2005-01\",\"c\":39.0409},{\"d\":\"2005-02\",\"c\":39.8549},{\"d\":\"2005-03\",\"c\":39.1088},{\"d\":\"2005-04\",\"c\":38.2474},{\"d\":\"2005-05\",\"c\":39.732},{\"d\":\"2005-06\",\"c\":40.0332},{\"d\":\"2005-07\",\"c\":41.786},{\"d\":\"2005-08\",\"c\":41.3316},{\"d\":\"2005-09\",\"c\":41.6588},{\"d\":\"2005-10\",\"c\":40.6804},{\"d\":\"2005-11\",\"c\":42.5582},{\"d\":\"2005-12\",\"c\":42.5657},{\"d\":\"2006-01\",\"c\":43.9359},{\"d\":\"2006-02\",\"c\":44.0325},{\"d\":\"2006-03\",\"c\":44.9354},{\"d\":\"2006-04\",\"c\":45.3651},{\"d\":\"2006-05\",\"c\":43.9027},{\"d\":\"2006-06\",\"c\":43.9608},{\"d\":\"2006-07\",\"c\":43.9087},{\"d\":\"2006-08\",\"c\":44.918},{\"d\":\"2006-09\",\"c\":45.9331},{\"d\":\"2006-10\",\"c\":47.5546},{\"d\":\"2006-11\",\"c\":48.6624},{\"d\":\"2006-12\",\"c\":49.2471},{\"d\":\"2007-01\",\"c\":50.1638},{\"d\":\"2007-02\",\"c\":49.3489},{\"d\":\"2007-03\",\"c\":49.9021},{\"d\":\"2007-04\",\"c\":51.9092},{\"d\":\"2007-05\",\"c\":53.8422},{\"d\":\"2007-06\",\"c\":52.8931},{\"d\":\"2007-07\",\"c\":51.0235},{\"d\":\"2007-08\",\"c\":51.7742},{\"d\":\"2007-09\",\"c\":53.7658},{\"d\":\"2007-10\",\"c\":54.7295},{\"d\":\"2007-11\",\"c\":52.2545},{\"d\":\"2007-12\",\"c\":51.8916},{\"d\":\"2008-01\",\"c\":48.6919},{\"d\":\"2008-02\",\"c\":47.4764},{\"d\":\"2008-03\",\"c\":47.0517},{\"d\":\"2008-04\",\"c\":49.3504},{\"d\":\"2008-05\",\"c\":50.3453},{\"d\":\"2008-06\",\"c\":46.2569},{\"d\":\"2008-07\",\"c\":45.9682},{\"d\":\"2008-08\",\"c\":46.6394},{\"d\":\"2008-09\",\"c\":42.3294},{\"d\":\"2008-10\",\"c\":34.9312},{\"d\":\"2008-11\",\"c\":32.1315},{\"d\":\"2008-12\",\"c\":32.699},{\"d\":\"2009-01\",\"c\":30.0678},{\"d\":\"2009-02\",\"c\":26.9032},{\"d\":\"2009-03\",\"c\":29.1287},{\"d\":\"2009-04\",\"c\":32.33},{\"d\":\"2009-05\",\"c\":34.0963},{\"d\":\"2009-06\",\"c\":34.2215},{\"d\":\"2009-07\",\"c\":36.8693},{\"d\":\"2009-08\",\"c\":38.2376},{\"d\":\"2009-09\",\"c\":39.8181},{\"d\":\"2009-10\",\"c\":38.7705},{\"d\":\"2009-11\",\"c\":40.9773},{\"d\":\"2009-12\",\"c\":42.1505},{\"d\":\"2010-01\",\"c\":40.6475},{\"d\":\"2010-02\",\"c\":42.0458},{\"d\":\"2010-03\",\"c\":44.7349},{\"d\":\"2010-04\",\"c\":45.7109},{\"d\":\"2010-05\",\"c\":42.1074},{\"d\":\"2010-06\",\"c\":39.6482},{\"d\":\"2010-07\",\"c\":42.4317},{\"d\":\"2010-08\",\"c\":40.4327},{\"d\":\"2010-09\",\"c\":44.2591},{\"d\":\"2010-10\",\"c\":46.041},{\"d\":\"2010-11\",\"c\":46.276},{\"d\":\"2010-12\",\"c\":49.4966},{\"d\":\"2011-01\",\"c\":50.5104},{\"d\":\"2011-02\",\"c\":52.3781},{\"d\":\"2011-03\",\"c\":52.5973},{\"d\":\"2011-04\",\"c\":54.1206},{\"d\":\"2011-05\",\"c\":53.5465},{\"d\":\"2011-06\",\"c\":52.5829},{\"d\":\"2011-07\",\"c\":51.3913},{\"d\":\"2011-08\",\"c\":48.2625},{\"d\":\"2011-09\",\"c\":44.608},{\"d\":\"2011-10\",\"c\":49.6779},{\"d\":\"2011-11\",\"c\":49.4924},{\"d\":\"2011-12\",\"c\":49.976},{\"d\":\"2012-01\",\"c\":52.5097},{\"d\":\"2012-02\",\"c\":54.7249},{\"d\":\"2012-03\",\"c\":56.4037},{\"d\":\"2012-04\",\"c\":56.0446},{\"d\":\"2012-05\",\"c\":52.5555},{\"d\":\"2012-06\",\"c\":54.6814},{\"d\":\"2012-07\",\"c\":55.1599},{\"d\":\"2012-08\",\"c\":56.6506},{\"d\":\"2012-09\",\"c\":58.0619},{\"d\":\"2012-10\",\"c\":57.0134},{\"d\":\"2012-11\",\"c\":57.4549},{\"d\":\"2012-12\",\"c\":58.1977},{\"d\":\"2013-01\",\"c\":61.3506},{\"d\":\"2013-02\",\"c\":62.1368},{\"d\":\"2013-03\",\"c\":64.5903},{\"d\":\"2013-04\",\"c\":65.6275},{\"d\":\"2013-05\",\"c\":67.231},{\"d\":\"2013-06\",\"c\":66.2651},{\"d\":\"2013-07\",\"c\":70.0725},{\"d\":\"2013-08\",\"c\":67.9484},{\"d\":\"2013-09\",\"c\":70.5964},{\"d\":\"2013-10\",\"c\":73.6088},{\"d\":\"2013-11\",\"c\":75.5982},{\"d\":\"2013-12\",\"c\":77.6646},{\"d\":\"2014-01\",\"c\":75.2032},{\"d\":\"2014-02\",\"c\":78.863},{\"d\":\"2014-03\",\"c\":79.2647},{\"d\":\"2014-04\",\"c\":79.3135},{\"d\":\"2014-05\",\"c\":80.9806},{\"d\":\"2014-06\",\"c\":83.1033},{\"d\":\"2014-07\",\"c\":81.4456},{\"d\":\"2014-08\",\"c\":84.8262},{\"d\":\"2014-09\",\"c\":83.0477},{\"d\":\"2014-10\",\"c\":85.3282},{\"d\":\"2014-11\",\"c\":87.4446},{\"d\":\"2014-12\",\"c\":87.4111},{\"d\":\"2015-01\",\"c\":85.0196},{\"d\":\"2015-02\",\"c\":89.9015},{\"d\":\"2015-03\",\"c\":88.856},{\"d\":\"2015-04\",\"c\":89.4028},{\"d\":\"2015-05\",\"c\":90.5627},{\"d\":\"2015-06\",\"c\":89.0459},{\"d\":\"2015-07\",\"c\":90.5602},{\"d\":\"2015-08\",\"c\":85.0437},{\"d\":\"2015-09\",\"c\":82.558},{\"d\":\"2015-10\",\"c\":89.0893},{\"d\":\"2015-11\",\"c\":89.6246},{\"d\":\"2015-12\",\"c\":87.7214},{\"d\":\"2016-01\",\"c\":82.7004},{\"d\":\"2016-02\",\"c\":82.692},{\"d\":\"2016-03\",\"c\":88.5712},{\"d\":\"2016-04\",\"c\":89.1543},{\"d\":\"2016-05\",\"c\":90.7006},{\"d\":\"2016-06\",\"c\":90.9486},{\"d\":\"2016-07\",\"c\":94.5642},{\"d\":\"2016-08\",\"c\":94.7594},{\"d\":\"2016-09\",\"c\":94.948},{\"d\":\"2016-10\",\"c\":92.8671},{\"d\":\"2016-11\",\"c\":97.0375},{\"d\":\"2016-12\",\"c\":98.9653},{\"d\":\"2017-01\",\"c\":100.8018},{\"d\":\"2017-02\",\"c\":104.5263},{\"d\":\"2017-03\",\"c\":104.5841},{\"d\":\"2017-04\",\"c\":105.6961},{\"d\":\"2017-05\",\"c\":106.7651},{\"d\":\"2017-06\",\"c\":107.7764},{\"d\":\"2017-07\",\"c\":109.803},{\"d\":\"2017-08\",\"c\":109.9675},{\"d\":\"2017-09\",\"c\":112.6508},{\"d\":\"2017-10\",\"c\":115.0948},{\"d\":\"2017-11\",\"c\":118.5825},{\"d\":\"2017-12\",\"c\":119.9593},{\"d\":\"2018-01\",\"c\":126.2348},{\"d\":\"2018-02\",\"c\":121.4888},{\"d\":\"2018-03\",\"c\":119.1038},{\"d\":\"2018-04\",\"c\":119.6391},{\"d\":\"2018-05\",\"c\":122.8949},{\"d\":\"2018-06\",\"c\":123.7596},{\"d\":\"2018-07\",\"c\":127.8664},{\"d\":\"2018-08\",\"c\":132.2552},{\"d\":\"2018-09\",\"c\":132.5146},{\"d\":\"2018-10\",\"c\":122.6944},{\"d\":\"2018-11\",\"c\":125.1649},{\"d\":\"2018-12\",\"c\":113.6797},{\"d\":\"2019-01\",\"c\":123.3882},{\"d\":\"2019-02\",\"c\":127.7794},{\"d\":\"2019-03\",\"c\":129.5896},{\"d\":\"2019-04\",\"c\":134.6761},{\"d\":\"2019-05\",\"c\":125.9897},{\"d\":\"2019-06\",\"c\":134.9074},{\"d\":\"2019-07\",\"c\":136.8129},{\"d\":\"2019-08\",\"c\":133.9636},{\"d\":\"2019-09\",\"c\":136.3472},{\"d\":\"2019-10\",\"c\":139.2186},{\"d\":\"2019-11\",\"c\":144.4919},{\"d\":\"2019-12\",\"c\":148.5437},{\"d\":\"2020-01\",\"c\":148.4529},{\"d\":\"2020-02\",\"c\":136.5781},{\"d\":\"2020-03\",\"c\":117.6133},{\"d\":\"2020-04\",\"c\":133.0596},{\"d\":\"2020-05\",\"c\":140.24},{\"d\":\"2020-06\",\"c\":143.4629},{\"d\":\"2020-07\",\"c\":151.7024},{\"d\":\"2020-08\",\"c\":162.4807},{\"d\":\"2020-09\",\"c\":156.7329},{\"d\":\"2020-10\",\"c\":153.6775},{\"d\":\"2020-11\",\"c\":171.8163},{\"d\":\"2020-12\",\"c\":179.8509},{\"d\":\"2021-01\",\"c\":179.2504},{\"d\":\"2021-02\",\"c\":184.8776},{\"d\":\"2021-03\",\"c\":191.6217},{\"d\":\"2021-04\",\"c\":201.2729},{\"d\":\"2021-05\",\"c\":202.1907},{\"d\":\"2021-06\",\"c\":207.209},{\"d\":\"2021-07\",\"c\":210.8079},{\"d\":\"2021-08\",\"c\":216.8339},{\"d\":\"2021-09\",\"c\":207.1541},{\"d\":\"2021-10\",\"c\":221.0073},{\"d\":\"2021-11\",\"c\":217.7795},{\"d\":\"2021-12\",\"c\":226.04},{\"d\":\"2022-01\",\"c\":212.3432},{\"d\":\"2022-02\",\"c\":207.0629},{\"d\":\"2022-03\",\"c\":213.813},{\"d\":\"2022-04\",\"c\":194.2884},{\"d\":\"2022-05\",\"c\":193.8},{\"d\":\"2022-06\",\"c\":177.8478},{\"d\":\"2022-07\",\"c\":194.471},{\"d\":\"2022-08\",\"c\":187.2202},{\"d\":\"2022-09\",\"c\":169.9388},{\"d\":\"2022-10\",\"c\":183.7256},{\"d\":\"2022-11\",\"c\":193.2229},{\"d\":\"2022-12\",\"c\":181.9092},{\"d\":\"2023-01\",\"c\":194.5065},{\"d\":\"2023-02\",\"c\":189.8348},{\"d\":\"2023-03\",\"c\":194.9739},{\"d\":\"2023-04\",\"c\":197.0755},{\"d\":\"2023-05\",\"c\":197.9162},{\"d\":\"2023-06\",\"c\":211.2334},{\"d\":\"2023-07\",\"c\":218.9719},{\"d\":\"2023-08\",\"c\":214.743},{\"d\":\"2023-09\",\"c\":204.433},{\"d\":\"2023-10\",\"c\":199.0241},{\"d\":\"2023-11\",\"c\":217.7629},{\"d\":\"2023-12\",\"c\":229.291},{\"d\":\"2024-01\",\"c\":231.8524},{\"d\":\"2024-02\",\"c\":244.1376},{\"d\":\"2024-03\",\"c\":252.0957},{\"d\":\"2024-04\",\"c\":241.1448},{\"d\":\"2024-05\",\"c\":252.6196},{\"d\":\"2024-06\",\"c\":260.3976},{\"d\":\"2024-07\",\"c\":265.323},{\"d\":\"2024-08\",\"c\":270.9785},{\"d\":\"2024-09\",\"c\":276.4817},{\"d\":\"2024-10\",\"c\":274.402},{\"d\":\"2024-11\",\"c\":292.7879},{\"d\":\"2024-12\",\"c\":283.8858},{\"d\":\"2025-01\",\"c\":292.4961},{\"d\":\"2025-02\",\"c\":286.9714},{\"d\":\"2025-03\",\"c\":270.1683},{\"d\":\"2025-04\",\"c\":268.1826},{\"d\":\"2025-05\",\"c\":284.9526},{\"d\":\"2025-06\",\"c\":299.6658},{\"d\":\"2025-07\",\"c\":306.5282},{\"d\":\"2025-08\",\"c\":313.7356},{\"d\":\"2025-09\",\"c\":324.4652},{\"d\":\"2025-10\",\"c\":331.6334},{\"d\":\"2025-11\",\"c\":332.5133},{\"d\":\"2025-12\",\"c\":332.4253},{\"d\":\"2026-01\",\"c\":337.6804},{\"d\":\"2026-02\",\"c\":335.8956},{\"d\":\"2026-03\",\"c\":319.0846},{\"d\":\"2026-04\",\"c\":352.2751},{\"d\":\"2026-05\",\"c\":370.5363},{\"d\":\"2026-06\",\"c\":369.1085},{\"d\":\"2026-07\",\"c\":367.2831},{\"d\":\"2026-08\",\"c\":377.1981},{\"d\":\"2026-09\",\"c\":374.24},{\"d\":\"2026-10\",\"c\":379.17}]},\"VXUS\":{\"name\":\"Vanguard Total International St\",\"currency\":\"USD\",\"last\":83.75,\"series\":[{\"d\":\"2011-02\",\"c\":32.1729},{\"d\":\"2011-03\",\"c\":32.091},{\"d\":\"2011-04\",\"c\":33.7551},{\"d\":\"2011-05\",\"c\":32.7402},{\"d\":\"2011-06\",\"c\":32.3431},{\"d\":\"2011-07\",\"c\":31.7758},{\"d\":\"2011-08\",\"c\":29.0905},{\"d\":\"2011-09\",\"c\":25.4093},{\"d\":\"2011-10\",\"c\":28.0126},{\"d\":\"2011-11\",\"c\":27.4201},{\"d\":\"2011-12\",\"c\":26.6038},{\"d\":\"2012-01\",\"c\":28.5552},{\"d\":\"2012-02\",\"c\":29.8561},{\"d\":\"2012-03\",\"c\":29.6935},{\"d\":\"2012-04\",\"c\":29.0756},{\"d\":\"2012-05\",\"c\":25.9274},{\"d\":\"2012-06\",\"c\":27.4754},{\"d\":\"2012-07\",\"c\":27.56},{\"d\":\"2012-08\",\"c\":28.2755},{\"d\":\"2012-09\",\"c\":29.2393},{\"d\":\"2012-10\",\"c\":29.4774},{\"d\":\"2012-11\",\"c\":30.0858},{\"d\":\"2012-12\",\"c\":31.5561},{\"d\":\"2013-01\",\"c\":32.3137},{\"d\":\"2013-02\",\"c\":31.9449},{\"d\":\"2013-03\",\"c\":32.2438},{\"d\":\"2013-04\",\"c\":33.3731},{\"d\":\"2013-05\",\"c\":32.2707},{\"d\":\"2013-06\",\"c\":31.1111},{\"d\":\"2013-07\",\"c\":32.5482},{\"d\":\"2013-08\",\"c\":31.9148},{\"d\":\"2013-09\",\"c\":34.3108},{\"d\":\"2013-10\",\"c\":35.5696},{\"d\":\"2013-11\",\"c\":35.6175},{\"d\":\"2013-12\",\"c\":36.1601},{\"d\":\"2014-01\",\"c\":34.2065},{\"d\":\"2014-02\",\"c\":36.1187},{\"d\":\"2014-03\",\"c\":36.2967},{\"d\":\"2014-04\",\"c\":36.7557},{\"d\":\"2014-05\",\"c\":37.4649},{\"d\":\"2014-06\",\"c\":38.1697},{\"d\":\"2014-07\",\"c\":37.5088},{\"d\":\"2014-08\",\"c\":37.9447},{\"d\":\"2014-09\",\"c\":36.0458},{\"d\":\"2014-10\",\"c\":36.0175},{\"d\":\"2014-11\",\"c\":35.8337},{\"d\":\"2014-12\",\"c\":34.447},{\"d\":\"2015-01\",\"c\":34.5396},{\"d\":\"2015-02\",\"c\":36.5349},{\"d\":\"2015-03\",\"c\":35.9895},{\"d\":\"2015-04\",\"c\":37.7193},{\"d\":\"2015-05\",\"c\":37.3762},{\"d\":\"2015-06\",\"c\":36.3553},{\"d\":\"2015-07\",\"c\":36.153},{\"d\":\"2015-08\",\"c\":33.4659},{\"d\":\"2015-09\",\"c\":32.1773},{\"d\":\"2015-10\",\"c\":34.1884},{\"d\":\"2015-11\",\"c\":33.7383},{\"d\":\"2015-12\",\"c\":33.007},{\"d\":\"2016-01\",\"c\":31.207},{\"d\":\"2016-02\",\"c\":30.4387},{\"d\":\"2016-03\",\"c\":32.9738},{\"d\":\"2016-04\",\"c\":33.6858},{\"d\":\"2016-05\",\"c\":33.3555},{\"d\":\"2016-06\",\"c\":33.051},{\"d\":\"2016-07\",\"c\":34.5445},{\"d\":\"2016-08\",\"c\":34.7006},{\"d\":\"2016-09\",\"c\":35.2837},{\"d\":\"2016-10\",\"c\":34.6111},{\"d\":\"2016-11\",\"c\":33.916},{\"d\":\"2016-12\",\"c\":34.5831},{\"d\":\"2017-01\",\"c\":35.9926},{\"d\":\"2017-02\",\"c\":36.475},{\"d\":\"2017-03\",\"c\":37.5683},{\"d\":\"2017-04\",\"c\":38.3396},{\"d\":\"2017-05\",\"c\":39.4739},{\"d\":\"2017-06\",\"c\":39.7231},{\"d\":\"2017-07\",\"c\":41.0607},{\"d\":\"2017-08\",\"c\":41.2824},{\"d\":\"2017-09\",\"c\":42.0594},{\"d\":\"2017-10\",\"c\":42.9125},{\"d\":\"2017-11\",\"c\":43.1814},{\"d\":\"2017-12\",\"c\":44.078},{\"d\":\"2018-01\",\"c\":46.5996},{\"d\":\"2018-02\",\"c\":44.1556},{\"d\":\"2018-03\",\"c\":43.9891},{\"d\":\"2018-04\",\"c\":44.1913},{\"d\":\"2018-05\",\"c\":43.4679},{\"d\":\"2018-06\",\"c\":42.5445},{\"d\":\"2018-07\",\"c\":43.6297},{\"d\":\"2018-08\",\"c\":42.5838},{\"d\":\"2018-09\",\"c\":42.675},{\"d\":\"2018-10\",\"c\":39.0239},{\"d\":\"2018-11\",\"c\":39.6798},{\"d\":\"2018-12\",\"c\":37.7175},{\"d\":\"2019-01\",\"c\":40.609},{\"d\":\"2019-02\",\"c\":41.272},{\"d\":\"2019-03\",\"c\":41.5896},{\"d\":\"2019-04\",\"c\":42.7435},{\"d\":\"2019-05\",\"c\":40.4276},{\"d\":\"2019-06\",\"c\":42.7604},{\"d\":\"2019-07\",\"c\":41.9092},{\"d\":\"2019-08\",\"c\":41.0013},{\"d\":\"2019-09\",\"c\":42.1182},{\"d\":\"2019-10\",\"c\":43.5613},{\"d\":\"2019-11\",\"c\":43.9934},{\"d\":\"2019-12\",\"c\":45.9195},{\"d\":\"2020-01\",\"c\":44.3611},{\"d\":\"2020-02\",\"c\":41.4339},{\"d\":\"2020-03\",\"c\":34.6961},{\"d\":\"2020-04\",\"c\":37.3339},{\"d\":\"2020-05\",\"c\":39.2027},{\"d\":\"2020-06\",\"c\":40.8663},{\"d\":\"2020-07\",\"c\":42.5618},{\"d\":\"2020-08\",\"c\":44.4485},{\"d\":\"2020-09\",\"c\":43.6364},{\"d\":\"2020-10\",\"c\":42.6327},{\"d\":\"2020-11\",\"c\":48.0109},{\"d\":\"2020-12\",\"c\":50.8168},{\"d\":\"2021-01\",\"c\":50.9435},{\"d\":\"2021-02\",\"c\":52.1176},{\"d\":\"2021-03\",\"c\":53.0921},{\"d\":\"2021-04\",\"c\":54.5655},{\"d\":\"2021-05\",\"c\":56.2421},{\"d\":\"2021-06\",\"c\":56.0563},{\"d\":\"2021-07\",\"c\":55.4247},{\"d\":\"2021-08\",\"c\":56.2355},{\"d\":\"2021-09\",\"c\":54.2875},{\"d\":\"2021-10\",\"c\":55.8493},{\"d\":\"2021-11\",\"c\":53.4722},{\"d\":\"2021-12\",\"c\":55.3824},{\"d\":\"2022-01\",\"c\":53.8143},{\"d\":\"2022-02\",\"c\":52.2809},{\"d\":\"2022-03\",\"c\":52.1326},{\"d\":\"2022-04\",\"c\":48.7467},{\"d\":\"2022-05\",\"c\":49.4884},{\"d\":\"2022-06\",\"c\":45.5597},{\"d\":\"2022-07\",\"c\":47.2192},{\"d\":\"2022-08\",\"c\":45.1006},{\"d\":\"2022-09\",\"c\":40.633},{\"d\":\"2022-10\",\"c\":42.0179},{\"d\":\"2022-11\",\"c\":47.4954},{\"d\":\"2022-12\",\"c\":46.4768},{\"d\":\"2023-01\",\"c\":50.5116},{\"d\":\"2023-02\",\"c\":48.3549},{\"d\":\"2023-03\",\"c\":49.7279},{\"d\":\"2023-04\",\"c\":50.6647},{\"d\":\"2023-05\",\"c\":48.8903},{\"d\":\"2023-06\",\"c\":51.0592},{\"d\":\"2023-07\",\"c\":53.044},{\"d\":\"2023-08\",\"c\":50.7132},{\"d\":\"2023-09\",\"c\":48.988},{\"d\":\"2023-10\",\"c\":47.3404},{\"d\":\"2023-11\",\"c\":51.2397},{\"d\":\"2023-12\",\"c\":53.8494},{\"d\":\"2024-01\",\"c\":52.9296},{\"d\":\"2024-02\",\"c\":54.4719},{\"d\":\"2024-03\",\"c\":56.2338},{\"d\":\"2024-04\",\"c\":54.9282},{\"d\":\"2024-05\",\"c\":57.1384},{\"d\":\"2024-06\",\"c\":56.6843},{\"d\":\"2024-07\",\"c\":58.1695},{\"d\":\"2024-08\",\"c\":59.5702},{\"d\":\"2024-09\",\"c\":61.1186},{\"d\":\"2024-10\",\"c\":58.3903},{\"d\":\"2024-11\",\"c\":58.2581},{\"d\":\"2024-12\",\"c\":56.5844},{\"d\":\"2025-01\",\"c\":58.4952},{\"d\":\"2025-02\",\"c\":59.5802},{\"d\":\"2025-03\",\"c\":59.8068},{\"d\":\"2025-04\",\"c\":61.5019},{\"d\":\"2025-05\",\"c\":64.4681},{\"d\":\"2025-06\",\"c\":67.0193},{\"d\":\"2025-07\",\"c\":66.4179},{\"d\":\"2025-08\",\"c\":69.231},{\"d\":\"2025-09\",\"c\":71.608},{\"d\":\"2025-10\",\"c\":72.7485},{\"d\":\"2025-11\",\"c\":73.0507},{\"d\":\"2025-12\",\"c\":74.8888},{\"d\":\"2026-01\",\"c\":79.078},{\"d\":\"2026-02\",\"c\":83.1977},{\"d\":\"2026-03\",\"c\":76.6261},{\"d\":\"2026-04\",\"c\":82.5387},{\"d\":\"2026-05\",\"c\":85.5199},{\"d\":\"2026-06\",\"c\":85.3358},{\"d\":\"2026-07\",\"c\":84.4374},{\"d\":\"2026-08\",\"c\":87.1625},{\"d\":\"2026-09\",\"c\":84.96},{\"d\":\"2026-10\",\"c\":83.75}]},\"BND\":{\"name\":\"Vanguard Total Bond Market ETF\",\"currency\":\"USD\",\"last\":71.19,\"series\":[{\"d\":\"2007-05\",\"c\":40.4672},{\"d\":\"2007-06\",\"c\":40.3411},{\"d\":\"2007-07\",\"c\":40.7133},{\"d\":\"2007-08\",\"c\":41.3172},{\"d\":\"2007-09\",\"c\":41.5665},{\"d\":\"2007-10\",\"c\":41.9485},{\"d\":\"2007-11\",\"c\":42.7702},{\"d\":\"2007-12\",\"c\":43.1324},{\"d\":\"2008-01\",\"c\":43.673},{\"d\":\"2008-02\",\"c\":43.7122},{\"d\":\"2008-03\",\"c\":43.8869},{\"d\":\"2008-04\",\"c\":43.7352},{\"d\":\"2008-05\",\"c\":43.3005},{\"d\":\"2008-06\",\"c\":43.3187},{\"d\":\"2008-07\",\"c\":43.3278},{\"d\":\"2008-08\",\"c\":43.6909},{\"d\":\"2008-09\",\"c\":43.4655},{\"d\":\"2008-10\",\"c\":42.1844},{\"d\":\"2008-11\",\"c\":43.8409},{\"d\":\"2008-12\",\"c\":46.0929},{\"d\":\"2009-01\",\"c\":45.1357},{\"d\":\"2009-02\",\"c\":44.8714},{\"d\":\"2009-03\",\"c\":45.3624},{\"d\":\"2009-04\",\"c\":45.5737},{\"d\":\"2009-05\",\"c\":45.8804},{\"d\":\"2009-06\",\"c\":46.1644},{\"d\":\"2009-07\",\"c\":46.769},{\"d\":\"2009-08\",\"c\":47.2416},{\"d\":\"2009-09\",\"c\":47.7164},{\"d\":\"2009-10\",\"c\":47.8476},{\"d\":\"2009-11\",\"c\":48.4715},{\"d\":\"2009-12\",\"c\":47.7691},{\"d\":\"2010-01\",\"c\":48.383},{\"d\":\"2010-02\",\"c\":48.5404},{\"d\":\"2010-03\",\"c\":48.4328},{\"d\":\"2010-04\",\"c\":48.9511},{\"d\":\"2010-05\",\"c\":49.5029},{\"d\":\"2010-06\",\"c\":50.2213},{\"d\":\"2010-07\",\"c\":50.6539},{\"d\":\"2010-08\",\"c\":51.4433},{\"d\":\"2010-09\",\"c\":51.4408},{\"d\":\"2010-10\",\"c\":51.6049},{\"d\":\"2010-11\",\"c\":51.2532},{\"d\":\"2010-12\",\"c\":50.7302},{\"d\":\"2011-01\",\"c\":50.7745},{\"d\":\"2011-02\",\"c\":50.9234},{\"d\":\"2011-03\",\"c\":50.8484},{\"d\":\"2011-04\",\"c\":51.5927},{\"d\":\"2011-05\",\"c\":52.2017},{\"d\":\"2011-06\",\"c\":52.0056},{\"d\":\"2011-07\",\"c\":52.8517},{\"d\":\"2011-08\",\"c\":53.7286},{\"d\":\"2011-09\",\"c\":54.0858},{\"d\":\"2011-10\",\"c\":54.1466},{\"d\":\"2011-11\",\"c\":54.1142},{\"d\":\"2011-12\",\"c\":54.7529},{\"d\":\"2012-01\",\"c\":55.1003},{\"d\":\"2012-02\",\"c\":55.1226},{\"d\":\"2012-03\",\"c\":54.8427},{\"d\":\"2012-04\",\"c\":55.4479},{\"d\":\"2012-05\",\"c\":55.9645},{\"d\":\"2012-06\",\"c\":56.0017},{\"d\":\"2012-07\",\"c\":56.6914},{\"d\":\"2012-08\",\"c\":56.7828},{\"d\":\"2012-09\",\"c\":56.8856},{\"d\":\"2012-10\",\"c\":56.8281},{\"d\":\"2012-11\",\"c\":56.8615},{\"d\":\"2012-12\",\"c\":56.3632},{\"d\":\"2013-01\",\"c\":55.9741},{\"d\":\"2013-02\",\"c\":56.2739},{\"d\":\"2013-03\",\"c\":56.3183},{\"d\":\"2013-04\",\"c\":56.89},{\"d\":\"2013-05\",\"c\":55.7945},{\"d\":\"2013-06\",\"c\":54.8751},{\"d\":\"2013-07\",\"c\":55.0839},{\"d\":\"2013-08\",\"c\":54.611},{\"d\":\"2013-09\",\"c\":55.2194},{\"d\":\"2013-10\",\"c\":55.6928},{\"d\":\"2013-11\",\"c\":55.5289},{\"d\":\"2013-12\",\"c\":55.1753},{\"d\":\"2014-01\",\"c\":56.03},{\"d\":\"2014-02\",\"c\":56.2932},{\"d\":\"2014-03\",\"c\":56.1977},{\"d\":\"2014-04\",\"c\":56.6486},{\"d\":\"2014-05\",\"c\":57.2452},{\"d\":\"2014-06\",\"c\":57.2933},{\"d\":\"2014-07\",\"c\":57.1341},{\"d\":\"2014-08\",\"c\":57.7863},{\"d\":\"2014-09\",\"c\":57.4559},{\"d\":\"2014-10\",\"c\":57.8712},{\"d\":\"2014-11\",\"c\":58.3522},{\"d\":\"2014-12\",\"c\":58.3853},{\"d\":\"2015-01\",\"c\":59.7888},{\"d\":\"2015-02\",\"c\":59.0075},{\"d\":\"2015-03\",\"c\":59.3292},{\"d\":\"2015-04\",\"c\":59.1373},{\"d\":\"2015-05\",\"c\":58.8436},{\"d\":\"2015-06\",\"c\":58.189},{\"d\":\"2015-07\",\"c\":58.7007},{\"d\":\"2015-08\",\"c\":58.5561},{\"d\":\"2015-09\",\"c\":59.0303},{\"d\":\"2015-10\",\"c\":59.0476},{\"d\":\"2015-11\",\"c\":58.8153},{\"d\":\"2015-12\",\"c\":58.7117},{\"d\":\"2016-01\",\"c\":59.4169},{\"d\":\"2016-02\",\"c\":59.9225},{\"d\":\"2016-03\",\"c\":60.4518},{\"d\":\"2016-04\",\"c\":60.6954},{\"d\":\"2016-05\",\"c\":60.691},{\"d\":\"2016-06\",\"c\":61.9168},{\"d\":\"2016-07\",\"c\":62.2878},{\"d\":\"2016-08\",\"c\":62.0923},{\"d\":\"2016-09\",\"c\":62.1632},{\"d\":\"2016-10\",\"c\":61.5792},{\"d\":\"2016-11\",\"c\":59.9943},{\"d\":\"2016-12\",\"c\":60.1922},{\"d\":\"2017-01\",\"c\":60.304},{\"d\":\"2017-02\",\"c\":60.6757},{\"d\":\"2017-03\",\"c\":60.6518},{\"d\":\"2017-04\",\"c\":61.1346},{\"d\":\"2017-05\",\"c\":61.5688},{\"d\":\"2017-06\",\"c\":61.6003},{\"d\":\"2017-07\",\"c\":61.9776},{\"d\":\"2017-08\",\"c\":62.6395},{\"d\":\"2017-09\",\"c\":62.3459},{\"d\":\"2017-10\",\"c\":62.3291},{\"d\":\"2017-11\",\"c\":62.2627},{\"d\":\"2017-12\",\"c\":62.5995},{\"d\":\"2018-01\",\"c\":61.8244},{\"d\":\"2018-02\",\"c\":61.1837},{\"d\":\"2018-03\",\"c\":61.6038},{\"d\":\"2018-04\",\"c\":61.0784},{\"d\":\"2018-05\",\"c\":61.495},{\"d\":\"2018-06\",\"c\":61.6109},{\"d\":\"2018-07\",\"c\":61.5883},{\"d\":\"2018-08\",\"c\":62.0002},{\"d\":\"2018-09\",\"c\":61.6617},{\"d\":\"2018-10\",\"c\":61.1301},{\"d\":\"2018-11\",\"c\":61.519},{\"d\":\"2018-12\",\"c\":62.6721},{\"d\":\"2019-01\",\"c\":63.3684},{\"d\":\"2019-02\",\"c\":63.3113},{\"d\":\"2019-03\",\"c\":64.5387},{\"d\":\"2019-04\",\"c\":64.5228},{\"d\":\"2019-05\",\"c\":65.7011},{\"d\":\"2019-06\",\"c\":66.5204},{\"d\":\"2019-07\",\"c\":66.6199},{\"d\":\"2019-08\",\"c\":68.4646},{\"d\":\"2019-09\",\"c\":68.076},{\"d\":\"2019-10\",\"c\":68.2877},{\"d\":\"2019-11\",\"c\":68.2594},{\"d\":\"2019-12\",\"c\":68.2085},{\"d\":\"2020-01\",\"c\":69.5587},{\"d\":\"2020-02\",\"c\":70.7185},{\"d\":\"2020-03\",\"c\":69.7082},{\"d\":\"2020-04\",\"c\":71.6319},{\"d\":\"2020-05\",\"c\":72.1108},{\"d\":\"2020-06\",\"c\":72.5948},{\"d\":\"2020-07\",\"c\":73.6503},{\"d\":\"2020-08\",\"c\":72.9567},{\"d\":\"2020-09\",\"c\":72.8848},{\"d\":\"2020-10\",\"c\":72.4793},{\"d\":\"2020-11\",\"c\":73.3589},{\"d\":\"2020-12\",\"c\":73.4707},{\"d\":\"2021-01\",\"c\":72.8376},{\"d\":\"2021-02\",\"c\":71.7103},{\"d\":\"2021-03\",\"c\":70.7986},{\"d\":\"2021-04\",\"c\":71.4117},{\"d\":\"2021-05\",\"c\":71.5216},{\"d\":\"2021-06\",\"c\":72.1635},{\"d\":\"2021-07\",\"c\":73.0066},{\"d\":\"2021-08\",\"c\":72.8684},{\"d\":\"2021-09\",\"c\":72.1298},{\"d\":\"2021-10\",\"c\":72.1805},{\"d\":\"2021-11\",\"c\":72.3279},{\"d\":\"2021-12\",\"c\":72.1034},{\"d\":\"2022-01\",\"c\":70.6145},{\"d\":\"2022-02\",\"c\":69.8109},{\"d\":\"2022-03\",\"c\":67.8897},{\"d\":\"2022-04\",\"c\":65.1926},{\"d\":\"2022-05\",\"c\":65.7336},{\"d\":\"2022-06\",\"c\":64.641},{\"d\":\"2022-07\",\"c\":66.1806},{\"d\":\"2022-08\",\"c\":64.3292},{\"d\":\"2022-09\",\"c\":61.6383},{\"d\":\"2022-10\",\"c\":60.9247},{\"d\":\"2022-11\",\"c\":63.1582},{\"d\":\"2022-12\",\"c\":62.6491},{\"d\":\"2023-01\",\"c\":64.7246},{\"d\":\"2023-02\",\"c\":62.9991},{\"d\":\"2023-03\",\"c\":64.6847},{\"d\":\"2023-04\",\"c\":65.065},{\"d\":\"2023-05\",\"c\":64.3078},{\"d\":\"2023-06\",\"c\":64.164},{\"d\":\"2023-07\",\"c\":64.0879},{\"d\":\"2023-08\",\"c\":63.6646},{\"d\":\"2023-09\",\"c\":62.0862},{\"d\":\"2023-10\",\"c\":61.1423},{\"d\":\"2023-11\",\"c\":63.919},{\"d\":\"2023-12\",\"c\":66.1915},{\"d\":\"2024-01\",\"c\":66.0835},{\"d\":\"2024-02\",\"c\":65.1827},{\"d\":\"2024-03\",\"c\":65.7367},{\"d\":\"2024-04\",\"c\":64.1535},{\"d\":\"2024-05\",\"c\":65.2316},{\"d\":\"2024-06\",\"c\":65.8061},{\"d\":\"2024-07\",\"c\":67.3552},{\"d\":\"2024-08\",\"c\":68.333},{\"d\":\"2024-09\",\"c\":69.2327},{\"d\":\"2024-10\",\"c\":67.5326},{\"d\":\"2024-11\",\"c\":68.254},{\"d\":\"2024-12\",\"c\":67.1067},{\"d\":\"2025-01\",\"c\":67.508},{\"d\":\"2025-02\",\"c\":68.9638},{\"d\":\"2025-03\",\"c\":68.9723},{\"d\":\"2025-04\",\"c\":69.2455},{\"d\":\"2025-05\",\"c\":68.7786},{\"d\":\"2025-06\",\"c\":69.8217},{\"d\":\"2025-07\",\"c\":69.6362},{\"d\":\"2025-08\",\"c\":70.4398},{\"d\":\"2025-09\",\"c\":71.2184},{\"d\":\"2025-10\",\"c\":71.6478},{\"d\":\"2025-11\",\"c\":72.0758},{\"d\":\"2025-12\",\"c\":71.8594},{\"d\":\"2026-01\",\"c\":72.0147},{\"d\":\"2026-02\",\"c\":73.1681},{\"d\":\"2026-03\",\"c\":71.8969},{\"d\":\"2026-04\",\"c\":72.0047},{\"d\":\"2026-05\",\"c\":72.2032},{\"d\":\"2026-06\",\"c\":72.3975},{\"d\":\"2026-07\",\"c\":71.4713},{\"d\":\"2026-08\",\"c\":71.7315},{\"d\":\"2026-09\",\"c\":69.901},{\"d\":\"2026-10\",\"c\":71.19}]},\"SGOV\":{\"name\":\"iShares 0-3 Month Treasury Bond\",\"currency\":\"USD\",\"last\":100.7,\"series\":[{\"d\":\"2020-06\",\"c\":83.3399},{\"d\":\"2020-07\",\"c\":83.3433},{\"d\":\"2020-08\",\"c\":83.3499},{\"d\":\"2020-09\",\"c\":83.3499},{\"d\":\"2020-10\",\"c\":83.3583},{\"d\":\"2020-11\",\"c\":83.3624},{\"d\":\"2020-12\",\"c\":83.3674},{\"d\":\"2021-01\",\"c\":83.3716},{\"d\":\"2021-02\",\"c\":83.3716},{\"d\":\"2021-03\",\"c\":83.3808},{\"d\":\"2021-04\",\"c\":83.3849},{\"d\":\"2021-05\",\"c\":83.3816},{\"d\":\"2021-06\",\"c\":83.3841},{\"d\":\"2021-07\",\"c\":83.3874},{\"d\":\"2021-08\",\"c\":83.3916},{\"d\":\"2021-09\",\"c\":83.3858},{\"d\":\"2021-10\",\"c\":83.3899},{\"d\":\"2021-11\",\"c\":83.3949},{\"d\":\"2021-12\",\"c\":83.4033},{\"d\":\"2022-01\",\"c\":83.3999},{\"d\":\"2022-02\",\"c\":83.4158},{\"d\":\"2022-03\",\"c\":83.4308},{\"d\":\"2022-04\",\"c\":83.4558},{\"d\":\"2022-05\",\"c\":83.5025},{\"d\":\"2022-06\",\"c\":83.5518},{\"d\":\"2022-07\",\"c\":83.6019},{\"d\":\"2022-08\",\"c\":83.8059},{\"d\":\"2022-09\",\"c\":83.9818},{\"d\":\"2022-10\",\"c\":84.2152},{\"d\":\"2022-11\",\"c\":84.4449},{\"d\":\"2022-12\",\"c\":84.7212},{\"d\":\"2023-01\",\"c\":85.0548},{\"d\":\"2023-02\",\"c\":85.359},{\"d\":\"2023-03\",\"c\":85.6656},{\"d\":\"2023-04\",\"c\":85.9579},{\"d\":\"2023-05\",\"c\":86.3821},{\"d\":\"2023-06\",\"c\":86.7268},{\"d\":\"2023-07\",\"c\":87.1678},{\"d\":\"2023-08\",\"c\":87.5338},{\"d\":\"2023-09\",\"c\":87.883},{\"d\":\"2023-10\",\"c\":88.3295},{\"d\":\"2023-11\",\"c\":88.702},{\"d\":\"2023-12\",\"c\":89.0611},{\"d\":\"2024-01\",\"c\":89.5126},{\"d\":\"2024-02\",\"c\":89.8786},{\"d\":\"2024-03\",\"c\":90.228},{\"d\":\"2024-04\",\"c\":90.7125},{\"d\":\"2024-05\",\"c\":91.056},{\"d\":\"2024-06\",\"c\":91.4191},{\"d\":\"2024-07\",\"c\":91.9044},{\"d\":\"2024-08\",\"c\":92.2616},{\"d\":\"2024-09\",\"c\":92.7348},{\"d\":\"2024-10\",\"c\":93.0814},{\"d\":\"2024-11\",\"c\":93.3968},{\"d\":\"2024-12\",\"c\":93.8073},{\"d\":\"2025-01\",\"c\":94.0971},{\"d\":\"2025-02\",\"c\":94.4094},{\"d\":\"2025-03\",\"c\":94.804},{\"d\":\"2025-04\",\"c\":95.111},{\"d\":\"2025-05\",\"c\":95.4046},{\"d\":\"2025-06\",\"c\":95.7994},{\"d\":\"2025-07\",\"c\":96.1162},{\"d\":\"2025-08\",\"c\":96.4514},{\"d\":\"2025-09\",\"c\":96.8234},{\"d\":\"2025-10\",\"c\":97.1127},{\"d\":\"2025-11\",\"c\":97.401},{\"d\":\"2025-12\",\"c\":97.7665},{\"d\":\"2026-01\",\"c\":98.0196},{\"d\":\"2026-02\",\"c\":98.2921},{\"d\":\"2026-03\",\"c\":98.64},{\"d\":\"2026-04\",\"c\":98.9131},{\"d\":\"2026-05\",\"c\":99.1693},{\"d\":\"2026-06\",\"c\":99.5301},{\"d\":\"2026-07\",\"c\":99.7976},{\"d\":\"2026-08\",\"c\":100.1696},{\"d\":\"2026-09\",\"c\":100.44},{\"d\":\"2026-10\",\"c\":100.7}]}}")
};
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getMarket = createServerFn({ method: "GET" }).handler(createSsrRpc("dcb6a66934d86a6b3914a6c724401dea17492057d2a3afde0b5a356a62ce1b42"));
var $$splitComponentImporter = () => import("./routes-BiCjfVkK.mjs");
var Route = createFileRoute("/")({
	loader: async () => {
		try {
			return { market: await getMarket() };
		} catch (error) {
			console.error("Live prices unavailable, using saved history.", error);
			return { market: fromSnapshot(snapshot_default) };
		}
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = { IndexRoute: Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$1
}) };
var routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route as n, router_exports as t };
