import { getSession } from "./_session.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSession(req);
  const configured = Boolean(
    process.env.AMAZON_LWA_CLIENT_ID &&
    process.env.AMAZON_LWA_CLIENT_SECRET &&
    process.env.AMAZON_LWA_REDIRECT_URI &&
    process.env.AMAZON_SESSION_SECRET &&
    process.env.AMAZON_SESSION_SECRET.length >= 32
  );

  return res.status(200).json({
    connected: Boolean(session),
    profile: session ? { name: session.name } : null,
    configured,
    scope: "identity-only",
    associatesDashboardAccess: false
  });
}
