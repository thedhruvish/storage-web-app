import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
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
      {percentage > 90 ? (
        <Link
          to='/pricing'
          search={{ billing: "year", currency: "usd" }}
          className='
      mt-2 mb-2 flex items-center gap-2 rounded-md
      bg-red-50 border border-red-200
      text-red-700 px-3 py-2 text-xs font-medium
      transition hover:bg-red-100
    '
        >
          <ShoppingCart className='h-4 w-4' />
          <span>Critical storage level — upgrade immediately</span>
        </Link>
      ) : (
        percentage > 85 && (
          <Link
            to='/pricing'
            search={{ billing: "year", currency: "usd" }}
            className='
      mt-2 mb-2 flex items-center gap-2 rounded-md
      bg-amber-50 border border-amber-200
      text-amber-800 px-3 py-2 text-xs font-medium
      transition hover:bg-amber-100
    '
          >
            <ShoppingCart className='h-4 w-4' />
            <span>You're running low on storage — upgrade now</span>
          </Link>
        )
      )}

      <p className='text-xs text-muted-foreground'>
        {formatFileSize(totalUsedBytes)} of {formatFileSize(maxStorageBytes)}{" "}
        used ({percentage.toFixed(2)}%)
      </p>

      <Progress
        value={percentage}
        className='h-2 mt-1'
        indicatorClassName={
          percentage > 90
            ? "bg-red-500"
            : percentage > 85
              ? "bg-yellow-500"
              : "bg-primary"
        }
      />
    </div>
  );
}
