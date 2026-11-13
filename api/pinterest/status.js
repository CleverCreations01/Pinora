import { getPinterestTokens, readPinterestSession } from "./_storage.js";

const REQUIRED_SCOPES = ["boards:read", "pins:write"];

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const sessionId = readPinterestSession(req);
  const environment = req.query.environment === "sandbox" ? "sandbox" : "production";
  const productionEnabled = process.env.PINTEREST_PRODUCTION_ENABLED === "true";
  if (!sessionId) {
    return res.status(200).json({
      connected: false,
      environment,
      scopes: [],
      requiredScopes: REQUIRED_SCOPES,
      missingScopes: REQUIRED_SCOPES,
      hasRequiredScopes: false,
      productionEnabled
    });
  }

  try {
    const tokens = await getPinterestTokens(environment, sessionId);
    const scopes = tokens?.scopes || [];
    const missingScopes = REQUIRED_SCOPES.filter(scope => !scopes.includes(scope));
    return res.status(200).json({
      connected: Boolean(tokens?.access_token),
      environment,
      expiresAt: tokens?.expires_at || null,
      scopes,
      requiredScopes: REQUIRED_SCOPES,
      missingScopes,
      hasRequiredScopes: Boolean(tokens?.access_token) && missingScopes.length === 0,
      productionEnabled
    });
  } catch {
    return res.status(500).json({
      connected: false,
      environment,
      error: "Could not verify this browser session's Pinterest connection.",
      productionEnabled
    });
  }
}
