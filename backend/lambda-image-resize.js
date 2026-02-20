import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
// No need to the Install the sharp lib . bcz It alredy create a aws lambda layer
import sharp from "sharp";
import { Buffer } from "node:buffer";

import path from "path";

const s3 = new S3Client();

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".jpeg"];
const DIRECTORY_NAME_FOR_TIGGER = "objects/";
const NOT_TIGGER = "/thumbs/";

export const handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Only originals
    if (
      !key.startsWith(DIRECTORY_NAME_FOR_TIGGER) ||
      key.includes(NOT_TIGGER)
    ) {
      continue;
    }

    const ext = path.extname(key).toLowerCase();
    if (!IMAGE_EXTS.includes(ext)) {
      continue;
    }

    // Download image
    const { Body } = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );

    const buffer = await streamToBuffer(Body);

    //  Create thumbnail
    const thumbBuffer = await sharp(buffer, { failOnError: false })
      .resize(150, 150, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      })
      .avif({
        quality: 35,
        effort: 2,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    const baseName = path.basename(key, ext);
    const thumbKey = `objects/thumbs/${baseName}.avif`;

    // Upload
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: "image/avif",
      }),
    );
  }
};

// Stream → Buffer
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};
