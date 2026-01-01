import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import ApiError from "./ApiError.js";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const santizeInput = (data) => {
  if (typeof data === "string") {
    DOMPurify.sanitize(data, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  if (Array.isArray(data)) {
    return data.map((item) => santizeInput(item));
  }

  if (data && typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, santizeInput(value)]),
    );
  }

  return data; // return other datatype like number boolean
};

export const validateInput = (ValidateSchema) => {
  return (req, res, next) => {
    if (!req.body) {
      return next(new ApiError(400, "Request body is required"));
    }

    // Sanitize input
    const cleanInput = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        typeof value === "string"
          ? DOMPurify.sanitize(value, {
              ALLOWED_TAGS: [],
              ALLOWED_ATTR: [],
            })
          : value,
      ]),
    );

    // Validate input
    const parsed = ValidateSchema.safeParse(cleanInput);

    if (!parsed.success) {
      return next(new ApiError(400, "Check You Input. It invalid or missing"));
    }

    req.body = parsed.data;
    return next();
  };
};
