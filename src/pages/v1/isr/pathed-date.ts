import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * SSR endpoint cached by Appwrite's CDN for one year, with no cache keys.
 *
 * Because there are no tags to purge, the only way to refresh it before the
 * year is up is a path invalidation targeting this exact URL path.
 */
export const GET: APIRoute = () => {
  const now = new Date();

  return new Response(
    JSON.stringify({
      endpoint: '/v1/isr/pathed-date',
      strategy: 'CDN-Cache-Control: public, max-age=31536000',
      generatedAt: now.toISOString(),
      generatedAtEpochMs: now.getTime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'CDN-Cache-Control': 'public, max-age=31536000',
      },
    },
  );
};
