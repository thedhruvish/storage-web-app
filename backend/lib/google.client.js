import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const googleOAuthClient = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const getDriveClient = (auth) => google.drive({ version: "v3", auth });

export const googleClient = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  "postmessage",
);
