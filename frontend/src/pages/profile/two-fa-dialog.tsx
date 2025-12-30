import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startRegistration } from "@simplewebauthn/browser";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  Smartphone,
  KeyRound,
  Download,
  ScanQrCode,
  Keyboard,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import {
  usePasskeysRegistrationVerify,
  useTotpVerify,
  useTwosteupSet,
} from "@/api/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Update the Step Type
type DialogStep =
  | "select"
  | "name"
  | "setup-totp"
  | "proccess-passkey"
  | "fail-passkey"
  | "success-passkey"
  | "backup-codes";

interface TwoFaDialogProps {
  setIs2FADialogOpen: (d: boolean) => void;
  is2FADialogOpen: boolean;
  isAllowedNewTOTP: boolean;
}

const nameSchema = z.object({
  name: z
    .string()
    .max(20, "Name not allowed this length is less than 20 characters"),
});

export function TwoFaDialog({
  setIs2FADialogOpen,
  is2FADialogOpen,
  isAllowedNewTOTP,
}: TwoFaDialogProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("select");
  // const [friendlyName, setFriendlyName] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<
    "totp" | "passkeys" | null
  >(null);
  const [otpCode, setOtpCode] = useState("");

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: "",
    },
  });

  const friendlyName = form.watch("name");
  // 2. State for Backup Codes
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [setupData, setSetupData] = useState<{
    otpauthUrl: string;
    secret: string;
  } | null>(null);

  const setupMutation = useTwosteupSet();
  const verifyMutation = useTotpVerify();
  const passkeysVerifyMutation = usePasskeysRegistrationVerify();

  const handleOpenChange = (open: boolean) => {
    // Prevent closing if on backup step (force them to click 'Done')
    if (!open && dialogStep === "backup-codes") {
      return;
    }

    setIs2FADialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setDialogStep("select");
        setSelectedMethod(null);
        setOtpCode("");
        setSetupData(null);
        setBackupCodes([]);
        setupMutation.reset();
        verifyMutation.reset();
      }, 300);
    }
  };

  const handleMethodSelect = (method: "totp" | "passkeys") => {
    setSelectedMethod(method);
    setDialogStep("name");
  };

  const handleNameSubmit = () => {
    if (!selectedMethod) return;

    if (selectedMethod === "totp") {
      handleStartTotpSetup();
    } else {
      handleStartPasskeysSetup();
    }
  };

  const handleStartTotpSetup = () => {
    setDialogStep("setup-totp");
    setupMutation.mutate(
      { method: "totp" },
      {
        onSuccess: (response: any) => {
          setSetupData({
            otpauthUrl: response.data.data.otpauthUrl,
            secret: response.data.data.secret,
          });
        },
      }
    );
  };

  const passkeysRegistration = async (optionsJSON: any) => {
    setDialogStep("proccess-passkey");
    let attResp;

    try {
      attResp = await startRegistration({ optionsJSON });
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        toast.error(
          "Error: Authenticator was probably already registered by user"
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
      setDialogStep("fail-passkey");
      return;
    }

    if (!attResp) {
      setDialogStep("fail-passkey");
      return;
    }

    passkeysVerifyMutation.mutate(
      { response: attResp, friendlyName },
      {
        onSuccess: () => {
          setDialogStep("success-passkey");
          toast.success("Passkey registered successfully");
        },
        onError: () => {
          setDialogStep("fail-passkey");
          toast.error("Failed to register passkey");
        },
      }
    );
  };

  const handleStartPasskeysSetup = () => {
    setupMutation.mutateAsync(
      { method: "passkeys" },
      {
        onSuccess: async (res) => {
          await passkeysRegistration(res.data.data);
        },
      }
    );
  };

  const handleVerifyToken = () => {
    verifyMutation.mutate(
      { token: otpCode, friendlyName },
      {
        onSuccess: (response: any) => {
          // 3. Capture codes and switch step
          // Assuming response structure: response.data.data.recoveryCodes
          setBackupCodes(response.data.data.recoveryCodes || []);
          setDialogStep("backup-codes");
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 4. Download Helper Function
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
    <Dialog open={is2FADialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Widen dialog for backup codes view
          dialogStep === "setup-totp" || dialogStep === "backup-codes"
            ? "sm:max-w-2xl"
            : "sm:max-w-md"
        )}
      >
        {dialogStep === "select" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Verification Method</DialogTitle>
              <DialogDescription>
                Select how you want to authenticate.
              </DialogDescription>
            </DialogHeader>
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
          </>
        )}

        {dialogStep === "name" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleNameSubmit)}
              className='animate-in fade-in slide-in-from-right-4 duration-300'
            >
              <DialogHeader>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 -ml-2'
                    onClick={() => setDialogStep("select")}
                  >
                    <ArrowLeft className='h-4 w-4' />
                  </Button>
                  <DialogTitle>Name your device</DialogTitle>
                </div>
                <DialogDescription>
                  Give this verification method a memorable name.
                </DialogDescription>
              </DialogHeader>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid gap-4 py-4'>
                    <FormLabel>Friendly Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. My iPhone, Work Laptop'
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && friendlyName.trim()) {
                            e.preventDefault();
                            form.handleSubmit(handleNameSubmit);
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type='submit'
                  disabled={
                    setupMutation.isPending || friendlyName.length === 0
                  }
                >
                  {setupMutation.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Setting up...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* STEP 2: SETUP TOTP (Unchanged logic, just update copyToClipboard call) */}
        {dialogStep === "setup-totp" && (
          <>
            <DialogHeader>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 -ml-2'
                  onClick={() => setDialogStep("select")}
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <DialogTitle>Setup Authenticator</DialogTitle>
              </div>
              <DialogDescription className='sr-only'>
                Follow the instructions to set up 2FA.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 py-4'>
              {/* LEFT COLUMN: QR & INTERACTION */}
              <div className='flex flex-col items-center justify-center space-y-6 order-2 md:order-1'>
                {setupMutation.isPending && (
                  <div className='flex flex-col items-center gap-4 py-8 w-full'>
                    <Skeleton className='h-40 w-40 rounded-xl' />
                    <div className='space-y-2 w-full px-4'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                    </div>
                  </div>
                )}

                {setupMutation.isError && (
                  <div className='text-center py-8 text-destructive'>
                    <p>Failed to generate QR Code.</p>
                    <Button variant='link' onClick={handleStartTotpSetup}>
                      Try Again
                    </Button>
                  </div>
                )}

                {setupData && !setupMutation.isPending && (
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
                        <Label className='text-sm font-medium'>
                          Verify Code
                        </Label>
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
                            onClick={handleVerifyToken}
                            disabled={
                              otpCode.length !== 6 || verifyMutation.isPending
                            }
                            className='w-24'
                          >
                            {verifyMutation.isPending ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        {verifyMutation.isError && (
                          <p className='text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1'>
                            <AlertCircle className='h-3 w-3' />
                            {(verifyMutation.error as any)?.response?.status ===
                            401
                              ? "Invalid code."
                              : "Verification failed."}
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
                  <h4 className='font-medium text-lg leading-none'>
                    Instructions
                  </h4>
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
                        <span className='italic'>Add Account</span>. Scan the QR
                        code shown on the left.
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
                        Enter the 6-digit code generated by the app into the
                        input box to verify setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PASSKEY STEPS */}
        {dialogStep === "proccess-passkey" && (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
            <div className='mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 relative'>
              <KeyRound className='h-10 w-10 text-blue-600 dark:text-blue-400' />
              <div className='absolute -bottom-1 -right-1 bg-background rounded-full p-1'>
                <Loader2 className='h-5 w-5 animate-spin text-primary' />
              </div>
            </div>
            <h3 className='text-xl font-semibold mb-2'>
              Continue in your browser
            </h3>
            <p className='text-muted-foreground max-w-xs mx-auto'>
              We've sent a request to your browser. Please follow the prompts to
              create your passkey.
            </p>
          </div>
        )}

        {dialogStep === "success-passkey" && (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
            <div className='mb-6 rounded-full bg-green-100 dark:bg-green-900/30 p-6'>
              <Check className='h-10 w-10 text-green-600 dark:text-green-400' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Passkey Added!</h3>
            <p className='text-muted-foreground mb-8'>
              You can now use this passkey to sign in to your account.
            </p>
            <Button
              className='w-full sm:w-auto min-w-[120px]'
              onClick={() => setIs2FADialogOpen(false)}
            >
              Done
            </Button>
          </div>
        )}

        {dialogStep === "fail-passkey" && (
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-300'>
            <div className='mb-6 rounded-full bg-red-100 dark:bg-red-900/30 p-6'>
              <AlertCircle className='h-10 w-10 text-red-600 dark:text-red-400' />
            </div>
            <h3 className='text-xl font-semibold mb-2'>Passkey Setup Failed</h3>
            <p className='text-muted-foreground mb-8 max-w-xs mx-auto'>
              We couldn't create your passkey. This might happen if you
              cancelled the request or the operation timed out.
            </p>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Button
                variant='outline'
                onClick={() => setIs2FADialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setDialogStep("name")}>Try Again</Button>
            </div>
          </div>
        )}

        {/* STEP 3: BACKUP CODES  */}
        {dialogStep === "backup-codes" && (
          <div className='animate-in fade-in slide-in-from-right-4 duration-300'>
            <DialogHeader>
              <div className='flex items-center gap-2 text-green-600 mb-2'>
                <ShieldCheck className='h-6 w-6' />
                <span className='font-semibold text-lg'>2FA Enabled</span>
              </div>
              <DialogTitle>Save your backup codes</DialogTitle>
              <DialogDescription>
                If you lose your device, these codes are the{" "}
                <strong>only way</strong> to recover your account.
              </DialogDescription>
            </DialogHeader>

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
                  We cannot show these codes again. If you close this window
                  without saving, you will lose them.
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

            <DialogFooter className='flex-col sm:flex-row gap-2'>
              <div className='flex-1 flex gap-2 w-full'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={downloadCodes}
                >
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
              <Button
                className='w-full sm:w-auto'
                onClick={() => {
                  setBackupCodes([]);
                  setIs2FADialogOpen(false);
                }}
              >
                I have saved them
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
