import { create } from "zustand";

type BreadCrumDetails = {
  name: string;
  _id: string;
};

type StatusT = "idle" | "loading" | "error" | "success";

interface UseBreadCrumDetails {
  path: BreadCrumDetails[];
  setPath: (newPath: BreadCrumDetails | BreadCrumDetails[]) => void;
  currentItemName: string | null;
  setCurrentItem: (item: string | null) => void;
  status: StatusT;
  setStatus: (status: StatusT) => void;
}

export const useBreadCrumStore = create<UseBreadCrumDetails>((set) => ({
  path: [],
  status: "idle",
  setPath: (newPath) => {
    if (Array.isArray(newPath)) {
      set({ path: newPath });
    } else {
      set((state) => ({ path: [...state.path, newPath] }));
    }
  },
  currentItemName: null,
  setCurrentItem: (item) => set({ currentItemName: item }),
  setStatus: (status) => set({ status }),
}));
