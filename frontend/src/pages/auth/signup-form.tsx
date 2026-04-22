import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { APP_NAME } from "@/contansts";
import { Eye, EyeOff } from "lucide-react";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { useRegisterMutation } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TurnstileWidget } from "./TurnstileWidget";
import LoginWithOauth from "./login-with-0auth";

export function SigupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoading, setTurnstileLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const turnstile = useTurnstile();
  const navagate = useNavigate();

  const registerMutation = useRegisterMutation();
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: FormData) {
    if (!turnstileToken) return;
    registerMutation.mutate(
      { ...values, turnstileToken },
      {
        onSuccess: (res) => {
          form.reset();
          const responseData = res.data.data;
          if (responseData.step) {
            localStorage.setItem("userId", responseData.userId);
            sessionStorage.setItem(
              "otpExpiryTime",
              (Date.now() + 3 * 60 * 1000).toString()
            );
            navagate({ to: "/auth/otp-verify" });
          } else {
            navagate({ to: "/auth/login" });
          }
        },
        onError: (error) => {
          toast.error(error.message || "Something went wrong");
          turnstile.reset();
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='overflow-hidden border border-border bg-card/50 backdrop-blur-xl shadow-xl p-0 max-w-md w-full mx-auto'>
        <div className='p-8 flex flex-col justify-center'>
          <div className='w-full space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                Create Account
              </h1>
              <p className='text-muted-foreground text-sm'>
                Join {APP_NAME} to secure your digital life.
              </p>
            </div>

            <div className='space-y-6'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <div className='grid gap-6'>
                    <LoginWithOauth />

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t border-border' />
                      </div>
                      <div className='relative flex justify-center text-[10px] uppercase tracking-widest font-bold'>
                        <span className='bg-card px-4 text-muted-foreground'>
                          Or register with email
                        </span>
                      </div>
                    </div>

                    <div className='grid gap-5'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem className='space-y-1.5'>
                            <FormLabel className='text-xs font-semibold text-foreground/70'>
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='John Doe'
                                className='h-11 bg-muted/20 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-lg'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-[11px]' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem className='space-y-1.5'>
                            <FormLabel className='text-xs font-semibold text-foreground/70'>
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='email'
                                placeholder='name@example.com'
                                className='h-11 bg-muted/20 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-lg'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-[11px]' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                          <FormItem className='space-y-1.5'>
                            <FormLabel className='text-xs font-semibold text-foreground/70'>
                              Create Password
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  className='h-11 bg-muted/20 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all pr-10 rounded-lg'
                                  {...field}
                                />
                                <button
                                  type='button'
                                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className='h-4 w-4' />
                                  ) : (
                                    <Eye className='h-4 w-4' />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className='text-[11px]' />
                          </FormItem>
                        )}
                      />

                      <div className='py-1 opacity-90 grayscale hover:grayscale-0 transition-all'>
                        <TurnstileWidget
                          setTurnstileToken={setTurnstileToken}
                          setTurnstileLoading={setTurnstileLoading}
                        />
                      </div>

                      <Button
                        type='submit'
                        className='w-full h-11 text-sm font-semibold transition-all hover:translate-y-[-1px] active:translate-y-0 shadow-md shadow-primary/10 rounded-lg'
                        disabled={
                          (turnstileLoading && !turnstileToken) ||
                          !form.formState.isValid ||
                          registerMutation.isPending
                        }
                      >
                        {registerMutation.isPending
                          ? "Creating account..."
                          : "Start your free trial"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>

              <div className='text-center text-sm pt-4 border-t border-border/50'>
                <p className='text-muted-foreground'>
                  Already have an account?{" "}
                  <Link
                    to='/auth/login'
                    className='font-semibold text-primary hover:text-primary/80 transition-colors'
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Legal Links */}
      <div className='text-muted-foreground/60 text-center text-[11px] px-8 flex justify-center gap-6'>
        <a
          href='/terms-and-conditions'
          target='_blank'
          className='hover:text-foreground transition-colors'
        >
          Terms of Service
        </a>
        <a
          href='/privacy-policy'
          target='_blank'
          className='hover:text-foreground transition-colors'
        >
          Privacy Policy
        </a>
        <Link to='/' className='hover:text-foreground transition-colors'>
          Support
        </Link>
      </div>
    </div>
  );
}
