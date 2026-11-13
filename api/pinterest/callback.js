import { timingSafeEqual } from "node:crypto";
import { readPinterestSession, savePinterestTokens } from "./_storage.js";
import { redirectToCanonicalHost } from "./_origin.js";

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const redirectUri = process.env.PINTEREST_REDIRECT_URI;
  if (!redirectUri) return res.status(503).send("Pinterest OAuth callback is not configured.");
  try {
    const callback = new URL(redirectUri);
    if (redirectToCanonicalHost(req, res, redirectUri, callback.pathname)) return;
  } catch (error) {
    return res.status(503).send(error.message || "Pinterest OAuth callback configuration is invalid.");
  }

  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const error = typeof req.query.error === "string" ? req.query.error : "";
  const savedState = readCookie(req, "pinterest_oauth_state");
  const sessionId = readPinterestSession(req);
  const environment = readCookie(req, "pinterest_oauth_environment") === "sandbox" ? "sandbox" : "production";
  const secureCookie = req.headers["x-forwarded-proto"] === "https" || !String(req.headers.host || "").includes("localhost");
  const secureFlag = secureCookie ? "; Secure" : "";

  res.setHeader("Set-Cookie", [
    "pinterest_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secureFlag,
    "pinterest_oauth_environment=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secureFlag
  ]);

  if (error) return res.redirect(302, "/?pinterest=denied&environment=" + environment + "&reason=" + encodeURIComponent(error.slice(0, 80)));
  if (!sessionId || !code || !/^[a-f0-9]{64}$/i.test(state) || !savedState ||
      state.length !== savedState.length ||
      !/^[a-f0-9]{64}$/i.test(savedState) ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(savedState))) {
    return res.redirect(302, "/?pinterest=error&environment=" + environment + "&reason=state_check_failed");
  }

  const { PINTEREST_APP_ID, PINTEREST_APP_SECRET } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET) {
    return res.redirect(302, "/?pinterest=error&environment=" + environment + "&reason=server_configuration_incomplete");
  }

  try {
    const base = environment === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
    const credentials = Buffer.from(PINTEREST_APP_ID + ":" + PINTEREST_APP_SECRET).toString("base64");
    const tokenResponse = await fetch(base + "/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + credentials,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });
    const tokens = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || typeof tokens.access_token !== "string" ||
        typeof tokens.expires_in !== "number" || !tokens.refresh_token) {
      console.error("Pinterest token exchange rejected:", tokenResponse.status);
      return res.redirect(302, "/?pinterest=error&environment=" + environment + "&reason=token_exchange_failed");
    }

    const granted = new Set(String(tokens.scope || "").split(/[\\s,]+/).filter(Boolean));
    const missing = ["boards:read", "pins:write"].filter(scope => !granted.has(scope));
    if (missing.length) {
      return res.redirect(302, "/?pinterest=error&environment=" + environment + "&reason=required_scope_missing");
    }

    await savePinterestTokens(tokens, environment, sessionId);
    return res.redirect(302, "/?pinterest=connected&environment=" + environment);
  } catch (err) {
    console.error("Pinterest OAuth callback failed:", err?.message || "unknown error");
    return res.redirect(302, "/?pinterest=error&environment=" + environment + "&reason=secure_token_storage_failed");
  }
}
