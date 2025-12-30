import { KeyRound, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SelectMethodProps {
  handleMethodSelect: (method: "totp" | "passkeys") => void;
  isAllowedNewTOTP: boolean;
}

export function SelectMethod({
  handleMethodSelect,
  isAllowedNewTOTP,
}: SelectMethodProps) {
  return (
    <div className='grid grid-cols-2 gap-4 py-4'>
      <div
        onClick={() => {
          if (isAllowedNewTOTP) handleMethodSelect("totp");
        }}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-muted bg-popover p-4 transition-all hover:border-primary/50",
          !isAllowedNewTOTP
            ? "opacity-60 cursor-not-allowed hover:border-muted"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {!isAllowedNewTOTP && (
          <Badge
            variant='secondary'
            className='absolute top-3 right-3 text-[10px] h-5 px-1.5'
          >
            Used
          </Badge>
        )}
        <div className='mb-3 rounded-full w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
          <Smartphone className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        </div>
        <h3 className='font-medium'>Authenticator App</h3>
        <p className='text-xs text-muted-foreground mt-1'>
          Google Auth, Authy, etc.
        </p>
      </div>
      <div
        onClick={() => handleMethodSelect("passkeys")}
        className='cursor-pointer rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-all hover:border-primary/50'
      >
        <div className='mb-3 rounded-full w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
          <KeyRound className='h-5 w-5 text-purple-600 dark:text-purple-400' />
        </div>
        <h3 className='font-medium'>Passkey</h3>
        <p className='text-xs text-muted-foreground mt-1'>Biometric</p>
      </div>
    </div>
  );
}
