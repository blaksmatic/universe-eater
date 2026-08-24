# Build & Run

## Prerequisites

- Node.js >= 18, npm >= 9
- Chromium for Playwright (only for `npm test`)

## Install

```bash
npm install
npx playwright install chromium   # only if you run automated tests
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | `build` + `esbuild --watch` + `serve at :3000` concurrently |
| `npm run build` | `esbuild src/main.ts --bundle --outfile=dist/bundle.js --sourcemap` + `node build-standalone.js` → `dist/universe-eater.html` |
| `npm run typecheck` | `tsc --noEmit` (strict, `noUnusedLocals`, `noUnusedParameters`) |
| `npm run build:wx` | WeChat mini-game bundle → `wx/bundle.js` (guards `window`/`localStorage`/`navigator`) |
| `npm run serve` | `npx serve . -p 3000` |
| `npm test` | Playwright harness — requires server on `:3456` |
| `npm run test:smoke` | Smoke subset |
| `npm run test:qa` | Edge-case harness `scripts/qa-edge.mjs` |

## Dev loop

```bash
npm run dev
# opens http://localhost:3000
# edits to src/*.ts trigger esbuild watch → reload browser
```

Before committing:

```bash
npm run typecheck
npm run build
```

## Outputs

- `dist/bundle.js` + `dist/bundle.js.map` — dev bundle (1.5 MB).
- `dist/universe-eater.html` — standalone single-file build (inlines CSS+JS).
- `wx/bundle.js` — CJS build for WeChat (three mocked via `wx/empty-three`).

## esbuild config

Bundler is invoked via CLI in `package.json` (no `esbuild.config.js`). Key flags:

- `--bundle --sourcemap`
- `--alias:three=./wx/empty-three` only for WeChat target
- `--define:document=__doc --define:window=__win` etc for WeChat sandbox

## TypeScript

`tsconfig.json:13` — `ES2020` / `ESNext` / `bundler` / `strict` / `noUnusedLocals`. Fix unused locals by exporting or removing; see `src/ui/theme.ts` as design-system example formerly flagged.

## Troubleshooting

- **Port in use**: `npm run serve` defaults to 3000; `playtest` expects 3456 — start `npx serve . -p 3456` in another terminal.
- **Three.js fallback**: `runtime.ts:34` catches `ThreeEntityRenderer` construction; game runs 2D-only if WebGL fails.
- **Audio unlock**: `runtime.unlockAudioOnce` must be called from user gesture; autoplay without gesture stays muted (by design).
- **WeChat guards**: never access `window`/`localStorage`/`navigator`/`document` at top-level without `typeof window !== 'undefined'` check — see `storage.ts`, `i18n.ts`.
