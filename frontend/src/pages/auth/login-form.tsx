import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { APP_NAME } from "@/contansts";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  QrCode,
  Cloud,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { useLoginMutation } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <Card className='overflow-hidden border-none shadow-2xl p-0 max-w-4xl w-full mx-auto'>
        <div className='grid md:grid-cols-2 lg:grid-cols-5 min-h-162.5'>
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
                  Your Files, <br />
                  Anywhere, <br />
                  <span className='text-indigo-200'>Securely Stored.</span>
                </h2>
                <p className='text-primary-foreground/80 text-lg max-w-xs'>
                  Experience the next generation of cloud storage with
                  end-to-end security.
                </p>
              </div>
            </div>

            <div className='relative z-10 space-y-4'>
              <div className='flex items-center gap-3'>
                <ShieldCheck className='h-5 w-5 text-indigo-200' />
                <span className='text-sm font-medium'>
                  Enterprise-grade security
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <Zap className='h-5 w-5 text-indigo-200' />
                <span className='text-sm font-medium'>
                  Lightning fast performance
                </span>
              </div>

              <div className='pt-8 border-t border-white/10 mt-8'>
                <p className='text-xs text-primary-foreground/60 italic'>
                  "StoreOne has transformed how our team manages digital
                  assets."
                </p>
              </div>
            </div>
          </div>

          {/* FORM SIDE */}
          <div className='lg:col-span-3 p-6 md:p-10 flex flex-col justify-center bg-card'>
            <div className='w-full max-w-md mx-auto space-y-8'>
              <div className='space-y-2 text-center md:text-left'>
                <h1 className='text-3xl font-bold tracking-tight'>Sign In</h1>
                <p className='text-muted-foreground'>
                  Welcome back! Please enter your details.
                </p>
              </div>

              <Tabs
                defaultValue='password'
                value={activeTab}
                onValueChange={handleTabChange}
                className='w-full'
              >
                <TabsList className='grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl h-12'>
                  <TabsTrigger
                    value='password'
                    className='rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 transition-all'
                  >
                    <Lock className='w-4 h-4' />
                    <span className='font-medium'>Password</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='qr'
                    className='rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2 transition-all'
                  >
                    <QrCode className='w-4 h-4' />
                    <span className='font-medium'>QR Code</span>
                  </TabsTrigger>
                </TabsList>

                <div className='min-h-100 flex flex-col'>
                  <TabsContent
                    value='password'
                    className='mt-0 border-0 p-0 focus-visible:ring-0 animate-in fade-in zoom-in-95 duration-300'
                  >
                    {(error || errorDescription) && (
                      <Alert variant='destructive' className='mb-6'>
                        <AlertTriangle className='h-4 w-4' />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>
                          {errorDescription ||
                            error ||
                            "An error occurred during login."}
                        </AlertDescription>
                      </Alert>
                    )}
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
                              name='email'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-xs font-bold uppercase text-muted-foreground tracking-widest'>
                                    Email
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
                                  <FormLabel className='text-xs font-bold uppercase text-muted-foreground tracking-widest flex justify-between'>
                                    Password
                                    <Link
                                      to='/auth/signup'
                                      className='text-[10px] text-primary hover:underline lowercase tracking-normal font-normal'
                                    >
                                      Forgot password?
                                    </Link>
                                  </FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        type={
                                          showPassword ? "text" : "password"
                                        }
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
                                loginMutation.isPending
                              }
                            >
                              {loginMutation.isPending
                                ? "Signing in..."
                                : "Sign in"}
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
                      "mt-0 border-0 p-0 focus-visible:ring-0 flex-1 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300",
                      activeTab !== "qr" && "hidden"
                    )}
                  >
                    <QrLogin isActive={activeTab === "qr"} />
                  </TabsContent>
                </div>
              </Tabs>

              <div className='text-center text-sm pt-4'>
                <span className='text-muted-foreground'>
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  to='/auth/signup'
                  className='font-bold text-primary underline-offset-4 hover:underline'
                >
                  Create one for free
                </Link>
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
          Help Center
        </Link>
      </div>
    </div>
  );
}
