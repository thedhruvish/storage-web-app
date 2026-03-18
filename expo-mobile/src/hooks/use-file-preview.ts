import { useState, useCallback } from "react";
import * as Linking from "expo-linking";
import type { FileItem } from "@/components/directory/types";
import { getFileIconName } from "@/utils/file-icon-helper";
import { useDialog } from "@/components/dialog";
import { useFileOperation } from "./use-file-operation";

export const useFilePreview = () => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const { showDialog } = useDialog();
  const { getFileUrl } = useFileOperation();

  const handlePreview = useCallback(
    async (file: FileItem) => {
      if (!file.extension) return;

      try {
        setIsOpening(true);
        console.log(file.extension);
        const fileType = getFileIconName(file.extension);
        const actualUrl = await getFileUrl(file._id);

        if (!actualUrl) {
          showDialog({
            title: "Error",
            message: "Could not retrieve file link.",
            type: "error",
          });
          return;
        }
        console.log(fileType);
        if (fileType === "image") {
          // For images, show the internal preview modal
          setPreviewFile({ ...file, previewUrl: actualUrl });
          setIsPreviewVisible(true);
          return;
        } else {
          const canOpen = await Linking.canOpenURL(actualUrl);
          if (canOpen || true) {
            // Some URLs can't be pre-checked but can be opened
            await Linking.openURL(actualUrl);
          } else {
            showDialog({
              title: "Error",
              message: "No supported app found to open this file.",
              type: "error",
            });
          }
        }
      } catch (error: any) {
        console.error("Error opening file:", error);
        showDialog({
          title: "Error",
          message: error.message || "Failed to open file in external app",
          type: "error",
        });
      } finally {
        setIsOpening(false);
      }
    },
    [showDialog, getFileUrl],
  );

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewFile(null);
  }, []);

  return {
    previewFile,
    isPreviewVisible,
    isOpening,
    handlePreview,
    closePreview,
  };
};
