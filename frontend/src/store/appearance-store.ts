import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Appearance = {
  sidebar: boolean;
  directoryLayout: "grid" | "list";
  theme: "dark" | "light" | "system";
};

type AppearanceStore = {
  appearance: Appearance;
  setAppearance: (updates: Partial<Appearance>) => void;
  clearAppearance: () => void;
};

const defaultAppearance: Appearance = {
  sidebar: true,
  directoryLayout: "grid",
  theme: "light",
};

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set, get) => ({
      appearance: defaultAppearance,
      setAppearance: (updates) =>
        set({
          appearance: {
            ...get().appearance,
            ...updates,
          },
        }),
      clearAppearance: () => set({ appearance: defaultAppearance }),
    }),
    {
      name: "user-appearance-storage",
      partialize: (state) => ({ appearance: state.appearance }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export const useAppearance = () => {
  const appearance = useAppearanceStore((state) => state.appearance);
  const setAppearance = useAppearanceStore((state) => state.setAppearance);
  const clearAppearance = useAppearanceStore((state) => state.clearAppearance);

  return { appearance, setAppearance, clearAppearance };
};
