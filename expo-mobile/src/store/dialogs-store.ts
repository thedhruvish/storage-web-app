import { create } from "zustand";

type DialogType =
  | "createFolder"
  | "upload"
  | "preview"
  | "rename"
  | "delete"
  | "share"
  | "details"
  | null;

interface DialogState {
  open: DialogType;
  currentItem: any;
  setOpen: (open: DialogType) => void;
  setCurrentItem: (item: any) => void;
  closeDialogs: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  open: null,
  currentItem: null,
  setOpen: (open) => set({ open }),
  setCurrentItem: (item) => set({ currentItem: item }),
  closeDialogs: () => set({ open: null, currentItem: null }),
}));
