import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateCloudfrontSignedUrl } from "./cloudforntCdn.service.js";
import { s3Client } from "../lib/s3.client.js";
import {
  BUCKET_NAME,
  DIRECTORY_PREVIEW_FOLDER,
  DIRECTORY_UPLOAD_FOLDER,
  IMAGE_EXTS,
  PRESIGNED_URL_EXPIRATION,
} from "../constants/s3.constants.js";
import { CLOUDFRONT_PRIVATE_KEY } from "../constants/constant.js";

export const generatePresignedUrl = async (
  fileName,
  ContentType,
  parentDir = DIRECTORY_UPLOAD_FOLDER,
) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${parentDir}${encodeURIComponent(fileName)}`,
      ContentType,
    });
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });
    return url;
  } catch (error) {
    throw new Error(error);
  }
};

// verfiy uploaded object
export const verifyUploadedObject = async (
  fileName,
  fileSize,
  parentDir = DIRECTORY_UPLOAD_FOLDER,
) => {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${parentDir}${encodeURIComponent(fileName)}`,
    });
    const headData = await s3Client.send(headCommand);
    return headData.ContentLength === fileSize;
  } catch (error) {
    return false;
  }
};

// get signed object url
export const getSignedUrlForGetObject = async (
  key,
  fileName,
  isDownload = false,
  parentDir = DIRECTORY_UPLOAD_FOLDER,
  expiresIn = PRESIGNED_URL_EXPIRATION,
) => {
  try {
    let url = null;

    const keyObject = `${parentDir}${encodeURIComponent(key)}`;

    if (CLOUDFRONT_PRIVATE_KEY || process.env.SECRET_CF_KEY) {
      url = await generateCloudfrontSignedUrl(
        keyObject,
        fileName,
        isDownload,
        expiresIn,
      );
    } else {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: keyObject,
        ResponseContentDisposition: `${isDownload ? "attachment;" : "inline;"} filename="${fileName}"`,
      });
      url = await getSignedUrl(s3Client, command, {
        expiresIn,
      });
    }
    return url;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Delete object from S3
export const deleteS3Object = async (
  fileName,
  parentDir = DIRECTORY_UPLOAD_FOLDER,
) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${parentDir}${fileName}`,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

// bulk delete objects from S3
export const bulkDeleteS3Objects = async (fileKeys) => {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: fileKeys,
        Quiet: true,
      },
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

export const buildS3DeleteKeys = ({ id, extension }) => {
  const fileKey = `${id}${extension}`;

  const keys = [{ Key: `${DIRECTORY_UPLOAD_FOLDER}${fileKey}` }];

  // Preview exists for images
  if (IMAGE_EXTS.includes(extension)) {
    keys.push({
      Key: `${DIRECTORY_PREVIEW_FOLDER}${id}.avif`,
    });
  }

  return keys;
};
