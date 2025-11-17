import { useMemo } from "react";
import { useUserStore } from "@/store/userStore";
import { formatFileSize } from "@/utils/functions";

// Define the 10MB storage threshold
const STORAGE_THRESHOLD_BYTES = 10000000;

/**
 * Custom hook to calculate storage status, percentage, and formatted values.
 * @param user - The user object (or null) containing storage info.
 */
export const useStorageStatus = () => {
  const user = useUserStore((state) => state.user);
  const {
    isUploadDisabled,
    storageUsedPercentage,
    totalUsedBytes,
    maxStorageBytes,
    formattedRemaining,
  } = useMemo(() => {
    if (!user?.maxStorageBytes || !user?.totalUsedBytes) {
      return {
        isUploadDisabled: false,
        storageUsedPercentage: 0,
        totalUsedBytes: "0 Bytes",
        maxStorageBytes: "0 Bytes",
        formattedRemaining: "0 Bytes",
      };
    }

    const { maxStorageBytes, totalUsedBytes } = user;
    const remainingSpace = maxStorageBytes - totalUsedBytes;

    const disabled = remainingSpace < STORAGE_THRESHOLD_BYTES;

    let percentage = 0;
    if (maxStorageBytes > 0 && totalUsedBytes > 0) {
      percentage = (totalUsedBytes / maxStorageBytes) * 100;
    }

    // if (totalUsedBytes > maxStorageBytes) {
    //   percentage = 100;
    // }

    return {
      isUploadDisabled: disabled,
      storageUsedPercentage: Math.round(percentage),
      totalUsedBytes: formatFileSize(totalUsedBytes),
      maxStorageBytes: formatFileSize(maxStorageBytes),
      formattedRemaining: formatFileSize(
        remainingSpace > 0 ? remainingSpace : 0
      ),
    };
  }, [user]);

  return {
    isUploadDisabled,
    storageUsedPercentage,
    totalUsedBytes,
    maxStorageBytes,
    formattedRemaining,
    storageTooltipMessage: (
      <p>Storage limit is max. Please upgrade your plan.</p>
    ),
  };
};
