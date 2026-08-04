import {
  APPWRITE_API_KEY,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_PROXY_DOMAIN,
} from 'astro:env/server';
import { Client, Proxy } from 'node-appwrite';

/**
 * Server-only Appwrite client. It carries an API key, so nothing here may be
 * imported from code that ends up in the browser bundle.
 */
export function createProxyService() {
  if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
    throw new Error(
      'Missing Appwrite credentials. Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY (see .env.example).',
    );
  }

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  return new Proxy(client);
}

/** Domain whose CDN cache the invalidations target. */
export function getProxyDomain() {
  if (!APPWRITE_PROXY_DOMAIN) {
    throw new Error('Missing APPWRITE_PROXY_DOMAIN (see .env.example).');
  }

  return APPWRITE_PROXY_DOMAIN;
}
