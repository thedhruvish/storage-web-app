import ApiResponse from "../utils/ApiResponse.js";
import { getRecent } from "../services/recent.service.js";

export const getRecentFiles = async (req, res) => {
  const result = await getRecent(req.user._id);

  res.status(200).json(new ApiResponse(200, "Recent files retrieved", result));
};
