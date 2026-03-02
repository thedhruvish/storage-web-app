import { useCallback, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { uploadFiles } from "@/store/upload-store";
import { useUser } from "@/store/user-store";
import { toast } from "sonner";
import { formatFileSize } from "@/utils/functions";

export const useFileUploader = () => {
  const params = useParams({ strict: false });
  const directoryId = (params as { directoryId?: string }).directoryId || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const openPricingHash = useCallback(() => {
    window.location.hash = "price";
  }, []);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (!user) return;
      const totalSize = Array.from(files).reduce(
        (acc, file) => acc + file.size,
        0
      );

      if (totalSize > user.uploadLimit) {
        openPricingHash();
        toast.error(
          `You can't Upload more than ${formatFileSize(user.uploadLimit)}`
        );
        return;
      }

      if (user.totalUsedBytes + totalSize > user.maxStorageBytes) {
        openPricingHash();
        toast.error("You have exceeded your storage limit.");
        return;
      }
      uploadFiles(Array.from(files), directoryId);
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
