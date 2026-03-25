import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QR_CODE_URL } from "@/contansts";
import { Loader2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useCreateLinkToken, useCheckLinkToken } from "@/api/auth";
import { Button } from "@/components/ui/button";

export function QrLogin({ isActive }: { isActive: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const createTokenMutation = useCreateLinkToken();
  const checkTokenMutation = useCheckLinkToken();
  const navigate = useNavigate();

  const generateToken = () => {
    setIsExpired(false);
    setTimeLeft(120);
    createTokenMutation.mutate(undefined, {
      onSuccess: (res) => {
        setToken(res.data.token);
      },
      onError: () => {
        toast.error("Failed to generate QR code");
      },
    });
  };

  useEffect(() => {
    if (isActive && !token && !createTokenMutation.isPending) {
      generateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, token]);

  // Timer countdown - runs in background as long as token exists
  useEffect(() => {
    if (!token || isExpired) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [token, isExpired]);

  // Polling backend status - only runs when isActive is true
  useEffect(() => {
    if (!token || isExpired || !isActive) return;

    const pollInterval = setInterval(() => {
      checkTokenMutation.mutate(token, {
        onSuccess: (res) => {
          if (res.data.status === "verified") {
            clearInterval(pollInterval);
            toast.success("Login successful");
            navigate({ to: "/app/directory" });
          }
        },
        onError: (err: any) => {
          if (err.response?.status === 404) {
            setIsExpired(true);
            clearInterval(pollInterval);
          }
        },
      });
    }, 3000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isExpired, isActive]);

  return (
    <div className='flex flex-col items-center justify-center p-4 gap-4'>
      <div className='relative bg-white p-4 rounded-xl border-4 border-primary/10 shadow-sm'>
        {createTokenMutation.isPending ? (
          <div className='w-50 h-50 flex items-center justify-center bg-muted/5'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : isExpired ? (
          <div className='w-50 h-50 flex flex-col items-center justify-center bg-muted/10 gap-3 rounded-lg'>
            <div className='bg-background p-2 rounded-full shadow-sm'>
              <RefreshCw className='h-6 w-6 text-muted-foreground' />
            </div>
            <p className='text-sm text-muted-foreground font-medium text-center px-4'>
              QR Code Expired
            </p>
            <Button size='sm' onClick={generateToken} className='mt-1'>
              Regenerate
            </Button>
          </div>
        ) : token ? (
          <QRCodeSVG
            value={`${QR_CODE_URL}?token=${token}`}
            size={200}
            level='H'
            imageSettings={{
              src: "/android-chrome-192x192.png",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        ) : null}
      </div>

      <div className='text-center space-y-2'>
        <div className='flex flex-col items-center gap-1'>
          <p className='text-sm font-semibold'>Login with QR Code</p>
          {!isExpired && token && (
            <div className='flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
              </span>
              Expires in {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          )}
        </div>
        <p className='text-xs text-muted-foreground px-6 leading-relaxed'>
          Open the StoreOne mobile app, go to Settings &gt; Link a Device, and
          scan this code.
        </p>
      </div>
    </div>
  );
}
