import React from "react";
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "@tanstack/react-router";
import { useDialogStore } from "@/store/DialogsStore";
import {
  AlertCircle,
  CheckCircle2,
  File as FileIcon,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import axiosClient from "@/api/axiosClient";
import { useGetAllDirectoryList } from "@/api/directoryApi";
import { truncateFileName } from "@/utils/truncateFileName";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

type FileProgress = {
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  cancelToken?: AbortController;
};
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MultiFileUploadDialog({ open }: Props) {
  const fileUploadSchema = z.object({
    files: z
      .array(z.instanceof(File))
      .min(1, "Please upload at least one file"),
  });

  type FileUploadValues = z.infer<typeof fileUploadSchema>;

  const { directoryId = "" } = useParams({ strict: false });

  const getDirectoryDataHook = useGetAllDirectoryList(directoryId);
  const { closeDialog } = useDialogStore();

  const form = useForm<FileUploadValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: { files: [] },
  });

  const [fileProgressList, setFileProgressList] = React.useState<
    Array<FileProgress>
  >([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = (acceptedFiles: Array<File>) => {
    const existingFiles = form.getValues("files");
    const newUniqueFiles = acceptedFiles.filter(
      (newFile) =>
        !existingFiles.some(
          (f) => f.name === newFile.name && f.size === newFile.size
        )
    );

    if (newUniqueFiles.length === 0) return;

    const updatedFiles = [...existingFiles, ...newUniqueFiles];
    form.setValue("files", updatedFiles, { shouldValidate: true });

    const newProgress = newUniqueFiles.map((file) => ({
      file,
      progress: 0,
      status: "idle" as const,
    }));

    setFileProgressList((prev) => [...prev, ...newProgress]);
    uploadFiles(newUniqueFiles);
  };

  // FIX: Ensure multiple file uploads are enabled
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true, // This enables multiple file selection
    noClick: isUploading,
  });

  const uploadFiles = async (files: Array<File>) => {
    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const controller = new AbortController();

      setFileProgressList((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "uploading", cancelToken: controller }
            : f
        )
      );

      const formData = new FormData();
      formData.append("file", file);

      try {
        await axiosClient.post(
          `${import.meta.env.VITE_BACKEND_URL}/document/${directoryId}`,
          formData,
          {
            withCredentials: true,
            signal: controller.signal,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event) => {
              if (!event.total) return;
              const percent = Math.round((event.loaded * 100) / event.total);
              setFileProgressList((prev) =>
                prev.map((f) =>
                  f.file === file ? { ...f, progress: percent } : f
                )
              );
            },
          }
        );

        setFileProgressList((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: "success",
                  progress: 100,
                  cancelToken: undefined,
                }
              : f
          )
        );
        return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (isAxiosError(error)) {
          if (axios.isCancel(error) || error.name === "CanceledError") {
            toast.error(`Upload cancelled for ${file.name}`);
          } else {
            toast.error(
              `Error uploading ${
                file.name.slice(0, 3) + "..."
              }: ${error.message || "Unknown error"}`
            );
          }
        }

        setFileProgressList((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: "error", cancelToken: undefined }
              : f
          )
        );
        return false;
      }
    });

    try {
      await Promise.all(uploadPromises);
    } finally {
      setIsUploading(false);
      getDirectoryDataHook.refetch();
    }
  };

  const handleRetry = (file: File) => {
    uploadFiles([file]);
  };

  const handleCancel = (file: File) => {
    const fileProgress = fileProgressList.find((f) => f.file === file);
    fileProgress?.cancelToken?.abort();

    setFileProgressList((prev) =>
      prev.map((f) =>
        f.file === file ? { ...f, status: "error", cancelToken: undefined } : f
      )
    );
  };

  // const handleCancelAll = () => {
  //   fileProgressList.forEach((fileObj) => {
  //     if (fileObj.status === "uploading") {
  //       fileObj.cancelToken?.abort();
  //     }
  //   });
  //   setFileProgressList([]);
  //   form.reset();
  //   onOpenChange(false);
  // };

  const getStatusIcon = (status: FileProgress["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className='h-4 w-4 text-green-500' />;
      case "error":
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      case "uploading":
        return <Loader2 className='h-4 w-4 animate-spin text-blue-500' />;
      default:
        return <FileIcon className='text-muted-foreground h-4 w-4' />;
    }
  };

  const getStatusColor = (status: FileProgress["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "uploading":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-muted-foreground";
    }
  };

  // Calculate completed files
  const completedCount = fileProgressList.filter(
    (f) => f.status === "success"
  ).length;
  const totalFiles = fileProgressList.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset();
          setFileProgressList([]);
        }
        closeDialog();
      }}
    >
      <DialogContent className='max-h-[90dvh] overflow-hidden sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2 text-lg'>
            <UploadCloud className='h-5 w-5' />
            Upload Files
          </DialogTitle>
          <DialogDescription className='dark:text-gray-400'>
            Upload files to your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='upload-file-form' className='flex flex-col'>
            <FormField
              control={form.control}
              name='files'
              render={() => (
                <FormItem>
                  <FormControl>
                    <div
                      {...getRootProps()}
                      className={`group bg-background cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-colors md:p-6 ${
                        isDragActive
                          ? "border-primary bg-blue-50 dark:bg-blue-900/20"
                          : "border-muted-foreground/30 hover:border-primary"
                      } ${isUploading ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      <input {...getInputProps({ multiple: true })} />
                      <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-100 md:h-12 md:w-12 dark:bg-blue-900/30 dark:text-blue-300 dark:group-hover:bg-blue-900/40'>
                          <UploadCloud className='h-5 w-5 md:h-6 md:w-6' />
                        </div>
                        <div>
                          <p className='text-foreground font-medium'>
                            {isDragActive
                              ? "Drop files here"
                              : "Drag & drop files or click to browse"}
                          </p>
                          <p className='text-muted-foreground mt-1 text-sm'>
                            Max file size: 50MB
                          </p>
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          disabled={isUploading}
                          className='mt-1'
                        >
                          Select Files
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className='mt-2 text-center' />
                </FormItem>
              )}
            />

            {fileProgressList.length > 0 && (
              <div className='mt-4 flex min-h-[200px] flex-1 flex-col'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='text-foreground font-medium'>
                    Uploading {totalFiles} file{totalFiles > 1 ? "s" : ""}
                  </h3>
                  <span className='text-muted-foreground text-sm'>
                    {completedCount}/{totalFiles} completed
                  </span>
                </div>

                {/* Fixed ScrollArea with defined height */}
                <ScrollArea className='max-h-[30vh] min-h-0 flex-1'>
                  <div className='space-y-3 pr-2'>
                    {fileProgressList.map((fileObj, i) => {
                      // Responsive filename truncation
                      const isMobile = window.innerWidth < 640;
                      const maxLength = isMobile ? 25 : 40;
                      const fileName = truncateFileName(
                        fileObj.file.name,
                        maxLength
                      );

                      return (
                        <div
                          key={i}
                          className='bg-card rounded-xl border p-3 shadow-sm transition-all hover:shadow-md'
                        >
                          <div className='flex items-start gap-3'>
                            <div className='mt-0.5 flex h-5 w-5 items-center justify-center'>
                              <FileIcon className='text-muted-foreground h-4 w-4' />
                            </div>

                            <div className='min-w-0 flex-1'>
                              <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-start'>
                                <div className='min-w-0'>
                                  <p className='text-foreground truncate text-sm font-medium'>
                                    {fileName}
                                  </p>
                                  <div className='xs:flex-row xs:items-center mt-1 flex flex-col gap-1 text-xs'>
                                    <span
                                      className={`${getStatusColor(fileObj.status)} flex items-center gap-1`}
                                    >
                                      {getStatusIcon(fileObj.status)}
                                      <span className='capitalize'>
                                        {fileObj.status}
                                      </span>
                                    </span>
                                    <span className='text-muted-foreground xs:inline mx-1 hidden'>
                                      •
                                    </span>
                                    <span className='text-muted-foreground'>
                                      {(
                                        fileObj.file.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
                                    </span>
                                  </div>
                                </div>

                                <div className='mt-1 flex justify-end sm:mt-0 sm:justify-normal sm:self-start'>
                                  {fileObj.status === "error" && (
                                    <Button
                                      variant='secondary'
                                      size='sm'
                                      className='h-7 px-2 text-xs'
                                      onClick={() => handleRetry(fileObj.file)}
                                    >
                                      Retry
                                    </Button>
                                  )}
                                  {fileObj.status === "uploading" && (
                                    <Button
                                      variant='destructive'
                                      size='sm'
                                      className='h-7 px-2 text-xs'
                                      onClick={() => handleCancel(fileObj.file)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className='mt-3'>
                                <div className='mb-1 flex justify-between text-xs'>
                                  <span className='text-muted-foreground'>
                                    Progress
                                  </span>
                                  <span className='text-foreground font-medium'>
                                    {fileObj.progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={fileObj.progress}
                                  className='h-2'
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </form>
        </Form>
        <DialogFooter className='mt-2 gap-2 sm:gap-0'>
          <div className='flex w-full flex-wrap items-center justify-between gap-2'>
            <span className='text-muted-foreground text-sm'>
              {fileProgressList.length > 0 && (
                <>
                  {completedCount} of {totalFiles} files uploaded
                </>
              )}
            </span>
            <div className='flex flex-wrap justify-end gap-2'>
              {fileProgressList.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setFileProgressList([]);
                    form.reset();
                  }}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant='outline'
                  // onClick={handleCancelAll}
                  // disabled={isUploading}
                >
                  {isUploading ? "Canceling..." : "Close"}
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
