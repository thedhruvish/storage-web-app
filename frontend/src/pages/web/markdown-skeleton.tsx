import { Skeleton } from "@/components/ui/skeleton";

export function MarkdownSkeleton() {
  return (
    <div className='pt-40 mx-auto max-w-4xl px-4 py-12'>
      <div className='space-y-8'>
        <Skeleton className='h-12 w-1/2' />

        <div className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-4/5' />
        </div>

        <Skeleton className='h-10 w-1/3' />

        <Skeleton className='h-48 w-full rounded-lg' />

        <div className='space-y-3'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
        </div>
      </div>
    </div>
  );
}

export function MarkdownError() {
  return (
    <div className='border rounded-lg p-6 text-center space-y-3'>
      <p className='text-lg font-semibold'>Failed to load deployment guide</p>
      <a
        href='https://github.com/thedhruvish/storeone/blob/main/DEPLOY.md'
        target='_blank'
        rel='noreferrer'
        className='text-primary underline'
      >
        View on GitHub
      </a>
    </div>
  );
}
