import { create } from "zustand";

interface SearchState {
  query: string;
  extensions: string;
  size: string;
  isStarred: boolean;
  setSearch: (query: string) => void;
  setExtensions: (extensions: string) => void;
  setSize: (size: string) => void;
  setIsStarred: (isStarred: boolean) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  extensions: "",
  size: "",
  isStarred: false,
  setSearch: (query) => set({ query }),
  setExtensions: (extensions) => set({ extensions }),
  setSize: (size) => set({ size }),
  setIsStarred: (isStarred) => set({ isStarred }),
  resetFilters: () => set({ extensions: "", size: "", isStarred: false }),
  resetAll: () =>
    set({ query: "", extensions: "", size: "", isStarred: false }),
}));
