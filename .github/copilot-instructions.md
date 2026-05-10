# Copilot Instructions for bookmarks-api

This is a small Express + TypeScript bookmark CRUD API used as a webinar demo.

## Conventions

- Add Jest + supertest tests for every new endpoint (under `tests/`).
- Keep the in-memory store. Do not introduce a database or external services.
- Routes live in `src/routes/`. Use one `Router` per resource.
- Validation: minimal — return 400 on missing required fields, 404 on unknown id.
- TypeScript strict mode is on. Avoid `any`.

## Test command

`npm test` runs Jest. All tests must pass before opening a PR.

## File layout

- `src/server.ts` — express app, exports `app` for tests
- `src/store.ts` — in-memory data store + `clearAll()` for tests
- `src/routes/*.ts` — one router per resource
- `tests/*.test.ts` — supertest specs

## Style

- 2-space indent, single quotes, trailing commas.
- Prefer explicit return types on exported functions.
