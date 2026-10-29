import { createFileRoute } from "@tanstack/react-router";
import { GroveApp } from "@/components/grove/app";
import snapshot from "@/lib/market/snapshot.json";
import { getMarket } from "@/lib/market/quotes";
import { fromSnapshot, type MarketBundle } from "@/lib/market/shape";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ market: MarketBundle }> => {
    try {
      return { market: await getMarket() };
    } catch (error) {
      console.error("Live prices unavailable, using saved history.", error);
      return { market: fromSnapshot(snapshot) };
    }
  },
  component: Home,
});

function Home() {
  const { market } = Route.useLoaderData();
  return <GroveApp market={market} />;
}
