import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessPasskey({
  doneFunction,
  title="Passkey Added!",
  description="You can now use this passkey to sign in to your account.",
}: {
  doneFunction?: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
      <div className='mb-6 rounded-full bg-green-100 dark:bg-green-900/30 p-6'>
        <Check className='h-10 w-10 text-green-600 dark:text-green-400' />
      </div>
      <h3 className='text-xl font-semibold mb-2'>{title}</h3>
      <p className='text-muted-foreground mb-8'>
        {description}
      </p>
      {doneFunction && (
        <Button
          className='w-full sm:w-auto min-w-[120px]'
          onClick={() => doneFunction()}
        >
          Done
        </Button>
      )}
    </div>
  );
}

export default SuccessPasskey;
