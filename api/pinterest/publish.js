import { getPinterestTokens, pinterestApiBase, readPinterestSession } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const sessionId = readPinterestSession(req);
  if (!sessionId) return res.status(401).json({ error: "Connect Pinterest in this browser session first." });
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (origin && host && new URL(origin).host !== host) return res.status(403).json({ error: "Cross-origin publishing requests are not allowed." });
  const environment = req.body?.environment === "production" ? "production" : "sandbox";
  if (environment === "production" && process.env.PINTEREST_PRODUCTION_ENABLED !== "true") return res.status(403).json({ error: "Production publishing is locked until Pinterest Standard access is approved and enabled." });
  try {
    const tokens = await getPinterestTokens(environment, sessionId);
    if (!tokens?.access_token) return res.status(401).json({ error: `Pinterest ${environment} account is not connected in this browser session.` });
    const { board_id, title, description, image_url, link } = req.body || {};
    if (!board_id || !title || !image_url) return res.status(400).json({ error: "board_id, title and image_url are required." });
    let image;
    try { image = new URL(image_url); } catch { return res.status(400).json({ error: "Image must be a publicly reachable HTTPS URL." }); }
    if (image.protocol !== "https:") return res.status(400).json({ error: "Image must use HTTPS." });
    if (link) {
      let target;
      try { target = new URL(link); } catch { return res.status(400).json({ error: "Destination link must be a valid HTTPS URL." }); }
      if (target.protocol !== "https:") return res.status(400).json({ error: "Destination link must use HTTPS." });
    }
    const response = await fetch(`${pinterestApiBase(environment)}/v5/pins`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ board_id, title: String(title).slice(0, 100), description: String(description || "").slice(0, 800), link: link || undefined, media_source: { source_type: "image_url", url: image.toString() } })
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json({ ...data, environment });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Pin publishing failed." });
  }
}
