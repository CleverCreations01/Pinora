const AMAZON_HOST = /(^|\\.)amazon\\.com$/i;
const DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases.";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.PINTEREST_SANDBOX_ACCESS_TOKEN;
  if (!token) {
    return res.status(409).json({
      error: "Sandbox publishing is disabled until PINTEREST_SANDBOX_ACCESS_TOKEN is configured."
    });
  }

  const { board_id, title, description, image_url, link, approved } = req.body || {};
  if (approved !== true) return res.status(400).json({ error: "Explicit approval is required before publishing." });
  if (!board_id || typeof board_id !== "string") return res.status(400).json({ error: "A Sandbox board is required." });
  if (!title || typeof title !== "string" || title.trim().length > 100) {
    return res.status(400).json({ error: "A title of 1–100 characters is required." });
  }
  if (!image_url || typeof image_url !== "string") return res.status(400).json({ error: "A publicly reachable image URL is required." });

  let image;
  try { image = new URL(image_url); } catch { return res.status(400).json({ error: "Image URL is invalid." }); }
  if (image.protocol !== "https:") return res.status(400).json({ error: "Image URL must use HTTPS." });

  let destination;
  if (link) {
    try { destination = new URL(link); } catch { return res.status(400).json({ error: "Amazon destination URL is invalid." }); }
    if (destination.protocol !== "https:" || !AMAZON_HOST.test(destination.hostname)) {
      return res.status(400).json({ error: "Affiliate destination must be an HTTPS Amazon.com URL." });
    }
  } else {
    return res.status(400).json({ error: "An Amazon.com affiliate destination is required." });
  }

  const cleanDescription = String(description || "").trim();
  const finalDescription = cleanDescription.includes(DISCLOSURE)
    ? cleanDescription
    : [cleanDescription, DISCLOSURE].filter(Boolean).join("\\n\\n");

  try {
    const response = await fetch("https://api-sandbox.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        board_id,
        title: title.trim(),
        description: finalDescription.slice(0, 800),
        link: destination.toString(),
        media_source: { source_type: "image_url", url: image.toString() }
      })
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ error: "Pinterest Sandbox publishing request failed." });
  }
}
