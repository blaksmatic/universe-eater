# Components — file management

## Why managed files

Prior monoliths: `ui.ts` 1471 lines, `weapons.ts` 1186, `enemies.ts` 1172 — single-file edits conflicted and hid responsibilities. The split keeps each file < 650 lines, one system per file, barrel re-exports for stable imports.

## Component map

| Component | File(s) | Responsibility | Public API |
|---|---|---|---|
| **Entry** | `src/main.ts` | canvas acquire, `GameRuntime.start()`, debug hook | none |
| **Runtime** | `src/runtime.ts` | loop, state transitions, resize, input routing, audio unlock, records | `GameRuntime` |
| **Game** | `src/game.ts` | `GameState`, draft queue, rerolls, doctrines, notifications, `gameDuration` | `Game`, `GameState` |
| **Player** | `src/player.ts` | `Player` movement/dash/crit/vamp/xp | `Player` |
| **Enemies** | `src/enemies.ts` → planned `src/entities/enemies/{types,enemy,spawner}.ts` | `Enemy` per-type config + boss phases; `EnemySpawner` escalation + elite/boss spawning | `Enemy`, `EnemySpawner`, `EnemyType` |
| **Weapons** | `src/weapons.ts` + `src/weapons/shared.ts` → planned per-weapon files | `Weapon` impls + `WeaponManager` registry + `hitEnemy` crit pipe | `WeaponManager`, `WEAPON_ORDER`, `Weapon` |
| **World** | `src/world.ts` | composition root (`WorldUpdateResult`) | `GameWorld` |
| **Combat** | `src/world-combat.ts` | `WorldCombatSystem`, combo milestones, kill rewards | `WorldCombatSystem` |
| **Motion** | `src/world-motion.ts` | `WorldMotionTracker` | — |
| **Renderer** | `src/world-renderer.ts` | draw order orchestration | `WorldRenderer` |
| **Camera** | `src/camera.ts` | follow + shake, `worldToScreen`, `isVisible` | `Camera` |
| **Background** | `src/background.ts` | starfield parallax | `Background` |
| **Geometry** | `src/geometry.ts` | neon grid/radials | `BackgroundGeometry` |
| **Particles** | `src/particles.ts` | FX, orbs, damage numbers, screen flash/vignette | `ParticleSystem` |
| **ThreeView** | `src/three-view.ts` | three.js overlay, adaptive quality, pooling | `ThreeEntityRenderer` |
| **Audio** | `src/audio.ts` | `audio` singleton, unlock, SFX throttle, music | `audio` |
| **Input** | `src/input.ts` | `touch`, `consume*Tap`, `triggerHaptic`, button layouts | `touch`, `isTouchDevice` |
| **Upgrades** | `src/upgrades.ts` | `buildUpgradeDraft`, `applyUpgradeChoice`, doctrines, tags, caps | `UpgradeChoice`, `Doctrine` |
| **Mutators** | `src/mutators.ts` | `rollMutators`, `composeSpawnMods`, `mutatorShort` | `MutatorId`, `EnemySpawnMods` |
| **UI** | `src/ui.ts` + `src/ui/icons.ts` + `src/ui/theme.ts` | `UI` HUD/draft/pause/title + icons + design system | `UI`, `WEAPON_SHAPES`, `UI_COLORS`, `glassPanel`… |
| **UI/Icons** | `src/ui/icons.ts` | `WEAPON_SHAPES: Record<IconName, drawIcon>` | `WEAPON_SHAPES` |
| **UI/Theme** | `src/ui/theme.ts` | `UI_COLORS`, `glassPanel`, `glowText`, `spacedText`, `gradientText` | design system |
| **Storage** | `src/storage.ts` | `loadSettings/saveSettings`, `loadRecords/submitRun` | `RecordUpdateResult` |
| **I18n** | `src/i18n.ts` | `getUiText`, `getWeaponName`, `format*`, `getLanguage/setLanguage` | `Language`, `TextResolver` |
| **Ids** | `src/ids.ts` | `WeaponId/Name`, `PassiveId/Name`, `UpgradeTag`, `DoctrineId`, `MutatorId`, `PASSIVE_CAPS` | — |
| **Utils** | `src/utils.ts` | `MAP_*`, `wrap*`, `TWO_PI`, `tracePoly`, `roundedRect`, `formatTime`, easing | — |

