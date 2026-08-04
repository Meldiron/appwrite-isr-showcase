// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      // Credentials for Proxy.createInvalidation(). Optional so the app still
      // boots (and explains itself) without them configured.
      APPWRITE_ENDPOINT: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'https://cloud.appwrite.io/v1',
      }),
      APPWRITE_PROJECT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      APPWRITE_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      APPWRITE_PROXY_DOMAIN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
