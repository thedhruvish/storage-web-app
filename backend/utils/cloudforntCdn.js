import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN;
const privateKey = process.env.PRIVATE_KEY;
const keyPairId = process.env.KEY_PAIR_ID;
// const s3ObjectKey = "799-200x300.jpg";
const dateLessThan = new Date(Date.now() + 1000 * 30);

export const generateCloudfrontSignedUrl = (
  s3ObjectKey,
  fileName,
  isDownload,
) => {
  const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}?response-content-disposition=${encodeURIComponent(`${isDownload ? "attachment" : "inline"};filename="${fileName}"`)}`;
  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl;
};
