import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Otp from "../models/Otp.model.js";
import { sendOtpToMail } from "../services/mail.service.js";
import {
  createAndCheckLimitSession,
  deleteRedisKey,
} from "../services/redis.service.js";
import {
  createNewUser,
  getGithubUserDetails,
  getGithubUserEmail,
  googleIdTokenVerify,
  loginWithEmailService,
  registerWithEmailService,
} from "../services/auth.service.js";
import { singleFindDirectory } from "../services/directory.service.js";
import {
  createAuthIdentity,
  exstingAuthIdentity,
  getOneAuthIdentity,
} from "../services/authIdentity.service.js";
import { SESSION_OPTIONS } from "../constants/constant.js";

// register user
export const registerWithEmail = async (req, res, next) => {
  await registerWithEmailService(req.body);
  res.status(201).json(new ApiResponse(201, "User registered successfully"));
};

// login user
export const loginWithEmail = async (req, res) => {
  const result = await loginWithEmailService(req.body);

  if (result.step === "2FA") {
    return res.status(200).json(
      new ApiResponse(200, "Verify 2FA", {
        isEnabled2Fa: true,
        ...result.data,
      }),
    );
  }

  if (result.step === "OTP") {
    return res.status(200).json(
      new ApiResponse(200, "Verify OTP", {
        is_verfiy_otp: true,
        userId: result.userId,
      }),
    );
  }

  res.cookie("sessionId", result.sessionId, SESSION_OPTIONS);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      showSetUp2Fa: result.showSetUp2Fa,
    }),
  );
};

// get user
export const getCureentUser = async (req, res) => {
  const directory = await singleFindDirectory(req.user.rootDirId, {
    metaData: 1,
  });

  res.status(200).json(
    new ApiResponse(200, "User login Successfuly", {
      ...req.user,
      totalUsedBytes: directory.metaData.size,
    }),
  );
};

// logout user
export const logout = async (req, res) => {
  const { sessionId } = req.signedCookies;
  await deleteRedisKey(`session:${sessionId}`);
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: true,
    signed: true,
  });
  res.status(200).json(new ApiResponse(200, "User logout Successfuly"));
};

// logout all devices
export const logoutAllDevices = async (req, res) => {
  await createAndCheckLimitSession(req.user._id, 0);
  res
    .status(200)
    .json(new ApiResponse(200, "User logout for all devices Successfuly"));
};

// login with google
export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  const { email, picture, name, sub } = await googleIdTokenVerify(idToken);

  const exstingEmail = await getOneAuthIdentity({
    providerId: sub,
    provider: "GOOGLE",
  });

  let userId;
  let showSetUp2Fa;
  if (exstingEmail) {
    // direct login
    if (exstingEmail.userId?.isDeleted) {
      return res
        .status(409)
        .json(
          new ApiError(409, "Your Account is Deleted. Please Contact Admin"),
        );
    }
    // verifiy 2FA
    userId = exstingEmail.userId._id;
    if (exstingEmail.userId?.twoFactorId?.isEnabled) {
      showSetUp2Fa = false;
      const twoFa = exstingEmail.userId?.twoFactorId;
      // do not gen a token just send which method to verify
      return res.status(200).json(
        new ApiResponse(200, "verify 2FA ", {
          isEnabled2Fa: true,
          isTotp: twoFa.totp?.isVerified === true ? true : false,
          isPasskey: twoFa.passkeys?.length !== 0 ? true : false,
          userId,
        }),
      );
    }
  } else {
    //  in the here register a new user.
    showSetUp2Fa = true;
    const normalizedEmail = email.toLowerCase().trim();

    userId = await createNewUser(
      {
        name,
        email: normalizedEmail,
        picture,
      },
      sub,
      "GOOGLE",
    );
    if (!userId) {
      return res.status(400).json(new ApiError(400, "Try Agin"));
    }
  }

  const sessionId = await createAndCheckLimitSession(userId.toString());

  res.cookie("sessionId", sessionId, SESSION_OPTIONS);

  return res.status(200).json(
    new ApiResponse(
      200,
      "User login Successfuly . and you can set the optionality to the 2 FA auth",
      {
        showSetUp2Fa,
      },
    ),
  );
};

