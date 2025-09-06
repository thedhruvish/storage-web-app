export const isValidTurnstileToken = async (token) => {
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

  return data.success; //is return true or false
};
