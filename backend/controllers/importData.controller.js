import { google } from "googleapis";
import ImportToken from "../models/ImportToken.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Document from "../models/document.model.js";
import { downloadFile, getFileList } from "../utils/DriveFile.js";

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
// Give google drive folder id to download.
export const importDriveData = async (req, res) => {
  // get paranet dir
  const uploadDirId = req.params.id || req.user.rootDirId;
  const { folderId } = req.body;
  const user = req.user;
  // find the accesstoken
  const tokenDoc = await ImportToken.findOne({
    userId: user._id,
    services: "google",
  });

  if (!tokenDoc) {
    return res.status(401).json(new ApiError(401, "Login again"));
  }
  // google oath setup
  googleApiOauth2Client.setCredentials({
    refresh_token: tokenDoc.refreshToken,
  });
  const newAccessToken = await googleApiOauth2Client.getAccessToken();

  googleApiOauth2Client.setCredentials({
    access_token: newAccessToken,
    refresh_token: tokenDoc.refreshToken,
  });
  const drive = google.drive({ version: "v3", auth: googleApiOauth2Client });
  //  get a list of file
  const { data } = await getFileList(drive, folderId);

  // download files
  const fileData = await downloadFile(drive, data.files, uploadDirId, user._id);
  // save in the db
  await Document.insertMany(fileData);

  res.status(201).json(new ApiResponse(201, "Data Import Successfuly"));
};
