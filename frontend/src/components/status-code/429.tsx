import { useEffect, useState } from "react";
import {
  Clock,
  Home,
  RefreshCw,
  AlertTriangle,
  DownloadCloud,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Error429Props {
  errorTitle?: string;
}

export default function Error429({
  errorTitle = "429 - Too Many Requests",
}: Error429Props) {
  const [mounted, setMounted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Simulate cooldown progress
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2; // Slower progress for cooldown feel
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 `}
    >
      {/* App Header */}
      <div className='flex items-center mb-8'>
        <DownloadCloud className={`h-8 w-8 mr-3 `} />
        <h1 className='text-2xl font-bold'>
          Storage<span className='text-blue-600'>App</span>
        </h1>
      </div>

      {/* Main Error Card */}
      <Card className='w-full max-w-md shadow-lg'>
        <CardContent className='pt-6'>
          <div className='flex justify-center mb-4'>
            <div className={`p-3 rounded-full `}>
              <Clock className='h-12 w-12 text-orange-500' />
            </div>
          </div>

          <h1 className='text-2xl font-bold text-center mb-2'>{errorTitle}</h1>
          <p className='text-muted-foreground text-center mb-6'>
            You've sent too many requests in a short period. Please wait a
            moment before trying again.
          </p>

          {/* Cooldown Progress */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium'>Cooldown Timer</span>
              <span className='text-sm text-muted-foreground'>
                {cooldown < 100 ? "Please wait..." : "Ready"}
              </span>
            </div>
            <Progress value={cooldown} className='h-2' />
          </div>

          {/* Rate Limit Info */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <ShieldAlert className='h-4 w-4 mr-2' />
              Why this happened
            </h2>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center'>
                <Activity className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Excessive page refreshes detected</span>
              </li>
              <li className='flex items-center'>
                <AlertTriangle className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Temporary traffic limit exceeded</span>
              </li>
              <li className='flex items-center'>
                <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Your IP is temporarily paused</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              onClick={handleRetry}
              className='flex-1'
              disabled={cooldown < 100}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${cooldown < 100 ? "animate-spin" : ""}`}
              />
              {cooldown < 100 ? "Cooling down..." : "Try Again"}
            </Button>
            <Button onClick={handleGoHome} variant='outline' className='flex-1'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <p className='text-xs text-muted-foreground text-center mt-6'>
            Mistake? Contact support at{" "}
            <a
              href='mailto:support@storage-app.com'
              className='text-blue-600 hover:underline'
            >
              support@storage-app.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className='mt-8 text-center text-sm text-muted-foreground'>
        <p>© {new Date().getFullYear()} StorageApp. All rights reserved.</p>
      </footer>
    </div>
  );
}
