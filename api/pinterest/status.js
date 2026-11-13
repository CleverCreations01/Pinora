import { getPinterestTokens } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const environment = req.query.environment === "production" ? "production" : "sandbox";
  try {
    const tokens = await getPinterestTokens(environment);
    return res.status(200).json({ connected: Boolean(tokens?.access_token), environment, expiresAt: tokens?.expires_at || null, productionEnabled: process.env.PINTEREST_PRODUCTION_ENABLED === "true" });
  } catch {
    return res.status(500).json({ connected: false, environment, error: "Could not verify Pinterest token storage." });
  }
}
