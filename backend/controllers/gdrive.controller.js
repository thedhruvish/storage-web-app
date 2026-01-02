import ApiResponse from "../utils/ApiResponse.js";
import {
  generateAuthUrl,
  saveOAuthToken,
  getAccessTokenForUser,
  isGoogleConnected,
} from "../services/gdrive-auth.service.js";
import { importFromGoogleDrive } from "../services/gdrive-import.service.js";

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
  const accessToken = await getGoogleAccessTokenForUser(req.user._id);

  await importFromGoogleDrive({
    user: req.user,
    uploadDirId: req.params.id || req.user.rootDirId,
    driveFile: req.body,
    accessToken,
  });

  res.status(201).json(new ApiResponse(201, "Import completed successfully"));
};
