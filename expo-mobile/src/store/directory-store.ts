import { create } from "zustand";

interface DirectoryState {
  selectedFiles: Set<string>;
  toggleSelection: (
    fileId: string,
    isMetaKey?: boolean,
    isShiftKey?: boolean
  ) => void;
  clearSelection: () => void;
  selectAll: (fileIds: string[]) => void;
}

export const useDirectoryStore = create<DirectoryState>((set) => ({
  selectedFiles: new Set(),
  toggleSelection: (fileId, isMetaKey = false, isShiftKey = false) =>
    set((state) => {
      const newSelection = new Set(state.selectedFiles);
      
      // In mobile, we might not always have meta/shift, but keeping the logic
      // for future keyboard support (e.g. iPad) or long-press multi-select
      if (isMetaKey) {
        if (newSelection.has(fileId)) {
          newSelection.delete(fileId);
        } else {
          newSelection.add(fileId);
        }
      } else {
        // Without meta key, if the file is already the only one selected, do nothing
        // Otherwise, clear selection and select just this file
        if (newSelection.size === 1 && newSelection.has(fileId)) {
          // It's already the only selected item, toggle off for mobile.
          return { selectedFiles: new Set() };
        }
        newSelection.clear();
        newSelection.add(fileId);
      }

      return { selectedFiles: newSelection };
    }),
  clearSelection: () => set({ selectedFiles: new Set() }),
  selectAll: (fileIds) => set({ selectedFiles: new Set(fileIds) }),
}));