// login with github
export const loginWithGithub = async (req, res) => {
  const { hint = "LOGIN", userId = null } = req.body;
  // for support both login and link account
  const redirectUrl =
    hint === "LINK"
      ? `${process.env.BACKEND_URL}/auth/github/link?userId=${userId}`
      : process.env.GITHUB_REDIRECT_URI;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Link create",
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=user:email`,
      ),
    );
};

// callback github
export const callbackGithub = async (req, res) => {
  const query = req.query;

  if (!query?.code) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/github?error=${query?.error}&error_description=${query?.error_description}`,
    );
  }

  const { providerId, accessToken, name, picture } = await getGithubUserDetails(
    query.code,
  );

  const exstingEmail = await getOneAuthIdentity({
    providerId,
    provider: "GITHUB",
  });

  let showSetUp2Fa;
  let queryParms;
  let userId;

  try {
    if (exstingEmail) {
      showSetUp2Fa = false;
      // direct login
      if (exstingEmail.userId?.isDeleted) {
        const errorMessge = "Account is Deleted";
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/github?error=${errorMessge}error_description=Your Account is Deleted. Please Contact Admin`,
        );
      }
      userId = exstingEmail.userId;
      // verifiy 2FA
      if (exstingEmail.userId?.twoFactorId?.isEnabled) {
        userId = exstingEmail.userId._id;

        const twoFa = exstingEmail.userId?.twoFactorId;

        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/github?isEnabled2Fa=${true}&isTotp=${twoFa.totp?.isVerified === true ? true : false}&isPasskey=${twoFa.passkeys?.length !== 0 ? true : false}&userId=${userId}`,
        );
      }
    } else {
      //  in the here register a new user.
      const email = await getGithubUserEmail(accessToken);

      userId = await createNewUser(
        {
          name,
          email,
          picture,
        },
        providerId,
        "GITHUB",
      );
      if (!userId) {
        return res.status(400).json(new ApiError(400, "Try Agin"));
      }
    }

    const sessionId = await createAndCheckLimitSession(userId.toString());

    res.cookie("sessionId", sessionId, SESSION_OPTIONS);
    queryParms = `showSetUp2Fa=${showSetUp2Fa}`;
  } catch (error) {
    queryParms = "error=something want wrong Try agin";
  } finally {
    res.redirect(`${process.env.FRONTEND_URL}/auth/github?${queryParms}`);
  }

  // process.env.FRONTEND_URL + "/github/session?sessionId=" + session.id,
};

// login with github for the set cookie
export const githubCookieSet = async (req, res) => {
  const { sessionId } = req.query;
  res.cookie("sessionId", sessionId, SESSION_OPTIONS);
  res.redirect(process.env.FRONTEND_URL);
};

// verify the otp
export const verfiyOtp = async (req, res) => {
  const { otp, userId } = req.body;

  const optDoc = await Otp.findOne({ userId, otp });

  if (!optDoc) {
    return res.status(400).json(new ApiError(400, "Invalid otp or It Expired"));
  }
  // delete after verfiy otp
  await optDoc.deleteOne();

  // genrate session
  const sessionId = await createAndCheckLimitSession(userId);

  res.cookie("sessionId", sessionId, SESSION_OPTIONS);
  res.status(200).json(new ApiResponse(200, "User login Successfuly"));
};

// re-send otp
export const reSendOtp = async (req, res) => {
  const { userId } = req.body;
  // delete exsting user Otp
  await sendOtpToMail(userId);

  res.status(200).json(
    new ApiResponse(200, "OTP resend successfully", {
      is_verfiy_otp: true,
      userId: userId,
    }),
  );
};

export const connectWithGoogle = async (req, res) => {
  const userId = req.user._id;
  const { idToken } = req.body;

  const { email, sub } = await googleIdTokenVerify(idToken);
  await exstingAuthIdentity({
    providerId: sub,
    provider: "GOOGLE",
  });

  await createAuthIdentity({
    userId,
    provider: "GOOGLE",
    providerEmail: email.toLowerCase().trim(),
    providerId: sub,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "SuccessFully Link Google Account"));
};

export const connectWithGithub = async (req, res) => {
  const { code } = req.query;

  const { providerId, accessToken } = await getGithubUserDetails(code);

  await exstingAuthIdentity(
    {
      providerId,
      provider: "GITHUB",
    },
    "This email alredy link to anothr account. try other account",
  );

  const providerEmail = await getGithubUserEmail(accessToken);

  await createAuthIdentity({
    userId,
    provider: "GITHUB",
    providerEmail,
    providerId,
  });
  res
    .status(201)
    .json(new ApiResponse(201, "SuccessFully Link Github Account"));
};

export const connectWithEmail = async (req, res) => {
  const { email } = req.body;
  const userId = req.user._id;

  await exstingAuthIdentity(
    {
      providerId: email.toLowerCase().trim(),
    },
    "This email alredy link to anothr account. try other account",
  );

  await sendOtpToMail(userId.toString());
  return res.status(200).json(
    new ApiResponse(200, "Verify the opt", {
      is_verfiy_otp: true,
      userId: userId,
    }),
  );
};

export const connectWithEmailVerifyOtp = async (req, res) => {
  const { otp, userId } = req.body;

  const optDoc = await Otp.findOne({ userId, otp });

  if (!optDoc) {
    return res.status(400).json(new ApiError(400, "Invalid otp or It Expired"));
  }
  // delete after verfiy otp
  await optDoc.deleteOne();
  res.status(201).json(new ApiResponse(201, "SuccessFully Link Email Account"));
};
