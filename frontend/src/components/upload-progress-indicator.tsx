import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useUploadStore } from "@/store/upload-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  File as FileIcon,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useGetCurrentUser } from "@/api/auth";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";

export function UploadProgressIndicator() {
  const { directoryId = "" } = useParams({ strict: false });
  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);
  const refreshUser = useGetCurrentUser();

  const [isMinimized, setIsMinimized] = useState(false);

  const { files, isUploading, cancelUpload, retryUpload, clearCompleted } =
    useUploadStore();

  const completedCount = files.filter((f) => f.status === "success").length;
  const totalFiles = files.length;
  const allDone =
    !isUploading && completedCount === totalFiles && totalFiles > 0;

  const [wasUploading, setWasUploading] = useState(false);

  useEffect(() => {
    if (isUploading) {
      setWasUploading(true);
    } else if (wasUploading && allDone) {
      // Only call after a real upload session ends
      refreshUser.refetch();
      getDirectoryDataHook.refetch();
      setWasUploading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading, allDone]);

  if (files.length === 0) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border bg-card text-card-foreground shadow-2xl transition-all sm:left-auto sm:w-[350px] sm:bottom-4 sm:right-4 sm:rounded-lg'>
      <div className='flex items-center justify-between border-b p-3'>
        <h3 className='text-sm font-semibold'>
          {isUploading
            ? `Uploading... (${completedCount}/${totalFiles})`
            : "Uploads"}
        </h3>
        <div className='flex items-center gap-1'>
          <Button
            size='icon'
            variant='ghost'
            className='h-6 w-6'
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-6 w-6'
            onClick={clearCompleted}
            disabled={isUploading}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            key='upload-list-body'
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className='overflow-hidden'
          >
            <div className='max-h-80'>
              <ScrollArea className='max-h-80'>
                <div className='space-y-4 p-4'>
                  {[...files].reverse().map((item) => (
                    <div
                      key={item.id}
                      className='group flex items-center gap-3 text-sm'
                    >
                      <FileIcon className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
                      <div className='flex-1 min-w-0'>
                        <p className='truncate font-medium'>{item.file.name}</p>
                        {(item.status === "uploading" ||
                          item.status === "queued") && (
                          <Progress
                            value={item.progress}
                            className='mt-1 h-1.5'
                          />
                        )}
                        {item.status === "success" && (
                          <p className='text-xs text-green-500'>Completed</p>
                        )}
                        {item.status === "error" && (
                          <p className='text-xs text-red-500'>{item.error}</p>
                        )}
                        {item.status === "canceled" && (
                          <p className='text-xs text-yellow-500'>Canceled</p>
                        )}
                      </div>

                      <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center'>
                        {(item.status === "uploading" ||
                          item.status === "queued") && (
                          <Button
                            size='icon'
                            variant='ghost'
                            className='hidden h-6 w-6 group-hover:flex'
                            onClick={() => cancelUpload(item.id)}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        )}
                        <div
                          className={
                            item.status === "uploading" ||
                            item.status === "queued"
                              ? "flex items-center justify-center group-hover:hidden"
                              : "flex items-center justify-center"
                          }
                        >
                          {item.status === "success" && (
                            <CheckCircle2 className='h-4 w-4 text-green-500' />
                          )}
                          {item.status === "queued" && (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          )}
                          {(item.status === "error" ||
                            item.status === "canceled") && (
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-6 w-6'
                              onClick={() => retryUpload(item.id, directoryId)}
                            >
                              <RefreshCw className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
