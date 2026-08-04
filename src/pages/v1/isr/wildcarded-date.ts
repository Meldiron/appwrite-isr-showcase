import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * SSR endpoint cached for a day, with no cache keys.
 *
 * Nothing here is addressable by tag, and the demo never purges this path
 * directly — the only thing that clears it is a domain-wide invalidation,
 * which drops every cached response regardless of tags or paths.
 */
export const GET: APIRoute = () => {
  const now = new Date();

  return new Response(
    JSON.stringify({
      endpoint: '/v1/isr/wildcarded-date',
      strategy: 'X-Appwrite-Cache-Control: public, max-age=86400',
      generatedAt: now.toISOString(),
      generatedAtEpochMs: now.getTime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Cache-Control': 'public, max-age=86400',
      },
    },
  );
};
