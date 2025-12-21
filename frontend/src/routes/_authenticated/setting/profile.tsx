import { createFileRoute } from "@tanstack/react-router";
import { useUserStore } from "@/store/user-store";
import { ActiveSessions } from "@/pages/profile/active-sessions";
import { BackupData } from "@/pages/profile/backup-data";
import { DangerZone } from "@/pages/profile/danger-zone";
import { ProfileHeader } from "@/pages/profile/profile-header";
import { SecuritySettings } from "@/pages/profile/security-settings";
import type {
  Session,
  ConnectedAccount,
  UserProfile,
} from "@/pages/profile/types";

export const Route = createFileRoute("/_authenticated/setting/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const userStore = useUserStore((state) => state.user);


  // Transform userStore data to our display type if necessary,
  // or define a comprehensive user object here for the UI
  const user: UserProfile = {
    name: userStore?.name || "User",
    email: userStore?.email || "user@example.com",
    avatarUrl: userStore?.profile || "",
    isPremium: true, // Toggle this to test the Premium Ring logic
  };

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

  // Define the state of connections
  const connectedAccounts: ConnectedAccount[] = [
    {
      provider: "password",
      isConnected: true,
    },
    {
      provider: "google",
      isConnected: true, // Try changing to false to see "Connect" button
      email: "dhruvish@gmail.com",
    },
    {
      provider: "github",
      isConnected: false, // Disconnected state
    },
  ];

  return (
    <div className='flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto'>
      <ProfileHeader user={user} />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'>
        {/* Left Column */}
        <div className='md:col-span-1 lg:col-span-1 space-y-6'>
          <SecuritySettings
            connectedAccounts={connectedAccounts}
            twoFactorType={null}
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
