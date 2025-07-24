import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import LoginWithGoogle from "./login-with-google";
import type { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLoginMutation } from "@/api/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const loginMutation = useLoginMutation();
  const navagate = useNavigate();
  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });
  useEffect(() => {
    if (loginMutation.isSuccess) {
      if (loginMutation.data.data.data.is_verfiy_otp) {
        localStorage.setItem("userId", loginMutation.data.data.data.userId);
        navagate({ to: "/otp-verify" });
      } else {
        navagate({ to: "/" });
      }
    }
  }, [loginMutation.isSuccess]);

  type FormData = z.infer<typeof formSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  if (loginMutation.isError) {
    const errorMsg =
      (loginMutation.error as AxiosError<{ message?: string }>).response?.data
        .message || "Something went wrong";

    toast.error(errorMsg);
  }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='grid gap-6'>
                {/* OAuth Buttons */}
                <div className='flex flex-col gap-4'>
                  {/* GitHub Button (remains full-width) */}
                  <Button
                    variant='outline'
                    className='w-full'
                    type='button'
                    onClick={() =>
                      (window.location.href = `${import.meta.env.VITE_BASE_URL}/auth/github`)
                    }
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                      <path
                        d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
                        fill='currentColor'
                      />
                    </svg>
                    Login with Github
                  </Button>
                  {/* Centered Google Login */}
                  <LoginWithGoogle />
                </div>
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

                  <Button type='submit' className='w-full'>
                    Login
                  </Button>
                </div>
                <div className='text-center text-sm'>
                  Don&apos;t have an account?{" "}
                  <Link to='/signup' className='underline underline-offset-4'>
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
