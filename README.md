# Miusix

Miusix is a self-hosted music product for the web, iOS, and Android. This
repository is a monorepo containing the user interfaces, API, shared contracts,
and deployment configuration.

## Repository map

```text
apps/
  web/       Vite + React web player
  mobile/    Expo app for iOS, Android, and mobile web
  api/       Fastify API and HTTP-range audio streaming
packages/
  contracts/ Shared Zod schemas and TypeScript models
  sdk/       Typed API client shared by web and mobile
infra/       Caddy reverse-proxy configuration
storage/     Local audio storage (files are ignored by Git)
```

## Local development

Requirements: Node.js 22+, npm, and optionally Docker.

```bash
npm install
cp .env.example .env
npm run dev:api
npm run dev:web
```

In another terminal, start the native client:

```bash
npm run dev:mobile
```

The web app runs on `http://localhost:3000`; the API runs on
`http://localhost:4000`. Expo prints QR codes and platform launch options.

## Self-hosting

Set a strong `POSTGRES_PASSWORD` in `.env`, then run:

```bash
docker compose up --build -d
```

Caddy serves the web app and proxies `/api/*` to the API. PostgreSQL data is
stored in a named Docker volume. Put MP3 files in `storage/media` using the
track UUID as the filename:

```text
storage/media/45a6ad78-bdd2-4f5e-9737-4858c929f238.mp3
```

The stream endpoint supports HTTP range requests for seeking. Production work
should add authentication, an upload/admin workflow, background metadata
processing, and object storage before allowing untrusted users.

## Configuration

Never commit `.env` files. Start from `.env.example` and keep production values
in the server's secret manager. The old repository version accidentally tracked
credentials; all previously exposed Supabase, PostgreSQL, and Vercel secrets
must be rotated even after the file is removed.
