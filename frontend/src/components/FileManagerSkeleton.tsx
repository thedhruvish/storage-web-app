import { Skeleton } from "@/components/ui/skeleton";

export function FileManagerSkeleton() {
  return (
    <div className='bg-background text-foreground flex h-screen'>
      {/* Sidebar */}
      <div className='w-64 border-r p-4'>
        <Skeleton className='mb-4 h-8 w-32' />
        <div className='space-y-2'>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className='h-6 w-full' />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex flex-1 flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-4'>
          <Skeleton className='h-8 w-48' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-8 rounded-full' />
          </div>
        </div>

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
