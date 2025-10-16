import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import axiosClient from "@/api/axiosClient";

type UploadStatus = "queued" | "uploading" | "success" | "error" | "canceled";

export interface UploadableFile {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  source: AbortController;
}

interface UploadState {
  files: UploadableFile[];
  isUploading: boolean;
  addFiles: (files: File[], directoryId: string) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string, directoryId: string) => void;
  clearCompleted: () => void;
}

const uploadFile = async (
  file: UploadableFile,
  directoryId: string,
  set: (fn: (state: UploadState) => Partial<UploadState>) => void
) => {
  const formData = new FormData();
  formData.append("file", file.file);

  try {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === file.id ? { ...f, status: "uploading" } : f
      ),
      isUploading: true,
    }));

    await axiosClient.post(`/document/${directoryId}`, formData, {
      signal: file.source.signal,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const progress = Math.round((event.loaded * 100) / event.total);
        set((state) => ({
          files: state.files.map((f) =>
            f.id === file.id ? { ...f, progress } : f
          ),
        }));
      },
    });

    set((state) => ({
      files: state.files.map((f) =>
        f.id === file.id ? { ...f, status: "success", progress: 100 } : f
      ),
    }));
  } catch (error) {
    if (axios.isCancel(error)) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: "canceled" } : f
        ),
      }));
    } else {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === file.id ? { ...f, status: "error" } : f
        ),
      }));
      if (axios.isAxiosError(error)) {
        if (error.status === 400) {
          toast.error(error.message);
        }
      } else {
        toast.error(`Failed to upload ${file.file.name}`);
      }
    }
  } finally {
    set((state) => {
      const stillUploading = state.files.some((f) => f.status === "uploading");
      return { isUploading: stillUploading };
    });
  }
};

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  isUploading: false,
  addFiles: (files, directoryId) => {
    const newFiles: UploadableFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "queued",
      source: new AbortController(),
    }));

    set((state) => ({ files: [...state.files, ...newFiles] }));
    newFiles.forEach((file) => uploadFile(file, directoryId, set));
  },
  cancelUpload: (id) => {
    const fileToCancel = get().files.find((f) => f.id === id);
    if (fileToCancel && fileToCancel.status === "uploading") {
      fileToCancel.source.abort();
    }
  },
  retryUpload: (id, directoryId) => {
    const fileToRetry = get().files.find((f) => f.id === id);
    if (fileToRetry) {
      const newFile: UploadableFile = {
        ...fileToRetry,
        status: "queued",
        progress: 0,
        source: new AbortController(),
      };
      set((state) => ({
        files: state.files.map((f) => (f.id === id ? newFile : f)),
      }));
      uploadFile(newFile, directoryId, set);
    }
  },
  clearCompleted: () => {
    set((state) => ({
      files: state.files.filter(
        (f) => f.status === "uploading" || f.status === "queued"
      ),
    }));
  },
}));
