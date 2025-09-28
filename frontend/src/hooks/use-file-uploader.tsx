import { useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { useUploadStore } from "@/store/uploadStore";

/**
 * A hook to manage file uploads.
 * It provides a trigger function and the required hidden file input JSX.
 * This decouples the file selection logic from the component that triggers it.
 */
export const useFileUploader = () => {
  const { addFiles } = useUploadStore();
  const params = useParams({ strict: false });
  const directoryId = (params as { directoryId?: string }).directoryId || "";
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files), directoryId);
    }
    // Reset input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = "";
    }
  };

  const triggerUploader = () => {
    inputRef.current?.click();
  };

  // Return a stable JSX element for the file input
  const UploaderInput = (
    <input
      type='file'
      ref={inputRef}
      onChange={handleFileSelect}
      style={{ display: "none" }}
      multiple
    />
  );

  return { triggerUploader, UploaderInput };
};
