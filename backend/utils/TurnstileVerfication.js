import ApiError from "./ApiError.js";

export const validTurnstileToken = async (token) => {
  if (!token) {
    throw new ApiError(401, "turnstile Token are the not defind");
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: `${process.env.TURNSTILE_SECRET_KEY}`,
        response: token,
      }),
    },
  );

  const data = await response.json();
  if (!data.success) {
    throw new ApiError(401, "recaptcha is not valid try again");
  }
  return data.success;
};
