export function redirectToCanonicalHost(req, res, redirectUri, pathname) {
  let canonical;
  try {
    canonical = new URL(redirectUri);
  } catch {
    throw new Error("PINTEREST_REDIRECT_URI must be a valid absolute URL.");
  }
  if (canonical.protocol !== "https:" || !canonical.hostname) {
    throw new Error("PINTEREST_REDIRECT_URI must use HTTPS.");
  }

  const forwardedHost = req.headers["x-forwarded-host"];
  const requestHost = String(forwardedHost || req.headers.host || "").split(",")[0].trim();
  if (requestHost && requestHost.toLowerCase() !== canonical.host.toLowerCase()) {
    const incoming = new URL(req.url || "/", canonical.origin);
    const target = new URL(pathname, canonical.origin);
    target.search = incoming.search;
    res.redirect(307, target.toString());
    return true;
  }
  return false;
}
