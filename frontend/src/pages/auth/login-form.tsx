import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { APP_NAME } from "@/contansts";
import { AlertTriangle, Eye, EyeOff, Lock, QrCode } from "lucide-react";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { useLoginMutation } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TurnstileWidget } from "./TurnstileWidget";
import LoginWithOauth from "./login-with-0auth";
import { QrLogin } from "./qr-login";

type Tab = "password" | "qr";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    error,
    error_description: errorDescription,
    tab,
  } = location.search as {
    error?: string;
    error_description?: string;
    tab?: Tab;
  };
  const loginMutation = useLoginMutation();
  const navigate = useNavigate({ from: "/auth/login" });

  const [activeTab, setActiveTab] = useState(tab || "password");

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab]);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoading, setTurnstileLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const turnstile = useTurnstile();

  const handleTabChange = (value: string) => {
    setActiveTab(value as Tab);
    navigate({
      search: (prev: any) => ({ ...prev, tab: value }),
      replace: true,
    });
  };

  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    if (!turnstileToken) return;
    loginMutation.mutate(
      { ...data, turnstileToken },
      {
        onSuccess(res) {
          const responseData = res.data.data;
          if (responseData.isEnabled2Fa) {
            localStorage.setItem("userId", responseData.userId);
            localStorage.setItem("isTotp", String(responseData.isTotp));
            localStorage.setItem("isPasskey", String(responseData.isPasskey));
            navigate({ to: "/auth/2fa" });
          } else if (responseData?.showSetUp2Fa) {
            localStorage.setItem("userId", responseData.userId);
            navigate({ to: "/auth/2fa/setup" });
          } else if (responseData.is_verfiy_otp) {
            localStorage.setItem("userId", responseData.userId);
            sessionStorage.setItem(
              "otpExpiryTime",
              (Date.now() + 3 * 60 * 1000).toString()
            );
            navigate({ to: "/auth/otp-verify" });
          } else {
            navigate({ to: "/app/directory" });
          }
        },
        onError(error) {
          toast.error(error.message || "Something went wrong");
          turnstile.reset();
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='overflow-hidden border border-border bg-card/50 backdrop-blur-xl shadow-xl p-0 max-w-md w-full mx-auto'>
        <div className='p-8 flex flex-col justify-center'>
          <div className='w-full space-y-8'>
            <div className='space-y-2 text-center'>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                Welcome back
              </h1>
              <p className='text-muted-foreground text-sm'>
                Enter your credentials to access your account.
              </p>
            </div>

            <Tabs
              defaultValue='password'
              value={activeTab}
              onValueChange={handleTabChange}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2 mb-8 bg-muted/30 p-1 rounded-xl h-11'>
                <TabsTrigger
                  value='password'
                  className='rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2 transition-all text-sm font-medium'
                >
                  <Lock className='w-3.5 h-3.5' />
                  <span>Password</span>
                </TabsTrigger>
                <TabsTrigger
                  value='qr'
                  className='rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-2 transition-all text-sm font-medium'
                >
                  <QrCode className='w-3.5 h-3.5' />
                  <span>QR Code</span>
                </TabsTrigger>
              </TabsList>

              <div className='min-h-100 flex flex-col'>
                <TabsContent
                  value='password'
                  className='mt-0 border-0 p-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-400'
                >
                  {(error || errorDescription) && (
                    <Alert
                      variant='destructive'
                      className='mb-6 py-3 border-destructive/20 bg-destructive/5'
                    >
                      <AlertTriangle className='h-4 w-4' />
                      <AlertDescription className='text-xs'>
                        {errorDescription ||
                          error ||
                          "An error occurred during login."}
                      </AlertDescription>
                    </Alert>
                  )}
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
                              Or continue with email
                            </span>
                          </div>
                        </div>

                        <div className='grid gap-5'>
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
                                <div className='flex items-center justify-between'>
                                  <FormLabel className='text-xs font-semibold text-foreground/70'>
                                    Password
                                  </FormLabel>
                                  <Link
                                    to='/auth/signup'
                                    className='text-[11px] text-primary hover:text-primary/80 transition-colors font-medium'
                                  >
                                    Forgot password?
                                  </Link>
                                </div>
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
                              loginMutation.isPending
                            }
                          >
                            {loginMutation.isPending
                              ? "Verifying..."
                              : "Sign in to account"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent
                  value='qr'
                  forceMount
                  className={cn(
                    "mt-0 border-0 p-0 focus-visible:ring-0 flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-400",
                    activeTab !== "qr" && "hidden"
                  )}
                >
                  <QrLogin isActive={activeTab === "qr"} />
                </TabsContent>
              </div>
            </Tabs>

            <div className='text-center text-sm pt-4 border-t border-border/50'>
              <p className='text-muted-foreground'>
                New to {APP_NAME}?{" "}
                <Link
                  to='/auth/signup'
                  className='font-semibold text-primary hover:text-primary/80 transition-colors'
                >
                  Create an account
                </Link>
              </p>
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
          Help Center
        </Link>
      </div>
    </div>
  );
}
