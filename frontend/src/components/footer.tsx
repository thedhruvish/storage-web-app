import { Cloud } from "lucide-react";

export const Footer = () => {
  return (
    <footer className='border-t bg-muted/30 py-16'>
      <div className='container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6'>
        <div className='flex items-center gap-2 font-bold text-xl'>
          <Cloud className='text-primary h-6 w-6' />
          <span>StoreFlow</span>
        </div>
        <div className='text-sm text-muted-foreground'>
          © 2024 StoreFlow Inc. Open Source Project.
        </div>
        <div className='flex gap-6'>
          <a
            href='https://github.com/thedhruvish/storage-web-app'
            target='_blank'
            className='text-muted-foreground hover:text-primary transition-colors'
          >
            GitHub
          </a>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary transition-colors'
          >
            Twitter
          </a>
          <a
            href='#'
            className='text-muted-foreground hover:text-primary transition-colors'
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
};
