# Serving llms.txt for the ASIW Supply store

`llms.txt` (in the repo root) is a plain-text summary of the site for AI
crawlers — an emerging convention similar to robots.txt. Shopify themes
cannot serve arbitrary root-level files, so it has to be served in front of
or beside Shopify. Two options, easiest first.

Before either option: replace the relative links in `llms.txt`
(`/collections/all`, `/pages/wholesale`, ...) with absolute URLs on your
live domain, e.g. `https://yourdomain.com/collections/all`.

## Option A — Shopify redirect to a CDN file (no Cloudflare needed)

1. Shopify admin → **Content → Files** → upload `llms.txt`.
2. Copy the CDN URL Shopify assigns (it looks like
   `https://cdn.shopify.com/s/files/.../llms.txt`).
3. Shopify admin → **Online Store → Navigation → View URL redirects →
   Create URL redirect**:
   - Redirect from: `/llms.txt`
   - Redirect to: the CDN URL from step 2
4. Verify: open `https://yourdomain.com/llms.txt` — you should land on the
   text file.

Caveat: crawlers must follow one 301 redirect. The major AI crawlers do,
but a same-URL response (Option B) is strictly better.

To update the file later, upload the new version in Files, then update the
redirect target (Shopify gives re-uploads a new URL).

## Option B — Cloudflare Worker (serves it directly at /llms.txt)

Requires the domain's DNS to be on Cloudflare with the store's traffic
proxied (orange cloud).

1. Cloudflare dashboard → **Workers & Pages → Create → Worker**, name it
   `llms-txt`.
2. Paste this code, replacing the placeholder text with the contents of
   `llms.txt`:

   ```js
   export default {
     async fetch() {
       const body = `# ASIW Supply
   ...paste the full llms.txt contents here...
   `;
       return new Response(body, {
         headers: {
           'content-type': 'text/plain; charset=utf-8',
           'cache-control': 'public, max-age=3600',
         },
       });
     },
   };
   ```

3. Deploy, then on the Worker → **Settings → Domains & Routes → Add route**:
   - Route: `yourdomain.com/llms.txt` (and `www.yourdomain.com/llms.txt`
     if www is used)
   - Zone: your domain
4. Verify: `curl https://yourdomain.com/llms.txt` returns the text with a
   200 status.

To update, edit the Worker body and redeploy.

## While you're in Cloudflare (from the site audit)

The audit reported "no text compression detected." Shopify serves Brotli
itself, so if the domain is proxied through Cloudflare check
**Speed → Optimization → Content Optimization** and make sure **Brotli**
is enabled. Verify with:

```sh
curl -sI -H 'accept-encoding: br,gzip' https://yourdomain.com | grep -i content-encoding
```

Expected: `content-encoding: br` (or `gzip`).
