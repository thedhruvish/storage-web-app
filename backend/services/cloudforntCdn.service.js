import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN;
// const privateKey = process.env.PRIVATE_KEY;
// const keyPairId = process.env.KEY_PAIR_ID;

const dateLessThan = new Date(Date.now() + 3600 * 1000);

const sanitizeFilenameASCII = (filename) => {
  const unique = Date.now().toString(36);

  if (!filename || typeof filename !== "string") {
    return `download-${unique}`;
  }

  if (/^[\x20-\x7E]+$/.test(filename)) {
    return filename;
  }

  const ext = filename.match(/\.[a-zA-Z0-9]+$/)?.[0] || "";

  return `download-${unique}${ext}`;
};

export const generateCloudfrontSignedUrl = (
  s3ObjectKey,
  fileName,
  isDownload,
) => {
  const safeFileName = sanitizeFilenameASCII(fileName);
  const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}?response-content-disposition=${encodeURIComponent(`${isDownload ? "attachment" : "inline"} ;filename="${safeFileName}"`)}`;
  const signedUrl = getSignedUrl({
    url,
    // keyPairId,
    dateLessThan,
    // privateKey,
  });
  return signedUrl;
};
