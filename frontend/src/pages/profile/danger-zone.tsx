import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDangerZone } from "@/api/setting-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionHeader } from "./section-header";

type DangerAction = "deactivate" | "wipe" | "delete";

export function DangerZone() {
  const [action, setAction] = useState<DangerAction | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const dangerZoneMutation = useDangerZone();

  const handleAction = (newAction: DangerAction) => {
    setAction(newAction);
    setConfirmText("");
  };

  const currentActionConfig = {
    deactivate: {
      method: "deactivate",
      title: "Deactivate Account",
      desc: "After you deactivate your account, you can reactivate it by logging in. If you have issues, contact support at info@gmail.com.",
      verification: "Deactivate",
      confirmBtnText: "Yes, deactivate account",
    },
    wipe: {
      method: "wipe",
      title: "Wipe Media",
      desc: "This will delete all stored media. It cannot be recovered.",
      verification: "Permanently-delete",
      confirmBtnText: "Yes, wipe media",
    },
    delete: {
      method: "delete",
      title: "Delete Account",
      desc: "This will permanently delete your account and all media. This action cannot be undone.",
      verification: "Permanently-Delete-Account",
      confirmBtnText: "Yes, delete account",
    },
  };

  const config = action ? currentActionConfig[action] : null;

  const handleConfirm = () => {
    if (!config) return;
    const method = config.method;
    toast.promise(dangerZoneMutation.mutateAsync(method), {
      loading: "Processing...",
      success: () => {
        setAction(null);
        return "Action completed successfully";
      },
      error: "Failed to complete action",
    });
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title='Danger Zone'
        infoTooltip='Irreversible actions regarding your account.'
      />

      <div className='rounded-xl border border-destructive/50 bg-red-50/50 dark:bg-red-900/10 p-6'>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Deactivate Account</h4>
              <p className='text-sm text-muted-foreground'>
                Temporarily disable your account.
              </p>
            </div>
            <Button
              variant='ghost'
              className='hover:bg-red-100 dark:hover:bg-red-900/40 text-destructive hover:text-destructive'
              onClick={() => handleAction("deactivate")}
            >
              Deactivate
            </Button>
          </div>

          <div className='h-px bg-destructive/20' />

          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Wipe Media</h4>
              <p className='text-sm text-muted-foreground'>
                Delete all uploaded content but keep account.
              </p>
            </div>
            <Button
              variant='ghost'
              className='hover:bg-red-100 dark:hover:bg-red-900/40 text-destructive hover:text-destructive'
              onClick={() => handleAction("wipe")}
            >
              Wipe Data
            </Button>
          </div>

          <div className='h-px bg-destructive/20' />

          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Delete Account</h4>
              <p className='text-sm text-muted-foreground'>
                Permanently remove your account.
              </p>
            </div>
            <Button
              variant='destructive'
              onClick={() => handleAction("delete")}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {config && (
        <ConfirmDialog
          open={!!action}
          onOpenChange={(open) => !open && setAction(null)}
          title={config.title}
          desc={config.desc}
          confirmText={
            dangerZoneMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...
              </>
            ) : (
              config.confirmBtnText
            )
          }
          destructive
          handleConfirm={handleConfirm}
          disabled={confirmText !== config.verification}
        >
          <div className='py-4 space-y-2'>
            <p className='text-sm text-muted-foreground'>
              To confirm, type{" "}
              <span className='font-bold text-foreground'>
                {config.verification}
              </span>{" "}
              below:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={config.verification}
              className='border-red-200 focus-visible:ring-red-500'
            />
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
