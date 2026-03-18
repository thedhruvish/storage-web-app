import { useState, useCallback } from "react";
import { usestarredToggle, useUpdateDirectory, useDeleteDirectory } from "@/api/directory-api";
import { useUpdateDocument, useDeleteDocument } from "@/api/document-api";
import { useDirectoryStore } from "@/store/directory-store";
import type { FileItem } from "@/components/directory/types";
import { useDialog } from "@/components/dialog";
import { useDownload } from "./use-download";

export const useFileActions = (directoryId: string = "") => {
  const { selectedFiles, clearSelection } = useDirectoryStore();
  const { showDialog } = useDialog();
  const { downloadBatch } = useDownload();
  
  const starToggleMutation = usestarredToggle();
  const updateDirectoryMutation = useUpdateDirectory(directoryId);
  const updateDocumentMutation = useUpdateDocument(directoryId);
  const deleteDirectoryMutation = useDeleteDirectory(directoryId);
  const deleteDocumentMutation = useDeleteDocument(directoryId);

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);

  const handleStar = useCallback(async (files: FileItem[]) => {
    try {
      for (const file of files) {
        await starToggleMutation.mutateAsync({
          id: file._id,
          type: file.extension ? "document" : "directory",
        });
      }
      clearSelection();
    } catch (error) {
      console.error("Failed to star files:", error);
    }
  }, [starToggleMutation, clearSelection]);

  const handleRename = useCallback(async (file: FileItem, newName: string) => {
    try {
      if (file.extension || file.type === "file") {
        await updateDocumentMutation.mutateAsync({
          id: file._id,
          data: { name: newName },
        });
      } else {
        await updateDirectoryMutation.mutateAsync({
          id: file._id,
          data: { name: newName },
        });
      }
      clearSelection();
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  }, [updateDocumentMutation, updateDirectoryMutation, clearSelection]);

  const handleDelete = useCallback(async (files: FileItem[]) => {
    const names = files.length === 1 ? files[0].name : `${files.length} items`;
    
    showDialog({
      title: "Delete",
      message: `Are you sure you want to delete ${names}?`,
      type: "warning",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          for (const file of files) {
            if (file.extension || file.type === "file") {
              await deleteDocumentMutation.mutateAsync({ id: file._id });
            } else {
              await deleteDirectoryMutation.mutateAsync({ id: file._id });
            }
          }
          clearSelection();
        } catch (error) {
          console.error("Failed to delete files:", error);
        }
      },
    });
  }, [deleteDocumentMutation, deleteDirectoryMutation, clearSelection, showDialog]);

  const handleShare = useCallback(() => {
    showDialog({
      title: "Share",
      message: "Share functionality is coming soon!",
      type: "info",
      confirmText: "OK",
    });
  }, [showDialog]);

  const handleDownload = useCallback(async (files: FileItem[]) => {
    await downloadBatch(files);
    clearSelection();
  }, [downloadBatch, clearSelection]);

  const openRenameDialog = useCallback((file: FileItem) => {
    setFileToRename(file);
    setRenameDialogOpen(true);
  }, []);

  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
    setFileToRename(null);
  }, []);

  return {
    handleStar,
    handleRename,
    handleDelete,
    handleShare,
    handleDownload,
    renameDialogOpen,
    fileToRename,
    openRenameDialog,
    closeRenameDialog,
  };
};
