# Universe Eater: Ascension

A fast-paced neon arcade survival game set in deep space. Survive the void, grow your build through level-up drafts, then slay the Void Warden to advance to the next stage — and it keeps getting harder.

**[Play in browser](https://blaksmatic.github.io/universe-eater/)** — no install needed, works on desktop and mobile. A standalone HTML build is also produced by `npm run build`.

## Controls

### Desktop
| Input | Action |
|---|---|
| WASD / Arrow Keys | Move |
| Space / Shift | Dash (brief invulnerability — phase through bullets) |
| 1–3 / Arrows + Enter | Pick level-up draft cards (R to reroll) |
| Escape / P | Pause (settings, build summary, restart / quit) |

### Mobile
| Input | Action |
|---|---|
| Virtual joystick (starts anywhere you touch) | Move |
| Bolt button (bottom-right) | Dash |
| Pause button (top-right) | Pause |

All weapons fire automatically — your job is positioning, kiting, and dashing through danger.

## Features

### The loop
1. **Survive the countdown** (≈5 minutes, shrinking on later stages) against escalating waves.
2. **Draft mutations** on every level-up: new weapons, weapon upgrades, or passives — with tag-based **Doctrines** that unlock powerful build archetypes.
3. **Slay the Void Warden** — a 3-phase boss with bullet rings, rotating spiral barrages, summons, and telegraphed charge attacks. Kill it to advance; your build carries into the next, harder stage.

### Weapons (7)
- **Laser Beam** — auto-targeting beam with impact flash
- **Orbit Shield** — rotating satellites that grind anything close
- **Nova Blast** — periodic expanding shockwave
- **Escort Wing** — a wingmate drone firing a support laser
- **Seeker Swarm** — homing missile volleys with AoE detonation
- **Arc Reactor** — chain lightning that leaps between packs
- **Singularity** — a thrown gravity well that drags enemies in and collapses

### Enemies (7 + elites + boss)
- **Swarmer** — fast, spawns in packs
- **Drifter** — telegraphs then charges
- **Titan** — slow tank with gravitational presence
- **Overlord** — summons and shoots spreads
- **Spitter** — keeps range, strafes, fires aimed orbs
- **Splitter** — bursts into shards on death
- **Bomber** — arms a fuse next to you, then detonates a bullet ring
- **Elites** — any type can spawn elite (larger, deadly, bonus XP, violet aura)
- **Void Warden** — stage boss (see above)

### Feel & UX
- Combo chain: rapid kills build a counter with milestone XP bursts
- Floating damage numbers with crit highlights (toggleable)
- Off-screen threat arrows for bosses and elites
- Procedural WebAudio soundtrack + synthesized SFX (no audio assets)
- Screen shake, hit vignettes, dash afterimages, boss warning stings
- Persistent records (best stage / kills / combo / time, runs played) + NEW RECORD badges
- Settings: sound, music, screen shake, damage numbers — all persisted
- Full English / 中文 localization, switchable in-game

## Docs

- [Build & Run](docs/BUILD.md) — install → dev → typecheck → bundle → WeChat.
- [Architecture](docs/ARCHITECTURE.md) — layers, game loop, data flow, toroidal map.
- [Components](docs/COMPONENTS.md) — file management, per-module responsibilities, adding new weapons/enemies.
- [Game Design](docs/GAME_DESIGN.md) — loop, weapons, enemies, boss phases, progression.

## Development

```bash
npm install && npm run dev     # build + watch + serve at :3000
npm run typecheck              # tsc --noEmit (now passes — design-system exports fixed)
npm test                       # automated Playwright playthrough (needs `npx playwright install chromium` and a server on :3456)
npm run build                  # production bundle + standalone HTML
npm run build:wx               # WeChat mini-game adapter build
```

Managed source layout:

```
src/
  main.ts            entry + debug hook
  core/              game, ids, mutators, storage, upgrades, runtime (barrel)
  entities/          player, enemies, weapons (barrel)
  weapons/shared.ts  Weapon interface + hitEnemy helpers (extracted)
  ui/icons.ts        WEAPON_SHAPES (extracted)
  ui/theme.ts        UI_COLORS + glassPanel/glowText (extracted, fixes noUnusedLocals)
  systems/           world, world-combat/motion, audio, input (barrel)
  render/            camera, background, geometry, particles, three-view, world-renderer (barrel)
  utils.ts / i18n.ts / etc
```

See `docs/COMPONENTS.md` for the full split plan and “how to add a new component/weapon”.

The automated test harness (`scripts/playtest.mjs`) drives real gameplay via a debug hook: smoke flow, heavy combat, the full boss fight (all 3 phases → victory → next stage), and mobile emulation with touch controls.

## Tech Stack

- **TypeScript** (strict mode)
- **HTML5 Canvas 2D** — gameplay layer, HUD, effects
- **three.js** — optional 3D entity overlay with adaptive quality (graceful 2D fallback)
- **WebAudio** — procedural music and SFX
- **esbuild** — bundler
