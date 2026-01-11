import { create } from "zustand";

interface DirectoryState {
  selectedFiles: Set<string>;
  toggleSelection: (
    id: string,
    multiSelect: boolean,
    rangeSelect: boolean
  ) => void;
  selectFile: (id: string) => void;
  clearSelection: () => void;
  setSelection: (ids: Set<string>) => void;
}

export const useDirectoryStore = create<DirectoryState>((set) => ({
  selectedFiles: new Set(),
  toggleSelection: (id, multiSelect, rangeSelect) =>
    set((state) => {
      const newSelected = new Set(
        multiSelect
          ? state.selectedFiles
          : rangeSelect
            ? state.selectedFiles
            : []
      );

      if (multiSelect) {
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
      } else if (rangeSelect) {
        // Simple range select implementation: add to existing
        // For full range select, we'd need the list of files to find indices
        newSelected.add(id);
      } else {
        newSelected.clear();
        newSelected.add(id);
      }

      return { selectedFiles: newSelected };
    }),
  selectFile: (id) =>
    set(() => ({
      selectedFiles: new Set([id]),
    })),
  clearSelection: () => set({ selectedFiles: new Set() }),
  setSelection: (ids) => set({ selectedFiles: ids }),
}));
