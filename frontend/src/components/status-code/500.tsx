import { useEffect, useState } from "react";
import {
  AlertCircle,
  Database,
  DownloadCloud,
  HomeIcon,
  RefreshCw,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/contansts";

interface Error500Props {
  errorTitle?: string;
}

export default function Error500({
  errorTitle = "500 - Server Error",
}: Error500Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          {APP_NAME}<span className='text-blue-600'>cloud</span>
        </h1>
      </div>

      {/* Main Error Card */}
      <Card className='w-full max-w-md shadow-lg'>
        <CardContent className='pt-6'>
          <div className='flex justify-center mb-4'>
            <div className={`p-3 rounded-full $`}>
              <AlertCircle className='h-12 w-12 text-red-600' />
            </div>
          </div>

          <h1 className='text-2xl font-bold text-center mb-2'>{errorTitle}</h1>
          <p className='text-muted-foreground text-center mb-6'>
            Oops! Something went wrong on our servers. Our team has been
            notified and is working to fix the issue.
          </p>

          {/* System Status */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Server className='h-4 w-4 mr-2' />
              {APP_NAME} App Status
            </h2>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-red-500 rounded-full mr-2'></span>
                File operations - Temporarily unavailable
              </li>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-yellow-500 rounded-full mr-2'></span>
                Authentication service - Degraded performance
              </li>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-green-500 rounded-full mr-2'></span>
                User data - Secure and intact
              </li>
            </ul>
          </div>

          {/* What you can do */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Database className='h-4 w-4 mr-2' />
              What you can do
            </h2>
            <ul className='text-sm space-y-1 list-disc pl-5'>
              <li>Wait a few minutes and try again</li>
              <li>Check our status page for updates</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button onClick={handleRetry} className='flex-1'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Try Again
            </Button>
            <Button onClick={handleGoHome} variant='outline' className='flex-1'>
              <HomeIcon className='mr-2 h-4 w-4' />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <p className='text-xs text-muted-foreground text-center mt-6'>
            Need immediate assistance? Contact us at info@dhruvish.in
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className='mt-8 text-center text-sm text-muted-foreground'>
        <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
