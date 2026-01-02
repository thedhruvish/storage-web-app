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
import { PRESIGNED_URL_EXPIRATION } from "../constants/s3.constants.js";

const privateKey = process.env.PRIVATE_KEY;

export const generatePresignedUrl = async (fileName, ContentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: encodeURIComponent(fileName),
      ContentType,
    });
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });
    return url;
  } catch (error) {
    return null;
  }
};

// verfiy uploaded object
export const verifyUploadedObject = async (fileName, fileSize) => {
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: encodeURIComponent(fileName),
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
) => {
  try {
    let url = null;
    if (privateKey) {
      url = generateCloudfrontSignedUrl(key, fileName, isDownload);
    } else {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: encodeURIComponent(key),
        ResponseContentDisposition: `${isDownload ? "attachment;" : "inline;"} filename="${fileName}"`,
      });
      url = await getSignedUrl(s3Client, command, {
        expiresIn: PRESIGNED_URL_EXPIRATION,
      });
    }
    return url;
  } catch (error) {
    return null;
  }
};

// Delete object from S3
export const deleteS3Object = async (fileName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
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
