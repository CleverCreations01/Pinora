import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { readPinterestSession } from "./_storage.js";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!readPinterestSession(req)) return res.status(401).json({ error: "Connect Pinterest in this browser session first." });
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (origin && host && new URL(origin).host !== host) return res.status(403).json({ error: "Cross-origin uploads are not allowed." });
  try {
    const dataUrl = String(req.body?.data_url || "");
    const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return res.status(400).json({ error: "Upload a JPG, PNG or WebP image." });
    const mime = match[1];
    const bytes = Buffer.from(match[2], "base64");
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) return res.status(413).json({ error: "Image must be smaller than 8 MB." });
    const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
    const blob = await put(`pinterest/pins/${randomUUID()}.${ext}`, bytes, {
      access: "public", addRandomSuffix: false, contentType: mime
    });
    return res.status(200).json({ url: blob.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Image upload failed. Check Vercel Blob configuration." });
  }
}
