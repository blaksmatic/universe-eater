# Universe Eater

A fast-paced survival browser game rendered on HTML5 Canvas. Survive 5 minutes against escalating enemy waves with 3 auto-firing weapons.

## Quick Start

```bash
npm install && npm run dev
```

Opens at http://localhost:3000. Build check: `npx tsc --noEmit`

## Tech Stack

- **TypeScript** (strict mode, `noUnusedLocals`, `noUnusedParameters`)
- **HTML5 Canvas 2D** — all rendering, no DOM elements in gameplay
- **esbuild** — bundler with watch mode (`dist/bundle.js`)
- No frameworks, no runtime dependencies

## Project Structure

```
src/
  main.ts        — Game loop, init, input handlers, draw orchestration
  game.ts        — Game state machine, auto-upgrade system, notifications
  player.ts      — Player movement (WASD/arrows), HP, XP/leveling
  enemies.ts     — 4 enemy types, spawner with time-based escalation
  weapons.ts     — 3 weapon classes (Laser, Orbit, Nova), WeaponManager
  camera.ts      — Camera follow, world-to-screen projection
  background.ts  — Parallax starfield, nebulae, cosmic dust, idle drift
  particles.ts   — Death effects (hollow bubble-up, explosion burst, flash)
  input.ts       — Keyboard state tracker
  ui.ts          — HUD, title/game-over/victory screens, notifications
  utils.ts       — Map constants, wrapping math, distance helpers
```

## Architecture

### Game Loop (`main.ts`)
Standard `requestAnimationFrame` loop with delta-time capping (`Math.min(dt, 0.05)`). The loop handles state transitions, updates all systems, then draws in back-to-front order: background -> enemies -> particles -> weapons -> player -> wrap zone -> HUD -> notifications.

### Map & Wrapping
The world is a 5000x5000 toroidal map. Objects wrap at edges using `wrapPosition()`. Distance/angle calculations use `wrappedDistance()`/`wrappedAngle()` to handle cross-boundary interactions correctly. The camera does NOT wrap — it follows the player directly.

### Game States (`game.ts`)
Four states: `TITLE` -> `PLAYING` -> `GAME_OVER` or `VICTORY`. Level-ups do NOT pause the game — a random upgrade is applied instantly with a fade-out notification.

### Enemy System (`enemies.ts`)
- **Swarmer** — small, fast, red circles, spawn in groups of 3-5
- **Drifter** — medium, orange circles, sometimes spawn in pairs
- **Titan** — large, slow, purple circles
- **Overlord** — large crimson rotating square, summons swarmers every 3s, shoots white projectile spreads at player every 1.5s, pulsing glow

Difficulty escalates over 5 minutes by adjusting spawn interval and enemy type weights. All enemies chase the player using `wrappedAngle`. Drifters periodically charge in a straight line. HP is visualized as a liquid fill level inside each enemy shape.

### Weapon System (`weapons.ts`)
All weapons auto-fire. Each has 10 upgrade levels with progressive visual and stat improvements.
- **LaserBeam** — targets nearest enemy, fires from player shell edge with water ripple effect, wavy beam with tapered segments, impact flash, energy orb at Lv.5+
- **OrbitShield** — rotating projectiles around player, trails at higher levels
- **NovaBlast** — always fires on cooldown (no target needed), expanding AoE ring with debris

Player starts with Laser. Orbit and Nova are unlocked through random level-up upgrades.

### Rendering Conventions
- All drawing uses `camera.worldToScreen()` for world-space objects
- Background uses parallax factors (0.2, 0.5, 0.8) per star layer
- Enemy/player HP shown as "liquid fill" clipped inside their shape outline
- Colors use `rgba()` strings — no named colors in gameplay rendering

## Key Patterns

- **Weapon interface**: `update(dt, playerX, playerY, enemies[])` and `draw(ctx, camera, playerX, playerY)` — all weapons implement this
- **Entity lifecycle**: enemies have a `dead` boolean; main loop collects XP from dead enemies, then `spawner.removeDead()` filters them out
- **Particle spawning**: `particles.spawnDeath()` creates hollow bubble-up + explosion burst (+ screen flash for large enemies)
- **Stats scaling**: each weapon's `getStats()` method derives all values from `this.level`

## Build & Validation

```bash
npm run build      # One-shot build with sourcemaps
npm run watch      # Rebuild on file changes
npx tsc --noEmit   # Type-check without emitting (run before committing)
```

No test framework is set up. Validate changes by running `npx tsc --noEmit` and playing the game in browser.

## Conventions

- All source files are in `src/` — one class/system per file
- TypeScript strict mode — no `any`, no unused locals/params
- No external runtime dependencies — pure Canvas 2D
- Coordinates are world-space unless variable is named `screen*` or `sx`/`sy`
- Enemy damage uses `enemy.takeDamage(amount)` — never set `hp` directly
- Map constants (`MAP_WIDTH`, `MAP_HEIGHT`) live in `utils.ts`
- Shared rendering helpers in `utils.ts`: `drawSphereShading()`, `parseHexColor()`, `formatTime()`
- Wrapped-distance math uses `wrappedDelta()` as the single source of truth
