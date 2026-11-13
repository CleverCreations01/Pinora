import { getPinterestTokens, pinterestApiBase } from "./_storage.js";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const environment = req.query.environment === "production" ? "production" : "sandbox";
  try {
    const tokens = await getPinterestTokens(environment);
    if (!tokens?.access_token) return res.status(401).json({ error: `Pinterest ${environment} account is not connected.` });
    const response = await fetch(`${pinterestApiBase(environment)}/v5/boards?page_size=100`, {
      headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" }
    });
    const data = await response.json();
    return res.status(response.status).json({ ...data, environment });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Could not load Pinterest boards." });
  }
}
