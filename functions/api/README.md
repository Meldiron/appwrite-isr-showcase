# api

ISR playground function. Serves a CDN-cached (ISR) endpoint and a purge
endpoint that invalidates the domain's cache via Appwrite's Proxy API.

Live at: https://isr-function-playground.appwrite.network

## 🧰 Usage

### GET /

- Returns markdown documentation for the API.

### GET /v1/date

- Returns a JSON payload with its generation timestamp. Cached by Appwrite's
  CDN for a year via `CDN-Cache-Control`, so the timestamp stays the same
  until the cache is purged.

Sample `200` Response:

```json
{
  "endpoint": "/v1/date",
  "strategy": "CDN-Cache-Control: public, max-age=31536000",
  "generatedAt": "2026-08-11T12:00:00.000Z",
  "generatedAtEpochMs": 1786536000000
}
```

### POST /v1/purge

- Purges the whole domain's CDN cache. Optionally accepts a JSON body
  `{ "domain": "example.appwrite.network" }` to purge a different domain
  owned by this project.

Sample `200` Response:

```json
{
  "success": true,
  "domain": "isr-function-playground.appwrite.network",
  "invalidation": { "...": "..." },
  "purgedAt": "2026-08-11T12:00:00.000Z"
}
```

## ⚙️ Configuration

| Setting           | Value         |
| ----------------- | ------------- |
| Runtime           | Node (26)     |
| Entrypoint        | `src/main.js` |
| Build Commands    | `npm install` |
| Permissions       | `any`         |
| Scopes            | `rules.write` |
| Timeout (Seconds) | 15            |

## 🔒 Environment Variables

| Variable                | Description                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `APPWRITE_PROXY_DOMAIN` | Optional. Domain to purge. Defaults to `isr-function-playground.appwrite.network`.        |
