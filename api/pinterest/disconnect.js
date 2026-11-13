import { deletePinterestTokens, readPinterestSession } from "./_storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sessionId = readPinterestSession(req);
  if (!sessionId) return res.status(401).json({ error: "No PINVORA Pinterest session was found." });

  const origin = req.headers.origin;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (!origin || !host) return res.status(403).json({ error: "A same-origin request is required." });
  try {
    if (new URL(origin).host !== host) return res.status(403).json({ error: "Cross-origin requests are not allowed." });
  } catch {
    return res.status(403).json({ error: "Request origin is invalid." });
  }

  try {
    await Promise.all([
      deletePinterestTokens("production", sessionId),
      deletePinterestTokens("sandbox", sessionId)
    ]);
    const secure = req.headers["x-forwarded-proto"] === "https" || !host.includes("localhost");
    const secureFlag = secure ? "; Secure" : "";
    res.setHeader("Set-Cookie", [
      "pinvora_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secureFlag,
      "pinterest_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secureFlag,
      "pinterest_oauth_environment=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" + secureFlag
    ]);
    return res.status(200).json({ disconnected: true, deleted: true });
  } catch (error) {
    console.error("Pinterest disconnect failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "PINVORA could not complete the token deletion. Please retry." });
  }
}
