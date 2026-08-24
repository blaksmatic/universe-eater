# Universe Eater

A fast-paced survival browser game rendered on HTML5 Canvas with an optional three.js 3D entity overlay. Survive the countdown against escalating enemy waves, draft mutations on level-up, then slay the multi-phase Void Warden to advance stages. Bilingual (EN / zh-CN), desktop + mobile.

## Quick Start

```bash
npm install && npm run dev
```

Opens at http://localhost:3000. Type-check: `npm run typecheck`. Automated tests: `npm test` (requires `npx playwright install chromium` and a server on :3456).

## Tech Stack

- **TypeScript** (strict mode, `noUnusedLocals`, `noUnusedParameters`)
- **HTML5 Canvas 2D** — gameplay rendering, HUD, effects (2D layer sits above the 3D overlay)
- **three.js** — `three-view.ts` renders 3D entity bodies with adaptive quality/pixel-ratio; falls back to pure 2D bodies if WebGL fails
- **WebAudio** — procedural ambient music + synthesized SFX (`audio.ts`, no audio assets)
- **esbuild** — bundler with watch mode (`dist/bundle.js`)
- **Playwright** — automated playtest harness (`scripts/playtest.mjs`, `scripts/qa-edge.mjs`)

## Project Structure

```
src/
  main.ts        — entry; creates GameRuntime; exposes window.__universeEater debug hook
  runtime.ts     — game loop, state transitions, input routing, audio unlock, records
  game.ts        — Game state machine, draft/level-up flow, notifications, scheduled hints
  world.ts       — GameWorld composition root; wires combat/weapons/motion/renderer
  world-combat.ts— collisions, combo chain, kill rewards, level-up blast, boss events
  world-motion.ts— player velocity sampling for background parallax
  world-renderer.ts— draw order + boss/elite threat auras
  player.ts      — movement, dash (i-frames, ghosts, cooldown), crit/vamp/xp stats
  enemies.ts     — 8 enemy types incl. elites + 3-phase boss; spawner with escalation
  weapons.ts     — 7 weapons (laser/orbit/nova/escort/seeker/arc/singularity) + manager
  upgrades.ts    — draft builder, passives with stack caps, doctrines, tag system
  particles.ts   — death FX, sparks, debris, XP orbs, damage numbers, screen effects
  camera.ts      — follow + shake (respects shakeEnabled setting)
  background.ts  — parallax starfield, wrap zone
  geometry.ts    — neon background geometry (grid, radials, rings, shapes)
  input.ts       — keyboard, floating touch joystick, dash/pause buttons, haptics
  ui.ts          — HUD, boss bar, combo meter, draft cards, pause menu, settings, records
  audio.ts       — WebAudio engine: throttled SFX + generative music, persisted toggles
  storage.ts     — settings + records persistence (localStorage)
  i18n.ts        — EN/zh-CN string tables and formatters
  ids.ts         — union types + passive stack caps
  three-view.ts  — three.js entity renderer (pooled visuals per enemy type)
```

## Architecture

### Game Loop (`runtime.ts`)
`requestAnimationFrame` loop with delta capping (`Math.min(dt, 0.05)`). States: `TITLE → PLAYING → LEVEL_UP/PAUSED → GAME_OVER/VICTORY`. When the stage countdown hits zero the runtime spawns the boss (`world.spawnBoss()`), plays the warning sting, and switches the HUD timer into "SLAY THE WARDEN" mode; victory fires only when the boss dies (`CombatFrameResult.bossKilled`).

### Map & Wrapping
The world is a 50000×50000 toroidal map. `wrapPosition()` / `wrappedDelta()` / `wrappedDistance()` / `wrappedAngle()` in `utils.ts` are the single source of truth for boundary math. The camera does NOT wrap.

### Enemies (`enemies.ts`)
Types: swarmer, drifter, titan, overlord, spitter (ranged kiter), splitter (death-shards), bomber (fuse + bullet ring), boss. Any spawn can be **elite** (chance scales with stage): bigger, tougher, +XP, violet aura. The **Void Warden** has 3 HP phases: P1 radial rings; P2 adds spiral barrages + summons; P3 adds telegraphed charge dashes and denser patterns. Phase transitions emit events drained by the world (`drainBossPhaseEvents`) for audio/shake.

