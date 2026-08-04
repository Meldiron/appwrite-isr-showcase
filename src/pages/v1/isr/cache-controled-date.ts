import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * SSR endpoint cached by Appwrite's CDN for 60 seconds.
 *
 * `CDN-Cache-Control` mirrors `Cache-Control` semantics, but is only
 * consumed by Appwrite's edge — it never reaches the browser, so the client
 * always talks to the CDN and we can observe the cached age.
 */
export const GET: APIRoute = () => {
  const now = new Date();

  return new Response(
    JSON.stringify({
      endpoint: '/v1/isr/cache-controled-date',
      strategy: 'CDN-Cache-Control: public, max-age=60',
      generatedAt: now.toISOString(),
      generatedAtEpochMs: now.getTime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'CDN-Cache-Control': 'public, max-age=60',
      },
    },
  );
};
