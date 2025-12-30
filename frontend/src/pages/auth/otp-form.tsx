import { useEffect, useState } from "react";
import { z } from "zod";
import { AxiosError } from "axios";
import { formatDuration, intervalToDuration } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useResendOtp, useVerifyOtp } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

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
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // submit otp
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!data.pin || !userId) return;
    toast.promise(
      verfiyOpt.mutateAsync(
        { otp: data.pin, userId },
        {
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
          localStorage.removeItem("userId");
          navagate({ to: "/" });
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
      toast.success("OTP resend successfully");
    } catch {
      toast.error("OTP resend failed. try after some time");
    }

    setCountdown(COUNTDOWN_SECONDS);
  };
  const formatTime = (secs: number) =>
    formatDuration(intervalToDuration({ start: 0, end: secs * 1000 }), {
      format: ["minutes", "seconds"],
      zero: true,
      delimiter: ":",
    });

  return (
    <div
      className={cn("animate-fade-in-up flex flex-col gap-6", className)}
      {...props}
    >
      <Card className='rounded-2xl shadow-xl'>
        <CardHeader className='pb-2 text-center'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Welcome back
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your phone.
          </CardDescription>
        </CardHeader>

        <CardContent className='pt-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex w-full flex-col items-center gap-6'
            >
              <FormField
                control={form.control}
                name='pin'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel className='text-sm font-semibold'>
                      One-Time Password
                    </FormLabel>

                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup className='w-full justify-between gap-2'>
                          {Array.from({ length: 6 }).map((_, idx) => (
                            <InputOTPSlot
                              key={idx}
                              index={idx}
                              className={cn(
                                "h-14 w-12 rounded-lg border-2 border-slate-300 text-2xl font-bold transition-all",
                                ""
                              )}
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>

                    <FormDescription className='mt-1 text-xs text-slate-500'>
                      Didn’t receive a code?{" "}
                      <button
                        type='button'
                        disabled={countdown > 0}
                        onClick={handleResend}
                        className={cn(
                          "font-semibold text-indigo-600",
                          countdown > 0 && "cursor-not-allowed opacity-60"
                        )}
                      >
                        {countdown > 0
                          ? `Resend in ${formatTime(countdown)}`
                          : "Resend"}
                      </button>
                    </FormDescription>

                    <FormMessage className='text-center text-sm' />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full rounded-lg bg-indigo-600 font-semibold text-white shadow-sm transition-transform hover:bg-indigo-700 active:scale-[.98]'
                disabled={!form.formState.isValid}
              >
                Verify & continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className='text-center text-xs leading-relaxed text-slate-500'>
        By continuing, you agree to our{" "}
        <a href='#' className='font-semibold text-slate-700 underline'>
          Terms
        </a>{" "}
        and{" "}
        <a href='#' className='font-semibold text-slate-700 underline'>
          Privacy Policy
        </a>
        .
      </p>

      {/* Minimal fade-in keyframes (global) */}
    </div>
  );
}
