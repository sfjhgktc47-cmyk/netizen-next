# Patch 10 — Hero banner image render fix

Fixes hero banner images not showing on the homepage even when uploaded in the admin panel.

Changes:
- `src/app/home-client.tsx`
  - Replaces Next `<Image fill>` rendering in the main hero slider with plain `<img>`.
  - Keeps the footer logo on Next Image.
  - This avoids Next image optimization / dynamic API image issues for `/api/public-image/...` banner URLs.

After deploy:
- Open `/` with Ctrl+F5.
- If the image is still missing, open DevTools Network and check `/api/public-image/banner/...` status.
