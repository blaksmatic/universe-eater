# Architecture

## Layers — current layout (v0.3.0)

```
src/
  main.ts            entry — canvas + GameRuntime + window.__universeEater hook
  runtime.ts         requestAnimationFrame loop, state routing, input, audio unlock, records
  game.ts            Game state machine, draft/level-up, notifications, scheduled hints
  ids.ts             union types + PASSIVE_CAPS
  mutators.ts        stage mutators (frenzy/heavy/…) + composeSpawnMods
  storage.ts         localStorage settings/records + submitRun() bests
  upgrades.ts        draft builder, passives stack caps, doctrines, tags
  player.ts          movement, dash (i-frames/ghosts), crit/vamp/xp, ripples
  enemies.ts         re-export shim → src/entities/enemies/*
  weapons.ts         re-export shim → src/weapons/*
  world.ts           composition root — wires camera/player/spawner/particles/weapons/combat/motion/renderer
  world-combat.ts    collisions, combo chain, kill rewards, boss events
  world-motion.ts    velocity sampling for background parallax
  world-renderer.ts  draw order: bg → geometry → entities/3D → auras → particles → weapons → player → wrap → vignette → HUD
  camera.ts          follow + shake (shakeEnabled + prefers-reduced-motion guard)
  background.ts      parallax starfield + wrap zone
  geometry.ts        neon grid/radials/rings
  particles.ts       death FX, sparks, debris, XP orbs, damage numbers, screen flashes (budget-capped)
  three-view.ts      three.js entity overlay, pooled visuals, adaptive quality, dispose() lifecycle, 2D fallback
  audio.ts           WebAudio engine, throttled SFX + generative music, persisted toggles
  input.ts           keyboard, floating joystick, dash/pause buttons, haptics, dash suppression constants
  ui.ts              HUD, boss bar, combo meter, draft cards, pause, title — imports icons/theme
  utils.ts           MAP constants, wrapPosition/wrappedDelta/Distance/Angle, distance/clamp/randomRange, TWO_PI, tracePoly, roundedRect, formatTime, easing
  i18n.ts            EN/zh-CN tables, formatters, syncDocumentLanguage
  entities/
    enemies/
      types.ts       EnemyType, EnemySpawnOptions, ENEMY_TYPES config, BOSS_BASE_HP
      enemy.ts       Enemy class + all 8 type behaviours + boss phases
      spawner.ts     EnemySpawner escalation + elite/boss spawning
      index.ts       barrel re-export
  weapons/
    shared.ts        Weapon interface + WeaponModifiers + hitEnemy helpers
    laser.ts / orbit.ts / nova.ts / escort.ts / seeker.ts / arc.ts / singularity.ts
    beam.ts          drawBeam helper
    manager.ts       WeaponManager registry (damage 2.8× cap, cooldown 0.4× floor)
    index.ts         barrel
  ui/
    icons.ts         WEAPON_SHAPES (all weapon+passive icons)
    theme.ts         UI_COLORS, glassPanel, glowText, spacedText, gradientText
```

Planned barrels `src/core/`, `src/systems/`, `src/render/` are documented in `docs/COMPONENTS.md:40` but not yet materialized — new code may use `src/<layer>/index.ts` barrels when they land; legacy `from './weapons'` / `from './enemies'` imports remain valid via retained re-export shims for backward compat.

## Game loop — `runtime.ts:13`

```
requestAnimationFrame (dt capped at 0.05)
  audio.intensity = bossEngaged ? 1 : 0
  handleTapTransitions (mobile)
  camera.updateShake
  ui.trackState

  TITLE       → world.updateTitle + drawTitle + ui.drawTitleScreen
  PLAYING     → game.elapsedTime += dt
                if timeRemaining <= 0 → game.beginBossEncounter + world.spawnBoss + audio.playBossWarning
                world.updatePlaying → combat + spawner + weapons + particles
                check bossKilled → finishRun + state=VICTORY
                check player.isDead → finishRun + state=GAME_OVER (2500 ms restart delay)
                check levelUps → world.triggerLevelUpBlast + queue drafts
  LEVEL_UP    → renderActiveRun (dimmed) + ui.drawLevelUpDraft
  PAUSED      → entityRenderer.render + world.drawPausedScene + ui.drawPauseMenu
  GAME_OVER/VICTORY → drawEndBackdrop + drawGameOver/drawVictory + NEW RECORD badges
```

## World update — `world.ts:74`

1. player.update / regenerate / ripples
2. motion.sample → background/geometry
3. camera.follow
4. spawner.update (elapsed + stage + mutators)
5. sync weapon modifiers (critChance/multiplier from player)
6. combat.applyCollisions + updateCombo
7. weaponManager.update
8. combat.consumeDefeatedEnemies → spawner.removeDead + drainBossPhaseEvents (sweeps boss bullets on phase change)
9. particles.update

## Toroidal map

- Size: 50000×50000 (`utils.ts:1`). Single source of truth: `wrapPosition`, `wrappedDelta`, `wrappedDistance`, `wrappedAngle`. Camera does NOT wrap.
- Spawns use `wrapPosition` + camera-relative offsets.

## Enemies (`enemies.ts:24`)

Types: swarmer, drifter (telegraphed charge), titan, overlord (summons), spitter (strafe+kite), splitter (death→shards), bomber (fuse→ring), boss (Void Warden). Any spawn can be elite (scale +1.55, hp×3.2, speed×0.92, xp×3, violet aura). Warden: 60000 base HP, 3 phases (P1 ring, P2 spiral+summons, P3 charge+dense), phase events drained by `world.ts:94` for shake/flash/audio. Stage skin cycles every 5 Mks.

## Weapons (`weapons.ts:80`)

Interface `Weapon { name, level, maxLevel, update(dt,px,py,enemies,modifiers), draw(...) }`. Damage via `hitEnemy` (crit roll → modifiers.onHit → damage numbers) or `hitEnemySilent` for ticks. Stats cached per level. Manager syncs crit from player each frame (`world.ts:85`).

## Rendering order (`world-renderer.ts`)

background → geometry → enemies (2D fallback) OR 3D overlay → threat auras (2D above 3D) → particles → weapons → player → wrap zone → vignette → screen effects → HUD → notifications. `renderActiveRun` in `runtime.ts:347` mirrors this plus vignette/HUD.

## Persistence (`storage.ts`)

Keys: `universe-eater.settings` (sound/music/shake/numbers), `universe-eater.records` (best stage/kills/level/time/combo, runs). `submitRun` returns which fields are new bests for end-screen badges.

## i18n

All user-facing strings via `i18n.ts`; bilingual tables + formatters (`formatHullLabel`, `formatStageLabel` etc). `syncDocumentLanguage` sets `document.documentElement.lang` + title. Language toggle appears on TITLE/PAUSED/GAME_OVER via `ui.getLanguageActionAt`.

## Debug hook

`window.__universeEater = GameRuntime` (`main.ts:17`) — used by `scripts/playtest.mjs` harness.
