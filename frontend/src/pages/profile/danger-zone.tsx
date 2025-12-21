import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

export function DangerZone() {
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  className='hover:bg-red-100 dark:hover:bg-red-900/40 text-destructive hover:text-destructive'
                >
                  Wipe Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className='bg-destructive hover:bg-destructive/90'>
                    Yes, wipe data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className='h-px bg-destructive/20' />

          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Delete Account</h4>
              <p className='text-sm text-muted-foreground'>
                Permanently remove your account.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className='bg-destructive hover:bg-destructive/90'>
                    Yes, delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
