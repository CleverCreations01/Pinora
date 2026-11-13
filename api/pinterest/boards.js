import { loadPinterestTokens } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const tokens = await loadPinterestTokens();
    if (!tokens?.access_token) return res.status(401).json({ error: "Pinterest is not connected." });
    const response = await fetch("https://api.pinterest.com/v5/boards?page_size=100", {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(500).json({ error: "Could not load Pinterest boards. Check server configuration." });
  }
}
