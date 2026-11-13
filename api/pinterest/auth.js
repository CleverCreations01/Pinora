import { randomBytes } from "node:crypto";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  const { PINTEREST_APP_ID, PINTEREST_REDIRECT_URI } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_REDIRECT_URI) return res.status(500).send("Add PINTEREST_APP_ID and PINTEREST_REDIRECT_URI in Vercel.");
  const state = randomBytes(24).toString("hex");
  res.setHeader("Set-Cookie", `pinterest_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", PINTEREST_APP_ID);
  url.searchParams.set("redirect_uri", PINTEREST_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "boards:read,pins:write");
  url.searchParams.set("state", state);
  return res.redirect(302, url.toString());
}
