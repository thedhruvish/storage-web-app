import { UAParser } from "ua-parser-js";
export const getRequestInfo = (req, res, next) => {
  const getHighEntropyValues =
    "Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness";
  res.setHeader("Accept-CH", getHighEntropyValues);
  res.setHeader("Critical-CH", getHighEntropyValues);
  req.ua = UAParser(req.headers).withClientHints();

  next();
};
