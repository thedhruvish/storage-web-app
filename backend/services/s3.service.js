import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateCloudfrontSignedUrl } from "./cloudforntCdn.service.js";

const privateKey = process.env.PRIVATE_KEY;

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
  // endpoint:process.env.AWS_ENDPOINT_URL||undefined,
});

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

export const PRESIGNED_URL_EXPIRATION = 60;

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
