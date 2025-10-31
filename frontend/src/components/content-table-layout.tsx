import type { ReactNode } from "react";
import { Main } from "./main";

interface ContentTableLayoutProps {
  title?: string;
  description?: string;
  buttons?: ReactNode;
  children: ReactNode; // This will render the main content, like your table
}

export function ContentTableLayout({
  title,
  description,
  buttons,
  children,
}: ContentTableLayoutProps) {
  return (
    <>
      <Main fixed>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          {title && (
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
              <p className='text-muted-foreground'>{description}</p>
            </div>
          )}

          <div>{buttons ?? null}</div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {children}
        </div>
      </Main>
    </>
  );
}
