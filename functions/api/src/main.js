import { AppwriteException, Client, InvalidationType, Proxy } from 'node-appwrite';

/** Domain this function is served on — the one whose CDN cache we purge. */
const DOMAIN = process.env.APPWRITE_PROXY_DOMAIN ?? 'isr-function-playground.appwrite.network';

/**
 * Cache for a year so a purge is, in practice, the only way to refresh the
 * response — that makes the ISR behaviour easy to observe.
 */
const ISR_TTL_SECONDS = 31536000;

const DOCS = `# ISR Function Playground

An Appwrite Function demonstrating Incremental Static Regeneration (ISR) on
Appwrite's CDN. Responses are cached at the edge via the \`CDN-Cache-Control\`
header and purged on demand through the Proxy API.

Base URL: https://${DOMAIN}

## Endpoints

### GET /v1/date

Returns a JSON payload with the timestamp it was generated at. The response is
cached by Appwrite's CDN for a year (\`CDN-Cache-Control: public,
max-age=${ISR_TTL_SECONDS}\`), so repeated requests return the same timestamp until the
cache is purged.

\`\`\`
curl https://${DOMAIN}/v1/date
\`\`\`

### POST /v1/purge

Purges the whole domain's CDN cache. The next request to \`/v1/date\` reaches
the function again and returns a fresh timestamp.

\`\`\`
curl -X POST https://${DOMAIN}/v1/purge
\`\`\`

Optionally pass a JSON body \`{ "domain": "example.appwrite.network" }\` to
purge a different domain owned by this project.

## Try it

1. \`GET /v1/date\` twice — the \`generatedAt\` timestamp does not change.
2. \`POST /v1/purge\`.
3. \`GET /v1/date\` again — the timestamp is fresh.
`;

function methodNotAllowed(res, allowed) {
  return res.json(
    { success: false, message: `Method not allowed. Use ${allowed}.` },
    405,
    { Allow: allowed },
  );
}

export default async ({ req, res, log, error }) => {
  if (req.path === '/') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');

    return res.text(DOCS, 200, {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  }

  if (req.path === '/v1/date') {
    if (req.method !== 'GET') return methodNotAllowed(res, 'GET');

    const now = new Date();
    log(`Generating /v1/date at ${now.toISOString()} — cached by the CDN until purged.`);

    // `CDN-Cache-Control` mirrors `Cache-Control` semantics, but is only
    // consumed by Appwrite's edge — it never reaches the browser, so the
    // client always talks to the CDN and can observe the cached timestamp.
    return res.json(
      {
        endpoint: '/v1/date',
        strategy: `CDN-Cache-Control: public, max-age=${ISR_TTL_SECONDS}`,
        generatedAt: now.toISOString(),
        generatedAtEpochMs: now.getTime(),
      },
      200,
      { 'CDN-Cache-Control': `public, max-age=${ISR_TTL_SECONDS}` },
    );
  }

  if (req.path === '/v1/purge') {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST');

    let domain = DOMAIN;
    if (req.bodyText) {
      try {
        const payload = JSON.parse(req.bodyText);
        if (payload && typeof payload.domain === 'string' && payload.domain.length > 0) {
          domain = payload.domain;
        }
      } catch {
        return res.json({ success: false, message: 'Request body must be valid JSON.' }, 400);
      }
    }

    // The dynamic API key inherits the function's scopes; purging requires
    // the `rules.write` scope (see appwrite.config.json).
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key'] ?? '');
    const proxy = new Proxy(client);

    try {
      const invalidation = await proxy.createInvalidation({
        domain,
        type: InvalidationType.All,
      });

      log(`Purged CDN cache for ${domain}.`);

      return res.json({
        success: true,
        domain,
        invalidation,
        purgedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof AppwriteException || err instanceof Error
          ? err.message
          : 'Unknown error while creating the invalidation.';
      const status = err instanceof AppwriteException ? err.code || 500 : 500;

      error(`Failed to purge CDN cache for ${domain}: ${message}`);

      return res.json({ success: false, domain, message }, status);
    }
  }

  return res.json(
    { success: false, message: 'Not found. See GET / for available endpoints.' },
    404,
  );
};
