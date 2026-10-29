import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Fill } from "@/lib/book";
import type { RiskDrop, StrategyId } from "@/lib/strategies/engine";

export type Style = "schedule" | "rule";

export type Profile = {
  monthly: number;
  years: number;
  drop: RiskDrop;
  style: Style;
  override: StrategyId | null;
};

type GroveState = {
  profile: Profile;
  fills: Fill[];
  ready: boolean;
  setProfile: (patch: Partial<Profile>) => void;
  addFills: (fills: Fill[]) => void;
  undoLast: () => void;
  setReady: (ready: boolean) => void;
};

export const defaultProfile: Profile = {
  monthly: 500,
  years: 20,
  drop: 25,
  style: "schedule",
  override: null,
};

export const useGrove = create<GroveState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      fills: [],
      ready: false,
      setProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      addFills: (fills) => set((state) => ({ fills: [...state.fills, ...fills] })),
      undoLast: () =>
        set((state) => {
          const last = state.fills[state.fills.length - 1];
          if (!last) return state;
          return { fills: state.fills.filter((fill) => fill.batchId !== last.batchId) };
        }),
      setReady: (ready) => set({ ready }),
    }),
    {
      name: "grove-book-v1",
      skipHydration: true,
      partialize: (state) => ({ profile: state.profile, fills: state.fills }),
      onRehydrateStorage: () => (state) => {
        state?.setReady(true);
      },
    },
  ),
);