### Weapons (`weapons.ts`)
All weapons auto-fire and implement `update(dt, px, py, enemies, modifiers)` + `draw(...)`. Damage goes through `hitEnemy()` (rolls crit via `modifiers.critChance`, reports through `modifiers.onHit` → floating damage numbers) or `hitEnemySilent()` for continuous ticks (orbit grind, singularity pull). Stats are cached per level.

### Combo (`world-combat.ts`)
Kills within 3.2s chain a combo; every 10th milestone pops the UI meter, plays a sting, and bursts bonus XP orbs. `comboBest` feeds end-of-run records.

### Drafts & Doctrines (`upgrades.ts`, `game.ts`)
Drafts offer 3 of: weapon unlocks / weapon level-ups / passives (8 passives, several stack-capped via `PASSIVE_CAPS`). Tag counts (force/ward/surge/forge) unlock **Doctrines** (bulwark, slipstream, nanite-lattice, annihilation). Rerolls refresh +1 per stage (cap 3).

### Persistence (`storage.ts`)
Settings (sound/music/shake/damage numbers) and records (best stage/kills/level/time/combo, runs) in localStorage; `submitRun()` returns which fields set new bests for the end-screen NEW RECORD badges.

### Rendering Order (`world-renderer.ts`)
background → geometry → enemies (2D fallback) or 3D overlay → **threat auras (2D, above 3D)** → particles → weapons → player → wrap zone → vignette → screen effects → HUD → notifications.

## Key Patterns

- **Entity lifecycle**: enemies carry `dead`; combat snapshots dead enemies, awards XP/combo/vamp, requests splitter remains via `spawner.handleDeathEffects()`, then `spawner.removeDead()` filters.
- **Enemy damage**: always `enemy.takeDamage(amount)`; weapon crits route through `hitEnemy()`.
- **Stats caching**: weapons recompute stats only on level change.
- **Shared utils**: `TWO_PI`, `tracePoly()`, `roundedRect()`, easing — import from `utils.ts`, never redeclare. NOTE: `roundedRect()` does NOT call `beginPath()` — callers must.
- **Screen effects**: `particles.addScreenFlash()` / `addDamageVignette()`.
- **Audio**: call through the `audio` singleton; SFX self-throttle. Unlock on first user gesture (`runtime.unlockAudioOnce`).
- **i18n**: all user-facing strings via `i18n.ts` (both languages, always add both).
- **Debug hook**: `window.__universeEater` (GameRuntime) — used by the Playwright harness.

## Build & Validation

```bash
npm run build      # bundle + standalone HTML
npm run typecheck  # tsc --noEmit (run before committing)
npm test           # full Playwright playthrough vs http://localhost:3456
npm run build:wx   # WeChat mini-game target (window/localStorage guarded in src)
```

No unit test framework; the Playwright harness is the regression suite:
- `scripts/playtest.mjs` — 18 functional checks (smoke, heavy combat, full 3-phase boss fight → victory → next stage, mobile emulation) + FPS warnings
- `scripts/qa-edge.mjs` — 25 edge-case checks (rapid restart, pause-during-boss, language switching, settings persistence, maxed-build gating, splitter/bomber behaviors)
- `scripts/mobile-audit.mjs` — portrait/landscape phone screenshots + touch interactions (draft taps, dash button, joystick)
- `scripts/balance-boss.mjs` — boss-fight DPS/TTK simulation with a realistic mid-tier build

## Conventions

- All source in `src/`, one system per file; coordinates are world-space unless named `screen*`/`sx`/`sy`
- Strict TS: no `any`, no unused locals/params
- Colors as `rgba()` strings; glow = thick dim stroke + thin bright stroke
- New user-facing copy must be added to BOTH locales in `i18n.ts`
- Guard `window`/`localStorage`/`navigator` access for the WeChat adapter
