import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useUploadStore, UploadableFile } from "@/store/upload-store";
import { useNotificationScheduler } from "@/hooks/use-notifications";
import { formatFileSize } from "@/utils/format-bytes";

export const UploadNotificationManager = () => {
  const files = useUploadStore((state) => state.files);
  const {
    scheduleUploadNotification,
    updateUploadNotification,
    dismissNotification,
  } = useNotificationScheduler();
  const prevFilesRef = useRef<Record<string, UploadableFile>>({});
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // We only want to show notifications if app is in background
    // However, for the sake of the requirement, we might want to show them even if foreground
    // but typically progress notifications are for background.
    // The user said: "when user was the upload a file than it show the progress on the notification"

    files.forEach((file) => {
      const prevFile = prevFilesRef.current[file.id];

      // New upload started
      if (!prevFile && file.status === "uploading") {
        scheduleUploadNotification(file.id, file.name);
      }
      // Progress updated
      else if (
        prevFile &&
        file.status === "uploading" &&
        file.progress !== prevFile.progress
      ) {
        // Only update every 5% to avoid flooding the notification system
        if (file.progress % 5 === 0 || file.progress === 100) {
          updateUploadNotification(
            file.id,
            file.name,
            file.progress,
            formatFileSize(file.size),
            file.directoryId,
          );
        }
      }
      // Status changed to success
      else if (
        prevFile &&
        prevFile.status === "uploading" &&
        file.status === "success"
      ) {
        updateUploadNotification(
          file.id,
          file.name,
          100,
          formatFileSize(file.size),
          file.directoryId,
        );
      }
      // Status changed to canceled or error
      else if (
        prevFile &&
        prevFile.status === "uploading" &&
        (file.status === "canceled" ||
          file.status === "error" ||
          file.status === "fail")
      ) {
        dismissNotification(file.id);
      }

      // Update ref
      prevFilesRef.current[file.id] = { ...file };
    });

    // Clean up ref for removed files
    const currentIds = new Set(files.map((f) => f.id));
    Object.keys(prevFilesRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        delete prevFilesRef.current[id];
      }
    });
  }, [
    files,
    scheduleUploadNotification,
    updateUploadNotification,
    dismissNotification,
  ]);

  return null;
};
