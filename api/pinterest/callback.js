import { timingSafeEqual } from "node:crypto";
import { savePinterestTokens } from "./_storage.js";

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  const { code, state, error } = req.query;
  const savedState = readCookie(req, "pinterest_oauth_state");
  const environment = readCookie(req, "pinterest_oauth_environment") === "production" ? "production" : "sandbox";
  res.setHeader("Set-Cookie", [
    "pinterest_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "pinterest_oauth_environment=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  ]);
  if (error) return res.redirect(302, `/?pinterest=denied&environment=${environment}`);
  if (typeof code !== "string" || typeof state !== "string" || !savedState || state.length !== savedState.length || !timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
    return res.status(400).send("Invalid authorization state. Please reconnect.");
  }
  const { PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REDIRECT_URI } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET || !PINTEREST_REDIRECT_URI) return res.status(500).send("Pinterest server configuration is incomplete.");
  try {
    const base = environment === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
    const credentials = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
    const tokenResponse = await fetch(`${base}/v5/oauth/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: PINTEREST_REDIRECT_URI })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || typeof tokens.access_token !== "string" || typeof tokens.expires_in !== "number") {
      return res.status(502).send("Pinterest token exchange failed. Please check the app configuration and reconnect.");
    }
    await savePinterestTokens(tokens, environment);
    return res.redirect(302, `/?pinterest=connected&environment=${environment}`);
  } catch {
    return res.status(502).send("Could not complete secure Pinterest connection. Please try again.");
  }
}
