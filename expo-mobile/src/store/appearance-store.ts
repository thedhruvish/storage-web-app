import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "expo-sqlite/kv-store";

type DirectoryLayout = "grid" | "list";

interface AppearanceState {
  directoryLayout: DirectoryLayout;
  setDirectoryLayout: (layout: DirectoryLayout) => void;
}

export const useAppearance = create<AppearanceState>()(
  persist(
    (set) => ({
      directoryLayout: "grid",
      setDirectoryLayout: (layout) => set({ directoryLayout: layout }),
    }),
    {
      name: "appearance-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
