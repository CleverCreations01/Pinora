# Pinterest Standard Access readiness

## Production integration

- Canonical application origin: https://pinora-six.vercel.app
- Registered OAuth callback: https://pinora-six.vercel.app/api/pinterest/callback
- OAuth grant: Authorization Code
- Requested minimum scopes: boards:read and pins:write
- Pinterest App ID and secret remain production-only Vercel environment variables.
- Preview OAuth requests are redirected to the canonical production origin before OAuth cookies are created. This keeps the state and session cookies on the same host as the registered callback.
- Pinterest access and refresh tokens are encrypted with AES-256-GCM and stored in private Vercel Blob storage, keyed by the browser session. PINVORA never asks for a Pinterest password or Pinterest session cookie.
- Preview deployments remain protected. The production application is public so Pinterest users and reviewers can complete OAuth.

## Publishing safety

Production board creation and Pin publishing remain disabled unless PINTEREST_PRODUCTION_ENABLED is explicitly set to true. Do not enable this flag until Pinterest confirms Standard Access for this app. Trial access and a successful OAuth connection do not mean public publishing has been approved.

## Before submitting the Standard Access request

1. Confirm the Pinterest developer app already has Trial access and is in good standing.
2. In Pinterest My Apps, confirm the exact redirect URI above is registered.
3. Confirm the app description explains that PINVORA helps users plan Pinterest content, connect their own account through OAuth, view their boards, and prepare Pins.
4. Make sure the public privacy policy at https://pinora-six.vercel.app/privacy.html is accurate and accessible. Add a real privacy contact channel before submitting; the current policy intentionally does not invent a personal email address.
5. Record a short demo showing the public production URL, the Pinterest OAuth consent screen, the return to PINVORA, and a live request that loads the connected user's actual Pinterest boards.
6. Show that users approve access through Pinterest OAuth and that PINVORA never requests or stores Pinterest login credentials or browser session cookies.
7. Submit the demo video, app use case, and privacy-policy URL from the Upgrade action in Pinterest My Apps.

## Important distinction

Pinterest controls the access-tier decision. Code and configuration can make the integration reviewable and reliable, but cannot grant Standard Access or guarantee approval. Pinterest's current guidance requires Trial approval, Developer Guidelines compliance, and a demo video that shows the OAuth flow and live Pinterest integration.
