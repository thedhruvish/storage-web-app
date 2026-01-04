import { UAParser } from "ua-parser-js";
import ApiError from "./ApiError.js";

export const getDeviceInfoFromRequest = (req) => {
  if (!req?.headers) {
    throw new ApiError(400, "header is not defind");
  }
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  return {
    device: {
      browser: result.browser.name || null,
      os: result.os.name || null,
      type: result.device.type || "desktop",
    },

    ipAddress:
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      null,

    userAgent: String(req.headers["user-agent"]) || null,
  };
};
