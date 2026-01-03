export type AuthProvider = "GOOGLE" | "GITHUB" | "EAMIL";

export interface Session {
  id: string;
  deviceType: "mobile" | "desktop" | "tablet";
  location: string;
  browserOS: string;
  isCurrent: boolean;
  lastActive: string;
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
// {
//               "_id": "6957db3d9a7d1d3db8f2793c",
//               "provider": "EAMIL",
//               "providerEmail": "admin@gmail.com",
//               "providerId": "admin@gmail.com"
//           },

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
