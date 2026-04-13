import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { APP_NAME } from "@/contansts";
import { Eye, EyeOff, Cloud, ShieldCheck, Zap } from "lucide-react";
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
      <Card className='overflow-hidden border-none shadow-2xl p-0 max-w-4xl w-full mx-auto'>
        <div className='grid md:grid-cols-2 lg:grid-cols-5 min-h-[700px]'>
          {/* BRANDING SIDE */}
          <div className='hidden md:flex lg:col-span-2 bg-primary p-10 flex-col justify-between text-primary-foreground relative overflow-hidden'>
            {/* Background Pattern/Overlay */}
            <div className='absolute inset-0 bg-linear-to-br from-primary via-primary to-indigo-900 opacity-90' />
            <div className='absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl' />
            <div className='absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl' />

            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-8'>
                <div className='bg-white/20 p-2 rounded-lg backdrop-blur-md'>
                  <Cloud className='h-6 w-6' />
                </div>
                <span className='text-2xl font-bold tracking-tighter uppercase'>
                  {APP_NAME}
                </span>
              </div>

              <div className='space-y-6 mt-12'>
                <h2 className='text-3xl font-bold leading-tight'>
                  Start Your <br />
                  Journey with <br />
                  <span className='text-indigo-200'>Cloud Freedom.</span>
                </h2>
                <p className='text-primary-foreground/80 text-lg max-w-xs'>
                  Join thousands of users who trust StoreOne for their most
                  important data.
                </p>
              </div>
            </div>

            <div className='relative z-10 space-y-4'>
              <div className='flex items-center gap-3'>
                <ShieldCheck className='h-5 w-5 text-indigo-200' />
                <span className='text-sm font-medium'>
                  Privacy-first architecture
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <Zap className='h-5 w-5 text-indigo-200' />
                <span className='text-sm font-medium'>
                  Unlimited possibilities
                </span>
              </div>

              <div className='pt-8 border-t border-white/10 mt-8'>
                <p className='text-xs text-primary-foreground/60 italic'>
                  "Setting up an account was seamless. The best storage solution
                  I've used."
                </p>
              </div>
            </div>
          </div>

          {/* FORM SIDE */}
          <div className='lg:col-span-3 p-6 md:p-10 flex flex-col justify-center bg-card'>
            <div className='w-full max-w-md mx-auto space-y-8'>
              <div className='space-y-2 text-center md:text-left'>
                <h1 className='text-3xl font-bold tracking-tight'>
                  Create Account
                </h1>
                <p className='text-muted-foreground'>
                  Get started with your free StoreOne account today.
                </p>
              </div>

              <div className='space-y-6'>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-5'
                  >
                    <div className='grid gap-5'>
                      <LoginWithOauth />

                      <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                          <span className='w-full border-t border-muted' />
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                          <span className='bg-card px-2 text-muted-foreground'>
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      <div className='grid gap-4'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs font-bold uppercase text-muted-foreground tracking-widest'>
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='John Doe'
                                  className='h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary transition-all'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='email'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-xs font-bold uppercase text-muted-foreground tracking-widest'>
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='email'
                                  placeholder='name@example.com'
                                  className='h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary transition-all'
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
                              <FormLabel className='text-xs font-bold uppercase text-muted-foreground tracking-widest'>
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    className='h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary transition-all pr-10'
                                    {...field}
                                  />
                                  <button
                                    type='button'
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOff className='h-4 w-4' />
                                    ) : (
                                      <Eye className='h-4 w-4' />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='py-1'>
                          <TurnstileWidget
                            setTurnstileToken={setTurnstileToken}
                            setTurnstileLoading={setTurnstileLoading}
                          />
                        </div>

                        <Button
                          type='submit'
                          className='w-full h-12 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]'
                          disabled={
                            (turnstileLoading && !turnstileToken) ||
                            !form.formState.isValid ||
                            registerMutation.isPending
                          }
                        >
                          {registerMutation.isPending
                            ? "Creating account..."
                            : "Sign up"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>

                <div className='text-center text-sm pt-4 border-t border-muted/50'>
                  <span className='text-muted-foreground'>
                    Already have an account?{" "}
                  </span>
                  <Link
                    to='/auth/login'
                    className='font-bold text-primary underline-offset-4 hover:underline'
                  >
                    Log in here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Footer Legal Links */}
      <div className='text-muted-foreground text-center text-xs px-8 flex justify-center gap-4'>
        <a
          href='/terms-and-conditions'
          target='_blank'
          className='hover:text-primary transition-colors'
        >
          Terms
        </a>
        <span>•</span>
        <a
          href='/privacy-policy'
          target='_blank'
          className='hover:text-primary transition-colors'
        >
          Privacy
        </a>
        <span>•</span>
        <Link to='/' className='hover:text-primary transition-colors'>
          Support
        </Link>
      </div>
    </div>
  );
}
