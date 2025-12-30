import { useState } from "react";
import { ShieldCheck, AlertCircle, Download, Copy, Check } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface BackupCodesProps {
  backupCodes: string[];
  onDone: () => void;
}

export function BackupCodes({ backupCodes, onDone }: BackupCodesProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadCodes = () => {
    const textContent = `MyApp Recovery Codes\n\nGenerated on: ${new Date().toLocaleDateString()}\nKeep these safe!\n\n${backupCodes.join("\n")}`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "myapp-recovery-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
      <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
        <div className='flex items-center gap-2 text-green-600 mb-2'>
          <ShieldCheck className='h-6 w-6' />
          <h2 className='text-lg font-semibold leading-none tracking-tight'>
            2FA Enabled
          </h2>
        </div>
        <div className='text-lg font-semibold leading-none tracking-tight text-foreground'>
          Save your backup codes
        </div>
        <p className='text-sm text-muted-foreground'>
          If you lose your device, these codes are the <strong>only way</strong>{" "}
          to recover your account.
        </p>
      </div>

      <div className='py-6'>
        {/* Warning Alert */}
        <Alert
          variant='destructive'
          className='mb-6 bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50'
        >
          <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertTitle className='text-red-800 dark:text-red-300'>
            Save them now
          </AlertTitle>
          <AlertDescription className='text-red-700/90 dark:text-red-400/90 text-xs'>
            We cannot show these codes again. If you close this window without
            saving, you will lose them.
          </AlertDescription>
        </Alert>

        {/* Codes Grid */}
        <div className='grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border border-border'>
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className='flex items-center justify-center h-10 font-mono text-sm font-medium bg-background border rounded border-border/50 select-all'
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='flex-1 flex gap-2 w-full'>
          <Button variant='outline' className='flex-1' onClick={downloadCodes}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
          <Button
            variant='outline'
            className='flex-1'
            onClick={() => copyToClipboard(backupCodes.join("\n"))}
          >
            {copySuccess ? (
              <Check className='mr-2 h-4 w-4 text-green-500' />
            ) : (
              <Copy className='mr-2 h-4 w-4' />
            )}
            Copy All
          </Button>
        </div>
        <Button className='w-full sm:w-auto' onClick={onDone}>
          I have saved them
        </Button>
      </div>
    </div>
  );
}
