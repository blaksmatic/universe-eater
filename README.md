# Universe Eater

A fast-paced survival browser game set in deep space. Survive 5 minutes against escalating waves of enemies using 3 auto-firing weapons.

## How to Run

```bash
npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

| Input | Action |
|---|---|
| WASD / Arrow Keys | Move player |
| 1 / 2 / 3 or Click | Select level-up choice |

## Features

### Weapons
- **Laser Beam** — Rapid-fire directed energy weapon
- **Orbit Shield** — Rotating projectiles that orbit the player
- **Nova Blast** — Area-of-effect radial burst

Each weapon has 10 upgrade levels with distinct visual progression.

### Enemies
- 4 enemy types with escalating difficulty over 5 minutes
- HP bar fill visualization on each enemy
- Death particle effects (hollow-out and bubble-up animation)

### Visuals
- Deep space background with parallax starfield, nebulae, and cosmic dust
- HUD with XP bar, level display, and timer

### Progression
- Collect XP from enemies to level up
- Choose one of 3 upgrade options at each level-up
- Victory screen at 5 minutes; game-over screen on death

## Tech Stack

- **TypeScript** — Strongly-typed game logic
- **HTML5 Canvas** — Rendering
- **esbuild** — Fast bundling with watch mode
