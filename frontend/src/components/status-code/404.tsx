import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileQuestion,
  Home,
  Folder,
  DownloadCloud,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Error404Props {
  errorTitle?: string;
}

export default function Error404({
  errorTitle = "404 - Page Not Found",
}: Error404Props) {
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
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300`}
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
              <FileQuestion className='h-12 w-12 text-purple-600' />
            </div>
          </div>

          <h1 className='text-2xl font-bold text-center mb-2'>{errorTitle}</h1>
          <p className='text-muted-foreground text-center mb-6'>
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Quick Links */}
          <div className={`p-4 rounded-lg mb-6 `}>
            <h2 className='font-medium mb-3 flex items-center'>
              <Folder className='h-4 w-4 mr-2' />
              Popular Sections
            </h2>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-blue-500 rounded-full mr-2'></span>
                <Link
                  to={"/app/directory"}
                  className='text-blue-600 hover:underline'
                >
                  My Files
                </Link>
              </li>
              <li className='flex items-center'>
                <span className='h-2 w-2 bg-green-500 rounded-full mr-2'></span>
                <Link to={"/"} className='text-blue-600 hover:underline'>
                  Shared with Me
                </Link>
              </li>
              {/* <li className='flex items-center'>
                <span className='h-2 w-2 bg-purple-500 rounded-full mr-2'></span>
                <a href='/recent' className='text-blue-600 hover:underline'>
                  Recent Files
                </a>
              </li> */}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button onClick={handleGoBack} variant='outline' className='flex-1'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Button>
            <Button onClick={handleGoHome} className='flex-1'>
              <Home className='mr-2 h-4 w-4' />
              Go Home
            </Button>
          </div>

          {/* Support Info */}
          <p className='text-xs text-muted-foreground text-center mt-6'>
            Can't find what you're looking for? Contact support@storage-app.com
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
