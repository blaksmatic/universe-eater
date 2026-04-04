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
  enemies.ts     — 4 enemy types with distinct shapes, spawner with escalation
  weapons.ts     — 3 weapon classes (Laser, Orbit, Nova), WeaponManager
  camera.ts      — Camera follow, world-to-screen projection, screen shake
  background.ts  — Parallax starfield, nebulae, cosmic dust, idle drift
  geometry.ts    — Neon background geometry (grid, radials, rings, floating shapes)
  particles.ts   — Death effects, spark trails, debris, glow pools, XP orbs, screen effects
  input.ts       — Keyboard state tracker, mobile touch joystick
  ui.ts          — HUD, title/game-over/victory screens, vignette, notifications
  utils.ts       — Map constants, wrapping math, shared rendering helpers
```

## Architecture

### Game Loop (`main.ts`)
Standard `requestAnimationFrame` loop with delta-time capping (`Math.min(dt, 0.05)`). The loop handles state transitions, updates all systems, then draws in back-to-front order: background -> geometry -> enemies -> particles -> weapons -> player -> wrap zone -> vignette -> screen effects -> HUD -> notifications.

Gameplay tuning constants (`CONTACT_DPS`, `PROJECTILE_DAMAGE`, `SHARP_HIT_THRESHOLD`, etc.) are named at the top of the file.

### Map & Wrapping
The world is a 50000x50000 toroidal map. Objects wrap at edges using `wrapPosition()`. Distance/angle calculations use `wrappedDistance()`/`wrappedAngle()` to handle cross-boundary interactions correctly. The camera does NOT wrap — it follows the player directly.

### Game States (`game.ts`)
Five states: `TITLE` -> `PLAYING` -> `GAME_OVER` or `VICTORY`, plus `PAUSED`. Level-ups do NOT pause the game — a random upgrade is applied instantly with a fade-out notification.

### Enemy System (`enemies.ts`)
- **Swarmer** — small, fast, jagged spiky star shape with pulsing red core, spawn in groups of 3-5
- **Drifter** — medium, hexagonal outline with inner rotating hexagon, charge glow buildup, sometimes spawn in pairs
- **Titan** — large, slow, concentric rotating rings with gravitational distortion lines and pulsing central eye
- **Overlord** — large crimson rotating square with inner diamond, summons swarmers every 3s, shoots white projectile spreads at player every 1.5s

All enemies have spawn-in animation (scale from 0 with overshoot easing) and white hit flash on damage. Difficulty escalates over 5 minutes by adjusting spawn interval and enemy type weights. HP is visualized as a liquid fill level clipped inside each enemy shape.

### Weapon System (`weapons.ts`)
All weapons auto-fire. Each has 10 upgrade levels with progressive visual and stat improvements. Stats are cached per level (recomputed only on level-up, not per frame).
- **LaserBeam** — targets nearest enemy, wavy beam with tapered segments, impact flash, energy orb at Lv.5+
- **OrbitShield** — rotating projectiles with separate hit/draw radii, trails at higher levels
- **NovaBlast** — expanding AoE ring with debris, inner glow at Lv.4+, shockwave at Lv.7+

### Particle System (`particles.ts`)
Death effects include: hollow bubble-up rings, explosion bursts, spark trails with velocity, rotating debris chunks, ground glow pools, and screen flash for large enemies. XP orbs fly from dead enemies toward the player with homing. Screen effects (damage vignette, level-up flash) are managed here. Particle count is capped at `MAX_PARTICLES` (500).

### Background Geometry (`geometry.ts`)
Radiangames-style neon background with: wavy grid lines, concentric rotating polygon rings around the player, floating wireframe shapes with parallax, and radial light rays. All elements use a double-draw glow technique (thick dim + thin bright) with a neon color palette.

### Camera (`camera.ts`)
Follows the player. Supports screen shake with intensity decay — triggered by damage, big kills, and level-ups. Shake offsets are baked into `worldToScreen()`.

### UI (`ui.ts`)
- **Title** — glowing text, animated subtitle, breathing start prompt
- **HUD** — rounded gradient XP bar, weapon icons, timer with glow
- **End screens** — shared `drawEndScreen` helper with scale-in titles, staggered stat reveals
- **Vignette** — permanent subtle dark edges, intensifies + red tint below 35% HP

### Rendering Conventions
- All drawing uses `camera.worldToScreen()` for world-space objects
- Background uses parallax factors (0.2, 0.5, 0.8) per star layer
- Enemy/player HP shown as "liquid fill" clipped inside their shape outline
- Colors use `rgba()` strings — no named colors in gameplay rendering
- Glow effects use double-draw: thick dim line + thin bright line

## Key Patterns

- **Weapon interface**: `update(dt, playerX, playerY, enemies[])` and `draw(ctx, camera, playerX, playerY)` — all weapons implement this
- **Entity lifecycle**: enemies have a `dead` boolean; main loop collects XP from dead enemies, then `spawner.removeDead()` filters them out. Dead enemies are skipped in collision checks.
- **Particle spawning**: `particles.spawnDeath()` creates spark trails, debris, glow pools, explosion burst, and bubble-up ring. `spawnXpOrbs()` creates homing golden orbs.
- **Stats caching**: each weapon caches `getStats()` result and only recomputes when `level` changes
- **Shared utils**: `TWO_PI`, `tracePoly()`, `easeOutBack()`, `easeOutCubic()` are exported from `utils.ts` — do not redeclare locally
- **Screen effects**: `particles.addScreenFlash()` and `particles.addDamageVignette()` for overlay effects; drawn via `particles.drawScreenEffects()` after gameplay but before HUD

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
- Map constants (`MAP_WIDTH`, `MAP_HEIGHT`) and shared helpers live in `utils.ts`
- Shared rendering helpers: `drawSphereShading()`, `parseHexColor()`, `formatTime()`, `tracePoly()`
- Wrapped-distance math uses `wrappedDelta()` as the single source of truth
- Mobile touch joystick starts wherever the player touches (floating joystick)
