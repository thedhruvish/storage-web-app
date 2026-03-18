import axios from "axios";
import { create } from "zustand";
import axiosClient from "@/api/axios-client";
import { useUserStore } from "./user-store";
import { STORAGE_SIZE_API_KEY } from "@/api/directory-api";
import { queryClient } from "@/lib/query-client";
import * as DocumentPicker from "expo-document-picker";

type UploadStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "canceled"
  | "fail";

export interface UploadableFile {
  id: string;
  name: string;
  size: number;
  uri: string;
  mimeType: string;
  progress: number;
  status: UploadStatus;
  source: AbortController;
  directoryId: string;
  error?: string;
  MongoId?: string;
}

interface UploadState {
  files: UploadableFile[];
  isUploading: boolean;
  isSheetVisible: boolean;

  addFileEntry: (file: UploadableFile) => void;
  updateFileEntry: (id: string, updates: Partial<UploadableFile>) => void;
  removeFileEntry: (id: string) => void;
  setGlobalUploading: (isUploading: boolean) => void;
  setSheetVisible: (visible: boolean) => void;
  clearCompleted: () => void;
  resetStore: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  isUploading: false,
  isSheetVisible: false,

  addFileEntry: (file) => set((state) => ({ files: [...state.files, file] })),

  updateFileEntry: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  removeFileEntry: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  setGlobalUploading: (isUploading) => set({ isUploading }),
  setSheetVisible: (visible) => set({ isSheetVisible: visible }),

  clearCompleted: () =>
    set((state) => ({
      files: state.files.filter(
        (f) => f.status === "uploading" || f.status === "queued",
      ),
    })),

  resetStore: () =>
    set({ files: [], isUploading: false, isSheetVisible: false }),
}));

/**
 * Core function to handle the entire lifecycle of a single file upload.
 */
const processFile = async (fileItem: UploadableFile, dirId: string) => {
  const store = useUploadStore.getState();
  const user = useUserStore.getState().user;
  let currentMongoId: string | undefined;
  let directoryId = dirId;
  let isRoot = false;

  if (!directoryId) {
    isRoot = true;
    directoryId = user?.rootDirId || "";
  }

  try {
    // A. Init Step
    const { data } = await axiosClient.post(`/document/${directoryId}/init`, {
      fileName: fileItem.name,
      fileSize: fileItem.size,
      ContentType: fileItem.mimeType,
    });

    currentMongoId = data.data.id;
    store.updateFileEntry(fileItem.id, {
      status: "uploading",
      MongoId: currentMongoId,
    });
    store.setGlobalUploading(true);
    store.setSheetVisible(true);

    const response = await fetch(data.data.presignedUrl, {
      method: "PUT",
      body: { uri: fileItem.uri } as any,
      headers: {
        "Content-Type": fileItem.mimeType,
      },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    // C. Completion Step
    store.updateFileEntry(fileItem.id, { status: "success", progress: 100 });

    try {
      await axiosClient.post(`/document/${currentMongoId}/compeleted`);
    } catch {
      store.updateFileEntry(fileItem.id, { status: "fail", progress: 0 });
    }
  } catch (error) {
    console.error("Upload error for", fileItem.name, ":", error);

    if (fileItem.source.signal.aborted) {
      if (currentMongoId) {
        try {
          await axiosClient.delete(`/document/${currentMongoId}/cancel`);
        } catch (e) {
          console.error("Failed to call cancel endpoint", e);
        }
      }
      store.updateFileEntry(fileItem.id, {
        status: "canceled",
        error: "Upload canceled",
      });
    } else {
      let errorMessage = `Failed to upload ${fileItem.name}`;

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      store.updateFileEntry(fileItem.id, {
        status: "error",
        error: errorMessage,
      });
    }
  } finally {
    queryClient.invalidateQueries({ queryKey: [STORAGE_SIZE_API_KEY] });
    queryClient.invalidateQueries({ queryKey: ["directorys", directoryId] });
    if (isRoot) {
      queryClient.invalidateQueries({ queryKey: ["directorys"] });
    }
    const currentFiles = useUploadStore.getState().files;
    const stillUploading = currentFiles.some((f) => f.status === "uploading");
    store.setGlobalUploading(stillUploading);
  }
};

/**
 * Public Utility: Start uploading a list of new files
 */
export const uploadFiles = (
  assets: DocumentPicker.DocumentPickerAsset[],
  directoryId: string,
) => {
  const store = useUploadStore.getState();

  const newFiles: UploadableFile[] = assets.map((asset) => ({
    id: Math.random().toString(36).substring(7),
    name: asset.name,
    size: asset.size || 0,
    uri: asset.uri,
    mimeType: asset.mimeType || "application/octet-stream",
    progress: 0,
    status: "queued",
    source: new AbortController(),
    directoryId,
  }));

  // 1. Add all to store immediately
  newFiles.forEach((f) => store.addFileEntry(f));

  // 2. Process each file
  newFiles.forEach((f) => processFile(f, directoryId));
};

/**
 * Public Utility: Retry a specific failed/canceled upload
 */
export const retryUpload = (id: string, directoryId?: string) => {
  const store = useUploadStore.getState();
  const fileToRetry = store.files.find((f) => f.id === id);

  if (fileToRetry) {
    const targetDirId = directoryId || fileToRetry.directoryId;
    const newFile: UploadableFile = {
      ...fileToRetry,
      status: "queued",
      progress: 0,
      source: new AbortController(),
      error: undefined,
      directoryId: targetDirId,
    };

    store.updateFileEntry(id, newFile);
    processFile(newFile, targetDirId);
  }
};

/**
 * Public Utility: Cancel an ongoing upload
 */
export const cancelUpload = (id: string) => {
  const store = useUploadStore.getState();
  const fileToCancel = store.files.find((f) => f.id === id);

  if (
    fileToCancel &&
    (fileToCancel.status === "uploading" || fileToCancel.status === "queued")
  ) {
    fileToCancel.source.abort();
  }
};
