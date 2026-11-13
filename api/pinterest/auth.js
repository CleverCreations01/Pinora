import { randomBytes } from "node:crypto";
import { readPinterestSession } from "./_storage.js";
import { redirectToCanonicalHost } from "./_origin.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const redirectUri = process.env.PINTEREST_REDIRECT_URI;
  if (!redirectUri) return res.status(503).send("Pinterest OAuth is not configured for this deployment.");

  try {
    const callback = new URL(redirectUri);
    if (redirectToCanonicalHost(req, res, redirectUri, "/api/pinterest/auth")) return;
    if (callback.pathname !== "/api/pinterest/callback" || callback.search || callback.hash) {
      return res.status(503).send("PINTEREST_REDIRECT_URI must point directly to /api/pinterest/callback.");
    }
  } catch (error) {
    return res.status(503).send(error.message || "Pinterest OAuth configuration is invalid.");
  }

  const { PINTEREST_APP_ID } = process.env;
  if (!PINTEREST_APP_ID) return res.status(503).send("Pinterest App ID is not configured for the production deployment.");

  const environment = req.query.environment === "sandbox" ? "sandbox" : "production";
  const state = randomBytes(32).toString("hex");
  // Keep the existing browser session so reconnecting does not orphan its saved token.
  const session = readPinterestSession(req) || randomBytes(32).toString("hex");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const secure = req.headers["x-forwarded-proto"] === "https" || !host.includes("localhost");
  const secureFlag = secure ? "; Secure" : "";

  res.setHeader("Set-Cookie", [
    "pinvora_session=" + session + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000" + secureFlag,
    "pinterest_oauth_state=" + state + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=600" + secureFlag,
    "pinterest_oauth_environment=" + environment + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=600" + secureFlag
  ]);

  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", PINTEREST_APP_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  // PINVORA reads boards and creates Pins; do not request unnecessary board-write access.
  url.searchParams.set("scope", "boards:read,pins:write");
  url.searchParams.set("state", state);
  return res.redirect(302, url.toString());
}
