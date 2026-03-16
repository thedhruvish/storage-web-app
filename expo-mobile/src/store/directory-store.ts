import { create } from "zustand";

interface DirectoryState {
  selectedFiles: Set<string>;
  toggleSelection: (fileId: string) => void;
  clearSelection: () => void;
  selectAll: (fileIds: string[]) => void;
  isSelectionMode: () => boolean;
}

export const useDirectoryStore = create<DirectoryState>((set, get) => ({
  selectedFiles: new Set(),

  toggleSelection: (fileId: string) =>
    set((state) => {
      const newSelection = new Set(state.selectedFiles);
      if (newSelection.has(fileId)) {
        newSelection.delete(fileId);
      } else {
        newSelection.add(fileId);
      }
      return { selectedFiles: newSelection };
    }),

  clearSelection: () => set({ selectedFiles: new Set() }),
  selectAll: (fileIds) => set({ selectedFiles: new Set(fileIds) }),
  isSelectionMode: () => get().selectedFiles.size > 0,
}));
