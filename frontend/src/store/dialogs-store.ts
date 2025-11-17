import type { FileItem } from "@/pages/directory/types";
import { create } from "zustand";

type DialogDialogType =
  | "rename"
  | "add"
  | "download"
  | "delete"
  | "share"
  | "star"
  | "newDirectory"
  | "uploadFile"
  | "details"
  | "importFile";

interface DialogState {
  open: DialogDialogType | null;
  setOpen: (open: DialogDialogType | null) => void;
  currentItem: FileItem | null;
  setCurrentItem: (item: FileItem | null) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
  currentItem: null,
  setCurrentItem: (item) => set({ currentItem: item }),
  closeDialog: () => set({ open: null, currentItem: null }),
}));
