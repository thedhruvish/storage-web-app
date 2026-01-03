import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/store/user-store";
import { useGoogleLogin, type CodeResponse } from "@react-oauth/google";
import { Github, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import GIcon from "@/assets/icons/g-Icon";
import {
  useConnectGoogle,
  useLinkEmailMutation,
  useSendOtpToEmail,
  useDisconnectLinkedAccount,
} from "@/api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Authenticate } from "./types";

const passwordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignInMethods({ authenticate }: { authenticate: Authenticate[] }) {
  const { user } = useUser();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const connectGoogleMutation = useConnectGoogle();
  const disconnectMutation = useDisconnectLinkedAccount();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpInput, setOtpInput] = useState("");
  const [disconnectAccount, setDisconnectAccount] =
    useState<Authenticate | null>(null);

  const linkEmailMutation = useLinkEmailMutation();
  const verifyOtpMutation = useSendOtpToEmail();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsPasswordDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setStep("form");
        setOtpInput("");
        form.reset();
      }, 300);
    }
  };

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    toast.promise(
      linkEmailMutation.mutateAsync({
        email: values.email,
        password: values.password,
      }),
      {
        loading: "Processing...",
        success: (data) => {
          if (data && data.data.is_otp) {
            setStep("otp");
            return "Verification code sent to your email";
          } else {
            handleOpenChange(false);
            form.reset();
            return "Password set successfully";
          }
        },
        error: (err) => {
          return err?.response?.data?.message || "Failed to set password";
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    if (otpInput.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    toast.promise(
      verifyOtpMutation.mutateAsync({
        otp: otpInput,
        email: form.getValues("email"),
        password: form.getValues("password"),
      }),
      {
        loading: "Verifying OTP...",
        success: () => {
          form.reset();
          handleOpenChange(false);
          return "Email verified and password set!";
        },
        error: (err) => {
          return err?.response?.data?.message || "Invalid OTP";
        },
      }
    );
  };

  const connectGoogle = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse: CodeResponse) => {
      toast.promise(
        connectGoogleMutation.mutateAsync({ idToken: codeResponse.code }),
        {
          loading: "Connecting to Google...",
          success: () => {
            setIsGoogleConnected(false);
            return "Connected to Google!";
          },
          error: () => {
            setIsGoogleConnected(false);
            return "Failed to connect to Google.";
          },
        }
      );
    },
    onError: (errorResponse) => {
      toast.error(errorResponse.error);
    },
  });

  const googleAccount = authenticate.find((acc) => acc.provider === "GOOGLE");
  const githubAccount = authenticate.find((acc) => acc.provider === "GITHUB");
  const passwordAccount = authenticate.find((acc) => acc.provider === "EAMIL");

  const handleConnectGoogle = () => {
    setIsGoogleConnected(true);
    connectGoogle();
  };

  const handleDisconnect = (account: Authenticate) => {
    setDisconnectAccount(account);
  };

  const confirmDisconnect = () => {
    if (!disconnectAccount || !disconnectAccount._id) return;

    toast.promise(
      disconnectMutation.mutateAsync({
        id: disconnectAccount._id,
      }),
      {
        loading: "Disconnecting...",
        success: () => {
          setDisconnectAccount(null);
          return "Disconnected successfully";
        },
        error: (err) => {
          return err?.response?.data?.message || "Failed to disconnect";
        },
      }
    );
  };

  return (
    <>
      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <div className='p-4 border-b bg-muted/40 flex justify-between items-center'>
          <div>
            <h4 className='font-semibold text-sm'>Sign-in Methods</h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Control how you access your account.
            </p>
          </div>
        </div>

        <div className='divide-y'>
          {/* Password */}
          <div className='group flex w-full flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:bg-gray-50/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between'>
            {/* Left Side: Icon & Text */}
            <div className='flex items-start gap-4 sm:items-center'>
              {/* Icon Container with Lock */}
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'>
                <Lock className='h-5 w-5' />
              </div>

              {/* Text Info */}
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold text-gray-900 dark:text-gray-100'>
                    Password
                  </p>
                  {passwordAccount && (
                    <Badge
                      variant={
                        user?.email === passwordAccount?.providerEmail
                          ? "default"
                          : "secondary"
                      }
                      className={`h-5 px-1.5 text-[10px] font-medium ${
                        user?.email === passwordAccount?.providerEmail
                          ? "" // Primary default style
                          : "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      Connected
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {passwordAccount
                    ? passwordAccount.providerEmail || "Connected"
                    : "Protect your account with a password."}
                </p>
              </div>
            </div>

            {/* Right Side: Action Button */}
            <div className='flex sm:justify-end'>
              {passwordAccount ? (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDisconnect(passwordAccount)}
                  disabled={user?.email === passwordAccount.providerEmail}
                  className='w-full text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 sm:w-auto'
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  size='sm'
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className='w-full sm:w-auto'
                >
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Google */}
          <div className='group flex w-full flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:bg-gray-50/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between'>
            {/* Left Side: Icon & Text */}
            <div className='flex items-start gap-4 sm:items-center'>
              {/* Icon Container with Google 'G' */}
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
                <GIcon />
              </div>

              {/* Text Info */}
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold text-gray-900 dark:text-gray-100'>
                    Google Account
                  </p>
                  {googleAccount?.provider === "GOOGLE" && (
                    <Badge
                      variant={
                        user?.email === googleAccount?.providerEmail
                          ? "default"
                          : "secondary"
                      }
                      className={`h-5 px-1.5 text-[10px] font-medium ${
                        user?.email === googleAccount?.providerEmail
                          ? ""
                          : "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      Connected
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {googleAccount
                    ? googleAccount.providerEmail || "Connected"
                    : "Enable one-click login and sync your calendar."}
                </p>
              </div>
            </div>

            {/* Right Side: Action Button */}
            <div className='flex sm:justify-end'>
              {googleAccount?.provider === "GOOGLE" ? (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDisconnect(googleAccount)}
                  disabled={user?.email === googleAccount.providerEmail}
                  className='w-full text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 sm:w-auto'
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant='default'
                  size='sm'
                  onClick={handleConnectGoogle}
                  disabled={
                    isGoogleConnected || connectGoogleMutation.isPending
                  }
                  className='w-full sm:w-auto'
                >
                  {isGoogleConnected ? (
                    <>
                      <span className='mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* GitHub */}
          <div className='group flex w-full flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:bg-gray-50/50 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-4 sm:items-center'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'>
                <Github className='h-5 w-5' />
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-semibold text-gray-900 dark:text-gray-100'>
                    GitHub
                  </p>
                  {githubAccount && (
                    <Badge
                      variant={
                        user?.email === githubAccount?.providerEmail
                          ? "default"
                          : "secondary"
                      }
                      className={`h-5 px-1.5 text-[10px] font-medium ${
                        user?.email === githubAccount?.providerEmail
                          ? ""
                          : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                      }`}
                    >
                      Connected
                    </Badge>
                  )}
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {githubAccount
                    ? githubAccount.providerEmail || "Connected"
                    : "Link your GitHub account."}
                </p>
              </div>
            </div>
            <div className='flex sm:justify-end'>
              {githubAccount ? (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDisconnect(githubAccount)}
                  disabled={user?.email === githubAccount.providerEmail}
                  className='w-full text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 sm:w-auto'
                >
                  Disconnect
                </Button>
              ) : (
                <Button size='sm' className='w-full sm:w-auto'>
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        open={!!disconnectAccount}
        onOpenChange={(open) => !open && setDisconnectAccount(null)}
        title='Disconnect Account'
        desc={`Are you sure you want to disconnect your ${disconnectAccount?.provider.toLowerCase()} account? This action cannot be undone.`}
        confirmText='Disconnect'
        destructive
        handleConfirm={confirmDisconnect}
        isLoading={disconnectMutation.isPending}
      />

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {passwordAccount ? "Change Password" : "Set Password"}
            </DialogTitle>
            <DialogDescription>
              {step === "otp"
                ? "Enter the 6-digit code sent to your email."
                : "Choose a strong password with at least 8 characters."}
            </DialogDescription>
          </DialogHeader>

          {step === "form" ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 py-4'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='name@example.com'
                          type='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='••••••••'
                          type='password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={linkEmailMutation.isPending}>
                    {linkEmailMutation.isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {passwordAccount ? "Change Password" : "Set Password"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='otp'>One-Time Password</Label>
                <Input
                  id='otp'
                  type='text'
                  placeholder='123456'
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsPasswordDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Verify
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SignInMethods;
