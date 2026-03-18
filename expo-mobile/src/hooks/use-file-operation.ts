import * as FileSystem from "expo-file-system/legacy";
import axiosClient from "@/api/axios-client";
import type { FileItem } from "@/components/directory/types";
import { useCallback } from "react";

export const useFileOperation = () => {
  const getFileUrl = useCallback(async (fileId: string, action?: string) => {
    try {
      const response = await axiosClient.get(
        `/document/${fileId}${action ? `?action=${action}` : ""}`,
      );
      return response.data?.data as string;
    } catch (error) {
      console.error("Failed to get file URL", error);
      return null;
    }
  }, []);

  const downloadToTemp = useCallback(
    async (file: FileItem, action?: string) => {
      try {
        const actualUrl = await getFileUrl(file._id, action);
        if (!actualUrl) return null;

        const timestamp = Date.now();
        const extension = file.extension
          ? `.${file.extension.replace(".", "")}`
          : "";
        const tempLocalUri = `${FileSystem.cacheDirectory}temp_${timestamp}${extension}`;

        const downloadResumable = FileSystem.createDownloadResumable(
          actualUrl,
          tempLocalUri,
        );

        const result = await downloadResumable.downloadAsync();
        if (result && result.status === 200) {
          return result.uri;
        }
        return null;
      } catch (error) {
        console.error("Failed to download to temp", error);
        return null;
      }
    },
    [getFileUrl],
  );

  return { getFileUrl, downloadToTemp };
};
