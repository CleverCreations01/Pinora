import { list, get, put } from "@vercel/blob";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const key = () => {
  const value = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (!/^[a-fA-F0-9]{64}$/.test(value)) throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hex characters");
  return Buffer.from(value, "hex");
};
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
async function blobUrl() {
  const result = await list({ prefix: "pinterest/private-tokens.json", limit: 1 });
  return result.blobs?.[0]?.url || null;
}
export async function savePinterestTokens(tokens) {
  const payload = {
    access_token: seal(tokens.access_token),
    refresh_token: seal(tokens.refresh_token),
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
  await put("pinterest/private-tokens.json", JSON.stringify(payload), {
    access: "private", addRandomSuffix: false, allowOverwrite: true,
    contentType: "application/json"
  });
}
export async function loadPinterestTokens() {
  const url = await blobUrl();
  if (!url) return null;
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  const payload = await new Response(result.stream).json();
  return {
    access_token: unseal(payload.access_token),
    refresh_token: unseal(payload.refresh_token),
    expires_at: payload.expires_at
  };
}
