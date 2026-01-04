import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Laptop,
  Smartphone,
  Tablet,
  X,
  Globe,
  Monitor,
  Clock,
  Loader2,
} from "lucide-react";
import { useDeleteSession } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionHeader } from "./section-header";
import type { Session } from "./types";

dayjs.extend(relativeTime);

interface ActiveSessionsProps {
  sessions: Session[];
  activeSessionId: string;
}

export function ActiveSessions({
  sessions,
  activeSessionId,
}: ActiveSessionsProps) {
  const deleteSessionMutation = useDeleteSession();
  const [sessionToDelete, setSessionToDelete] = useState<string | null | "all">(
    null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile":
      case "phone":
        return <Smartphone className='h-5 w-5' />;
      case "tablet":
        return <Tablet className='h-5 w-5' />;
      case "desktop":
      case "computer":
        return <Monitor className='h-5 w-5' />;
      default:
        return <Laptop className='h-5 w-5' />;
    }
  };

  const deleteSessionHandler = (id?: string) => {
    if (id) {
      setSessionToDelete(id);
    } else {
      setSessionToDelete("all");
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    const options = {
      onSuccess: () => {
        setShowConfirmDialog(false);
      },
    };
    if (sessionToDelete === "all") {
      deleteSessionMutation.mutate(undefined, options);
    } else if (sessionToDelete) {
      deleteSessionMutation.mutate(sessionToDelete, options);
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
          {sessions.map((session) => {
            const isCurrent = session._id === activeSessionId;
            const showDelete = session.isActive && !isCurrent;

            return (
              <div
                key={session._id}
                className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4'
              >
                <div className='flex items-start gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground mt-1 sm:mt-0'>
                    {getIcon(session.device.type || "desktop")}
                  </div>
                  <div className='space-y-1'>
                    <p className='font-medium flex flex-wrap items-center gap-2'>
                      {session.device.browser} on {session.device.os}
                      {isCurrent ? (
                        <span className='text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider'>
                          Current Session
                        </span>
                      ) : session.isActive ? (
                        <span className='text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider'>
                          Active
                        </span>
                      ) : null}
                    </p>
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Globe className='h-3 w-3' />
                        {session.location.city || session.location.regionName
                          ? `${session.location.city ?? ""}${session.location.city && session.location.regionName ? ", " : ""}${session.location.regionName ?? ""}`
                          : session.ipAddress}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {session.isActive
                          ? "Active now"
                          : `Last active ${dayjs(session.lastActiveAt).fromNow()}`}
                      </div>
                    </div>
                  </div>
                </div>

                {showDelete && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-center'
                    title='Revoke Session'
                    onClick={() => deleteSessionHandler(session._id)}
                  >
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Revoke session</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className='p-4 bg-muted/30 border-t'>
          <Button
            variant='destructive'
            className='w-full sm:w-auto'
            onClick={() => deleteSessionHandler()}
          >
            Log out all other devices
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={
          sessionToDelete === "all"
            ? "Log out from all other devices?"
            : "Revoke this session?"
        }
        desc={
          sessionToDelete === "all" ? (
            <p>
              This will log you out from all other devices where you are
              currently logged in. Your current session will not be affected.
            </p>
          ) : (
            <p>
              Are you sure you want to revoke this session? The device will show
              as inactive.
            </p>
          )
        }
        confirmText={
          deleteSessionMutation.isPending ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              {sessionToDelete === "all" ? "Logging out..." : "Revoking..."}
            </span>
          ) : sessionToDelete === "all" ? (
            "Log out all"
          ) : (
            "Revoke session"
          )
        }
        handleConfirm={handleConfirmDelete}
        destructive
        isLoading={deleteSessionMutation.isPending}
      />
    </div>
  );
}
