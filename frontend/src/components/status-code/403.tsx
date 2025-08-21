import { useEffect, useState } from "react";
import {
  Lock,
  Home,
  Shield,
  AlertCircle,
  UserX,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Error403Props {
  errorTitle?: string;
}

export default function Error403({
  errorTitle = "403 - Access Denied",
}: Error403Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
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
              <Lock className='h-12 w-12 text-amber-600' />
            </div>
          </div>

          <h1 className='text-2xl font-bold text-center mb-2'>{errorTitle}</h1>
          <p className='text-muted-foreground text-center mb-6'>
            You don't have permission to access this resource. Please check your
            credentials or contact your administrator.
          </p>

          {/* Access Information */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Shield className='h-4 w-4 mr-2' />
              Access Restrictions
            </h2>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-amber-500 rounded-full mr-2'></span>
                Insufficient permissions for this resource
              </li>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-red-500 rounded-full mr-2'></span>
                Authentication successful but authorization failed
              </li>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-green-500 rounded-full mr-2'></span>
                Your account is active and valid
              </li>
            </ul>
          </div>

          {/* Possible Reasons */}
          <div className={`p-4 rounded-lg mb-6`}>
            <h2 className='font-medium mb-3 flex items-center'>
              <AlertCircle className='h-4 w-4 mr-2' />
              Possible Reasons
            </h2>
            <ul className='text-sm space-y-1 list-disc pl-5'>
              <li>You may need higher privileges to view this content</li>
              <li>The resource might be restricted to specific user roles</li>
              <li>Your session may have expired or become invalid</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button onClick={handleGoBack} variant='outline' className='flex-1'>
              <UserX className='mr-2 h-4 w-4' />
              Go Back
            </Button>
            <Button onClick={handleGoHome} className='flex-1'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <p className='text-xs text-muted-foreground text-center mt-6'>
            Need access to this resource? Contact your administrator or
            support@storage-app.com
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
