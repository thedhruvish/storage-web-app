import { useEffect, useState } from "react";
import { z } from "zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useResendOtp, useVerifyOtp } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

const COUNTDOWN_SECONDS = 3 * 60; // 3 minutes

export function OtpVerfiyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [countdown, setCountdown] = useState(() => {
    const expiryTime = sessionStorage.getItem("otpExpiryTime");
    if (expiryTime) {
      const remaining = Math.max(
        0,
        Math.floor((Number(expiryTime) - Date.now()) / 1000)
      );
      return remaining;
    }
    return COUNTDOWN_SECONDS;
  });

  const verfiyOpt = useVerifyOtp();
  const reSendOTP = useResendOtp();
  const navagate = useNavigate();
  const userId = localStorage.getItem("userId");
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });

  if (!userId) {
    navagate({ to: "/auth/login" });
  }

  useEffect(() => {
    const expiryTime = sessionStorage.getItem("otpExpiryTime");

    if (!expiryTime) {
      const newExpiryTime = Date.now() + COUNTDOWN_SECONDS * 1000;
      sessionStorage.setItem("otpExpiryTime", newExpiryTime.toString());
    }

    const timer = setInterval(() => {
      const storedExpiry = sessionStorage.getItem("otpExpiryTime");
      if (!storedExpiry) return;

      const currentTime = Date.now();
      const remaining = Math.max(
        0,
        Math.floor((Number(storedExpiry) - currentTime) / 1000)
      );

      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // submit otp
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!data.pin || !userId) return;
    toast.promise(
      verfiyOpt.mutateAsync(
        { otp: data.pin, userId },

        {
          onSuccess(res) {
            const responseData = res.data.data;
            sessionStorage.removeItem("otpExpiryTime");
            if (responseData?.showSetUp2Fa) {
              localStorage.setItem("userId", responseData.userId);
              navagate({ to: "/auth/2fa/setup" });
            } else {
              navagate({ to: "/" });
            }
          },
          onError(error) {
            const errorMsg =
              (error as AxiosError<{ message?: string }>).response?.data
                .message || "OTP are invalid";
            toast.error(errorMsg);
          },
        }
      ),
      {
        loading: "Verifying OTP...",
        success: () => {
          return "OTP verified successfully";
        },
      }
    );
    form.reset();
  };
  // reset otp
  const handleResend = async () => {
    if (!userId) return;
    try {
      await reSendOTP.mutateAsync({ userId });
      const newExpiryTime = Date.now() + COUNTDOWN_SECONDS * 1000;
      sessionStorage.setItem("otpExpiryTime", newExpiryTime.toString());
      setCountdown(COUNTDOWN_SECONDS);
      toast.success("OTP resend successfully");
    } catch {
      toast.error("OTP resend failed. try after some time");
    }
  };
  const formatTime = (secs: number) => `${secs}s`;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='border border-border bg-card/50 backdrop-blur-xl shadow-xl p-0 max-w-md w-full mx-auto overflow-hidden'>
        <div className='p-8'>
          <div className='space-y-2 text-center mb-8'>
            <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
              Verify identity
            </CardTitle>
            <CardDescription className='text-muted-foreground text-sm'>
              Enter the 6-digit code sent to your registered device.
            </CardDescription>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex w-full flex-col items-center gap-8'
            >
              <FormField
                control={form.control}
                name='pin'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <div className='flex items-center justify-center mb-4'>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className='gap-2.5'>
                            {Array.from({ length: 6 }).map((_, idx) => (
                              <InputOTPSlot
                                key={idx}
                                index={idx}
                                className='h-12 w-11 rounded-lg border border-border bg-muted/20 text-xl font-semibold focus:ring-1 focus:ring-primary/30 transition-all'
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                    </div>

                    <div className='text-center'>
                      <FormDescription className='text-[11px] text-muted-foreground font-medium'>
                        Didn’t receive a code?{" "}
                        <button
                          type='button'
                          disabled={countdown > 0}
                          onClick={handleResend}
                          className={cn(
                            "font-bold text-primary transition-colors hover:text-primary/80",
                            countdown > 0 && "cursor-not-allowed opacity-50"
                          )}
                        >
                          {countdown > 0
                            ? `Resend in ${formatTime(countdown)}`
                            : "Resend now"}
                        </button>
                      </FormDescription>
                    </div>

                    <FormMessage className='text-center text-[11px] mt-2' />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full h-11 text-sm font-semibold transition-all hover:-translate-y-px active:translate-y-0 shadow-md shadow-primary/10 rounded-lg'
                disabled={!form.formState.isValid || verfiyOpt.isPending}
              >
                {verfiyOpt.isPending
                  ? "Verifying code..."
                  : "Verify & access account"}
              </Button>
            </form>
          </Form>
        </div>
      </Card>

      <div className='text-muted-foreground/60 text-center text-[11px] px-8 flex justify-center gap-6'>
        <Link
          to='/terms-and-conditions'
          className='hover:text-foreground transition-colors'
        >
          Terms
        </Link>
        <Link
          to='/privacy-policy'
          className='hover:text-foreground transition-colors'
        >
          Privacy
        </Link>
        <button
          onClick={() => navagate({ to: "/auth/login" })}
          className='hover:text-foreground transition-colors font-semibold text-foreground/70'
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
