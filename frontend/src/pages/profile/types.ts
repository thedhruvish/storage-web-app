export type AuthProvider = "GOOGLE" | "GITHUB" | "EAMIL";

export interface SessionLocation {
  city: string | null;
  regionName: string | null;
  countryName: string | null;
  countryCode: string | null;
}

export interface SessionDevice {
  browser: string;
  os: string;
  type: string;
}

export interface Session {
  location: SessionLocation;
  _id: string;
  device: SessionDevice;
  ipAddress: string;
  isActive: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export type AuthMethodType = "totp" | "passkey";

// 2. Define the TOTP Interface
export interface TotpMethod {
  type: "totp";
  _id?: string;
  friendlyName: string;

  isVerified: boolean;
  createdAt: Date | string;
  lastUsed?: Date | string;
}

// 3. Define the Passkey Interface
export interface PasskeyMethod {
  type: "passkey";
  _id?: string;
  credentialID: string;
  // Backend uses Buffer, Frontend receives it as Base64 String or number[]
  credentialPublicKey: Buffer | string;
  counter: number;
  transports?: string[]; // ['usb', 'nfc', 'ble', 'internal']
  friendlyName: string; // Default: "Unknown Device"
  createdAt: Date | string;
  lastUsed?: Date | string;
}

// 4. The Discriminated Union (The "Smart" Type)
export type TwoFactorMethod = TotpMethod | PasskeyMethod;

// New interface for handling multiple connection states
export interface ConnectedAccount {
  provider: AuthProvider;
  email: string;
  lastUsed?: string;
}

export interface Authenticate {
  _id?: string;
  provider: AuthProvider;
  providerEmail: string;
  providerId: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean; // To trigger the rounded ring
}
