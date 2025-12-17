import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import axiosClient from "@/api/axios-client";

// --- Types ---

type UploadStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "canceled"
  | "fail";

export interface UploadableFile {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  source: AbortController;
  error?: string;
  MongoId?: string;
}

interface UploadState {
  files: UploadableFile[];
  isUploading: boolean;

  addFileEntry: (file: UploadableFile) => void;
  updateFileEntry: (id: string, updates: Partial<UploadableFile>) => void;
  removeFileEntry: (id: string) => void;
  setGlobalUploading: (isUploading: boolean) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  isUploading: false,

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

  clearCompleted: () =>
    set((state) => ({
      files: state.files.filter(
        (f) => f.status === "uploading" || f.status === "queued"
      ),
    })),
}));

/**
 * Core function to handle the entire lifecycle of a single file upload.
 * It strictly checks initialization before proceeding to upload.
 */
const processFile = async (fileItem: UploadableFile, directoryId: string) => {
  const store = useUploadStore.getState();
  let currentMongoId: string | undefined;
  try {
    // A. Init Step: Check storage limits and get signed URL
    // If this fails, code jumps immediately to catch block
    const { data } = await axiosClient.post(`/document/${directoryId}/init`, {
      fileName: fileItem.file.name,
      fileSize: fileItem.file.size,
      ContentType: fileItem.file.type,
    });
    currentMongoId = data.data.id;
    // Only set status to 'uploading' IF init was successful
    store.updateFileEntry(fileItem.id, {
      status: "uploading",
      MongoId: currentMongoId,
    });
    store.setGlobalUploading(true);

    // B. Upload Step: PUT to the generated URL
    await axios.put(data.data.genUrl, fileItem.file, {
      signal: fileItem.source.signal,
      headers: { "Content-Type": fileItem.file.type },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        store.updateFileEntry(fileItem.id, { progress });
      },
    });

    // C. Completion Step: Mark success locally
    store.updateFileEntry(fileItem.id, { status: "success", progress: 100 });

    try {
      await axiosClient.post(`/document/${currentMongoId}/compeleted`);
    } catch {
      store.updateFileEntry(fileItem.id, { status: "fail", progress: 0 });
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      await axiosClient.delete(`/document/${currentMongoId}/cancel`);
      store.updateFileEntry(fileItem.id, {
        status: "canceled",
        error: "Upload canceled",
      });
    } else {
      let errorMessage = `Failed to upload ${fileItem.file.name}`;

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      store.updateFileEntry(fileItem.id, {
        status: "error",
        error: errorMessage,
      });
    }
  } finally {
    // Check if any other files are still uploading to update global state
    const currentFiles = useUploadStore.getState().files;
    const stillUploading = currentFiles.some((f) => f.status === "uploading");
    store.setGlobalUploading(stillUploading);
  }
};

/**
 * Public Utility: Start uploading a list of new files
 */
export const uploadFiles = (files: File[], directoryId: string) => {
  const store = useUploadStore.getState();

  const newFiles: UploadableFile[] = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    progress: 0,
    status: "queued",
    source: new AbortController(),
  }));

  // 1. Add all to store immediately
  newFiles.forEach((f) => store.addFileEntry(f));

  // 2. Process each file
  newFiles.forEach((f) => processFile(f, directoryId));
};

/**
 * Public Utility: Retry a specific failed/canceled upload
 */
export const retryUpload = (id: string, directoryId: string) => {
  const store = useUploadStore.getState();
  const fileToRetry = store.files.find((f) => f.id === id);

  if (fileToRetry) {
    // Create a fresh object for the retry (new abort controller)
    const newFile: UploadableFile = {
      ...fileToRetry,
      status: "queued",
      progress: 0,
      source: new AbortController(),
      error: undefined,
    };

    store.updateFileEntry(id, newFile);
    processFile(newFile, directoryId);
  }
};

/**
 * Public Utility: Cancel an ongoing upload
 */
export const cancelUpload = (id: string) => {
  const store = useUploadStore.getState();
  const fileToCancel = store.files.find((f) => f.id === id);

  if (fileToCancel && fileToCancel.status === "uploading") {
    fileToCancel.source.abort();
  }
};
