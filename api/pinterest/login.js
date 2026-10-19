
import { randomBytes } from "node:crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).send(
      "Pinterest configuration is missing."
    );
  }

  const state = randomBytes(32).toString("hex");

  res.setHeader(
    "Set-Cookie",
    `pinterest_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "boards:read,boards:write,pins:read,pins:write,user_accounts:read",
    state
  });

  return res.redirect(
    302,
    `https://www.pinterest.com/oauth/?${params.toString()}`
  );
      }
