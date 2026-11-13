import { getPinterestTokens, readPinterestSession } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const sessionId = readPinterestSession(req);
  const environment = req.query.environment === "production" ? "production" : "sandbox";
  if (!sessionId) return res.status(200).json({ connected: false, environment, productionEnabled: process.env.PINTEREST_PRODUCTION_ENABLED === "true" });
  try {
    const tokens = await getPinterestTokens(environment, sessionId);
    return res.status(200).json({ connected: Boolean(tokens?.access_token), environment, expiresAt: tokens?.expires_at || null, productionEnabled: process.env.PINTEREST_PRODUCTION_ENABLED === "true" });
  } catch {
    return res.status(500).json({ connected: false, environment, error: "Could not verify this browser session's Pinterest connection." });
  }
}
