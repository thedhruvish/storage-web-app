import ApiResponse from "../utils/ApiResponse.js";
import {
  generateAuthUrl,
  saveOAuthToken,
  getAccessTokenForUser,
  isGoogleConnected,
} from "../services/gdrive-auth.service.js";
import { importFromGoogleDrive } from "../services/gdrive-import.service.js";
import ApiError from "../utils/ApiError.js";

export const genrateGoogleDriveImportAuthUrl = (req, res) => {
  res.redirect(generateAuthUrl());
};

export const googleDriveCallback = async (req, res) => {
  await saveOAuthToken(req.user._id, req.query.code);
  res.redirect(process.env.FRONTEND_URL);
};

export const checkOauthConnected = async (req, res) => {
  const connected = await isGoogleConnected(req.user._id);

  res.status(200).json(
    new ApiResponse(200, connected ? "Connected" : "Not Connected", {
      is_connected: Boolean(connected),
    }),
  );
};

export const getGoogleAccessToken = async (req, res) => {
  const token = await getAccessTokenForUser(req.user._id);

  res.status(200).json(
    new ApiResponse(200, "Access token generated", {
      accessToken: token,
    }),
  );
};

export const importDriveData = async (req, res) => {
  try {
    await importFromGoogleDrive({
      user: req.user,
      uploadDirId: req.params.id || req.user.rootDirId,
      driveFile: req.body,
    });
  } catch (error) {
    console.error("❌ downloadSingleFile FULL ERROR:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Google auth error ONLY if 401 from Google
    if (error.code === 401 || error.response?.status === 401) {
      throw new ApiError(401, "GOOGLE_REAUTH_REQUIRED");
    }

    // AWS credentials error
    if (error.name === "CredentialsProviderError") {
      throw new ApiError(500, "AWS_CREDENTIALS_MISSING");
    }

    throw error;
  }

  res.status(201).json(new ApiResponse(201, "Import completed successfully"));
};
