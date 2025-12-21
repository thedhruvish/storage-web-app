import { Laptop, Smartphone, Tablet, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";
import type { Session } from "./types";

interface ActiveSessionsProps {
  sessions: Session[];
}

export function ActiveSessions({ sessions }: ActiveSessionsProps) {
  const getIcon = (type: Session["deviceType"]) => {
    switch (type) {
      case "mobile":
        return <Smartphone className='h-5 w-5' />;
      case "tablet":
        return <Tablet className='h-5 w-5' />;
      default:
        return <Laptop className='h-5 w-5' />;
    }
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title='Active Sessions'
        infoTooltip='These devices have access to your account.'
      />

      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <div className='divide-y'>
          {sessions.map((session) => (
            <div
              key={session.id}
              className='flex items-center justify-between p-4'
            >
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground'>
                  {getIcon(session.deviceType)}
                </div>
                <div>
                  <p className='font-medium flex items-center gap-2'>
                    {session.browserOS}
                    {session.isCurrent && (
                      <span className='text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider'>
                        Current
                      </span>
                    )}
                  </p>
                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Globe className='h-3 w-3' />
                    {session.location} • Last active: {session.lastActive}
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                >
                  <X className='h-4 w-4' />
                  <span className='sr-only'>Revoke session</span>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className='p-4 bg-muted/30 border-t'>
          <Button variant='destructive' className='w-full'>
            Log out all other devices
          </Button>
        </div>
      </div>
    </div>
  );
}
