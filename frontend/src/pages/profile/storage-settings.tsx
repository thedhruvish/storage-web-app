import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

export function StorageSettings() {
  const handleClearCache = async () => {
    try {
      // 1. Clear Cache Storage (Service Worker caches)
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Unregister Service Workers
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // 3. Clear LocalStorage & SessionStorage
      localStorage.clear();
      sessionStorage.clear();

      toast.success("Cache cleared successfully. Reloading...");

      // 4. Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      toast.error("Failed to clear cache fully.");
    }
  };

  return (
    <div className='space-y-6'>
      <SectionHeader
        title='Storage & Cache'
        infoTooltip='Manage your local browser data and cached files.'
      />

      <div className='rounded-xl border bg-card p-6 shadow-sm'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='space-y-1'>
            <h4 className='font-medium flex items-center gap-2'>
              <RotateCcw className='h-4 w-4 text-blue-500' />
              Clear Application Cache
            </h4>
            <p className='text-sm text-muted-foreground max-w-md'>
              If you're experiencing issues with the website, clearing the cache
              will remove all local data and refresh the application.
            </p>
          </div>
          <Button
            variant='outline'
            className='hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors'
            onClick={handleClearCache}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Clear & Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
