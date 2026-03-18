import * as FileSystem from "expo-file-system/legacy";
import { Directory, File } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";
import type { FileItem } from "@/components/directory/types";
import KvStore from "expo-sqlite/kv-store";
import axiosClient from "@/api/axios-client";
import { useDialog } from "@/components/dialog";
import * as Linking from "expo-linking";
import { getMimeType } from "@/utils/mime-helper";

const DOWNLOAD_DIR_KEY = "download_directory_uri";

export const useDownload = () => {
  const { showDialog } = useDialog();

  const getStoredDirectory = async () => {
    if (Platform.OS !== "android") return null;
    const uri = await KvStore.getItem(DOWNLOAD_DIR_KEY);
    if (!uri) return null;

    try {
      const dir = new Directory(uri);
      if (dir.exists) {
        return dir;
      }
    } catch (e) {
      console.error("Invalid stored directory URI", e);
    }
    return null;
  };

  const pickAndStoreDirectory = async () => {
    try {
      const dir = await Directory.pickDirectoryAsync();
      if (dir) {
        await KvStore.setItem(DOWNLOAD_DIR_KEY, dir.uri);
        return dir;
      }
    } catch (e) {
      console.error("Failed to pick directory", e);
    }
    return null;
  };

  const downloadFile = async (file: FileItem) => {
    let tempUri = "";
    try {
      // 1. Permissions
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== "granted") {
        showDialog({
          title: "Permission Denied",
          message: "Permission to access storage is required to download files.",
          type: "warning",
        });
        return;
      }

      // 2. Request the download URL
      const response = await axiosClient.get(
        `/document/${file._id}?action=download`,
      );
      const actualDownloadUrl = response.data?.data; 
      
      if (!actualDownloadUrl) {
        showDialog({
          title: "Error",
          message: "Could not retrieve download link.",
          type: "error",
        });
        return;
      }

      const token = handleToken.getToken(AUTH_TOKEN_NAME);
      const headers = {
        Token: token || "",
        "X-Platform": "mobile",
      };

      if (Platform.OS === "android") {
        let targetDir = await getStoredDirectory();

        if (!targetDir) {
          showDialog({
            title: "Download Folder",
            message: "Please select a directory to save your downloads.",
            type: "info",
            confirmText: "Select Folder",
            onConfirm: async () => {
              targetDir = await pickAndStoreDirectory();
              if (targetDir) {
                // Re-trigger download after selection
                downloadFile(file);
              }
            },
          });
          return; // Exit and wait for user to select folder
        }

        if (targetDir) {
          try {
            // Check if 'storeone' already exists to avoid duplicates like 'storeone (1)'
            const existingItems = targetDir.list();
            let storeOneDir = existingItems.find(
              (item) => item instanceof Directory && item.name === "storeone"
            ) as Directory | undefined;

            if (!storeOneDir) {
              storeOneDir = targetDir.createDirectory("storeone");
              if (!storeOneDir.exists) {
                await storeOneDir.create({ idempotent: true });
              }
            }

            // Check if the file already exists in 'storeone' to avoid duplicates like 'file (1).png'
            const storeOneItems = storeOneDir.list();
            let finalFile = storeOneItems.find(
              (item) => item instanceof File && item.name === file.name
            ) as File | undefined;

            if (!finalFile) {
              let nameWithoutExtension = file.name;
              if (file.extension && file.name.toLowerCase().endsWith("." + file.extension.toLowerCase())) {
                nameWithoutExtension = file.name.slice(0, -(file.extension.length + 1));
              }
              const mimeType = getMimeType(file.extension);
              finalFile = storeOneDir.createFile(nameWithoutExtension, mimeType);
            }
            
            // 1. Download to a temporary LOCAL file first (must be file:// for downloadAsync)
            const timestamp = Date.now();
            const extension = file.extension ? `.${file.extension.replace(".", "")}` : "";
            const tempLocalUri = `${FileSystem.documentDirectory}temp_saf_${timestamp}${extension}`;
            
            const downloadResult = await FileSystem.downloadAsync(actualDownloadUrl, tempLocalUri, {
              headers,
            });

            if (downloadResult.status === 200) {
              // 2. Read the temp file as base64
              const base64Content = await FileSystem.readAsStringAsync(downloadResult.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });

              // 3. Use StorageAccessFramework to write to the content URI
              await FileSystem.StorageAccessFramework.writeAsStringAsync(
                finalFile.uri,
                base64Content,
                { encoding: FileSystem.EncodingType.Base64 }
              );

              // 4. Cleanup temp local file
              await FileSystem.deleteAsync(tempLocalUri, { idempotent: true });

              showDialog({
                title: "Download Complete",
                message: `File saved to storeone/${file.name}`,
                type: "success",
                confirmText: "Open Folder",
                onConfirm: () => {
                  if (storeOneDir.uri) {
                    Linking.openURL(storeOneDir.uri).catch(err => {
                      console.error("Failed to open folder:", err);
                    });
                  }
                },
                cancelText: "Dismiss",
              });
              return; // Success!
            }
          } catch (err) {
            console.error("SAF write failed, falling back to MediaLibrary:", err);
          }
        }
      }

      // 3. Fallback/iOS path: Download to temporary file
      const timestamp = Date.now();
      const extension = file.extension ? `.${file.extension.replace(".", "")}` : "";
      const tempFileName = `temp_${timestamp}${extension}`;
      tempUri = `${FileSystem.documentDirectory}${tempFileName}`;

      await FileSystem.deleteAsync(tempUri, { idempotent: true });

      const downloadResult = await FileSystem.downloadAsync(actualDownloadUrl, tempUri, {
        headers,
      });

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      if (Platform.OS === "ios") {
        // iOS: Share sheet
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
          showDialog({
            title: "Success",
            message: "File saved to media library.",
            type: "success",
          });
        }
      } else {
        // Android fallback (if SAF failed or was cancelled)
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        showDialog({
          title: "Success",
          message: "File saved to media library.",
          type: "success",
        });
      }

    } catch (error) {
      console.error("Download error:", error);
      showDialog({
        title: "Download Failed",
        message: "Failed to download file.",
        type: "error",
      });
    } finally {
      // Cleanup temp file if it was created
      if (tempUri) {
        try {
          await FileSystem.deleteAsync(tempUri, { idempotent: true });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  };

  const downloadBatch = async (files: FileItem[]) => {
    for (const file of files) {
      if (file.extension || file.type === "file") {
        await downloadFile(file);
      }
    }
  };

  return { downloadFile, downloadBatch };
};
