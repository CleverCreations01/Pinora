import { loadPinterestTokens } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const tokens = await loadPinterestTokens();
    return res.status(200).json({
      connected: Boolean(tokens?.access_token),
      expiresAt: tokens?.expires_at || null
    });
  } catch {
    return res.status(500).json({ connected: false, error: "Could not verify Pinterest token storage." });
  }
}
