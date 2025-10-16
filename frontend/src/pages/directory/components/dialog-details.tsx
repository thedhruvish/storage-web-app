import { useDialogStore } from "@/store/DialogsStore";
import { motion } from "framer-motion";
import { Star, StarOff, FileText } from "lucide-react";
import { toast } from "sonner";
import { usestarredToggle } from "@/api/directoryApi";
import { formatDate, formatFileSize } from "@/utils/functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function FileDetailsDialog({ open }: Props) {
  const { currentItem, closeDialog } = useDialogStore();
  const starredMutation = usestarredToggle();

  const starredToggle = () => {
    if (!currentItem) return;
    currentItem.isStarred = !currentItem.isStarred;
    starredMutation.mutate(
      {
        id: currentItem._id,
        type: currentItem.extension ? "document" : "directory",
      },
      {
        onSuccess: () => {
          toast.success("Starred successfully");
        },
        onError: () => {
          toast.error("Starred failed");
          currentItem.isStarred = !currentItem.isStarred;
        },
      }
    );
  };

  if (!currentItem) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        closeDialog();
      }}
    >
      <DialogTrigger asChild>
        <Button variant='outline'>View File Details</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='w-5 h-5' /> {currentItem.name}
          </DialogTitle>
          <DialogDescription>File details and metadata</DialogDescription>
        </DialogHeader>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell className='font-medium'>File Name</TableCell>
              <TableCell>{currentItem.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Size</TableCell>
              <TableCell>
                {formatFileSize(currentItem.metaData?.size)}
              </TableCell>
            </TableRow>
            {currentItem.extension && (
              <TableRow>
                <TableCell className='font-medium'>Extension</TableCell>
                <TableCell>{currentItem.extension}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className='font-medium'>Created At</TableCell>
              <TableCell>{formatDate(currentItem.createdAt)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Updated At</TableCell>
              <TableCell>{formatDate(currentItem.updatedAt)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Starred</TableCell>
              <TableCell>
                <Button variant='ghost' size='icon' onClick={starredToggle}>
                  <motion.div
                    key={currentItem.isStarred ? "starred" : "unstarred"}
                    initial={{ scale: 0.8, rotate: 0, opacity: 0.6 }}
                    animate={{ scale: 1.2, rotate: 360, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    {currentItem.isStarred ? (
                      <Star className='fill-current text-yellow-500' />
                    ) : (
                      <StarOff className='text-gray-400' />
                    )}
                  </motion.div>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
