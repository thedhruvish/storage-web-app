export const deviceCheck = async (req, res, next) => {
  if (
    req.headers &&
    req.headers["x-platform"] === "mobile" &&
    req.headers["user-agent"].startsWith("okhttp")
  ) {
    req.isMobile = true;
  } else {
    req.isMobile = false;
  }
  next();
};
