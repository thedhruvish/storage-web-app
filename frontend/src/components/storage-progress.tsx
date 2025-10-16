import { formatFileSize } from "@/utils/functions";
import { Progress } from "@/components/ui/progress";

type StorageProgressProps = {
  totalUsedBytes: number;
  maxStorageBytes: number;
};

export function StorageProgress({
  totalUsedBytes,
  maxStorageBytes,
}: StorageProgressProps) {
  const percentage =
    maxStorageBytes > 0 ? (totalUsedBytes / maxStorageBytes) * 100 : 0;

  return (
    <div className='px-3 py-2 text-sm'>
      <p className='text-xs text-muted-foreground'>
        {formatFileSize(totalUsedBytes)} of {formatFileSize(maxStorageBytes)}{" "}
        used
      </p>
      <Progress
        value={percentage}
        className='h-2 mt-1'
        indicatorClassName={
          percentage > 90
            ? "bg-red-500"
            : percentage > 75
              ? "bg-yellow-500"
              : "bg-primary"
        }
      />
    </div>
  );
}
