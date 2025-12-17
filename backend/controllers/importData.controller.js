import { google } from "googleapis";
import ImportToken from "../models/ImportToken.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Document from "../models/Document.model.js";
import {
  downloadFiles,
  downloadSingleFile,
  getFileList,
} from "../utils/DriveFile.js";
import Directory from "../models/Directory.model.js";
import { updateParentDirectorySize } from "../utils/DirectoryHelper.js";
import { rm } from "node:fs/promises";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const googleApiOauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

// scope for import
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// genrate login url
export const genrateGoogleDriveImportAuthUrl = async (req, res) => {
  const authUrl = googleApiOauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  res.redirect(authUrl);
};

// google callback handle are store in the db
export const googleDriveCallback = async (req, res) => {
  const { code } = req.query;

  const { tokens } = await googleApiOauth2Client.getToken(code);

  if (!req.user || !req.user._id) {
    return res
      .status(401)
      .json(new ApiError(401, "User ID is missing in request"));
  }

  if (!tokens.refresh_token) {
    return res
      .status(500)
      .json(new ApiError(500, "Refresh token not received from Google"));
  }
  await ImportToken.findOneAndUpdate(
    { userId: req.user._id, services: "google" },
    {
      refreshToken: tokens.refresh_token,
      userId: req.user._id,
      services: "google",
    },
    { upsert: true, new: true },
  );

  res.redirect(`${process.env.FRONTEND_URL}`);
};

// check the exsting user Oath to connected or not
export const checkOauthConnected = async (req, res) => {
  const userId = req.user._id;
  const tokenDoc = await ImportToken.exists({ userId, services: "google" });
  if (!tokenDoc) {
    return res.status(200).json(
      new ApiResponse(200, "Not Connected", {
        is_connected: false,
      }),
    );
  }
  return res.status(200).json(
    new ApiResponse(200, "Connected", {
      is_connected: true,
    }),
  );
};
export const getGoogleAccessToken = async (req, res) => {
  const userId = req.user._id;

  // Find the stored refresh token
  const tokenDoc = await ImportToken.findOne({
    userId: userId,
    services: "google",
  });

  if (!tokenDoc) {
    return res
      .status(401)
      .json(new ApiError(401, "User not connected to Google Drive."));
  }

  try {
    // Set the refresh token on the OAuth client
    googleApiOauth2Client.setCredentials({
      refresh_token: tokenDoc.refreshToken,
    });

    // Get a new access token
    const { token } = await googleApiOauth2Client.getAccessToken();

    if (!token) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to generate access token."));
    }

    // Send the access token to the frontend
    return res.status(200).json(
      new ApiResponse(200, "Access token generated", {
        accessToken: token,
      }),
    );
  } catch (error) {
    console.error("Error getting access token:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Error getting access token"));
  }
};

// Give google drive folder id to download.
export const importDriveData = async (req, res) => {
  const uploadDirId = req.params.id || req.user.rootDirId;
  const { id, mimeType, name } = req.body;
  const user = req.user;

  const tokenDoc = await ImportToken.findOne({
    userId: user._id,
    services: "google",
  });

  if (!tokenDoc) {
    return res
      .status(401)
      .json(new ApiError(401, "Google login expired. Please reconnect."));
  }

  // 🔑 Setup OAuth2 client
  googleApiOauth2Client.setCredentials({
    refresh_token: tokenDoc.refreshToken,
  });

  const { token: accessToken } = await googleApiOauth2Client.getAccessToken();

  googleApiOauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: tokenDoc.refreshToken,
  });

  const drive = google.drive({ version: "v3", auth: googleApiOauth2Client });
  const directory = await Directory.findById(user.rootDirId, {
    metaData: 1,
  }).lean();

  if (mimeType === "application/vnd.google-apps.folder") {
    // when import folder than it create a folder and that is the import also create a same name folder
    const parentDir = await Directory.findById(uploadDirId, { path: 1 }).lean();

    const newFolder = await Directory.create({
      name,
      parentDirId: uploadDirId,
      userId: user._id,
      path: [...parentDir.path, parentDir._id],
      metaData: {
        source: "google-drive",
        size: 0,
      },
    });
    const fileMetaData = await getFileList(drive, id);
    const totalSize = fileMetaData.totalSize;

    if (directory.metaData.size + totalSize > user.maxStorageBytes) {
      return res.status(400).json({
        message: "Storage limit exceeded — file removed.",
      });
    }

    const fileData = await downloadFiles(
      drive,
      fileMetaData,
      newFolder._id,
      user._id,
    );

    await updateParentDirectorySize(newFolder._id, totalSize);
    await Document.insertMany(fileData);

    return res
      .status(201)
      .json(new ApiResponse(201, "Folder imported successfully"));
  } else {
    const fileData = await downloadSingleFile(
      drive,
      id,
      name,
      mimeType,
      uploadDirId,
      user._id,
    );

    if (
      directory.metaData.size + fileData.metaData.size >
      user.maxStorageBytes
    ) {
      await rm(
        `${import.meta.dirname}/../storage/${fileData._id}${fileData.extension}`,
      );
      return res.status(400).json({
        message: "Storage limit exceeded — file removed.",
      });
    }
    await Document.create(fileData);
    await updateParentDirectorySize(uploadDirId, fileData.metaData.size);

    return res
      .status(201)
      .json(new ApiResponse(201, "File imported successfully"));
  }
};
