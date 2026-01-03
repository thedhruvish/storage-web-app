import AuthIdentity from "../models/AuthIdentity.model.js";

export const exstingAuthIdentity = async (
  filter,
  errorMessage = "Email Id Already Existing",
) => {
  const isExstingEmail = await AuthIdentity.exists(filter);

  if (isExstingEmail) {
    throw new ApiError(409, errorMessage);
  }
};

export const getOneAuthIdentity = async (filter) => {
  return await AuthIdentity.findOne(filter)
    .populate({
      path: "userId",
      select: "_id isDeleted twoFactorId metaData",
      populate: {
        path: "twoFactorId",
        select: "_id totp isEnabled passkeys",
      },
    })
    .select("+passwordHash");
};

export const createAuthIdentity = (data, session = undefined) => {
  const newAuthIdentity = new AuthIdentity(data);
  return newAuthIdentity.save({ session });
};
