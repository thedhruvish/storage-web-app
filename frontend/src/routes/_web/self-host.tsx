import { createFileRoute } from "@tanstack/react-router";
import { MarkdownError, MarkdownSkeleton } from "@/pages/web/markdown-skeleton";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_web/self-host")({
  loader: async () => {
    const res = await fetch(
      "https://raw.githubusercontent.com/thedhruvish/storeone/main/DEPLOY.md"
    );

    const markdown = await res.text();

    return { markdown };
  },
  gcTime: 30 * 60 * 60 * 1000,
  pendingComponent: MarkdownSkeleton,
  errorComponent: MarkdownError,
  component: RouteComponent,
});

function RouteComponent() {
  const { markdown } = Route.useLoaderData();

  return (
    <div className='pt-40 mx-auto max-w-4xl px-4 py-12'>
      <article className='prose prose-neutral dark:prose-invert max-w-none'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: (props) => (
              <h1 className='text-4xl font-extrabold mb-8 mt-6' {...props} />
            ),

            h2: (props) => (
              <h2
                className='text-3xl font-bold border-b pb-2 mt-12 mb-6'
                {...props}
              />
            ),

            h3: (props) => (
              <h3 className='text-2xl font-semibold mt-10 mb-4' {...props} />
            ),

            p: (props) => (
              <p className='text-muted-foreground leading-7 mb-4' {...props} />
            ),

            ul: (props) => (
              <ul className='list-disc ml-6 space-y-2 mb-6' {...props} />
            ),

            ol: (props) => (
              <ol className='list-decimal ml-6 space-y-2 mb-6' {...props} />
            ),

            a: ({ href, ...props }) => (
              <a
                href={href}
                target={href?.startsWith("#") ? "_self" : "_blank"}
                rel='noreferrer'
                className='text-primary underline hover:opacity-80'
                {...props}
              />
            ),

            code: ({ className, children, ...props }: any) => {
              const isInline = !className;

              if (isInline) {
                return (
                  <code
                    className='bg-muted px-1.5 py-1 rounded text-sm font-mono'
                    {...props}
                  >
                    {children}
                  </code>
                );
              }

              return (
                <pre className='bg-muted p-4 rounded-lg overflow-x-auto text-sm'>
                  <code className={className}>{children}</code>
                </pre>
              );
            },

            blockquote: (props) => (
              <blockquote
                className='border-l-4 border-primary pl-4 italic my-6'
                {...props}
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </div>
  );
}
