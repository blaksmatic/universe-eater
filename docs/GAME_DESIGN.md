# Game Design

## Loop

1. **Survive** — 300 s countdown (shrinks by 20 s per stage, min 180 s) vs escalating waves.
2. **Draft** — every level-up offers 3 choices: weapon unlock / weapon level-up / passive (8 passives, some caps via `PASSIVE_CAPS` in `ids.ts:30`). Tags `force/ward/surge/forge` tally toward **Doctrines** (`bulwark/slipstream/nanite-lattice/annihilation`).
3. **Slay** — timer → `Game.beginBossEncounter` → `world.spawnBoss()` → HUD becomes “SLAY THE WARDEN”. Victory only on `bossKilled`.
4. **Advance** — `Game.advanceStage` increments stage, resets timer, rolls new `mutators`, preserves build; `world.prepareNextStage` clears spawner/particles.

## Weapons (7)

- Laser Beam — beam `computeLaserStats` → `drawBeam` wavy path, impact flash.
- Orbit Shield — `OrbitShield` satellites grinding at `hitEnemySilent` per-frame.
- Nova Blast — `NovaBlast` expanding ring, one `hitEnemy` per blast.
- Escort Wing — `EscortWing` orbiting craft paired to laser cadence.
- Seeker Swarm — `SeekerSwarm` homing missiles with AoE detonation.
- Arc Reactor — `ArcReactor` chain lightning (jumps `2+P(lvl)`).
- Singularity — `Singularity` states `idle→flying→active→collapsing`, pull+grind+collapse.

All via `WeaponManager.modifiers` (damage/cooldown/crit). Unlock order gated by `WEAPON_ORDER` in `weapons.ts:1252`.

## Enemies & boss

- Swarmer/drifter/titan/overlord/spitter/splitter/bomber + boss. Elite chance `0.03 + (stage-1)*0.035` up to 0.18.
- Spawner `getSpawnConfig` stages at 20/45/90/150/215 s effective (plus `stage*60`). Pace `/ (1+stage*0.12)`.
- Warden Mk.N: color skin cycles 5 entries every stage; P1 ring 14/2.6 s, P2 spiral+summon, P3 charge (telegraphed via `fuseRatio` + `drawChargeTrail`) with denser rings. Phase events via `drainBossPhaseEvents` → shake 6/0.3 + flash + `audio.playBossPhase`.

## Passives & doctrines

- hull (+25 HP + repair), thrusters (+speed), nanoforge (regen), plating (DR), targeting (+8% crit ×2), overclock (-7% cd), vampiric (+0.8 on kill), amplifier (+12% XP). Caps: targeting 6, overclock/vampiric/amplifier 5.
- Doctrines unlock at trait thresholds: e.g., bulwark from ward tags → +20 hull + grace.

## Combat & combo

- `world-combat.ts` — contact damage, `combo 3.2 s` window, milestone every 10 → sting + XP burst. `comboBest` feeds records.
- `hitEnemy` rolls `modifiers.critChance` → `modifiers.onHit` → `WorldCombatSystem.reportWeaponHit` → floating numbers (toggleable `damageNumbersEnabled`).

## Progression & difficulty

- Stage mutators (7): frenzy/heavy/overdrive/shrapnel/elites/tiny/veterans — rolled via `rollMutators(stage)` (stage 1 none, then 1→2 mutators). Applied as `EnemySpawnMods` scaling hp/speed/radius/bullet/scaleBonus/eliteChance.
- Rerolls: 2 initial, +1 per stage cap 3.
- Records: bestStage/bestKills/bestLevel/bestTime/bestCombo.

## Feel

- Dash i-frames + ghosts + cooldown ring (`player.dashCooldownRatio`).
- Off-screen arrows for boss/elite, boss bar pips, XP bar glow, damage vignette (`ui.drawVignette`), shake respecting `shakeEnabled`, WebAudio ambient+stings, persisted settings.

## Balancing references

- `scripts/balance-boss.mjs` — mid-tier DPS/TTK sim.
- `scripts/playtest.mjs` / `qa-edge.mjs` / `mobile-audit.mjs` — automated coverage.

## Adding content

- Enemy: add config to `ENEMY_TYPES` in `enemies.ts:24`, type to `EnemyType`, case in `update`/`draw`.
- Weapon: implement `Weapon` + icon + i18n + `WEAPON_ORDER`.
- Passive: add to `ids.ts` caps + `upgrades.ts` pools + `i18n.ts` text.
- Doctrine: add `DoctrineId` + `TAG_TEXT` thresholds in `upgrades.ts`.
- Mutator: add `MutatorId` + text + weight in `mutators.ts`.
