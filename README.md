# astro-isr

Astro SSR app (`@astrojs/node`, standalone) demonstrating Appwrite's three CDN caching
strategies, styled with [Basecoat UI](https://basecoatui.com) on Tailwind v4.

## Routes

| Route                            | Caching headers                                    | How it refreshes                    |
| :------------------------------- | :------------------------------------------------- | :---------------------------------- |
| `/`                              | none                                               | dashboard with three fetch cards    |
| `/v1/isr/cache-controled-date`   | `CDN-Cache-Control: public, max-age=60`     | 60s TTL expiry                      |
| `/v1/isr/keyed-date`             | `CDN-Cache-Key: key123 key456`                   | tag invalidation only (no TTL)      |
| `/v1/isr/pathed-date`            | `CDN-Cache-Control: public, max-age=31536000` | path invalidation (1 year TTL)    |
| `/v1/isr/wildcarded-date`        | `CDN-Cache-Control: public, max-age=86400`  | domain-wide purge (24h TTL)         |
| `/v1/isr/invalidate`             | `Cache-Control: no-store`                          | `POST` — calls `Proxy.createInvalidation()` |

Each date endpoint returns `{ endpoint, strategy, generatedAt, generatedAtEpochMs }`. The
cards compare `generatedAtEpochMs` against the browser clock to display how old the cached
copy is, ticking every second.

## Setup

```sh
npm install
cp .env.example .env   # fill in your Appwrite credentials
npm run dev            # http://localhost:4321
```

Environment variables (typed via `astro:env`, all server-only):

| Variable                | Purpose                                                       |
| :---------------------- | :------------------------------------------------------------ |
| `APPWRITE_ENDPOINT`     | Appwrite API endpoint (defaults to Cloud)                      |
| `APPWRITE_PROJECT_ID`   | Project the API key belongs to                                 |
| `APPWRITE_API_KEY`      | API key with proxy invalidation scope                          |
| `APPWRITE_PROXY_DOMAIN` | Domain whose CDN cache the invalidations target                |

Without credentials the pages and date endpoints work fine; the invalidation buttons
report the missing configuration in the card.

## Caching caveat

`CDN-Cache-Control` and `CDN-Cache-Key` are consumed by Appwrite's edge and never
reach the browser, so locally every fetch is freshly rendered and the age resets to zero.
Deploy behind Appwrite to see the cache age actually grow.

## Commands

| Command             | Action                                     |
| :------------------ | :----------------------------------------- |
| `npm run dev`       | Dev server at `localhost:4321`             |
| `npm run build`     | Build the SSR bundle to `./dist/`          |
| `npm run preview`   | Run the built Node server                  |
| `npx astro check`   | Type-check `.astro` and `.ts` files        |
