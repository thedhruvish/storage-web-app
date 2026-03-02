import { create } from "zustand";
import { persist } from "zustand/middleware";

type StorageState = {
  totalUsedBytes: number;
  setTotalUsedBytes: (bytes: number) => void;
};

export const useStorageStore = create<StorageState>()(
  persist(
    (set) => ({
      totalUsedBytes: 0,
      setTotalUsedBytes: (bytes) => set({ totalUsedBytes: bytes }),
    }),
    {
      name: "storage-metrics",
    }
  )
);
