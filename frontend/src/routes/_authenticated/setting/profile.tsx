import { createFileRoute } from "@tanstack/react-router";
import { ActiveSessions } from "@/pages/profile/active-sessions";
import { BackupData } from "@/pages/profile/backup-data";
import { DangerZone } from "@/pages/profile/danger-zone";
import { ProfileHeader } from "@/pages/profile/profile-header";
import { SecuritySettings } from "@/pages/profile/security-settings";
import type { Session } from "@/pages/profile/types";
import { useGetInfoOnSetting } from "@/api/setting-api";

export const Route = createFileRoute("/_authenticated/setting/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isPending } = useGetInfoOnSetting();

  const sessions: Session[] = [
    {
      id: "1",
      deviceType: "desktop",
      location: "San Francisco, US",
      browserOS: "Chrome on macOS",
      isCurrent: true,
      lastActive: "Now",
    },
    {
      id: "2",
      deviceType: "mobile",
      location: "San Francisco, US",
      browserOS: "Safari on iPhone 15",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
  ];

  if (isPending) {
    return <div>Loading...</div>;
  }

  const userData = data?.data.data;
  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto'>
      <ProfileHeader user={userData?.user} />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
        {/* Left Column */}
        <div className='md:col-span-1 lg:col-span-1 space-y-6'>
          <SecuritySettings
            connectedAccounts={userData.connectedAccounts}
            twoFactor={userData.twoFactor}
            isTwoFactorEnabled={userData.isTwoFactorEnabled}
            twoFactorId={userData.twoFactorId}
            isAllowedNewTOTP={userData.isAllowedNewTOTP}
          />
        </div>

        {/* Right Column */}
        <div className='md:col-span-1 lg:col-span-2 space-y-6'>
          <ActiveSessions sessions={sessions} />
          <BackupData />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
