import { getPinterestTokens, pinterestApiBase } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const environment = req.body?.environment === "production" ? "production" : "sandbox";
  if (environment === "production" && process.env.PINTEREST_PRODUCTION_ENABLED !== "true") {
    return res.status(403).json({ error: "Production publishing is locked until Pinterest Standard access is approved and enabled." });
  }
  try {
    const tokens = await getPinterestTokens(environment);
    if (!tokens?.access_token) return res.status(401).json({ error: `Pinterest ${environment} account is not connected.` });
    const { board_id, title, description, image_url, link } = req.body || {};
    if (!board_id || !title || !image_url) return res.status(400).json({ error: "board_id, title and image_url are required." });
    let image;
    try { image = new URL(image_url); } catch { return res.status(400).json({ error: "Image must be a publicly reachable HTTPS URL." }); }
    if (image.protocol !== "https:") return res.status(400).json({ error: "Image must use HTTPS." });
    if (link) {
      const target = new URL(link);
      if (target.protocol !== "https:") return res.status(400).json({ error: "Destination link must use HTTPS." });
    }
    const response = await fetch(`${pinterestApiBase(environment)}/v5/pins`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ board_id, title: String(title).slice(0, 100), description: String(description || "").slice(0, 800), link: link || undefined, media_source: { source_type: "image_url", url: image.toString() } })
    });
    const data = await response.json();
    return res.status(response.status).json({ ...data, environment });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Pin publishing failed." });
  }
}
