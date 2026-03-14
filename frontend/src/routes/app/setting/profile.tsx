import { createFileRoute } from "@tanstack/react-router";
import { ActiveSessions } from "@/pages/profile/active-sessions";
import { BackupData } from "@/pages/profile/backup-data";
import { DangerZone } from "@/pages/profile/danger-zone";
import { ProfileHeader } from "@/pages/profile/profile-header";
import {
  ErrorState,
  ProfilePageSkeleton,
} from "@/pages/profile/profile-skeleton";
import { SecuritySettings } from "@/pages/profile/security-settings";
import { StorageSettings } from "@/pages/profile/storage-settings";
import { useGetInfoOnSetting } from "@/api/setting-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/app/setting/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending, error, isError, refetch } = useGetInfoOnSetting();

  if (isPending) {
    return <ProfilePageSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const userData = data?.data.data;

  if (!userData) {
    return (
      <div className='flex min-h-[60vh] w-full items-center justify-center p-4'>
        <Card className='max-w-md w-full'>
          <CardHeader className='text-center'>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              We couldn&apos;t find your profile information. Please try
              refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <Button onClick={() => refetch()} variant='outline'>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto'>
      <ProfileHeader user={userData.user} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start'>
        {/* Left Column - Full width on mobile, 1/3 on large screens */}
        <div className='lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1'>
          <SecuritySettings
            twoFactor={userData.twoFactor}
            isTwoFactorEnabled={userData.isTwoFactorEnabled}
            twoFactorId={userData.twoFactorId}
            isAllowedNewTOTP={userData.isAllowedNewTOTP}
            authenticate={userData.authenticate}
          />
        </div>

        {/* Right Column - Full width on mobile, 2/3 on large screens */}
        <div className='lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2'>
          <ActiveSessions
            sessions={userData.sessionHistory}
            activeSessionId={userData.sessionId}
          />
          <BackupData />
          <StorageSettings />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
