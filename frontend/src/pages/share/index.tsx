import { useNavigate } from "@tanstack/react-router";
import { FileGrid } from "@/pages/directory/components/file-grid";
import { useAppearance } from "@/store/appearance-store";
import { useUser } from "@/store/user-store";
import { Moon, Sun } from "lucide-react";
import { getShareDocument } from "@/api/docuement-api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { FileManagerSkeleton } from "@/components/file-manager-skeleton";
import { SiteHeader } from "@/components/site-header";
import Error404 from "@/components/status-code/404";
import { useTheme } from "@/components/theme-provider";

export default function Index({ shareId = "" }: { shareId?: string }) {
  const getShareDocumentData = getShareDocument(shareId);
  const { user } = useUser();
  const { appearance } = useAppearance();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (getShareDocumentData.isError) {
    return <Error404 errorTitle={getShareDocumentData?.error?.message} />;
  }

  return (
    <>
      {user ? (
        <div className='[--header-height:calc(theme(spacing.14))]'>
          <SidebarProvider
            className='flex flex-col'
            defaultOpen={appearance.sidebar}
          >
            <SiteHeader />
            <div className='flex flex-1'>
              <AppSidebar />
              <SidebarInset className='flex flex-col'>
                <div className='flex-1 p-4'>
                  <div className='pb-4'>
                    <h2 className='text-2xl font-bold'>Shared Files</h2>
                    <p className='text-muted-foreground'>
                      {getShareDocumentData.data?.data.documents.length || 0}{" "}
                      files shared with you
                    </p>
                  </div>
                  <Separator />
                  {getShareDocumentData.isLoading ? (
                    <FileManagerSkeleton />
                  ) : getShareDocumentData.data?.data.documents.length === 0 ? (
                    <div className='flex min-h-[50vh] flex-col items-center justify-center'>
                      <div className='max-w-md text-center'>
                        <div className='bg-secondary mb-6 rounded-2xl p-6'>
                          <div className='mb-2 text-6xl'>📁</div>
                          <h3 className='text-2xl font-bold'>No Files Found</h3>
                        </div>
                        <p className='text-muted-foreground'>
                          This shared folder doesn't contain any files yet.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <FileGrid
                      files={getShareDocumentData.data?.data.documents || []}
                      documentType='file'
                      viewMode={appearance.directoryLayout}
                    />
                  )}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      ) : (
        <div className='bg-background text-foreground min-h-screen transition-colors'>
          {/* Header */}
          <header className='bg-background/80 fixed top-0 z-10 w-full border-b backdrop-blur-sm'>
            <div className='container mx-auto flex items-center justify-between px-4 py-3'>
              <div className='flex items-center space-x-4'>
                <h1 className='from-primary bg-gradient-to-r to-red-600 bg-clip-text text-xl font-bold text-transparent'>
                  ShareDocs
                </h1>
              </div>

              <div className='flex items-center space-x-3'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={toggleTheme}
                  aria-label='Toggle theme'
                >
                  {theme === "dark" ? (
                    <Sun className='h-5 w-5' />
                  ) : (
                    <Moon className='h-5 w-5' />
                  )}
                </Button>

                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    className='rounded-full'
                    onClick={() => navigate({ to: "/auth/login" })}
                  >
                    Login
                  </Button>
                  <Button
                    className='bg-primary hover:bg-primary/90 rounded-full'
                    onClick={() => navigate({ to: "/auth/signup" })}
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className='container mx-auto px-4 pt-20 pb-8'>
            {getShareDocumentData.isLoading ? (
              <FileManagerSkeleton />
            ) : getShareDocumentData.data?.data.documents.length === 0 ? (
              <div className='flex min-h-[50vh] flex-col items-center justify-center'>
                <div className='max-w-md text-center'>
                  <div className='bg-secondary mb-6 rounded-2xl p-6'>
                    <div className='mb-2 text-6xl'>📁</div>
                    <h3 className='text-2xl font-bold'>No Files Found</h3>
                  </div>
                  <p className='text-muted-foreground'>
                    This shared folder doesn't contain any files yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='flex items-end justify-between'>
                  <div>
                    <h2 className='text-2xl font-bold'>Shared Files</h2>
                    <p className='text-muted-foreground'>
                      {getShareDocumentData.data?.data.documents.length} files
                      shared with you
                    </p>
                  </div>
                </div>

                <div className='bg-muted/30 rounded-xl border p-4'>
                  <FileGrid
                    files={getShareDocumentData.data?.data.documents || []}
                    documentType='file'
                    viewMode={appearance.directoryLayout}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}
