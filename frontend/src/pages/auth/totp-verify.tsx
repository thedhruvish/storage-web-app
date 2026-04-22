import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useLoginWithTotp } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function TotpVerify() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const loginMutation = useLoginWithTotp();

  const handleVerify = () => {
    if (code.length !== 6) return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return;
    }
    toast.promise(loginMutation.mutateAsync({ token: code, userId }), {
      loading: "Verifying...",
      success: () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("isTotp");
        localStorage.removeItem("isPasskey");
        navigate({ to: "/app" });
        return "Logged in successfully";
      },
      error: (err: any) => {
        // Clear code on error for better UX
        setCode("");
        return err?.response?.data?.message || "Verification failed";
      },
    });
  };

  return (
    <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
      <Card className='relative w-full overflow-hidden border border-border bg-card/50 backdrop-blur-xl shadow-xl p-0 max-w-md w-full mx-auto'>
        <CardHeader className='flex flex-col items-center gap-2 pt-8 pb-6 px-8 text-center'>
          {/* Absolute positioned back button to keep title centered */}
          <div className='absolute left-4 top-4'>
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg'
              onClick={() => window.history.back()}
            >
              <ArrowLeft className='h-4 w-4' />
              <span className='sr-only'>Back</span>
            </Button>
          </div>

          {/* Visual Icon */}
          <div className='bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl shadow-sm'>
            <ShieldCheck className='size-7' />
          </div>

          <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
            Secure access
          </CardTitle>
          <CardDescription className='max-w-[280px] text-sm text-muted-foreground'>
            Enter the 6-digit code from your authenticator app.
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col items-center gap-8 px-8 pb-10'>
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            className='gap-2.5'
          >
            <InputOTPGroup className='gap-2.5'>
              <InputOTPSlot
                index={0}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
              <InputOTPSlot
                index={1}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
              <InputOTPSlot
                index={2}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
            </InputOTPGroup>

            <div className='flex items-center justify-center'>
              <div className='w-1.5 h-1.5 rounded-full bg-border' />
            </div>

            <InputOTPGroup className='gap-2.5'>
              <InputOTPSlot
                index={3}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
              <InputOTPSlot
                index={4}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
              <InputOTPSlot
                index={5}
                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
              />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className='w-full h-11 text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-0 shadow-md shadow-primary/10 rounded-lg'
            onClick={handleVerify}
            disabled={code.length !== 6 || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Verifying...
              </>
            ) : (
              "Confirm and login"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className='mt-8 text-center'>
        <p className='text-[11px] text-muted-foreground font-medium'>
          Lost access to your device?{" "}
          <button className='text-primary hover:underline'>
            Use a recovery code
          </button>
        </p>
      </div>
    </div>
  );
}
