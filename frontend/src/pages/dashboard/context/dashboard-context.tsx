import React, { useState } from "react";
import type { FileItem } from "../types";
import useDialogState from "@/hooks/use-dialog-state";

type DashboardDialogType =
  | "rename"
  | "add"
  | "download"
  | "delete"
  | "share"
  | "star"
  | "newDirectory"
  | "uploadFile";

interface DashboardContextType {
  open: DashboardDialogType | null;
  setOpen: (str: DashboardDialogType | null) => void;
  currentItem: FileItem | null;
  setCurrentItem: React.Dispatch<React.SetStateAction<FileItem | null>>;
}

const DashboardContext = React.createContext<DashboardContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

//  Provider component
export default function DashboardProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<DashboardDialogType>(null);
  const [currentItem, setCurrentItem] = useState<FileItem | null>(null);

  return (
    <DashboardContext.Provider
      value={{ open, setOpen, currentItem, setCurrentItem }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

//  Custom hook
export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within <DashboardProvider>");
  }
  return context;
};