## Barrel layers (current vs planned)

Current (v0.3.0) — flat `src/*.ts` plus realized barrels:
- `src/entities/enemies/index.ts` → `enemy, spawner, types`
- `src/weapons/index.ts` → `shared, laser, orbit, nova, escort, seeker, arc, singularity, manager`
- `src/weapons/shared.ts` → `Weapon`, `WeaponModifiers`, `hitEnemy`, `getNearestEnemy`
- `src/ui/{icons,theme}.ts` → icons + design system
- Top-level re-exports `src/enemies.ts` → `src/entities/enemies` and `src/weapons.ts` → `src/weapons/*` kept for back-compat

Planned (not yet materialized):
- `src/core/index.ts` → `game, ids, mutators, storage, upgrades, runtime`
- `src/systems/index.ts` → `world, world-combat, world-motion, audio, input`
- `src/render/index.ts` → `camera, background, geometry, particles, three-view, world-renderer`

New code should import from realized barrels; legacy `from './weapons'` imports remain valid via retained shims. When `src/core` etc land, prefer `from './core'`.

## UI split details

Before: `src/ui.ts` contained icon shapes (200 lines) + design system (100 lines) inline — caused `noUnusedLocals` failure when helpers unused.
After:
- `src/ui/icons.ts:1` — 15 icon drawers keyed by `WeaponName|PassiveName`, imports `TWO_PI, roundedRect`.
- `src/ui/theme.ts:1` — `UI_COLORS` palette + 4 helpers (`glassPanel` etc) exported for reuse.
- `src/ui.ts:1` — imports `WEAPON_SHAPES` + re-exports `UI_COLORS/glassPanel…` from `theme` so legacy `import { glassPanel } from './ui'` still works.

## Weapons split details

- `src/weapons/shared.ts:1` — canonical `Weapon` interface + `WeaponModifiers` + `hitEnemy/hitEnemySilent/getNearestEnemy`. Previously inline in `src/weapons.ts:18`.
- Remaining split (per-weapon files `laser.ts`, `orbit.ts`, …) is prepared as incremental extraction; current bundle still works, next step is to move each class file-by-file and make `src/weapons.ts` a barrel `export * from './weapons/laser'` etc.

## Enemies split (planned)

Segment into `src/entities/enemies/{config.ts, enemy.ts, spawner.ts, bosses/warden.ts}`; current `src/enemies.ts` retained. Spawner escalation (`getSpawnConfig`) + mutation `spawnOptions` become `spawner.ts`.

## Conventions

- One system per file; world-space coords unless `screen*`.
- Strict TS: `noUnusedLocals/Parameters` — export unused design helpers or prefix `_`.
- Colors as `rgba()` strings; glow = thick dim + thin bright stroke.
- `roundedRect` does NOT call `beginPath()` — callers must.
- Screen effects via `particles.addScreenFlash/addDamageVignette`.
- Audio via `audio` singleton; unlock on first gesture.
- Guard `window`/`localStorage`/`navigator` for WeChat.

## Adding a new component

1. Create file under appropriate `src/<layer>/`.
2. Export public API; add barrel re-export in `src/<layer>/index.ts` if layer-shared.
3. Keep `src/<legacy>.ts` as re-export shim for one release (or delete after migrating imports).
4. Add bilingual strings to `i18n.ts` if user-facing.
5. Run `npm run typecheck && npm run build`.

## Adding a new weapon

1. Create `src/weapons/<name>.ts` implementing `Weapon` from `shared.ts`.
2. Use `hitEnemy` for discrete hits, `hitEnemySilent` for ticks.
3. Cache stats per level; recompute only on level change.
4. Register in `src/weapons.ts:WEAPON_ORDER` + manager factory.
5. Add icon to `src/ui/icons.ts` and names to `i18n.ts`.

## Testing components

- `npm run typecheck` — strict gate.
- `npm run build` — esbuild bundle sanity.
- Playwright harness (`scripts/playtest.mjs`) covers smoke, heavy combat, full 3-phase boss → victory → next stage, mobile emulation.
- `scripts/qa-edge.mjs` for edge cases, `scripts/mobile-audit.mjs` for touch, `scripts/balance-boss.mjs` for DPS simulation.
