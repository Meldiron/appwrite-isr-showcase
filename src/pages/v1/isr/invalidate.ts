import type { APIRoute } from 'astro';
import { AppwriteException, InvalidationType } from 'node-appwrite';
import { createProxyService, getProxyDomain } from '../../../lib/appwrite';

export const prerender = false;

const ALLOWED_TYPES: InvalidationType[] = [
  InvalidationType.Tag,
  InvalidationType.Path,
  InvalidationType.All,
];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/**
 * Purges Appwrite's CDN cache via `Proxy.createInvalidation()`.
 *
 * Body: `{ "type": "tag" | "path" | "all", "reference"?: string }`
 *  - `tag`  — purges everything tagged with `reference` (e.g. `key123`)
 *  - `path` — purges a single URL path (e.g. `/v1/isr/pathed-date`)
 *  - `all`  — purges the whole domain, `reference` is ignored
 */
export const POST: APIRoute = async ({ request }) => {
  let payload: { type?: string; reference?: string };

  try {
    payload = await request.json();
  } catch {
    return json({ success: false, message: 'Request body must be valid JSON.' }, 400);
  }

  const type = payload.type as InvalidationType | undefined;

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return json(
      { success: false, message: `type must be one of: ${ALLOWED_TYPES.join(', ')}.` },
      400,
    );
  }

  if (type !== InvalidationType.All && !payload.reference) {
    return json({ success: false, message: `reference is required when type is "${type}".` }, 400);
  }

  try {
    const proxy = createProxyService();
    const invalidation = await proxy.createInvalidation({
      domain: getProxyDomain(),
      type,
      reference: payload.reference,
    });

    return json(
      {
        success: true,
        type,
        reference: payload.reference ?? null,
        invalidation,
        invalidatedAt: new Date().toISOString(),
      },
      200,
    );
  } catch (error) {
    const message =
      error instanceof AppwriteException || error instanceof Error
        ? error.message
        : 'Unknown error while creating the invalidation.';
    const status = error instanceof AppwriteException ? (error.code || 500) : 500;

    return json({ success: false, type, reference: payload.reference ?? null, message }, status);
  }
};
