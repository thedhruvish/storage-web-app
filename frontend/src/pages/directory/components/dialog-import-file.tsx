import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportFileDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            Import File
          </DialogTitle>
          <DialogDescription>
            Import Google Drive Data in current directory .
          </DialogDescription>
        </DialogHeader>
        <div className='flex w-full items-center gap-2'>
          <Button
            variant={"outline"}
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_BACKEND_URL}/import-data/google/oauthurlgen`;
            }}
          >
            Import to Google Drive
          </Button>
        </div>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
