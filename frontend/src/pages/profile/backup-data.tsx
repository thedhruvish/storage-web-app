import { useState } from "react";
import { Download, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SectionHeader } from "./section-header";

export function BackupData() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='space-y-6'>
      <SectionHeader
        title='Backup & Data'
        infoTooltip='Includes all uploaded media, chat logs, and profile settings.'
      />

      <div className='rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
            <Archive className='h-6 w-6' />
          </div>
          <div>
            <h4 className='font-medium'>Download Your Data</h4>
            <p className='text-sm text-muted-foreground'>
              Export a copy of your personal data.
            </p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Download
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Data Download</DialogTitle>
              <DialogDescription>
                We will compile your data. You will receive an email with a
                download link within 5 minutes. The link expires in 24 hours.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>Request Download</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
