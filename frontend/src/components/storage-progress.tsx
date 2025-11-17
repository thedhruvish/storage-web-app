import { Link } from "@tanstack/react-router";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { useStorageStatus } from "@/hooks/use-storage-status";
import { Progress } from "@/components/ui/progress";

export function StorageProgress() {
  const { storageUsedPercentage, maxStorageBytes, totalUsedBytes } =
    useStorageStatus();

  const formattedPercentage = storageUsedPercentage.toFixed(2);

  return (
    <div className='px-3 py-2 text-sm'>
      {storageUsedPercentage >= 100 ? (
        <div>
          <div
            className='
        mt-2 mb-2 flex items-center gap-2 rounded-md
        bg-red-100 border border-red-300
        text-red-800 px-3 py-2 text-xs font-medium
      '
          >
            <AlertTriangle className='h-4 w-4' />
            <span>
              Your storage is over the limit. Downloads remain available for 2–3
              days. After that, files may be permanently deleted and cannot be
              restored.
            </span>
          </div>

          <Link
            to='/pricing'
            search={{ billing: "year", currency: "usd" }}
            className='
        mt-2 mb-3 flex items-center gap-2 rounded-md
        bg-red-50 border border-red-200
        text-red-700 px-3 py-2 text-xs font-medium
        transition hover:bg-red-100
      '
          >
            <ShoppingCart className='h-4 w-4' />
            <span>Upgrade your plan to restore full access</span>
          </Link>
        </div>
      ) : storageUsedPercentage > 90 ? (
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
      ) : storageUsedPercentage > 85 ? (
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
      ) : null}

      <p className='text-xs text-muted-foreground'>
        {totalUsedBytes} of {maxStorageBytes} used ({formattedPercentage}%)
      </p>

      <Progress
        value={storageUsedPercentage}
        className='h-2 mt-1'
        indicatorClassName={
          storageUsedPercentage >= 100
            ? "bg-red-700"
            : storageUsedPercentage > 90
              ? "bg-red-500"
              : storageUsedPercentage > 85
                ? "bg-yellow-500"
                : "bg-primary"
        }
      />
    </div>
  );
}
