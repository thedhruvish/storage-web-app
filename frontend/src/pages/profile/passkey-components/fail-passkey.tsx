import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailPasskey({
  cancelFunction,
  tryAgainFunction,
}: {
  cancelFunction?: () => void;
  tryAgainFunction?: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
      <div className='mb-6 rounded-full bg-red-100 dark:bg-red-900/30 p-6'>
        <AlertCircle className='h-10 w-10 text-red-600 dark:text-red-400' />
      </div>
      <h3 className='text-xl font-semibold mb-2'>Passkey Setup Failed</h3>
      <p className='text-muted-foreground mb-8 max-w-xs mx-auto'>
        We couldn't create your passkey. This might happen if you cancelled the
        request or the operation timed out.
      </p>
      <div className='flex flex-col sm:flex-row gap-3'>
        {cancelFunction && (
          <Button variant='outline' onClick={cancelFunction}>
            Cancel
          </Button>
        )}
        {tryAgainFunction && (
          <Button onClick={tryAgainFunction}>Try Again</Button>
        )}
      </div>
    </div>
  );
}

export default FailPasskey;
