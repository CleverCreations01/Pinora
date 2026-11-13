import { getPinterestTokens, pinterestApiBase, readPinterestSession } from "./_storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sessionId = readPinterestSession(req);
  if (!sessionId) return res.status(401).json({ error: "Connect Pinterest in this browser session first." });

  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (origin && host && new URL(origin).host !== host) return res.status(403).json({ error: "Cross-origin Pinterest actions are not allowed." });

  const environment = req.body?.environment === "production" ? "production" : "sandbox";
  if (environment === "production" && process.env.PINTEREST_PRODUCTION_ENABLED !== "true") {
    return res.status(403).json({ error: "Production actions are locked until Standard access is approved." });
  }

  const name = String(req.body?.name || "").trim();
  if (!name || name.length > 50) {
    return res.status(400).json({ error: "Board name must be 1–50 characters." });
  }

  try {
    const tokens = await getPinterestTokens(environment, sessionId);
    if (!tokens?.access_token) {
      return res.status(401).json({ error: `Pinterest ${environment} account is not connected.` });
    }

    const response = await fetch(`${pinterestApiBase(environment)}/v5/boards`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ name, privacy: "PUBLIC" })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || "Pinterest rejected the board creation request.",
        pinterest_status: response.status,
        pinterest_error: data,
        environment
      });
    }
    return res.status(response.status).json({ ...data, environment });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Could not create Pinterest board." });
  }
}
