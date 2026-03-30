# Universe Eater

A fast-paced survival browser game set in deep space. Survive 5 minutes against escalating waves of enemies using 3 auto-firing weapons.

## Play Now

**[Play in browser](https://blaksmatic.github.io/universe-eater/)** — no install needed, works on desktop and mobile.

Or download the [standalone HTML](https://github.com/blaksmatic/universe-eater/releases/latest) and open it directly.

## Controls

### Desktop
| Input | Action |
|---|---|
| WASD / Arrow Keys | Move |
| Escape | Pause |

### Mobile
| Input | Action |
|---|---|
| Virtual joystick (left side) | Move |
| Pause button (top-right) | Pause |

All weapons fire automatically.

## Features

### Weapons
- **Laser Beam** — Targets nearest enemy, fires from player shell with water ripple effect
- **Orbit Shield** — Rotating projectiles that orbit the player
- **Nova Blast** — Expanding AoE ring with debris

Each weapon has 10 upgrade levels with progressive visual and stat improvements. Upgrades are applied randomly on level-up.

### Enemies
- **Swarmer** — Small, fast, spawns in groups
- **Drifter** — Medium, occasionally charges at player
- **Titan** — Large, slow, high HP
- **Overlord** — Boss that summons swarmers and shoots projectile spreads

Difficulty escalates over 5 minutes by adjusting spawn rates and enemy type weights.

### Visuals
- 3D-styled parallax starfield with motion streaking and perspective scaling
- Sphere shading on all entities
- HP shown as glowing arc ring on player
- Particle effects on enemy death

## Development

```bash
npm install && npm run dev
```

Opens at http://localhost:3000 with hot reload.

```bash
npm run build              # Build for Pages + standalone HTML
npx tsc --noEmit           # Type-check
```

## Tech Stack

- **TypeScript** (strict mode) — no runtime dependencies
- **HTML5 Canvas 2D** — all rendering
- **esbuild** — bundler (~28 KB output)
