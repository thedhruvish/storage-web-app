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
  InputOTPSeparator,
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
    <Card className='relative w-full overflow-hidden'>
      <CardHeader className='flex flex-col items-center gap-2 pb-2 text-center'>
        {/* Absolute positioned back button to keep title centered */}
        <div className='absolute left-4 top-4'>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-foreground'
            onClick={() => window.history.back()}
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
        </div>

        {/* Visual Icon */}
        <div className='bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full'>
          <ShieldCheck className='size-6' />
        </div>

        <CardTitle className='text-xl'>Two-Step Verification</CardTitle>
        <CardDescription className='max-w-xs'>
          Enter the 6-digit code from your authenticator app to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col items-center gap-6 pt-4'>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => setCode(value)}
        >
          {/* Group 1: First 3 digits */}
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>

          <InputOTPSeparator />

          {/* Group 2: Last 3 digits */}
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className='w-full'
          onClick={handleVerify}
          disabled={code.length !== 6 || loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
