import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Smartphone, ChevronRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TwoFactorSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState<{
    userId: string;
    isTotp: boolean;
    isPasskey: boolean;
  } | null>(null);

  useEffect(() => {
    // 1. Read from LocalStorage
    // Assuming you saved it as a JSON object or individual keys.
    // Based on your mutation, let's assume you save a JSON object or specific keys.
    // Here is how you should load it:
    const userId = localStorage.getItem("userId");
    const isTotp = localStorage.getItem("isTotp") === "true";
    const isPasskey = localStorage.getItem("isPasskey") === "true";

    if (!userId) {
      // If no data, redirect back to login
      navigate({ to: "/auth/login" });
      return;
    }

    setAuthData({ userId, isTotp, isPasskey });
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <SelectionSkeleton />;
  }

  return (
    <Card className='relative w-full overflow-hidden border-none shadow-none md:border md:shadow-sm'>
      <CardHeader className='flex flex-col items-center gap-2 text-center pb-6'>
        <div className='bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full'>
          <ShieldCheck className='size-6' />
        </div>
        <CardTitle className='text-xl'>Verify it's you</CardTitle>
        <CardDescription className='max-w-xs'>
          Select a verification method to complete your login securely.
        </CardDescription>
      </CardHeader>

      <CardContent className='grid gap-4 px-4 pb-8 md:px-6'>
        {authData?.isTotp && (
          <MethodButton
            icon={<Smartphone className='h-5 w-5' />}
            title='Authenticator App'
            description='Enter a code from Google or Authy'
            colorClass='bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
            onClick={() =>
              navigate({
                to: `/auth/2fa/totp`,
              })
            }
          />
        )}

        {authData?.isPasskey && (
          <MethodButton
            icon={<KeyRound className='h-5 w-5' />}
            title='Passkey'
            description='Use FaceID, TouchID or PIN'
            colorClass='bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400'
            onClick={() =>
              navigate({
                to: `/auth/2fa/passkey`,
              })
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

// Sub-component for cleaner code
function MethodButton({
  icon,
  title,
  description,
  colorClass,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant='outline'
      className='h-auto w-full p-4 flex items-center justify-between transition-all hover:border-primary/50 hover:bg-muted/50'
      onClick={onClick}
    >
      <div className='flex items-center gap-4'>
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass}`}
        >
          {icon}
        </div>
        <div className='flex flex-col items-start'>
          <span className='font-semibold text-foreground'>{title}</span>
          <span className='text-xs text-muted-foreground font-normal'>
            {description}
          </span>
        </div>
      </div>
      <ChevronRight className='h-4 w-4 text-muted-foreground/50' />
    </Button>
  );
}

function SelectionSkeleton() {
  return (
    <Card className='w-full border-none shadow-none md:border'>
      <CardHeader className='flex flex-col items-center gap-4'>
        <Skeleton className='h-12 w-12 rounded-full' />
        <div className='space-y-2 text-center'>
          <Skeleton className='h-6 w-32 mx-auto' />
          <Skeleton className='h-4 w-48 mx-auto' />
        </div>
      </CardHeader>
      <CardContent className='gap-4 grid'>
        <Skeleton className='h-20 w-full rounded-xl' />
        <Skeleton className='h-20 w-full rounded-xl' />
      </CardContent>
    </Card>
  );
}
