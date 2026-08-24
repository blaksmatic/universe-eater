# Architecture

## Layers (management files)

```
src/
  main.ts                 entry — canvas + GameRuntime + window.__universeEater hook
  core/                   barrel: game.ts, ids.ts, mutators.ts, storage.ts, upgrades.ts, runtime.ts
    game.ts               Game state machine, draft/level-up, notifications, scheduled hints
    runtime.ts            requestAnimationFrame loop, state routing, input, audio unlock, records
    ids.ts                union types + PASSIVE_CAPS
    mutators.ts           stage mutators (frenzy/heavy/…) + composeSpawnMods
    storage.ts            localStorage settings/records + submitRun() bests
    upgrades.ts           draft builder, passives stack caps, doctrines, tags
  entities/               barrel: player.ts, enemies.ts, weapons.ts
    player.ts             movement, dash (i-frames/ghosts), crit/vamp/xp, ripples
    enemies.ts            8 types + elites + 3-phase Void Warden + spawner escalation
    weapons/              shared.ts + legacy bundle; 7 weapons (laser/orbit/nova/escort/seeker/arc/singularity) + manager
  systems/                barrel: world.ts, world-combat.ts, world-motion.ts, audio.ts, input.ts
    world.ts              composition root — wires camera/player/spawner/particles/weapons/combat/motion/renderer
    world-combat.ts       collisions, combo chain, kill rewards, boss events
    world-motion.ts       velocity sampling for background parallax
    audio.ts              WebAudio engine, throttled SFX + generative music, persisted toggles
    input.ts              keyboard, floating joystick, dash/pause buttons, haptics
  render/                 barrel: camera.ts, background.ts, geometry.ts, particles.ts, three-view.ts, world-renderer.ts
    camera.ts             follow + shake (shakeEnabled guard)
    background.ts         parallax starfield + wrap zone
    geometry.ts           neon grid/radials/rings
    particles.ts          death FX, sparks, debris, XP orbs, damage numbers, screen flashes
    three-view.ts         three.js entity overlay (pooled visuals, adaptive quality, 2D fallback)
    world-renderer.ts     draw order: bg → geometry → entities/3D → auras → particles → weapons → player → wrap → vignette → HUD
  ui/                     icons.ts + theme.ts split from ui.ts
    ui.ts                 HUD, boss bar, combo meter, draft cards, pause, title — now imports icons/theme
    ui/icons.ts           WEAPON_SHAPES (all weapon+passive icons)
    ui/theme.ts           UI_COLORS, glassPanel, glowText, spacedText, gradientText (design system)
    storage/i18n interplay for language selector
  utils/
    utils.ts              MAP constants, wrapPosition/wrappedDelta/Distance/Angle, distance/clamp/randomRange, TWO_PI, tracePoly, roundedRect, formatTime, easing
  i18n.ts                 EN/zh-CN tables, formatters, syncDocumentLanguage
```

Import rule: new code prefers `src/<layer>/index.ts` barrels; legacy `from './weapons'` etc still works via re-export shims retained for compatibility.

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
