import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
  // endpoint:process.env.AWS_ENDPOINT_URL||undefined,
});

export const bucketName = process.env.AWS_BUCKET_NAME;

export const PRESIGNED_URL_EXPIRATION = 60;

export const generatePresignedUrl = async (fileName, ContentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
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
      Bucket: bucketName,
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
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: encodeURIComponent(key),
      ResponseContentDisposition: `${isDownload ? "attachment;" : "inline;"} filename="${fileName}"`,
    });
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });
    return url;
  } catch (error) {
    return null;
  }
};

// Delete object from S3
export const deleteS3Object = async (fileName) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: encodeURIComponent(fileName),
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};
