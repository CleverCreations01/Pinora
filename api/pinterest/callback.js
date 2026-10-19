import {
  createCipheriv,
  randomBytes,
  timingSafeEqual
} from "node:crypto";

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function encryptToken(value, key) {
  if (!value) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(".");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method not allowed");
  }

  const { code, state, error } = req.query;
  const savedState = readCookie(req, "pinterest_oauth_state");

  res.setHeader(
    "Set-Cookie",
    "pinterest_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );

  if (error) {
    return res.status(400).send("Pinterest authorization was cancelled or denied.");
  }

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    !savedState ||
    state.length !== savedState.length ||
    !timingSafeEqual(Buffer.from(state), Buffer.from(savedState))
  ) {
    return res.status(400).send("Invalid authorization state. Please try again.");
  }

  const {
    PINTEREST_APP_ID,
    PINTEREST_APP_SECRET,
    PINTEREST_REDIRECT_URI,
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    TOKEN_ENCRYPTION_KEY
  } = process.env;

  if (
    !PINTEREST_APP_ID ||
    !PINTEREST_APP_SECRET ||
    !PINTEREST_REDIRECT_URI ||
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY ||
    !TOKEN_ENCRYPTION_KEY
  ) {
    return res.status(500).send("Server configuration is incomplete.");
  }

  if (!/^[a-fA-F0-9]{64}$/.test(TOKEN_ENCRYPTION_KEY)) {
    return res.status(500).send("Token encryption key must be 64 hexadecimal characters.");
  }

  try {
    const credentials = Buffer.from(
      `${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: PINTEREST_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      return res.status(502).send("Pinterest token exchange failed. Check the app configuration and try again.");
    }

    const tokens = await tokenResponse.json();
    if (
      typeof tokens.access_token !== "string" ||
      typeof tokens.expires_in !== "number" ||
      !Number.isFinite(tokens.expires_in) ||
      tokens.expires_in <= 0
    ) {
      return res.status(502).send("Pinterest returned an unexpected token response.");
    }

    const encryptionKey = Buffer.from(TOKEN_ENCRYPTION_KEY, "hex");
    const row = {
      id: 1,
      access_token: encryptToken(tokens.access_token, encryptionKey),
      refresh_token: encryptToken(
        typeof tokens.refresh_token === "string" ? tokens.refresh_token : null,
        encryptionKey
      ),
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabaseUrl = SUPABASE_URL.replace(/\/+$/, "");
    const saveResponse = await fetch(
      `${supabaseUrl}/rest/v1/pinterest_tokens?on_conflict=id`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SECRET_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(row)
      }
    );

    if (!saveResponse.ok) {
      return res.status(502).send("Pinterest connected, but secure token storage failed. Publishing is disabled.");
    }

    return res.status(200).send(
      "Pinterest connected and tokens were encrypted before storage. Publishing is still disabled until the connection is verified."
    );
  } catch {
    return res.status(502).send("Could not complete secure Pinterest connection. Please try again.");
  }
}
