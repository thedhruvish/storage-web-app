import { useEffect, useState } from "react";
import {
  Wrench,
  Home,
  RefreshCw,
  Clock,
  Server,
  DownloadCloud,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { APP_NAME } from "@/contansts";

interface Error503Props {
  errorTitle?: string;
}

export default function Error503({
  errorTitle = "503 - Service Unavailable",
}: Error503Props) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Simulate progress for maintenance
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(timer);
          return prev;
        }
        return prev + 5;
      });
    }, 1000);

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
          {APP_NAME}<span className='text-blue-600'>cloud</span>
        </h1>
      </div>

      {/* Main Error Card */}
      <Card className='w-full max-w-md shadow-lg'>
        <CardContent className='pt-6'>
          <div className='flex justify-center mb-4'>
            <div className={`p-3 rounded-full `}>
              <Wrench className='h-12 w-12 text-blue-600' />
            </div>
          </div>

          <h1 className='text-2xl font-bold text-center mb-2'>{errorTitle}</h1>
          <p className='text-muted-foreground text-center mb-6'>
            Our services are temporarily undergoing maintenance. We'll be back
            online shortly.
          </p>

          {/* Maintenance Progress */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium'>Maintenance Progress</span>
              <span className='text-sm text-muted-foreground'>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Maintenance Information */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Calendar className='h-4 w-4 mr-2' />
              Scheduled Maintenance
            </h2>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center'>
                <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Started: Today, 10:00 PM UTC</span>
              </li>
              <li className='flex items-center'>
                <Clock className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Expected completion: Today, 11:30 PM UTC</span>
              </li>
              <li className='flex items-center'>
                <Server className='h-4 w-4 mr-2 text-muted-foreground' />
                <span>Services affected: File uploads, downloads</span>
              </li>
            </ul>
          </div>

          {/* What's Happening */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Wrench className='h-4 w-4 mr-2' />
              What We're Doing
            </h2>
            <ul className='text-sm space-y-1 list-disc pl-5'>
              <li>Performing database optimization</li>
              <li>Upgrading storage infrastructure</li>
              <li>Implementing performance enhancements</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button onClick={handleRetry} className='flex-1'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Check Status
            </Button>
            <Button onClick={handleGoHome} variant='outline' className='flex-1'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <p className='text-xs text-muted-foreground text-center mt-6'>
            For updates, check our{" "}
            <a href='#' className='text-blue-600 hover:underline'>
              status page
            </a>{" "}
            or follow us on Twitter
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
