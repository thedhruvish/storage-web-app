export type AuthProvider = "google" | "github" | "password";
export type TwoFactorType = "totp" | "passkey" | null;

export interface Session {
  id: string;
  deviceType: "mobile" | "desktop" | "tablet";
  location: string;
  browserOS: string;
  isCurrent: boolean;
  lastActive: string;
}

// New interface for handling multiple connection states
export interface ConnectedAccount {
  provider: AuthProvider;
  isConnected: boolean;
  email?: string;
  lastUsed?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean; // To trigger the rounded ring
}
