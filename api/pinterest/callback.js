import { timingSafeEqual } from "node:crypto";
import { readPinterestSession, savePinterestTokens } from "./_storage.js";

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp(`(?:^|;\\\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  const { code, state, error } = req.query;
  const savedState = readCookie(req, "pinterest_oauth_state");
  const sessionId = readPinterestSession(req);
  const environment = readCookie(req, "pinterest_oauth_environment") === "production" ? "production" : "sandbox";
  const secureCookie = req.headers["x-forwarded-proto"] === "https" || !String(req.headers.host || "").includes("localhost");
  const secureFlag = secureCookie ? "; Secure" : "";
  res.setHeader("Set-Cookie", [
    `pinterest_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`,
    `pinterest_oauth_environment=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`
  ]);
  if (error) return res.redirect(302, `/?pinterest=denied&environment=${environment}&reason=${encodeURIComponent(String(error).slice(0, 80))}`);
  if (!sessionId || typeof code !== "string" || typeof state !== "string" || !savedState || state.length !== savedState.length || !timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
    return res.redirect(302, `/?pinterest=error&environment=${environment}&reason=state_check_failed`);
  }
  const { PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REDIRECT_URI } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET || !PINTEREST_REDIRECT_URI) return res.redirect(302, `/?pinterest=error&environment=${environment}&reason=server_configuration_incomplete`);
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
      return res.redirect(302, `/?pinterest=error&environment=${environment}&reason=token_exchange_failed&status=${tokenResponse.status}`);
    }
    await savePinterestTokens(tokens, environment, sessionId);
    return res.redirect(302, `/?pinterest=connected&environment=${environment}`);
  } catch (err) {
    console.error("Pinterest OAuth callback failed:", err?.message || "unknown error");
    return res.redirect(302, `/?pinterest=error&environment=${environment}&reason=secure_token_storage_failed`);
  }
}
