import ImportToken from "../models/ImportToken.model.js";
import ApiError from "../utils/ApiError.js";
import { googleOAuthClient, DRIVE_SCOPES } from "../lib/google.client.js";

export const generateAuthUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: DRIVE_SCOPES,
    prompt: "consent",
  });
};

export const saveOAuthToken = async (userId, code) => {
  const { tokens } = await googleOAuthClient.getToken(code);

  if (!tokens.refresh_token) {
    throw new ApiError(500, "Refresh token not received from Google");
  }

  await ImportToken.findOneAndUpdate(
    { userId, services: "google" },
    {
      refreshToken: tokens.refresh_token,
      userId,
      services: "google",
    },
    { upsert: true },
  );
};

export const getAccessTokenForUser = async (userId) => {
  const tokenDoc = await ImportToken.findOne({
    userId,
    services: "google",
  });

  if (!tokenDoc) {
    throw new ApiError(401, "User not connected to Google Drive");
  }

  googleOAuthClient.setCredentials({
    refresh_token: tokenDoc.refreshToken,
  });

  const { token } = await googleOAuthClient.getAccessToken();
  if (!token) {
    throw new ApiError(500, "Failed to generate access token");
  }

  return token;
};

export const isGoogleConnected = async (userId) => {
  return ImportToken.exists({ userId, services: "google" });
};
