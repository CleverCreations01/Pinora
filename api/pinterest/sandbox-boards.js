export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.PINTEREST_SANDBOX_ACCESS_TOKEN;
  if (!token) {
    return res.status(409).json({
      connected: false,
      error: "Sandbox token is not configured. Generate a Sandbox access token in Pinterest My Apps and add PINTEREST_SANDBOX_ACCESS_TOKEN to Vercel."
    });
  }

  try {
    const response = await fetch("https://api-sandbox.pinterest.com/v5/boards?page_size=100", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch {
    return res.status(502).json({ error: "Could not load Pinterest Sandbox boards." });
  }
}
