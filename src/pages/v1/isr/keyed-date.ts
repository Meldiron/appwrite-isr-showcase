import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * SSR endpoint cached for a year, but tagged with two cache keys.
 *
 * `X-Appwrite-Cache-Control` is what puts the response in the cache at all —
 * `X-Appwrite-Keys` only attaches the space separated tags `key123` and
 * `key456`. With the TTL that long, purging either tag via the Proxy API is in
 * practice the only way to refresh it.
 */
export const GET: APIRoute = () => {
  const now = new Date();

  return new Response(
    JSON.stringify({
      endpoint: '/v1/isr/keyed-date',
      strategy: 'X-Appwrite-Cache-Control: public, max-age=31536000 + X-Appwrite-Keys: key123 key456',
      generatedAt: now.toISOString(),
      generatedAtEpochMs: now.getTime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Cache-Control': 'public, max-age=31536000',
        'X-Appwrite-Keys': 'key123 key456',
      },
    },
  );
};
