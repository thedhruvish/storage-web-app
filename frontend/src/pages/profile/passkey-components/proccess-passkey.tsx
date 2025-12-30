import { KeyRound, Loader2 } from "lucide-react";

const ProccessPasskey = () => {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
      <div className='mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 relative'>
        <KeyRound className='h-10 w-10 text-blue-600 dark:text-blue-400' />
        <div className='absolute -bottom-1 -right-1 bg-background rounded-full p-1'>
          <Loader2 className='h-5 w-5 animate-spin text-primary' />
        </div>
      </div>
      <h3 className='text-xl font-semibold mb-2'>Continue in your browser</h3>
      <p className='text-muted-foreground max-w-xs mx-auto'>
        We've sent a request to your browser. Please follow the prompts to
        create your passkey.
      </p>
    </div>
  );
};

export default ProccessPasskey;
