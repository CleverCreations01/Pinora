import { list, get, put } from "@vercel/blob";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const key = () => {
  const value = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(value)) throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters");
  return Buffer.from(value, "hex");
};
const environmentName = (value) => value === "sandbox" ? "sandbox" : "production";
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
export async function savePinterestTokens(tokens, environment = "production") {
  const env = environmentName(environment);
  const payload = {
    access_token: seal(tokens.access_token),
    refresh_token: seal(tokens.refresh_token),
    expires_at: new Date(Date.now() + Number(tokens.expires_in || 0) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    environment: env
  };
  const path = env === "production" ? "pinterest/production/private-tokens.json" : "pinterest/sandbox/private-tokens.json";
  await put(path, JSON.stringify(payload), {
    access: "private", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json"
  });
}
export async function loadPinterestTokens(environment = "production") {
  const env = environmentName(environment);
  const path = env === "production" ? "pinterest/production/private-tokens.json" : "pinterest/sandbox/private-tokens.json";
  let url = await findUrl(path);
  // Read the legacy production token location without deleting or overwriting it.
  if (!url && env === "production") url = await findUrl("pinterest/private-tokens.json");
  if (!url) return null;
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  const payload = await new Response(result.stream).json();
  return {
    access_token: unseal(payload.access_token),
    refresh_token: unseal(payload.refresh_token),
    expires_at: payload.expires_at,
    environment: env
  };
}
export async function getPinterestTokens(environment = "production") {
  const env = environmentName(environment);
  const tokens = await loadPinterestTokens(env);
  if (!tokens?.access_token) return null;
  const expires = Date.parse(tokens.expires_at || "");
  if (!tokens.refresh_token || !Number.isFinite(expires) || expires - Date.now() > 5 * 60 * 1000) return tokens;
  const base = env === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
  const credentials = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString("base64");
  const response = await fetch(`${base}/v5/oauth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refresh_token })
  });
  const refreshed = await response.json();
  if (!response.ok || !refreshed.access_token) throw new Error("Pinterest token refresh failed. Reconnect the account.");
  const next = { ...refreshed, refresh_token: refreshed.refresh_token || tokens.refresh_token };
  await savePinterestTokens(next, env);
  return { access_token: next.access_token, refresh_token: next.refresh_token, expires_at: new Date(Date.now() + Number(next.expires_in || 0) * 1000).toISOString(), environment: env };
}
export function pinterestApiBase(environment = "production") {
  return environmentName(environment) === "sandbox" ? "https://api-sandbox.pinterest.com" : "https://api.pinterest.com";
}
