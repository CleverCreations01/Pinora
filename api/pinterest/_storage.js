import { list, get, put } from "@vercel/blob";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const key = () => {
  const value = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(value)) throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters");
  return Buffer.from(value, "hex");
};
const environmentName = value => value === "sandbox" ? "sandbox" : "production";

export function readPinterestSession(req) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/(?:^|;\s*)pinvora_session=([a-f0-9]{64})(?:;|$)/);
  return match ? match[1] : null;
}
function requireSession(sessionId) {
  if (typeof sessionId !== "string" || !/^[a-f0-9]{64}$/.test(sessionId)) {
    throw new Error("A valid PINVORA browser session is required.");
  }
  return sessionId;
}
function seal(value) {
  if (!value) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}
function unseal(value) {
  if (!value) return null;
  const [iv, tag, data] = value.split(".");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
async function findUrl(path) {
  const result = await list({ prefix: path, limit: 1 });
  return result.blobs?.[0]?.url || null;
}
function tokenPath(sessionId, environment) {
  return "pinterest/sessions/" + requireSession(sessionId) + "/" + environmentName(environment) + "/private-tokens.json";
}
function normaliseScopes(value) {
  if (Array.isArray(value)) return value.filter(scope => typeof scope === "string");
  return String(value || "").split(/[\s,]+/).filter(Boolean);
}
export async function savePinterestTokens(tokens, environment = "production", sessionId) {
  const env = environmentName(environment);
  const expiresIn = Number(tokens.expires_in || 0);
  if (!tokens.access_token || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error("Pinterest returned an incomplete token response.");
  }
  const payload = {
    access_token: seal(tokens.access_token),
    refresh_token: seal(tokens.refresh_token),
    scopes: normaliseScopes(tokens.scope || tokens.scopes),
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    environment: env
  };
  await put(tokenPath(sessionId, env), JSON.stringify(payload), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json"
  });
}
export async function loadPinterestTokens(environment = "production", sessionId) {
  const path = tokenPath(sessionId, environment);
  const url = await findUrl(path);
  if (!url) return null;
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  const payload = await new Response(result.stream).json();
  return {
    access_token: unseal(payload.access_token),
    refresh_token: unseal(payload.refresh_token),
    scopes: normaliseScopes(payload.scopes),
    expires_at: payload.expires_at,
    environment: environmentName(environment)
  };
}
export async function getPinterestTokens(environment = "production", sessionId) {
  const env = environmentName(environment);
  const tokens = await loadPinterestTokens(env, sessionId);
  if (!tokens?.access_token) return null;
  const expires = Date.parse(tokens.expires_at || "");
  if (!tokens.refresh_token || !Number.isFinite(expires) || expires - Date.now() > 5 * 60 * 1000) return tokens;

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  if (!appId || !appSecret) throw new Error("Pinterest token refresh credentials are not configured.");
  const base = env === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
  const credentials = Buffer.from(appId + ":" + appSecret).toString("base64");
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token
  });
  if (tokens.scopes?.length) form.set("scope", tokens.scopes.join(" "));
  const response = await fetch(base + "/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + credentials,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: form
  });
  const refreshed = await response.json().catch(() => ({}));
  if (!response.ok || !refreshed.access_token || !Number(refreshed.expires_in)) {
    throw new Error("Pinterest token refresh failed. Reconnect the account.");
  }
  const next = {
    ...refreshed,
    scope: refreshed.scope || tokens.scopes,
    refresh_token: refreshed.refresh_token || tokens.refresh_token
  };
  await savePinterestTokens(next, env, sessionId);
  return {
    access_token: next.access_token,
    refresh_token: next.refresh_token,
    scopes: normaliseScopes(next.scope),
    expires_at: new Date(Date.now() + Number(next.expires_in) * 1000).toISOString(),
    environment: env
  };
}
export function pinterestApiBase(environment = "production") {
  return environmentName(environment) === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
}
