import { timingSafeEqual } from "node:crypto";
import { savePinterestTokens } from "./_storage.js";

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}


export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const { code, state, error } = req.query;
  const savedState = readCookie(req, "pinterest_oauth_state");

  res.setHeader(
    "Set-Cookie",
    "pinterest_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );

  if (error) {
    return res.status(400).send("Pinterest authorization was cancelled or denied.");
  }

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    !savedState ||
    state.length !== savedState.length ||
    !timingSafeEqual(Buffer.from(state), Buffer.from(savedState))
  ) {
    return res.status(400).send("Invalid authorization state. Please try again.");
  }

  const {
    PINTEREST_APP_ID,
    PINTEREST_APP_SECRET,
    PINTEREST_REDIRECT_URI,
  } = process.env;

  if (
    !PINTEREST_APP_ID ||
    !PINTEREST_APP_SECRET ||
    !PINTEREST_REDIRECT_URI
  ) {
    return res.status(500).send("Server configuration is incomplete.");
  }

  try {
    const credentials = Buffer.from(
      `${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: PINTEREST_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      return res.status(502).send("Pinterest token exchange failed. Check the app configuration and try again.");
    }

    const tokens = await tokenResponse.json();
    if (
      typeof tokens.access_token !== "string" ||
      typeof tokens.expires_in !== "number" ||
      !Number.isFinite(tokens.expires_in) ||
      tokens.expires_in <= 0
    ) {
      return res.status(502).send("Pinterest returned an unexpected token response.");
    }

    await savePinterestTokens(tokens);

    return res.redirect(302, "https://pinora-six.vercel.app/?pinterest=connected");
  } catch {
    return res.status(502).send("Could not complete secure Pinterest connection. Please try again.");
  }
}
