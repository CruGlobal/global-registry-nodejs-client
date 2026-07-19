# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`global-registry-nodejs-client` is a small Node.js client that wraps the
[Global Registry](https://github.com/CruGlobal/global_registry) REST API.
It exposes a single class, `GRClient`, whose properties are typed resource
objects (`Entity`, `EntityType`, etc.) that translate method calls into HTTP
requests against a Global Registry instance.

```js
const { GRClient } = require('global-registry-nodejs-client')

const client = new GRClient({ baseUrl, accessToken })
const { entity } = await client.Entity.getOne(id)
```

## Ownership

Cru (Server Applications Engineering) now owns and maintains this project.
It was originally authored by Brian Zoetewey, who handed off ownership in
July 2026 (see PR #39 — Brian, GitHub `Omicron7`, approved the change and
confirmed "It can be handed off, no need to keep me in the loop"). There is
no requirement to keep the original author in the review loop.

## Consumers

- **`us-onboarding`** (AWS Lambda) — runtime dependency, pinned via a git URL
  (`https://github.com/CruGlobal/global-registry-nodejs-client.git#vX.Y.Z`).
  This is the primary production consumer; keep the public API stable for it.
- **Celigo** — used only for external unit testing / research, NOT at runtime.
- Other historical consumers (`okta-hooks`, `designation-sync`) inspect thrown
  error shapes (`err.statusCode`, `err.error`) — treat those as public API.

## Public API (keep stable)

`GRClient` is constructed with `{ baseUrl, accessToken }` (falling back to
`GLOBAL_REGISTRY_URL` / `GLOBAL_REGISTRY_TOKEN` env vars). It exposes these
resource objects:

| Property           | Path                   | Capabilities                                  |
|--------------------|------------------------|-----------------------------------------------|
| `Entity`           | `/entities/`           | `get`, `getOne`, `post`, `put`, `delete`      |
| `EntityType`       | `/entity_types/`       | `get`, `getOne`, `post`, `put`, `delete`      |
| `RelationshipType` | `/relationship_types/` | `get`, `getOne`, `post`, `put`, `delete`      |
| `EnumValue`        | `/enum_values/`        | `get`, `getOne`, `post`, `put`, `delete`      |
| `Measurement`      | `/measurements/`       | `get`, `getOne`, `post`, `put`, `delete`      |
| `System`           | `/systems/`            | `get`, `getOne`, `post`, `put`, `delete`      |
| `MeasurementType`  | `/measurement_types/`  | `get`, `getOne` (read-only)                   |
| `Subscription`     | `/subscriptions/`      | `get`, `getOne`, `delete`, `subscribe`, `confirm` |

- `get(params)` — list/filter (params are flattened into nested query params,
  e.g. `{ filters: { name: 'person' } }` → `filters[name]=person`).
- `getOne(id, params)` — fetch one by id.
- `post(content, options)` / `put(id, content, options)` — the resource name
  wraps the body automatically (e.g. `Entity.post({...})` sends `{ entity: {...} }`).
- `delete(id)` — delete by id.
- Errors thrown on non-2xx responses are `StatusCodeError` (with `.statusCode`,
  `.error`, `.response`); network/timeout failures throw `RequestError` (with
  `.error`/`.cause`). Both shapes mirror the old `request-promise-native` API so
  consumers that inspect them keep working.

## Auth model

Auth is a bearer access token sent as `Authorization: Bearer <accessToken>`.
Each token maps to a Global Registry **system**: entities created through the
client are attributed to that system, and a record's `client_integration_id`
is the source system's own per-record key (its primary key in the source of
record). Different consumers use different tokens and therefore write into
different system-owned namespaces in GR.

## Architecture

- `index.js` — entry point, re-exports `GRClient`.
- `lib/client.js` — `GRClient`; builds the resource objects from a type table.
- `lib/global-registry-object.js` — resource base classes (read-only,
  read+delete, full CRUD, and the specialized `Subscription` object).
- `lib/config.js` — `Configurator`; resolves `baseUrl`/`accessToken` from
  options or env, throws `MissingParameterError` if absent.
- `lib/http-client.js` — `HttpClient`, a minimal promise-based HTTP client
  built directly on Node's core `http`/`https` (JSON in/out, gzip/deflate
  decoding, request-compatible redirect following). **Zero runtime deps.**
- `lib/errors.js` — `ConfigurationError`, `MissingParameterError`.

## Commands

```bash
yarn install --frozen-lockfile   # install (repo uses yarn.lock)
yarn test                        # Jest test suite
yarn lint                        # standard (non-blocking)
```

Node >= 18. Tests run under Jest 22 in a `vm`-sandboxed node environment that
does NOT expose ambient `URL`/`fetch`/`AbortController` globals — `http-client.js`
deliberately uses `require('url').URL` and core `http`/`https` instead of those
globals so the nock-based suite keeps working. Do not introduce `fetch`/`axios`
without a Jest major upgrade.

## Release process

Consumers pin this package by **git URL + tag**, not the npm registry. To cut
a release:

1. Bump `version` in `package.json` (semver: MINOR for API-compatible changes,
   MAJOR only for breaking public-API changes).
2. `yarn install --frozen-lockfile && yarn test` to confirm health.
3. Commit to `master` (Cru-owned; direct commit is fine for release mechanics).
4. Create an annotated git tag `vX.Y.Z`, push it, and cut a GitHub Release.
5. Update consumers' git-URL pin to the new tag and refresh their lockfiles.

**Do NOT run `npm publish`** — this package is not distributed via the npm registry.

## Maintenance priorities

- **Keep the public API stable.** The resource surface and thrown-error shapes
  above are relied on by production consumers via a git pin.
- **Address dependency security vulnerabilities.** The first Cru-owned release
  (1.2.0) removed the deprecated `request` / `request-promise-native` runtime
  stack, which pulled a vulnerable, unpatchable `form-data@2.3.3`. The library
  now has zero runtime dependencies. Remaining `npm audit` / `yarn audit`
  findings are all Jest 22 devDependency transitives; they do not reach
  consumers (git-URL installs skip devDependencies) and are gated on a future
  Jest major upgrade.
