import { Suspense, lazy } from "react";
import { useDialogStore } from "@/store/dialogs-store";
import { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import type { DocRenderer } from "@iamjariwala/react-doc-viewer";
import { BookOpen, Loader2 } from "lucide-react";
import { Download, X } from "lucide-react";
import { useGetFilePreview, useGetGuestFilePreview } from "@/api/directory-api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";

const PreviewViewer = lazy(() => import("./preview-viewer"));

const CustomVideoRenderer: DocRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument) return null;

  return (
    <div className='flex w-full h-full items-center justify-center bg-transparent'>
      <video
        controls
        src={currentDocument.uri}
        className='max-h-full max-w-full object-contain'
      />
    </div>
  );
};
CustomVideoRenderer.fileTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
];
CustomVideoRenderer.weight = 1;

export default function DialogPreviewFile() {
  const { open, setOpen, currentItem } = useDialogStore();
  const { theme } = useTheme();
  const {
    data: authData,
    isPending: isAuthPending,
    isError: isAuthError,
    error: authError,
  } = useGetFilePreview(
    currentItem && !currentItem.isGuest ? currentItem._id : ""
  );

  const {
    data: guestData,
    isPending: isGuestPending,
    isError: isGuestError,
    error: guestError,
  } = useGetGuestFilePreview(
    currentItem?.isGuest ? currentItem.shareId || "" : "",
    currentItem?.isGuest ? currentItem._id || "" : ""
  );

  const isPending = currentItem?.isGuest ? isGuestPending : isAuthPending;
  const isError = currentItem?.isGuest ? isGuestError : isAuthError;
  const error = currentItem?.isGuest ? guestError : authError;
  const data = currentItem?.isGuest ? guestData : authData;

  if (!currentItem || open !== "preview") return null;

  const extension = currentItem.extension?.replace(".", "").toLowerCase();

  let fileType = extension;
  if (extension === "mp4") fileType = "video/mp4";
  else if (extension === "mov") fileType = "video/quicktime";
  else if (extension === "avi") fileType = "video/x-msvideo";

  const baseUri = data?.data;

  const uri = fileType === "pdf" && baseUri ? `${baseUri}#toolbar=0` : baseUri;

  const docs = [
    {
      uri,
      fileType,
      fileName: currentItem.name,
    },
  ];

  return (
    <Dialog
      open={open === "preview"}
      onOpenChange={(val) => !val && setOpen(null)}
    >
      <DialogContent
        className='max-w-none sm:max-w-none w-screen h-dvh rounded-none! border-0! flex flex-col p-0 gap-0 overflow-hidden'
        showCloseButton={false}
      >
        {/* Custom Header */}
        <div className='flex items-center justify-between p-4 border-b bg-background'>
          <h2 className='text-lg font-semibold'>{currentItem.name}</h2>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                window.open(docs[0].uri, "_blank");
              }}
            >
              <BookOpen className='size-4 mr-2' />
              Open
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (currentItem.isGuest) {
                  window.open(
                    `${import.meta.env.VITE_BACKEND_URL}/permission/open/${currentItem.shareId}/${currentItem._id}?action=download`,
                    "_blank"
                  );
                } else {
                  window.open(
                    `${import.meta.env.VITE_BACKEND_URL}/document/${currentItem._id}?action=download`,
                    "_blank"
                  );
                }
              }}
            >
              <Download className='size-4 mr-2' />
              Download
            </Button>

            <Button variant='ghost' size='icon' onClick={() => setOpen(null)}>
              <X className='size-4' />
            </Button>
          </div>
        </div>
        <div className='flex-1 bg-muted/20 flex flex-col overflow-auto'>
          {isPending ? (
            <div className='flex-1 flex items-center justify-center'>
              <Loader2 className='size-8 animate-spin text-muted-foreground' />
            </div>
          ) : isError ? (
            <div className='flex-1 flex flex-col items-center justify-center text-destructive'>
              <p>Failed to load preview</p>
              <p className='text-sm text-muted-foreground'>
                {error?.message || "An error occurred"}
              </p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading viewer...</div>}>
              <PreviewViewer
                className='h-full w-full [&_video]:max-w-full [&_video]:max-h-full [&_video]:object-contain'
                documents={docs}
                prefetchMethod='GET'
                pluginRenderers={[CustomVideoRenderer, ...DocViewerRenderers]}
                theme={{
                  primary: theme === "dark" ? "#1e293b" : "#f1f5f9",
                  textPrimary: theme === "dark" ? "#f8fafc" : "#0f172a",
                }}
                config={{
                  themeMode:
                    theme === "dark"
                      ? "dark"
                      : theme === "light"
                        ? "light"
                        : "auto",
                  search: { enableSearch: true },
                  fullscreen: { enableFullscreen: true },
                  loadingProgress: { enableProgressBar: true },
                  keyboard: { enableKeyboardShortcuts: true },
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                  },
                  noRenderer: {
                    overrideComponent: ({ document, fileName }) => {
                      return (
                        <div className='flex-1 flex flex-col items-center justify-center text-center p-8'>
                          <h3 className='text-lg font-semibold mb-2'>
                            Unsupported File Type
                          </h3>
                          <p className='text-muted-foreground mb-4'>
                            The file "{fileName}" cannot be previewed in the
                            browser.
                          </p>
                          <Button
                            onClick={() => {
                              window.open(document?.uri, "_blank");
                            }}
                          >
                            Open File
                          </Button>
                        </div>
                      );
                    },
                  },
                }}
              />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
