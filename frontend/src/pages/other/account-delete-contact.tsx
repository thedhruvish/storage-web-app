import { Shield, Mail, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccountDeletionStatus() {
  const handleContactAdmin = () => {
    const subject = "Delete Account Active Request";
    const body =
      "Please include your account information and reason for the deletion request.";
    window.location.href = `mailto:try@dhruvish.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br  flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-4'>
          <div className='flex justify-center'>
            <div className='p-3 rounded-full '>
              <Shield className='h-8 w-8 ' />
            </div>
          </div>
          <CardTitle className='text-center text-2xl'>
            Account Deletion Status
          </CardTitle>
          <CardDescription className='text-center'>
            Your account deletion request is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <Alert
            variant='default'
            className='bg-blue-50 dark:bg-blue-900/20 border-blue-200'
          >
            <AlertTriangle className='h-4 w-4 text-blue-600' />
            <AlertTitle className='text-blue-800 dark:text-blue-200'>
              Notice
            </AlertTitle>
            <AlertDescription className='text-blue-700 dark:text-blue-300'>
              The account deletion process has been initiated. This action may
              take some time to complete across all systems.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <p className='text-sm text-slate-600 dark:text-slate-300'>
              If you need to access this account or believe this deletion was
              made in error, please contact the administration team immediately.
            </p>

            <Alert variant='destructive'>
              <Mail className='h-4 w-4' />
              <AlertTitle>Contact Administration</AlertTitle>
              <AlertDescription>
                Email: info@example.com
                <br />
                Subject: "Delete Account Active Request"
              </AlertDescription>
            </Alert>
          </div>

          <div className='flex flex-col gap-3'>
            <Button onClick={handleContactAdmin} className='gap-2'>
              <Mail className='h-4 w-4' />
              Contact Admin Now
            </Button>
            <Button variant='outline' asChild>
              <a href='/'>Return to Homepage</a>
            </Button>
          </div>

          <p className='text-xs text-slate-500 dark:text-slate-400 text-center'>
            For security reasons, account deletion may be subject to review and
            verification. Unauthorized or illegal account access may result in
            administrative action.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
