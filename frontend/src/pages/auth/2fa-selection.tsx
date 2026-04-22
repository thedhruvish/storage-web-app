import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Smartphone, ChevronRight, ShieldCheck } from "lucide-react";
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
    <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
      <Card className='relative w-full overflow-hidden border border-border bg-card/50 backdrop-blur-xl shadow-xl p-0 max-w-md w-full mx-auto'>
        <CardHeader className='flex flex-col items-center gap-2 text-center pt-8 pb-6 px-8'>
          <div className='bg-primary/10 text-primary mb-4 flex size-14 items-center justify-center rounded-2xl shadow-sm'>
            <ShieldCheck className='size-7' />
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight text-foreground'>
            Verify identity
          </CardTitle>
          <CardDescription className='max-w-[280px] text-sm text-muted-foreground'>
            Choose a secure method to confirm it's really you.
          </CardDescription>
        </CardHeader>

        <CardContent className='grid gap-3 px-8 pb-10'>
          {authData?.isTotp && (
            <MethodButton
              icon={<Smartphone className='h-5 w-5' />}
              title='Authenticator App'
              description='Google Authenticator, Authy, or others'
              onClick={() => navigate({ to: `/auth/2fa/totp` })}
            />
          )}

          {authData?.isPasskey && (
            <MethodButton
              icon={<KeyRound className='h-5 w-5' />}
              title='Passkey'
              description='FaceID, TouchID, or Security Key'
              onClick={() => navigate({ to: `/auth/2fa/passkey` })}
            />
          )}
        </CardContent>
      </Card>

      <div className='mt-8 text-center'>
        <button
          onClick={() => navigate({ to: "/auth/login" })}
          className='text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors'
        >
          Cancel and go back
        </button>
      </div>
    </div>
  );
}

// Sub-component for cleaner code
function MethodButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      className='group flex w-full items-center justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-primary/40 hover:bg-muted/40 active:translate-y-[1px]'
      onClick={onClick}
    >
      <div className='flex items-center gap-4 text-left'>
        <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-background shadow-sm transition-colors group-hover:text-primary'>
          {icon}
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
            {title}
          </span>
          <span className='text-[11px] text-muted-foreground font-medium'>
            {description}
          </span>
        </div>
      </div>
      <ChevronRight className='h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary' />
    </button>
  );
}

function SelectionSkeleton() {
  return (
    <div className='max-w-md w-full mx-auto'>
      <Card className='border border-border bg-card/50'>
        <CardHeader className='flex flex-col items-center gap-4 pt-8'>
          <Skeleton className='h-14 w-14 rounded-2xl' />
          <div className='space-y-2 text-center'>
            <Skeleton className='h-7 w-40 mx-auto' />
            <Skeleton className='h-4 w-56 mx-auto' />
          </div>
        </CardHeader>
        <CardContent className='gap-3 grid pb-10 px-8'>
          <Skeleton className='h-16 w-full rounded-xl' />
          <Skeleton className='h-16 w-full rounded-xl' />
        </CardContent>
      </Card>
    </div>
  );
}
