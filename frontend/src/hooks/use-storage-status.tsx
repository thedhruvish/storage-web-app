import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { STORAGE_SIZE_API_KEY } from "@/contansts";
import { useStorageStore } from "@/store/storage-store";
import { useUserStore } from "@/store/user-store";
import { formatFileSize } from "@/utils/functions";

// Define the 10MB storage threshold
const STORAGE_THRESHOLD_BYTES = 10000000;

/**
 * Custom hook to calculate storage status, percentage, and formatted values.
 * @param user - The user object (or null) containing storage info.
 */
export const useStorageStatus = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const totalUsedBytesRaw = useStorageStore((state) => state.totalUsedBytes);

  const {
    isUploadDisabled,
    storageUsedPercentage,
    totalUsedBytes,
    maxStorageBytes,
    formattedRemaining,
  } = useMemo(() => {
    if (!user) {
      return {
        isUploadDisabled: false,
        storageUsedPercentage: 0,
        totalUsedBytes: "0 Bytes",
        maxStorageBytes: "0 Bytes",
        formattedRemaining: "0 Bytes",
      };
    }

    const { maxStorageBytes } = user;
    const remainingSpace = maxStorageBytes - totalUsedBytesRaw;

    const disabled = remainingSpace < STORAGE_THRESHOLD_BYTES;

    let percentage = 0;
    if (maxStorageBytes > 0 && totalUsedBytesRaw > 0) {
      percentage = (totalUsedBytesRaw / maxStorageBytes) * 100;
    }

    if (totalUsedBytesRaw > maxStorageBytes) {
      percentage = 100;
    }

    return {
      isUploadDisabled: disabled,
      storageUsedPercentage: Math.round(percentage),
      totalUsedBytes: formatFileSize(totalUsedBytesRaw),
      maxStorageBytes: formatFileSize(maxStorageBytes, 0),
      formattedRemaining: formatFileSize(
        remainingSpace > 0 ? remainingSpace : 0
      ),
    };
  }, [user, totalUsedBytesRaw]);

  const refreshStorage = () => {
    queryClient.invalidateQueries({ queryKey: [STORAGE_SIZE_API_KEY] });
  };

  return {
    isUploadDisabled,
    storageUsedPercentage,
    totalUsedBytes,
    maxStorageBytes,
    formattedRemaining,
    refreshStorage,
    storageTooltipMessage: (
      <p>Storage limit is max. Please upgrade your plan.</p>
    ),
  };
};
