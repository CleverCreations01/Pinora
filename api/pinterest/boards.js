import { getPinterestTokens, pinterestApiBase } from "./_storage.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const environment = req.query.environment === "production" ? "production" : "sandbox";

  try {
    const tokens = await getPinterestTokens(environment);
    if (!tokens?.access_token) {
      return res.status(401).json({ error: `Pinterest ${environment} account is not connected.` });
    }

    // Pinterest Sandbox can return empty pages while still providing a bookmark.
    // Keep following the cursor until boards appear or pagination is exhausted.
    const base = pinterestApiBase(environment);
    const items = [];
    let bookmark = null;
    let pagesFetched = 0;
    const seenBookmarks = new Set();

    do {
      const url = new URL(`${base}/v5/boards`);
      url.searchParams.set("page_size", "250");
      if (bookmark) url.searchParams.set("bookmark", bookmark);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || data.error || "Pinterest could not load boards.",
          pinterest_status: response.status,
          pinterest_error: data
        });
      }

      if (Array.isArray(data.items)) items.push(...data.items);
      pagesFetched += 1;
      const next = data.bookmark || null;
      if (!next || seenBookmarks.has(next)) {
        bookmark = null;
        break;
      }
      seenBookmarks.add(next);
      bookmark = next;
    } while (bookmark && pagesFetched < 20);

    return res.status(200).json({
      items,
      bookmark,
      pages_fetched: pagesFetched,
      environment,
      warning: items.length === 0
        ? "No Sandbox boards were returned after following Pinterest pagination. Try creating a Sandbox board."
        : null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Could not load Pinterest boards." });
  }
}
