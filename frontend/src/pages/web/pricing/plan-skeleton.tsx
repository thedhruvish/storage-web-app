import { Skeleton } from "@/components/ui/skeleton";

export const PlanSkeleton = ({ mode }: { mode: "modal" | "page" }) => {
  return (
    <main className={mode === "modal" ? "pt-8 pb-12" : "pt-40 pb-20"}>
      <div className='container mx-auto max-w-6xl px-6'>
        <div className='mb-16 text-center'>
          <Skeleton className='h-12 w-3/4 max-w-md mx-auto mb-6' />
          <Skeleton className='h-6 w-1/2 max-w-sm mx-auto mb-10' />
          <Skeleton className='h-12 w-64 mx-auto rounded-xl' />
        </div>
        <div className='grid grid-cols-1 justify-center gap-8 md:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='p-8 rounded-2xl border bg-card flex flex-col h-full space-y-4'
            >
              <Skeleton className='h-8 w-24 mb-2' />
              <Skeleton className='h-12 w-32 mb-6' />
              <Skeleton className='h-4 w-48 mb-8' />
              <div className='space-y-4 flex-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-5/6' />
                <Skeleton className='h-4 w-4/6' />
                <Skeleton className='h-4 w-full' />
              </div>
              <Skeleton className='h-12 w-full mt-8 rounded-lg' />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
