import { createFileRoute } from "@tanstack/react-router";
import { ActiveSessions } from "@/pages/profile/active-sessions";
import { BackupData } from "@/pages/profile/backup-data";
import { DangerZone } from "@/pages/profile/danger-zone";
import { ProfileHeader } from "@/pages/profile/profile-header";
import { SecuritySettings } from "@/pages/profile/security-settings";
import { useGetInfoOnSetting } from "@/api/setting-api";

export const Route = createFileRoute("/app/setting/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useGetInfoOnSetting();

  if (isPending) {
    return <div>Loading...</div>;
  }

  const userData = data?.data.data;

  // userData.sessionHistory[]
  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto'>
      <ProfileHeader user={userData?.user} />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
        {/* Left Column */}
        <div className='md:col-span-1 lg:col-span-1 space-y-6'>
          <SecuritySettings
            twoFactor={userData.twoFactor}
            isTwoFactorEnabled={userData.isTwoFactorEnabled}
            twoFactorId={userData.twoFactorId}
            isAllowedNewTOTP={userData.isAllowedNewTOTP}
            authenticate={userData.authenticate}
          />
        </div>

        {/* Right Column */}
        <div className='md:col-span-1 lg:col-span-2 space-y-6'>
          <ActiveSessions
            sessions={userData?.sessionHistory}
            activeSessionId={userData.sessionId}
          />
          <BackupData />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
