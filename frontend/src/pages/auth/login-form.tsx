import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useTurnstile } from "react-turnstile";
import { toast } from "sonner";
import { useLoginMutation } from "@/api/auth";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TurnstileWidget } from "./TurnstileWidget";
import LoginWithOauth from "./login-with-0auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoading, setTurnstileLoading] = useState(false);
  const turnstile = useTurnstile();
  const location = useLocation();

  // Check for error query params
  // location.search is already parsed by TanStack Router
  const { error, error_description: errorDescription } = location.search as {
    error?: string;
    error_description?: string;
  };

  const loginMutation = useLoginMutation();

  const navigate = useNavigate();
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
  });

  const onSubmit = (data: FormData) => {
    if (!turnstileToken) return;
    loginMutation.mutate(
      { ...data, turnstileToken },
      {
        onSuccess(res) {
          // Access the data safely
          const responseData = res.data.data;

          if (responseData.isEnabled2Fa) {
            localStorage.setItem("userId", responseData.userId);
            localStorage.setItem("isTotp", String(responseData.isTotp));
            localStorage.setItem("isPasskey", String(responseData.isPasskey));

            navigate({
              to: "/auth/2fa",
            });
          } else if (responseData?.showSetUp2Fa) {
            localStorage.setItem("userId", responseData.userId);
            navigate({ to: "/auth/2fa/setup" });
          } else if (responseData.is_verfiy_otp) {
            localStorage.setItem("userId", responseData.userId);
            navigate({ to: "/auth/otp-verify" });
          } else {
            navigate({ to: "/app" });
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
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Welcome back</CardTitle>
          <CardDescription>
            Login with your Github Or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || errorDescription) && (
            <Alert variant='destructive' className='mb-6'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>
                {errorDescription || error || "An error occurred during login."}
              </AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='grid gap-6'>
                {/* OAuth Buttons */}
                <LoginWithOauth />
                {/* Divider */}
                <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                  <span className='bg-card text-muted-foreground relative z-10 px-2'>
                    Or continue with
                  </span>
                </div>

                {/* Input Fields */}
                <div className='grid gap-6'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='m@example.com'
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
                          <Input type='password' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <TurnstileWidget
                    setTurnstileToken={setTurnstileToken}
                    setTurnstileLoading={setTurnstileLoading}
                  />

                  <Button
                    type='submit'
                    className='w-full'
                    disabled={
                      (turnstileLoading && !turnstileToken) ||
                      !form.formState.isValid ||
                      loginMutation.isPending
                    }
                  >
                    Login
                  </Button>
                </div>
                <div className='text-center text-sm'>
                  Don&apos;t have an account?{" "}
                  <Link
                    to='/auth/signup'
                    className='underline underline-offset-4'
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a>{" "}
        and <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  );
}
