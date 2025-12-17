import { Skeleton } from "@/components/ui/skeleton";

export function FileManagerSkeleton() {
  return (
    <div className='bg-background text-foreground flex h-screen'>
      <div className='flex flex-1 flex-col'>
        {/* Folders + Files Grid */}
        <div className='grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
          {[...Array(12)].map((_, i) => (
            <div key={i} className='flex flex-col items-center space-y-2'>
              <Skeleton className='h-20 w-20 rounded-md' />
              <Skeleton className='h-4 w-16' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
