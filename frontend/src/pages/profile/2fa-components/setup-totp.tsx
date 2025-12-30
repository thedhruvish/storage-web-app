import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ScanQrCode,
  Keyboard,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface SetupTotpProps {
  onBack: () => void;
  isLoadingSetup: boolean;
  isErrorSetup: boolean;
  onRetrySetup: () => void;
  setupData: { otpauthUrl: string; secret: string } | null;
  onVerify: (code: string) => void;
  isVerifying: boolean;
  verifyError: string | null;
}

export function SetupTotp({
  onBack,
  isLoadingSetup,
  isErrorSetup,
  onRetrySetup,
  setupData,
  onVerify,
  isVerifying,
  verifyError,
}: SetupTotpProps) {
  const [otpCode, setOtpCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <>
      <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 -ml-2'
            onClick={onBack}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h2 className='text-lg font-semibold leading-none tracking-tight'>
            Setup Authenticator
          </h2>
        </div>
        <p className='sr-only'>Follow the instructions to set up 2FA.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 py-4'>
        {/* LEFT COLUMN: QR & INTERACTION */}
        <div className='flex flex-col items-center justify-center space-y-6 order-2 md:order-1'>
          {isLoadingSetup && (
            <div className='flex flex-col items-center gap-4 py-8 w-full'>
              <Skeleton className='h-40 w-40 rounded-xl' />
              <div className='space-y-2 w-full px-4'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </div>
          )}

          {isErrorSetup && (
            <div className='text-center py-8 text-destructive'>
              <p>Failed to generate QR Code.</p>
              <Button variant='link' onClick={onRetrySetup}>
                Try Again
              </Button>
            </div>
          )}

          {setupData && !isLoadingSetup && (
            <div className='w-full space-y-6 animate-in fade-in zoom-in duration-300'>
              <div className='flex justify-center'>
                <div className='p-4 bg-white rounded-xl shadow-sm border border-gray-200'>
                  <QRCodeSVG
                    value={setupData.otpauthUrl}
                    size={160}
                    level='H'
                  />
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold'>
                    Secret Key
                  </Label>
                  <div className='flex gap-2'>
                    <div className='flex-1 h-9 rounded-md border border-input bg-muted/50 px-3 py-1 text-xs shadow-sm flex items-center font-mono text-foreground truncate'>
                      {setupData.secret}
                    </div>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => copyToClipboard(setupData.secret)}
                      className='shrink-0 h-9 w-9 p-0'
                    >
                      {copySuccess ? (
                        <Check className='h-4 w-4 text-green-500' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                <div className='space-y-1.5 pt-2 border-t'>
                  <Label className='text-sm font-medium'>Verify Code</Label>
                  <div className='flex gap-2'>
                    <Input
                      placeholder='000000'
                      maxLength={6}
                      className='font-mono tracking-widest text-center text-lg h-10'
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                    />
                    <Button
                      onClick={() => onVerify(otpCode)}
                      disabled={otpCode.length !== 6 || isVerifying}
                      className='w-24'
                    >
                      {isVerifying ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  {verifyError && (
                    <p className='text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1'>
                      <AlertCircle className='h-3 w-3' />
                      {verifyError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INSTRUCTIONS */}
        <div className='space-y-6 md:border-l md:pl-8 order-1 md:order-2'>
          <div className='space-y-1'>
            <h4 className='font-medium text-lg leading-none'>Instructions</h4>
            <p className='text-sm text-muted-foreground'>
              Follow these steps to enable 2FA.
            </p>
          </div>

          <div className='space-y-5'>
            <div className='flex gap-3'>
              <div className='flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary'>
                <Download className='w-4 h-4' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none mt-1.5'>
                  1. Get the App
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Download{" "}
                  <span className='font-medium text-foreground'>
                    Google Authenticator
                  </span>{" "}
                  or any TOTP app from your phone's app store.
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary'>
                <ScanQrCode className='w-4 h-4' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none mt-1.5'>
                  2. Scan Code
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Open the app and select{" "}
                  <span className='italic'>Add Account</span>. Scan the QR code
                  shown on the left.
                </p>
              </div>
            </div>

            <div className='flex gap-3'>
              <div className='flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary'>
                <Keyboard className='w-4 h-4' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none mt-1.5'>
                  3. Enter Token
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Enter the 6-digit code generated by the app into the input box
                  to verify setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
