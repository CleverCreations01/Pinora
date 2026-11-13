import { randomBytes } from "node:crypto";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") return res.status(405).send("Method not allowed");

  const { PINTEREST_APP_ID, PINTEREST_REDIRECT_URI } = process.env;
  if (!PINTEREST_APP_ID || !PINTEREST_REDIRECT_URI) {
    return res.status(503).send("Pinterest app credentials are not configured.");
  }

  const environment = req.query.environment === "production" ? "production" : "sandbox";
  const state = randomBytes(32).toString("hex");
  const session = randomBytes(32).toString("hex");
  const secure = req.headers["x-forwarded-proto"] === "https" || !String(req.headers.host || "").includes("localhost");
  const secureFlag = secure ? "; Secure" : "";

  res.setHeader("Set-Cookie", [
    `pinvora_session=${session}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${secureFlag}`,
    `pinterest_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secureFlag}`,
    `pinterest_oauth_environment=${environment}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secureFlag}`
  ]);

  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", PINTEREST_APP_ID);
  url.searchParams.set("redirect_uri", PINTEREST_REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "boards:read,boards:write,pins:write");
  url.searchParams.set("state", state);
  return res.redirect(302, url.toString());
}
